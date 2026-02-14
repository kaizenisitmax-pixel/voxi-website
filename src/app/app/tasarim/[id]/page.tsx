"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Loader2,
  Cpu,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Design {
  id: string;
  original_image_url: string;
  ai_image_url: string;
  category: string;
  style: string;
  tool: string;
  service_type: string;
  prompt: string;
  processing_status: string;
  model_used: string | null;
  estimated_cost: number | null;
  replicate_id: string | null;
  created_at: string;
}

export default function TasarimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    async function fetchDesign() {
      const supabase = supabaseRef.current;

      const { data, error: fetchError } = await supabase
        .from("designs")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError("Tasarım bulunamadı");
        setLoading(false);
        return;
      }

      setDesign(data as Design);
      setLoading(false);

      // If still processing, poll for updates
      if (data.processing_status === "processing") {
        const interval = setInterval(async () => {
          const { data: updated } = await supabase
            .from("designs")
            .select("*")
            .eq("id", id)
            .single();

          if (updated && updated.processing_status !== "processing") {
            setDesign(updated as Design);
            clearInterval(interval);
          }
        }, 3000);

        return () => clearInterval(interval);
      }
    }

    fetchDesign();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!design) return;
    const confirmed = window.confirm("Bu tasarımı silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    const supabase = supabaseRef.current;
    await supabase.from("designs").delete().eq("id", design.id);
    router.push("/app/kutuphane");
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
        <p className="mt-4 text-sm text-text-tertiary">Tasarım yükleniyor...</p>
      </div>
    );
  }

  // Error state
  if (error || !design) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="mb-4 text-sm text-text-tertiary">
          {error || "Tasarım bulunamadı"}
        </p>
        <Link href="/app/kutuphane">
          <Button
            variant="outline"
            className="rounded-xl border-border-light"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kütüphaneye Dön
          </Button>
        </Link>
      </div>
    );
  }

  // Still processing
  if (design.processing_status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-border-light bg-white shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          Tasarım işleniyor...
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          AI görseliniz hazırlanıyor, lütfen bekleyin.
        </p>
        <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-border-light">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-accent-black" />
        </div>
      </div>
    );
  }

  // Failed state
  if (design.processing_status === "failed") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="mb-2 text-lg font-semibold text-text-primary">
          Tasarım başarısız oldu
        </p>
        <p className="mb-6 text-sm text-text-tertiary">
          AI görseli oluşturulamadı. Lütfen tekrar deneyin.
        </p>
        <Link href="/app">
          <Button className="h-12 rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press">
            <Sparkles className="mr-2 h-4 w-4" />
            Yeni Tasarım Oluştur
          </Button>
        </Link>
      </div>
    );
  }

  // Completed — show full detail
  const styleName = design.style.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/kutuphane">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-white text-text-secondary hover:text-text-primary transition-colors btn-press">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              {(design.category || "").charAt(0).toUpperCase() + (design.category || "").slice(1)} — {styleName}
            </h1>
            <p className="text-sm text-text-tertiary">
              {formatDate(design.created_at)}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-white text-text-secondary hover:text-danger transition-colors btn-press"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Önce / Sonra Slider */}
      {design.ai_image_url && design.original_image_url ? (
        <BeforeAfterSlider
          beforeSrc={design.original_image_url}
          afterSrc={design.ai_image_url}
          beforeLabel="Önce"
          afterLabel="Sonra"
          className="mb-6"
        />
      ) : (
        <div className="mb-6 overflow-hidden rounded-2xl border border-border-light">
          {design.ai_image_url ? (
            <img
              src={design.ai_image_url}
              alt="AI Tasarım"
              className="aspect-video w-full object-cover"
            />
          ) : (
            <img
              src={design.original_image_url}
              alt="Orijinal"
              className="aspect-video w-full object-cover"
            />
          )}
        </div>
      )}

      {/* Aksiyon Butonları */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-11 rounded-xl border-border-light bg-white text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
          onClick={() => {
            if (design.ai_image_url) {
              window.open(design.ai_image_url, "_blank");
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Indir
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-xl border-border-light bg-white text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `VOXI Tasarım — ${styleName}`,
                url: window.location.href,
              });
            }
          }}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Paylaş
        </Button>
        <Link href="/app">
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-border-light bg-white text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Tekrar
          </Button>
        </Link>
      </div>

      {/* Detay Kartı */}
      <div className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">
          Tasarım Detayları
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-bg">
              <Home className="h-4 w-4 text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Kategori</p>
              <p className="text-sm font-medium text-text-primary">
                {(design.category || "").charAt(0).toUpperCase() + (design.category || "").slice(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-bg">
              <Tag className="h-4 w-4 text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Tasarım Stili</p>
              <p className="text-sm font-medium text-text-primary">
                {styleName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-bg">
              <Calendar className="h-4 w-4 text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Oluşturma Tarihi</p>
              <p className="text-sm font-medium text-text-primary">
                {formatDate(design.created_at)}
              </p>
            </div>
          </div>
          {design.model_used && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-bg">
                <Cpu className="h-4 w-4 text-text-tertiary" />
              </div>
              <div>
                <p className="text-xs text-text-tertiary">AI Model</p>
                <p className="text-sm font-medium text-text-primary">
                  {design.model_used}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-bg">
              <Sparkles className="h-4 w-4 text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Hizmet Tipi</p>
              <p className="text-sm font-medium text-text-primary">
                {(design.service_type || "").charAt(0).toUpperCase() + (design.service_type || "").slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Yeni Tasarım CTA */}
      <div className="mt-6">
        <Link href="/app">
          <Button className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press">
            <Sparkles className="mr-2 h-4 w-4" />
            Yeni Tasarım Oluştur
          </Button>
        </Link>
      </div>
    </div>
  );
}
