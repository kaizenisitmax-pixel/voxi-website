import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Env vars yoksa middleware'i atla — sayfa yine de render edilsin
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Middleware: Supabase env vars missing, skipping auth");
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // IMPORTANT: Do not remove this — it refreshes the session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // /app/* auth guard
    if (request.nextUrl.pathname.startsWith("/app") && !user) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
  } catch (error) {
    console.error("Middleware error:", error);
    // Hata durumunda sayfayı yine de göster
    return NextResponse.next();
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
