"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  FolderOpen,
  MessageCircle,
  UserCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const tabs = [
  { href: "/app", icon: Sparkles, label: "Tasarla" },
  { href: "/app/kutuphane", icon: FolderOpen, label: "Kütüphane" },
  { href: "/app/sohbetler", icon: MessageCircle, label: "Sohbetler" },
  { href: "/app/profil", icon: UserCircle, label: "Profil" },
];

export function AppShell({
  user,
  children,
}: {
  user: SupabaseUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  // user null ise login'e yönlendir
  useEffect(() => {
    if (!user) {
      router.replace("/giris");
    }
  }, [user, router]);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    router.push("/");
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    user?.phone ||
    "Kullanıcı";

  const isActiveTab = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-warm-bg">
      {/* ── Desktop Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] flex-col border-r border-border-light bg-white md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <Link
            href="/app"
            className="text-lg font-bold tracking-tight text-text-primary"
          >
            VOXI
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1 px-3 pt-2">
          {tabs.map((tab) => {
            const active = isActiveTab(tab.href);
            return (
              <Link key={tab.href} href={tab.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-warm-bg text-text-primary"
                      : "text-text-secondary hover:bg-warm-bg/60 hover:text-text-primary"
                  )}
                >
                  <tab.icon className={cn("h-[18px] w-[18px]", active ? "text-text-primary" : "text-text-tertiary")} />
                  {tab.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border-light p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-black text-xs font-medium text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {displayName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:bg-warm-bg hover:text-text-primary transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 pb-20 md:pb-0 md:pl-[220px]">
        {children}
      </main>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border-light bg-white/95 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex h-[72px] max-w-md items-end justify-around px-2 pb-2">
          {tabs.map((tab) => {
            const active = isActiveTab(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className="w-16">
                <div className="flex flex-col items-center gap-0.5 pt-2">
                  <tab.icon
                    className={cn(
                      "h-[22px] w-[22px] transition-colors",
                      active ? "text-text-primary" : "text-text-tertiary"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      active ? "text-text-primary" : "text-text-tertiary"
                    )}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
