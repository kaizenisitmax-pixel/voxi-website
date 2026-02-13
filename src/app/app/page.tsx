"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Camera,
  X,
  Loader2,
  Sparkles,
  Home,
  Building2,
  Factory,
  MoreHorizontal,
  PaintBucket,
  Hammer,
  Thermometer,
  RefreshCw,
  Sofa,
  Trash2,
  Paintbrush,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ─── */

const categories = [
  { id: "ev", label: "Ev", icon: Home },
  { id: "ticari", label: "Ticari", icon: Building2 },
  { id: "endustriyel", label: "Endüstriyel", icon: Factory },
  { id: "diger", label: "Diğer", icon: MoreHorizontal },
];

const serviceTypes = [
  {
    id: "dekorasyon",
    title: "Dekorasyon",
    description: "İç mekan tasarımı ve dekorasyon",
    icon: PaintBucket,
  },
  {
    id: "yapi",
    title: "Yapı",
    description: "Tadilat ve yapısal değişiklikler",
    icon: Hammer,
  },
  {
    id: "iklimlendirme",
    title: "İklimlendirme",
    description: "Isıtma, soğutma ve havalandırma",
    icon: Thermometer,
  },
];

const designStyles = [
  { id: "modern", name: "Modern Minimalist", img: null },
  { id: "scandinavian", name: "Skandinav", img: null },
  { id: "industrial", name: "Industrial", img: null },
  { id: "bohemian", name: "Bohem", img: null },
  { id: "japandi", name: "Japandi", img: null },
  { id: "rustic", name: "Rustik", img: null },
  { id: "contemporary", name: "Çağdaş", img: null },
  { id: "classic", name: "Klasik", img: null },
  { id: "artdeco", name: "Art Deco", img: null },
  { id: "midcentury", name: "Mid-Century", img: null },
];

const tools = [
  { id: "redesign", label: "Yeniden Tasarla", icon: RefreshCw },
  { id: "furnish", label: "Döşe", icon: Sofa },
  { id: "remove-furniture", label: "Mobilya Sil", icon: Trash2 },
  { id: "wall-paint", label: "Duvar Boya", icon: Paintbrush },
];

type Step = "category" | "service" | "style" | "photo" | "tool" | "generating";

const stepOrder: Step[] = [
  "category",
  "service",
  "style",
  "photo",
  "tool",
  "generating",
];

/* ─── Component ─── */

export default function TasarlaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [tool, setTool] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const stepIdx = stepOrder.indexOf(step);
  const totalSteps = stepOrder.length - 1; // exclude "generating"

  const goNext = () => {
    const next = stepOrder[stepIdx + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    const prev = stepOrder[stepIdx - 1];
    if (prev) setStep(prev);
  };

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setPhoto(URL.createObjectURL(file));
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) setPhoto(URL.createObjectURL(file));
  }, []);

  const handleGenerate = () => {
    setStep("generating");
    setTimeout(() => router.push("/app/tasarim/demo-1"), 3000);
  };

  /* ─── Render ─── */
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {/* Header */}
      {step !== "generating" && (
        <>
          <div className="mb-1 flex items-center justify-between">
            {stepIdx > 0 ? (
              <button
                onClick={goBack}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:bg-white hover:text-text-primary transition-colors btn-press"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-9" />
            )}
            <span className="text-xs font-medium text-text-tertiary">
              {stepIdx + 1} / {totalSteps}
            </span>
            <div className="w-9" />
          </div>

          {/* Progress */}
          <div className="mb-8 flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= stepIdx ? "bg-accent-black" : "bg-border-light"
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Step: Kategori ── */}
      {step === "category" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Kategori seç
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Tasarım yapılacak mekanın türünü belirle.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  goNext();
                }}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all btn-press",
                  category === cat.id
                    ? "border-accent-black bg-white shadow-sm"
                    : "border-border-light bg-white hover:border-text-tertiary"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warm-bg">
                  <cat.icon className="h-5 w-5 text-text-primary" />
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Hizmet Tipi ── */}
      {step === "service" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Hizmet tipi seç
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Ne tür bir değişiklik yapmak istiyorsun?
            </p>
          </div>
          <div className="space-y-3">
            {serviceTypes.map((svc) => (
              <button
                key={svc.id}
                onClick={() => {
                  setService(svc.id);
                  goNext();
                }}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all btn-press",
                  service === svc.id
                    ? "border-accent-black bg-white shadow-sm"
                    : "border-border-light bg-white hover:border-text-tertiary"
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warm-bg">
                  <svc.icon className="h-5 w-5 text-text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {svc.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {svc.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Stil ── */}
      {step === "style" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Tasarım stili seç
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Mekana uygulanacak tasarım dilini belirle.
            </p>
          </div>

          {/* Horizontal scroll cards */}
          <div className="-mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {designStyles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={cn(
                    "flex w-[130px] shrink-0 flex-col items-center rounded-2xl border p-4 transition-all btn-press",
                    style === s.id
                      ? "border-accent-black bg-white shadow-sm"
                      : "border-border-light bg-white hover:border-text-tertiary"
                  )}
                >
                  <div className="mb-3 flex h-16 w-full items-center justify-center rounded-xl bg-warm-bg">
                    <Sparkles className="h-5 w-5 text-text-tertiary" />
                  </div>
                  <span className="text-xs font-medium text-text-primary text-center leading-tight">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
            disabled={!style}
            onClick={goNext}
          >
            Devam Et
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Step: Fotoğraf ── */}
      {step === "photo" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Fotoğraf yükle
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Dönüştürmek istediğin mekanın net bir fotoğrafını seç.
            </p>
          </div>

          {/* Context tip */}
          <div className="flex items-start gap-3 rounded-xl border border-border-light bg-white p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
            <p className="text-xs leading-relaxed text-text-secondary">
              En iyi sonuç için odanın tamamını gösteren, iyi aydınlatılmış bir
              fotoğraf kullan. Geniş açı tercih edilir.
            </p>
          </div>

          {!photo ? (
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors",
                isDragging
                  ? "border-accent-black bg-white"
                  : "border-border-light bg-white"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-bg">
                <Upload className="h-6 w-6 text-text-tertiary" />
              </div>
              <p className="mb-1 text-sm font-medium text-text-primary">
                Fotoğrafını sürükle veya seç
              </p>
              <p className="mb-4 text-xs text-text-tertiary">
                JPG, PNG — Maksimum 10MB
              </p>
              <label>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-border-light bg-white text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
                  asChild
                >
                  <span>
                    <Camera className="mr-2 h-4 w-4" />
                    Fotoğraf Seç
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm">
              <img
                src={photo}
                alt="Yüklenen fotoğraf"
                className="aspect-video w-full object-cover"
              />
              <button
                onClick={() => setPhoto(null)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <Button
            className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
            disabled={!photo}
            onClick={goNext}
          >
            Devam Et
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Step: Araç Seç ── */}
      {step === "tool" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Araç seç
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Fotoğrafa ne yapmak istiyorsun?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all btn-press",
                  tool === t.id
                    ? "border-accent-black bg-white shadow-sm"
                    : "border-border-light bg-white hover:border-text-tertiary"
                )}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warm-bg">
                  <t.icon className="h-5 w-5 text-text-primary" />
                </div>
                <span className="text-xs font-medium text-text-primary">
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-border-light bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Özet
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Kategori</span>
                <span className="font-medium text-text-primary">
                  {categories.find((c) => c.id === category)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Hizmet</span>
                <span className="font-medium text-text-primary">
                  {serviceTypes.find((s) => s.id === service)?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Stil</span>
                <span className="font-medium text-text-primary">
                  {designStyles.find((s) => s.id === style)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Maliyet</span>
                <span className="font-medium text-text-primary">1 Kredi</span>
              </div>
            </div>
          </div>

          <Button
            className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
            disabled={!tool}
            onClick={handleGenerate}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI ile Tasarla
          </Button>
        </div>
      )}

      {/* ── Generating ── */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-border-light bg-white shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Tasarım oluşturuluyor...
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Bu işlem birkaç saniye sürebilir.
          </p>
          <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-border-light">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-accent-black" />
          </div>
        </div>
      )}
    </div>
  );
}
