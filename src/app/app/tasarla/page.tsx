"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Camera,
  X,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Step = "upload" | "style" | "options" | "generating";

const roomTypes = [
  "Salon",
  "Yatak Odasi",
  "Mutfak",
  "Banyo",
  "Cocuk Odasi",
  "Ofis",
  "Yemek Odasi",
  "Balkon",
];

const designStyles = [
  {
    id: "modern",
    name: "Modern Minimalist",
    description: "Sade cizgiler, notr tonlar",
  },
  {
    id: "scandinavian",
    name: "Skandinav",
    description: "Acik renkler, dogal dokular",
  },
  {
    id: "industrial",
    name: "Industrial",
    description: "Ham malzemeler, metal aksan",
  },
  {
    id: "bohemian",
    name: "Bohem",
    description: "Renkli, katmanli, eklektik",
  },
  {
    id: "japandi",
    name: "Japandi",
    description: "Japon + Iskandinav sadeligi",
  },
  {
    id: "rustic",
    name: "Rustik",
    description: "Dogal ahsap, sicak tonlar",
  },
  {
    id: "contemporary",
    name: "Cagdas",
    description: "Guncel trendler, dinamik",
  },
  {
    id: "classic",
    name: "Klasik",
    description: "Zarif detaylar, simetri",
  },
];

export default function TasarlaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setSelectedImage(url);
      }
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  }, []);

  const handleGenerate = () => {
    setStep("generating");
    // Simulate generation
    setTimeout(() => {
      router.push("/app/tasarim/demo-1");
    }, 3000);
  };

  const stepIndex = ["upload", "style", "options", "generating"].indexOf(step);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/app">
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-white text-text-secondary hover:text-text-primary transition-colors btn-press">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            Yeni Tasarim
          </h1>
          <p className="text-sm text-text-tertiary">
            Adim {Math.min(stepIndex + 1, 3)} / 3
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= stepIndex ? "bg-accent-black" : "bg-border-light"
            )}
          />
        ))}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Oda fotografini yukle
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Donusturmek istedigin odanin net bir fotografini sec.
            </p>
          </div>

          {!selectedImage ? (
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors",
                isDragging
                  ? "border-accent-black bg-warm-bg"
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
                Fotografini surukle veya sec
              </p>
              <p className="mb-4 text-xs text-text-tertiary">
                JPG, PNG - Maksimum 10MB
              </p>
              <label>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-border-light bg-white text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
                  asChild
                >
                  <span>
                    <Camera className="mr-2 h-4 w-4" />
                    Fotograf Sec
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
                src={selectedImage}
                alt="Yuklenen fotograf"
                className="aspect-video w-full object-cover"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Room Type */}
          <div>
            <label className="mb-3 block text-sm font-medium text-text-primary">
              Oda Tipi
            </label>
            <div className="flex flex-wrap gap-2">
              {roomTypes.map((room) => (
                <button
                  key={room}
                  onClick={() => setSelectedRoom(room)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-medium transition-all btn-press",
                    selectedRoom === room
                      ? "border-accent-black bg-accent-black text-white"
                      : "border-border-light bg-white text-text-secondary hover:border-text-tertiary"
                  )}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
            disabled={!selectedImage || !selectedRoom}
            onClick={() => setStep("style")}
          >
            Devam Et
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step: Style Selection */}
      {step === "style" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Tasarim stilini sec
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Odana uygulanacak tasarim dilini belirle.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {designStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={cn(
                  "flex flex-col items-start rounded-2xl border p-4 text-left transition-all btn-press",
                  selectedStyle === style.id
                    ? "border-accent-black bg-white shadow-sm"
                    : "border-border-light bg-white hover:border-text-tertiary"
                )}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-warm-bg">
                  <Sparkles className="h-4 w-4 text-text-secondary" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {style.name}
                </h3>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {style.description}
                </p>
                {selectedStyle === style.id && (
                  <div className="mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-black">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl border-border-light bg-white text-base font-medium text-text-primary hover:bg-warm-bg btn-press"
              onClick={() => setStep("upload")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
            <Button
              className="h-12 flex-1 rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
              disabled={!selectedStyle}
              onClick={() => setStep("options")}
            >
              Devam Et
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Options & Generate */}
      {step === "options" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Ozet ve olustur
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Secimlerini kontrol et ve tasarimi olustur.
            </p>
          </div>

          {/* Summary Card */}
          <div className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
            <div className="space-y-4">
              {/* Image Preview */}
              {selectedImage && (
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={selectedImage}
                    alt="Secilen fotograf"
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border-light pt-4">
                <span className="text-sm text-text-tertiary">Oda Tipi</span>
                <span className="text-sm font-medium text-text-primary">
                  {selectedRoom}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-tertiary">
                  Tasarim Stili
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {designStyles.find((s) => s.id === selectedStyle)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-tertiary">Maliyet</span>
                <span className="text-sm font-medium text-text-primary">
                  1 Kredi
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl border-border-light bg-white text-base font-medium text-text-primary hover:bg-warm-bg btn-press"
              onClick={() => setStep("style")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
            <Button
              className="h-12 flex-1 rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
              onClick={handleGenerate}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Olustur
            </Button>
          </div>
        </div>
      )}

      {/* Step: Generating */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white border border-border-light shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Tasarim olusturuluyor...
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Bu islem birkaç saniye surebilir.
          </p>
          <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-border-light">
            <div className="h-full w-full animate-pulse rounded-full bg-accent-black" />
          </div>
        </div>
      )}
    </div>
  );
}
