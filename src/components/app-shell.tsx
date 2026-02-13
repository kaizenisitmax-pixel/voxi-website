"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Sparkles,
  FolderOpen,
  User,
  LogOut,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navItems = [
  { href: "/app", icon: Home, label: "Ana Sayfa" },
  { href: "/app/kutuphane", icon: FolderOpen, label: "Kutuphane" },
  { href: "/app/tasarla", icon: Plus, label: "Tasarla", primary: true },
];

export function AppShell({
  user,
  children,
}: {
  user: SupabaseUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

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
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    user.phone ||
    "Kullanici";

  return (
    <div className="flex min-h-screen flex-col bg-warm-bg">
      {/* Top Header - Desktop & Mobile */}
      <header className="sticky top-0 z-50 border-b border-border-light bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/app" className="text-lg font-bold text-text-primary">
            evim
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "h-9 gap-2 rounded-lg text-sm font-medium",
                    pathname === item.href
                      ? "bg-warm-bg text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-black text-xs font-medium text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-text-secondary">{displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-warm-bg hover:text-text-primary transition-colors"
              title="Cikis Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-light bg-white/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.primary) {
              return (
                <Link key={item.href} href={item.href}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-black btn-press">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                </Link>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                <div className="flex flex-col items-center gap-1 px-3 py-1">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-text-primary" : "text-text-tertiary"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive ? "text-text-primary" : "text-text-tertiary"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Profile in bottom nav */}
          <Link href="/app">
            <div className="flex flex-col items-center gap-1 px-3 py-1">
              <User
                className={cn(
                  "h-5 w-5 text-text-tertiary"
                )}
              />
              <span className="text-[10px] font-medium text-text-tertiary">
                Profil
              </span>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
