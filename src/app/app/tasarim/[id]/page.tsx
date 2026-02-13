"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import {
  ArrowLeft,
  Download,
  Share2,
  Heart,
  RotateCcw,
  Sparkles,
  Calendar,
  Tag,
  Home,
} from "lucide-react";

// Mock data - gercek uygulamada Supabase'den gelecek
const mockDesign = {
  id: "1",
  title: "Salon - Modern Minimalist",
  style: "Modern Minimalist",
  room: "Salon",
  date: "12 Ocak 2025",
  beforeImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  afterImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop",
  liked: false,
};

export default function TasarimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const design = mockDesign;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/kutuphane">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-white text-text-secondary hover:text-text-primary transition-colors btn-press">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              {design.title}
            </h1>
            <p className="text-sm text-text-tertiary">{design.date}</p>
          </div>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-white text-text-secondary hover:text-text-primary transition-colors btn-press">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Before / After Slider */}
      <BeforeAfterSlider
        beforeSrc={design.beforeImage}
        afterSrc={design.afterImage}
        beforeLabel="Once"
        afterLabel="Sonra"
        className="mb-6"
      />

      {/* Action Buttons */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-11 rounded-xl border-border-light bg-white text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
        >
          <Download className="mr-2 h-4 w-4" />
          Indir
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-xl border-border-light bg-white text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Paylas
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-xl border-border-light bg-white text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Tekrar
        </Button>
      </div>

      {/* Details Card */}
      <div className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">
          Tasarim Detaylari
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-bg">
              <Home className="h-4 w-4 text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Oda Tipi</p>
              <p className="text-sm font-medium text-text-primary">
                {design.room}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-bg">
              <Tag className="h-4 w-4 text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Tasarim Stili</p>
              <p className="text-sm font-medium text-text-primary">
                {design.style}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-bg">
              <Calendar className="h-4 w-4 text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Olusturma Tarihi</p>
              <p className="text-sm font-medium text-text-primary">
                {design.date}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-bg">
              <Sparkles className="h-4 w-4 text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">AI Model</p>
              <p className="text-sm font-medium text-text-primary">
                VOXI AI v1
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Regenerate CTA */}
      <div className="mt-6">
        <Link href="/app/tasarla">
          <Button className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press">
            <Sparkles className="mr-2 h-4 w-4" />
            Yeni Tasarim Olustur
          </Button>
        </Link>
      </div>
    </div>
  );
}
