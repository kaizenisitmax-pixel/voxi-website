"use client";

import Link from "next/link";
import {
  Video,
  FolderOpen,
  CreditCard,
  Building2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const studioCards = [
  {
    href: "/app/firma/studio",
    icon: Video,
    title: "Video Studio",
    desc: "Öncesi/sonrası fotoğraflarından timelapse video üret",
    accent: true,
  },
  {
    href: "/app/firma/videolar",
    icon: FolderOpen,
    title: "Videolarım",
    desc: "Oluşturduğun videoları görüntüle, paylaş ve yönet",
    accent: false,
  },
  {
    href: "/app/firma/krediler",
    icon: CreditCard,
    title: "Krediler",
    desc: "Bakiyeni görüntüle, kredi satın al, işlem geçmişi",
    accent: false,
  },
  {
    href: "/app/firma/kayit",
    icon: Building2,
    title: "Firma Bilgileri",
    desc: "Firma kaydı ve profil bilgilerini düzenle",
    accent: false,
  },
];

export default function FirmaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Supplier Studio</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Projelerinizi videoya dönüştürün, portföyünüzü yönetin
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {studioCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div
              className={cn(
                "group flex items-center gap-4 rounded-2xl border p-5 transition-all hover:shadow-sm btn-press",
                card.accent
                  ? "border-accent-black bg-accent-black text-white"
                  : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  card.accent ? "bg-white/10" : "bg-warm-bg"
                )}
              >
                <card.icon
                  className={cn(
                    "h-5 w-5",
                    card.accent ? "text-white" : "text-text-tertiary"
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    card.accent ? "text-white" : "text-text-primary"
                  )}
                >
                  {card.title}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    card.accent ? "text-white/60" : "text-text-tertiary"
                  )}
                >
                  {card.desc}
                </p>
              </div>
              <ArrowRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                  card.accent ? "text-white/50" : "text-text-tertiary"
                )}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
