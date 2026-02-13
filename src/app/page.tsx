import { redirect } from "next/navigation";
import { LandingContent } from "@/components/landing-content";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const params = await searchParams;

  // Fallback: magic link may land on /?code=xxx instead of /auth/callback
  if (params.code) {
    const next = params.next ?? "/app";
    redirect(`/auth/callback?code=${params.code}&next=${next}`);
  }

  return <LandingContent />;
}
