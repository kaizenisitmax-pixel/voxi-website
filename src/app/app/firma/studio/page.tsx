"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Upload,
  ImageIcon,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Video,
  CheckCircle2,
  Download,
  Share2,
  Plus,
  Gift,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyFirm } from "@/services/supplierService";
import { canGenerate } from "@/services/creditService";
import {
  startSupplierTimelapse,
  uploadProjectPhoto,
  subscribeToJob,
} from "@/services/timelapseService";
import type {
  Firm,
  VideoOptions,
  VideoDuration,
} from "@/types/supplier";
import {
  VIDEO_DURATION_CREDITS,
  VIDEO_DURATION_LABELS,
  MUSIC_LABELS,
} from "@/types/supplier";

type Step = "photos" | "options" | "generating" | "done";

export default function SupplierStudioPage() {
  const router = useRouter();
  const [firm, setFirm] = useState<Firm | null>(null);
  const [step, setStep] = useState<Step>("photos");

  // Fotoğraflar
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Seçenekler
  const [duration, setDuration] = useState<VideoDuration>("30s");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [music, setMusic] = useState<VideoOptions["musicTrack"]>("auto");

  // Üretim durumu
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Kredi bilgisi
  const [creditInfo, setCreditInfo] = useState<{
    isFree: boolean;
    needed: number;
    balance: number;
  } | null>(null);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFirm();
  }, []);

  useEffect(() => {
    if (firm) checkCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firm, duration]);

  const loadFirm = async () => {
    const f = await getMyFirm();
    if (!f) {
      router.replace("/app/firma/kayit");
      return;
    }
    setFirm(f);
  };

  const checkCredits = async () => {
    if (!firm) return;
    const result = await canGenerate(firm.id, duration);
    setCreditInfo({
      isFree: result.isFree,
      needed: result.creditsNeeded,
      balance: result.currentBalance,
    });
  };

  // Fotoğraf seç (web File API)
  const handleFileSelect = useCallback(
    (type: "before" | "after") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (type === "before") {
        setBeforePreview(url);
        setBeforeFile(file);
      } else {
        setAfterPreview(url);
        setAfterFile(file);
      }
    },
    []
  );

  const clearPhoto = (type: "before" | "after") => {
    if (type === "before") {
      setBeforePreview(null);
      setBeforeFile(null);
    } else {
      setAfterPreview(null);
      setAfterFile(null);
    }
  };

  // Video üret
  const handleGenerate = async () => {
    if (!firm || !beforeFile || !afterFile) return;

    const check = await canGenerate(firm.id, duration);
    if (!check.allowed) {
      setError(check.reason || "Yetersiz kredi. Kredi satın alın.");
      return;
    }

    setStep("generating");
    setGenerating(true);
    setProgress(0);
    setStatus("Fotoğraflar yükleniyor...");
    setError(null);

    try {
      // Fotoğrafları yükle
      const [beforeUrl, afterUrl] = await Promise.all([
        uploadProjectPhoto(firm.id, beforeFile, "before"),
        uploadProjectPhoto(firm.id, afterFile, "after"),
      ]);

      setProgress(15);
      setStatus("Video üretimi başlatılıyor...");

      // Timelapse başlat
      const jobId = await startSupplierTimelapse({
        firmId: firm.id,
        beforeImageUrl: beforeUrl,
        afterImageUrl: afterUrl,
        duration,
        options: {
          category: firm.sector,
          duration,
          aspectRatio,
          musicTrack: music,
          logoOverlay: !!firm.logo_url,
          textOverlay: { firmName: firm.name },
          ctaType: firm.whatsapp ? "whatsapp" : firm.phone ? "phone" : null,
          ctaValue: firm.whatsapp || firm.phone || null,
        },
      });

      // Realtime takip
      const unsubscribe = subscribeToJob(jobId, (jobStatus, jobProgress, url) => {
        setProgress(jobProgress);
        const statusMap: Record<string, string> = {
          generating_keyframes: "Ara kareler üretiliyor...",
          generating_clips: "Video oluşturuluyor...",
          merging: "Birleştiriliyor...",
          post_processing: "Son rötuşlar...",
          completed: "Tamamlandı!",
          failed: "Hata oluştu",
        };
        setStatus(statusMap[jobStatus] || jobStatus);

        if (jobStatus === "completed" && url) {
          setVideoUrl(url);
          setStep("done");
          setGenerating(false);
          unsubscribe();
        }

        if (jobStatus === "failed") {
          setGenerating(false);
          setError("Video üretimi başarısız. Krediniz iade edildi.");
          setStep("photos");
          unsubscribe();
        }
      });
    } catch (err: unknown) {
      setGenerating(false);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setStep("photos");
    }
  };

  const resetStudio = () => {
    setStep("photos");
    setBeforePreview(null);
    setAfterPreview(null);
    setBeforeFile(null);
    setAfterFile(null);
    setVideoUrl(null);
    setProgress(0);
    setError(null);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Supplier Studio</h1>
        {creditInfo && (
          <div className="rounded-full bg-accent-black px-3.5 py-1.5">
            {creditInfo.isFree ? (
              <span className="text-xs font-bold text-green-400">Ücretsiz</span>
            ) : (
              <span className="text-xs font-semibold text-white">
                {creditInfo.balance} kredi
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={beforeInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect("before")}
      />
      <input
        ref={afterInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect("after")}
      />

      {/* ══════════════════════════════════════
          STEP: PHOTOS
         ══════════════════════════════════════ */}
      {step === "photos" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">1. Proje Fotoğrafları</h2>
            <p className="mt-1 text-sm text-text-tertiary">
              Öncesi ve sonrası fotoğraflarını yükleyin
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            {/* Öncesi */}
            <PhotoCard
              label="Öncesi"
              preview={beforePreview}
              onSelect={() => beforeInputRef.current?.click()}
              onClear={() => clearPhoto("before")}
            />

            {/* Ok */}
            <div className="flex h-[180px] items-center">
              <ArrowRight className="h-5 w-5 text-text-tertiary" />
            </div>

            {/* Sonrası */}
            <PhotoCard
              label="Sonrası"
              preview={afterPreview}
              onSelect={() => afterInputRef.current?.click()}
              onClear={() => clearPhoto("after")}
            />
          </div>

          {beforeFile && afterFile && (
            <Button
              className="h-14 w-full rounded-xl bg-accent-black text-base font-bold text-white hover:bg-accent-black/90 btn-press"
              onClick={() => setStep("options")}
            >
              Devam
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP: OPTIONS
         ══════════════════════════════════════ */}
      {step === "options" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-text-primary">2. Video Ayarları</h2>

          {/* Süre */}
          <div>
            <p className="mb-2.5 text-sm font-semibold text-text-secondary">Video Süresi</p>
            <div className="flex flex-wrap gap-2">
              {(["20s", "30s", "40s", "60s"] as VideoDuration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border px-5 py-3 transition-all btn-press",
                    duration === d
                      ? "border-accent-black bg-accent-black text-white"
                      : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
                  )}
                >
                  <span className="text-sm font-semibold">{VIDEO_DURATION_LABELS[d]}</span>
                  <span
                    className={cn(
                      "mt-0.5 text-[11px]",
                      duration === d ? "text-white/60" : "text-text-tertiary"
                    )}
                  >
                    {VIDEO_DURATION_CREDITS[d]} kredi
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <p className="mb-2.5 text-sm font-semibold text-text-secondary">Format</p>
            <div className="flex flex-wrap gap-2">
              {([
                { value: "9:16" as const, label: "9:16", desc: "Reels" },
                { value: "16:9" as const, label: "16:9", desc: "YouTube" },
                { value: "1:1" as const, label: "1:1", desc: "Feed" },
              ]).map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border px-5 py-3 transition-all btn-press",
                    aspectRatio === ar.value
                      ? "border-accent-black bg-accent-black text-white"
                      : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
                  )}
                >
                  <span className="text-sm font-semibold">{ar.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 text-[11px]",
                      aspectRatio === ar.value ? "text-white/60" : "text-text-tertiary"
                    )}
                  >
                    {ar.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Müzik */}
          <div>
            <p className="mb-2.5 text-sm font-semibold text-text-secondary">Müzik</p>
            <div className="flex flex-wrap gap-2">
              {(["auto", "epic", "corporate", "ambient", "sessiz"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMusic(m)}
                  className={cn(
                    "rounded-lg border px-4 py-2.5 text-sm font-medium transition-all btn-press",
                    music === m
                      ? "border-accent-black bg-accent-black text-white"
                      : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
                  )}
                >
                  {MUSIC_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Maliyet Özeti */}
          <div className="flex items-center gap-3 rounded-xl border border-border-light bg-white p-4">
            {creditInfo?.isFree ? (
              <>
                <Gift className="h-5 w-5 shrink-0 text-green-600" />
                <span className="text-sm font-bold text-green-700">Bu video ücretsiz!</span>
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 shrink-0 text-text-primary" />
                <span className="text-sm text-text-secondary">
                  <strong>{VIDEO_DURATION_CREDITS[duration]} kredi</strong> harcanacak
                  (bakiye: {creditInfo?.balance || 0})
                </span>
              </>
            )}
          </div>

          {/* Butonlar */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-14 flex-1 rounded-xl border-border-light text-base font-semibold text-text-secondary hover:bg-warm-bg btn-press"
              onClick={() => setStep("photos")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
            <Button
              className="h-14 flex-2 rounded-xl bg-accent-black text-base font-bold text-white hover:bg-accent-black/90 btn-press"
              onClick={handleGenerate}
            >
              <Video className="mr-2 h-4 w-4" />
              Video Oluştur
            </Button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP: GENERATING
         ══════════════════════════════════════ */}
      {step === "generating" && (
        <div className="flex flex-col items-center py-16">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border-light bg-white shadow-sm">
            <Loader2 className="h-7 w-7 animate-spin text-text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Video Üretiliyor</h2>
          <p className="mt-2 text-sm text-text-secondary">{status}</p>

          {/* Progress Bar */}
          <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-border-light">
            <div
              className="h-full rounded-full bg-accent-black transition-all duration-500 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold tabular-nums text-text-primary">{progress}%</p>

          <p className="mt-6 max-w-sm text-center text-xs leading-relaxed text-text-tertiary">
            Bu işlem 3-7 dakika sürebilir.
            <br />
            Sayfadan ayrılabilirsiniz, video hazır olunca bildirim alacaksınız.
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP: DONE
         ══════════════════════════════════════ */}
      {step === "done" && videoUrl && (
        <div className="flex flex-col items-center py-12">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold text-text-primary">Video Hazır!</h2>

          <Button
            className="mt-6 h-14 rounded-xl bg-accent-black px-8 text-base font-bold text-white hover:bg-accent-black/90 btn-press"
            onClick={() => window.open(videoUrl, "_blank")}
          >
            <Video className="mr-2 h-4 w-4" />
            Videoyu İzle
          </Button>

          {/* Paylaşım */}
          <div className="mt-6 flex gap-6">
            <a
              href={videoUrl}
              download
              className="flex flex-col items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Download className="h-5 w-5" />
              <span className="text-xs">İndir</span>
            </a>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "VOXI Video", url: videoUrl });
                } else {
                  navigator.clipboard.writeText(videoUrl);
                }
              }}
              className="flex flex-col items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span className="text-xs">Paylaş</span>
            </button>
          </div>

          <Button
            variant="outline"
            className="mt-8 h-12 rounded-xl border-border-light px-8 text-sm font-semibold text-text-secondary hover:bg-warm-bg btn-press"
            onClick={resetStudio}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Video Oluştur
          </Button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// PHOTO CARD COMPONENT
// ==========================================

function PhotoCard({
  label,
  preview,
  onSelect,
  onClear,
}: {
  label: string;
  preview: string | null;
  onSelect: () => void;
  onClear: () => void;
}) {
  if (preview) {
    return (
      <div className="relative">
        <p className="mb-2 text-center text-xs font-semibold text-text-tertiary">{label}</p>
        <div className="relative overflow-hidden rounded-2xl border border-border-light bg-border-light">
          <img
            src={preview}
            alt={label}
            className="h-[180px] w-full object-cover"
          />
          <button
            onClick={onClear}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-center text-xs font-semibold text-text-tertiary">{label}</p>
      <button
        onClick={onSelect}
        className="flex h-[180px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-light bg-white transition-colors hover:border-text-tertiary hover:bg-warm-bg"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warm-bg">
          <ImageIcon className="h-5 w-5 text-text-tertiary" />
        </div>
        <span className="text-xs text-text-tertiary">Fotoğraf Seç</span>
      </button>
    </div>
  );
}
