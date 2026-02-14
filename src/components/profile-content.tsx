"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Mail,
  Phone,
  CreditCard,
  ChevronRight,
  Shield,
  HelpCircle,
  Star,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function ProfileContent({ user }: { user: SupabaseUser | null }) {
  if (!user) return null;
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
    "Kullanıcı";

  const menuItems = [
    {
      icon: CreditCard,
      label: "Abonelik ve Krediler",
      sublabel: "3 kredi kaldı",
    },
    {
      icon: Star,
      label: "VOXI Pro'ya Geç",
      sublabel: "Sınırsız tasarım",
    },
    {
      icon: Shield,
      label: "Gizlilik ve Güvenlik",
      sublabel: "Hesap ayarları",
    },
    {
      icon: HelpCircle,
      label: "Yardım ve Destek",
      sublabel: "SSS, iletişim",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Profil</h1>
      </div>

      {/* Kullanıcı Kartı */}
      <div className="mb-6 rounded-2xl border border-border-light bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-black text-lg font-semibold text-white">
            {(displayName || "K").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-text-primary">
              {displayName}
            </h2>
            <div className="mt-1 flex flex-col gap-0.5">
              {user.email && (
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <Phone className="h-3 w-3" />
                  {user.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* İstatistik */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border-light bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-text-primary">3</p>
          <p className="mt-0.5 text-[10px] font-medium text-text-tertiary">
            Tasarım
          </p>
        </div>
        <div className="rounded-2xl border border-border-light bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-text-primary">3</p>
          <p className="mt-0.5 text-[10px] font-medium text-text-tertiary">
            Kredi
          </p>
        </div>
        <div className="rounded-2xl border border-border-light bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-text-primary">Ücretsiz</p>
          <p className="mt-0.5 text-[10px] font-medium text-text-tertiary">
            Plan
          </p>
        </div>
      </div>

      {/* Menü */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-warm-bg/50 btn-press ${
              i < menuItems.length - 1 ? "border-b border-border-light" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warm-bg">
              <item.icon className="h-4 w-4 text-text-tertiary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">
                {item.label}
              </p>
              <p className="text-xs text-text-tertiary">{item.sublabel}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" />
          </button>
        ))}
      </div>

      {/* Çıkış */}
      <Button
        variant="outline"
        className="h-12 w-full rounded-xl border-border-light bg-white text-base font-medium text-red-500 hover:bg-red-50 hover:text-red-600 btn-press"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Çıkış Yap
      </Button>

      {/* Versiyon */}
      <p className="mt-6 text-center text-xs text-text-tertiary">
        VOXI v1.0.0
      </p>
    </div>
  );
}
