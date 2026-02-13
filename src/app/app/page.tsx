"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
  Info,
  AlertCircle,
  MessageCircle,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  categories,
  serviceTypes,
  getStyles,
  getTools,
  getDetailQuestions,
  photoTips,
} from "@/lib/design-data";
import {
  getModelForDesign,
  estimateProcessingTime,
  calculateModelCost,
  buildEnhancedPrompt,
  REPLICATE_MODELS,
} from "@/lib/replicate-model-mapping";
import type { StyleOption, QuestionGroup } from "@/lib/design-data";

type Step =
  | "category"
  | "service"
  | "style"
  | "iklimlendirme-info"
  | "photo"
  | "tool"
  | "details"
  | "generating";

const stepLabels: Record<string, { num: number; title: string }> = {
  category: { num: 1, title: "Kategori" },
  service: { num: 2, title: "Hizmet Tipi" },
  style: { num: 3, title: "Stil" },
  "iklimlendirme-info": { num: 4, title: "Bilgi" },
  photo: { num: 4, title: "Fotoğraf" },
  tool: { num: 5, title: "Araç" },
  details: { num: 6, title: "Detaylar" },
};

function getStepOrder(serviceType: string | null): Step[] {
  if (serviceType === "iklimlendirme") {
    return ["category", "service", "style", "iklimlendirme-info"];
  }
  return ["category", "service", "style", "photo", "tool", "details", "generating"];
}

export default function TasarlaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [tool, setTool] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Details state
  const [details, setDetails] = useState<Record<string, string[]>>({});
  const [freeText, setFreeText] = useState("");

  // Generation state
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<{
    modelUsed: string;
    estimatedTime: number;
    estimatedCost: number;
  } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stepOrder = getStepOrder(service);
  const stepIdx = stepOrder.indexOf(step);
  const currentStepMeta = step !== "generating" ? stepLabels[step] : null;
  const availableStyles = getStyles(category, service);
  const availableTools = getTools(service);
  const detailQuestions = getDetailQuestions(category, service);

  // Total step count for indicator
  const totalSteps = service === "iklimlendirme" ? 4 : 6;

  // Cleanup polling/timer on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
      if (file) {
        setPhoto(URL.createObjectURL(file));
        setPhotoFile(file);
      }
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
      setPhoto(URL.createObjectURL(file));
      setPhotoFile(file);
    }
  }, []);

  // Toggle detail chip selection
  const toggleDetail = useCallback(
    (groupId: string, option: string, multiple: boolean) => {
      setDetails((prev) => {
        const current = prev[groupId] || [];
        if (multiple) {
          // Multi-select: toggle
          const next = current.includes(option)
            ? current.filter((o) => o !== option)
            : [...current, option];
          return { ...prev, [groupId]: next };
        } else {
          // Single-select: replace or deselect
          const next = current[0] === option ? [] : [option];
          return { ...prev, [groupId]: next };
        }
      });
    },
    []
  );

  // Build customPrompt from quick selections + free text
  const customPrompt = useMemo(() => {
    const parts: string[] = [];
    for (const selections of Object.values(details)) {
      if (selections.length > 0) {
        parts.push(selections.join(", "));
      }
    }
    if (freeText.trim()) {
      parts.push(freeText.trim());
    }
    return parts.join(", ");
  }, [details, freeText]);

  // Preview prompt (computed live)
  const previewPrompt = useMemo(() => {
    if (!category || !service || !style || !tool) return "";
    return buildEnhancedPrompt(service, category, style, tool, customPrompt || undefined);
  }, [category, service, style, tool, customPrompt]);

  // Real AI generation
  const handleGenerate = async () => {
    if (!photoFile || !category || !service || !style || !tool) return;

    setStep("generating");
    setGenerationError(null);
    setElapsedSeconds(0);

    const modelConfig = getModelForDesign(service, category, style);
    const finalModel = modelConfig || REPLICATE_MODELS.interior_design;
    setGenerationInfo({
      modelUsed: finalModel.modelId,
      estimatedTime: estimateProcessingTime(finalModel),
      estimatedCost: calculateModelCost(finalModel),
    });

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      const formData = new FormData();
      formData.append("image", photoFile);
      formData.append("category", category);
      formData.append("serviceType", service);
      formData.append("style", style);
      formData.append("tool", tool);
      if (customPrompt) {
        formData.append("customPrompt", customPrompt);
      }

      const startRes = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const startData = await startRes.json();

      if (!startRes.ok) {
        throw new Error(startData.error || "Tasarim baslatilamadi");
      }

      const { designId, predictionId } = startData;

      const pollStatus = async (): Promise<void> => {
        try {
          const statusRes = await fetch(
            `/api/generate/status?predictionId=${predictionId}&designId=${designId}`
          );
          const statusData = await statusRes.json();

          if (statusData.status === "completed") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            router.push(`/app/tasarim/${designId}`);
            return;
          }
          if (statusData.status === "failed") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            setGenerationError(statusData.error || "Tasarim basarisiz oldu");
            return;
          }
        } catch {
          console.error("Polling error, retrying...");
        }
      };

      pollingRef.current = setInterval(pollStatus, 2000);
      setTimeout(pollStatus, 1000);
    } catch (error) {
      if (timerRef.current) clearInterval(timerRef.current);
      setGenerationError(
        error instanceof Error ? error.message : "Beklenmeyen bir hata olustu"
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {/* ── Step indicator ── */}
      {step !== "generating" && (
        <>
          {/* Back + Title */}
          <div className="mb-4 flex items-center gap-3">
            {stepIdx > 0 ? (
              <button
                onClick={goBack}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light bg-white text-text-secondary hover:text-text-primary transition-colors btn-press"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-9" />
            )}
            <h1 className="flex-1 text-lg font-semibold text-text-primary">
              {currentStepMeta?.title}
            </h1>
          </div>

          {/* Numbered step badges: 1-6 (or 1-4 for iklimlendirme) */}
          <div className="mb-8 flex items-center justify-center gap-1.5 md:gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((num, i) => {
              const active = currentStepMeta && currentStepMeta.num >= num;
              const current = currentStepMeta?.num === num;
              return (
                <div key={num} className="flex items-center gap-1.5 md:gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-colors md:h-8 md:w-8 md:text-xs",
                      current
                        ? "bg-accent-black text-white"
                        : active
                          ? "bg-accent-black/80 text-white"
                          : "bg-border-light text-text-tertiary"
                    )}
                  >
                    {num}
                  </div>
                  {i < totalSteps - 1 && (
                    <div
                      className={cn(
                        "h-0.5 w-4 rounded-full transition-colors md:w-8",
                        active ? "bg-accent-black" : "bg-border-light"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          ADIM 1: KATEGORİ SEÇ
         ══════════════════════════════════════════ */}
      {step === "category" && (
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Tasarım yapılacak mekanın türünü seç.
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setStyle(null);
                  setDetails({});
                  setFreeText("");
                  goNext();
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all btn-press",
                  category === cat.id
                    ? "border-accent-black bg-accent-black text-white"
                    : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
                )}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ADIM 2: HİZMET TİPİ SEÇ
         ══════════════════════════════════════════ */}
      {step === "service" && (
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Ne tür bir değişiklik yapmak istiyorsun?
          </p>
          <div className="space-y-3">
            {serviceTypes.map((svc) => (
              <button
                key={svc.id}
                onClick={() => {
                  setService(svc.id);
                  setStyle(null);
                  setTool(null);
                  setDetails({});
                  setFreeText("");
                  goNext();
                }}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all btn-press",
                  service === svc.id
                    ? "border-2 border-accent-black bg-selected-bg"
                    : "border border-border-light bg-white hover:border-text-tertiary"
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warm-bg">
                  <svc.icon className="h-5 w-5 text-text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {svc.label}
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

      {/* ══════════════════════════════════════════
          ADIM 3: STİL SEÇ (DİNAMİK)
         ══════════════════════════════════════════ */}
      {step === "style" && (
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Mekana uygulanacak tasarım dilini seç.
          </p>
          <div className="-mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-5 md:overflow-visible">
              {availableStyles.map((s: StyleOption) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={cn(
                    "flex w-[100px] shrink-0 flex-col items-center gap-2.5 rounded-2xl border p-4 transition-all btn-press md:w-auto",
                    style === s.id
                      ? "border-2 border-accent-black bg-selected-bg"
                      : "border border-border-light bg-white hover:border-text-tertiary"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warm-bg">
                    <s.icon className="h-5 w-5 text-text-primary" />
                  </div>
                  <span className="text-center text-[11px] font-medium leading-tight text-text-primary md:text-xs">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {availableStyles.length === 0 && (
            <div className="rounded-2xl border border-border-light bg-white p-8 text-center">
              <p className="text-sm text-text-tertiary">
                Lütfen önce kategori ve hizmet tipi seçin.
              </p>
            </div>
          )}

          <Button
            className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
            disabled={!style}
            onClick={() => {
              if (service === "iklimlendirme") {
                setStep("iklimlendirme-info");
              } else {
                goNext();
              }
            }}
          >
            Devam Et
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          İKLİMLENDİRME BİLGİ
         ══════════════════════════════════════════ */}
      {step === "iklimlendirme-info" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-light bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-bg">
              <Info className="h-7 w-7 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              AI Tasarım Yakında
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              İklimlendirme kategorisinde AI görsel tasarım henüz desteklenmiyor.
              Şimdilik uzmanlarımızla iletişime geçerek projeniz için profesyonel
              destek alabilirsiniz.
            </p>
          </div>

          {/* İklimlendirme detay soruları (teklif talebi) */}
          {detailQuestions.length > 0 && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-text-primary">
                Projenizi tanımlayın
              </h3>
              {detailQuestions.map((group: QuestionGroup) => (
                <div key={group.id}>
                  <p className="mb-2 text-xs font-medium text-text-secondary">
                    {group.label}
                    {group.multiple && (
                      <span className="ml-1 text-text-tertiary">(çoklu seçim)</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const isSelected = (details[group.id] || []).includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => toggleDetail(group.id, option, group.multiple)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all btn-press",
                            isSelected
                              ? "border-accent-black bg-accent-black text-white"
                              : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            className="h-14 w-full rounded-xl bg-accent-black text-base font-semibold text-white hover:bg-accent-black/90 btn-press"
            onClick={() => router.push("/app/sohbetler")}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Uzmanla İletişime Geç
          </Button>
          <button
            onClick={() => {
              setService(null);
              setStyle(null);
              setStep("category");
            }}
            className="w-full text-center text-sm text-text-tertiary hover:text-text-primary transition-colors"
          >
            Farklı bir hizmet tipi seç
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ADIM 4: FOTOĞRAF YÜKLE
         ══════════════════════════════════════════ */}
      {step === "photo" && (
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Dönüştürmek istediğin mekanın net bir fotoğrafını seç.
          </p>

          {service && photoTips[service] && (
            <div className="flex items-start gap-3 rounded-xl border border-border-light bg-white p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
              <p className="text-xs leading-relaxed text-text-secondary">
                {photoTips[service]}
              </p>
            </div>
          )}

          {!photo ? (
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors",
                isDragging
                  ? "border-accent-black bg-selected-bg"
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
                <Camera className="h-6 w-6 text-text-tertiary" />
              </div>
              <p className="mb-1 text-sm font-medium text-text-primary">
                Fotoğraf Yükle
              </p>
              <p className="mb-4 text-xs text-text-tertiary">
                Sürükle bırak veya seç — JPG, PNG, maks 10MB
              </p>
              <label>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-border-light bg-white text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
                  asChild
                >
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
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
              <div className="absolute bottom-3 right-3">
                <label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg border-white/30 bg-black/50 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70"
                    asChild
                  >
                    <span>Değiştir</span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
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

      {/* ══════════════════════════════════════════
          ADIM 5: ARAÇ SEÇ
         ══════════════════════════════════════════ */}
      {step === "tool" && (
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Ne yapmak istersiniz?
          </p>

          <div
            className={cn(
              "grid gap-3",
              availableTools.length <= 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-5"
            )}
          >
            {availableTools.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all btn-press",
                  tool === t.id
                    ? "border-2 border-accent-black bg-selected-bg"
                    : "border border-border-light bg-white hover:border-text-tertiary"
                )}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warm-bg">
                  <t.icon className="h-5 w-5 text-text-primary" />
                </div>
                <span className="text-xs font-medium text-text-primary text-center">
                  {t.label}
                </span>
                <span className="text-[10px] text-text-tertiary text-center leading-tight hidden md:block">
                  {t.description}
                </span>
              </button>
            ))}
          </div>

          <Button
            className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
            disabled={!tool}
            onClick={goNext}
          >
            Devam Et
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ADIM 6: TASARIM DETAYLARI (PROMPT BUILDER)
         ══════════════════════════════════════════ */}
      {step === "details" && (
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Tasarımını detaylandır. Tüm seçenekler opsiyonel — hiç seçmeden de devam edebilirsin.
          </p>

          {/* Dinamik hızlı seçenek grupları */}
          {detailQuestions.length > 0 && (
            <div className="space-y-5">
              {detailQuestions.map((group: QuestionGroup) => (
                <div key={group.id}>
                  <p className="mb-2 text-xs font-medium text-text-secondary">
                    {group.label}
                    {group.multiple && (
                      <span className="ml-1 text-text-tertiary">(çoklu seçim)</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const isSelected = (details[group.id] || []).includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => toggleDetail(group.id, option, group.multiple)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all btn-press",
                            isSelected
                              ? "border-accent-black bg-accent-black text-white"
                              : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Serbest metin alanı */}
          <div>
            <p className="mb-2 text-xs font-medium text-text-secondary">
              Eklemek İstediğin Detaylar
            </p>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Örn: Geniş pencereler, açık mutfak, bahçeye bakan teras..."
              rows={3}
              className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-black focus:outline-none focus:ring-2 focus:ring-accent-black/20 resize-none"
            />
          </div>

          {/* Prompt önizleme */}
          {previewPrompt && (
            <div className="rounded-xl bg-[#F0EDE8] p-4">
              <div className="mb-2 flex items-center gap-2">
                <ClipboardList className="h-3.5 w-3.5 text-text-tertiary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Oluşan Tasarım Promptu
                </span>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary font-mono break-words">
                &ldquo;{previewPrompt}&rdquo;
              </p>
              {/* Model info */}
              {category && service && style && (() => {
                const m = getModelForDesign(service, category, style);
                const model = m || REPLICATE_MODELS.interior_design;
                return (
                  <p className="mt-2 text-[10px] text-text-tertiary">
                    Model: {model.modelId.split("/").pop()} (~{estimateProcessingTime(model)}s, ${calculateModelCost(model).toFixed(3)})
                  </p>
                );
              })()}
            </div>
          )}

          {/* Özet kartı */}
          <div className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Özet
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Kategori</span>
                <span className="font-medium text-text-primary">
                  {categories.find((c) => c.id === category)?.label ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Hizmet</span>
                <span className="font-medium text-text-primary">
                  {serviceTypes.find((s) => s.id === service)?.label ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Stil</span>
                <span className="font-medium text-text-primary">
                  {getStyles(category, service).find((s) => s.id === style)?.label ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Araç</span>
                <span className="font-medium text-text-primary">
                  {availableTools.find((t) => t.id === tool)?.label ?? "—"}
                </span>
              </div>
              {customPrompt && (
                <div className="flex justify-between border-t border-border-light pt-2">
                  <span className="text-text-tertiary">Detaylar</span>
                  <span className="font-medium text-text-primary text-xs text-right max-w-[60%] truncate">
                    {customPrompt.length > 60 ? customPrompt.slice(0, 60) + "..." : customPrompt}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tasarımı Başlat */}
          <Button
            className="h-14 w-full rounded-xl bg-accent-black text-base font-semibold text-white hover:bg-accent-black/90 btn-press"
            onClick={handleGenerate}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Tasarımı Başlat
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          OLUŞTURULUYOR
         ══════════════════════════════════════════ */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-24">
          {generationError ? (
            <>
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-danger/20 bg-danger/5 shadow-sm">
                <AlertCircle className="h-8 w-8 text-danger" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                Tasarım başarısız
              </h2>
              <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">
                {generationError}
              </p>
              <Button
                className="mt-6 h-12 rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
                onClick={() => {
                  setStep("details");
                  setGenerationError(null);
                  setGenerationInfo(null);
                }}
              >
                Tekrar Dene
              </Button>
            </>
          ) : (
            <>
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-border-light bg-white shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                Tasarım oluşturuluyor...
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {generationInfo
                  ? `Tahmini süre: ~${generationInfo.estimatedTime} saniye`
                  : "Bu işlem birkaç saniye sürebilir."}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                Geçen süre: {elapsedSeconds}s
              </p>
              <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-border-light">
                <div
                  className="h-full rounded-full bg-accent-black transition-all duration-1000 ease-linear"
                  style={{
                    width: generationInfo
                      ? `${Math.min((elapsedSeconds / generationInfo.estimatedTime) * 100, 95)}%`
                      : "50%",
                  }}
                />
              </div>
              {generationInfo && (
                <div className="mt-6 rounded-xl border border-border-light bg-white px-4 py-3 text-center">
                  <p className="text-[11px] text-text-tertiary">
                    Model: {generationInfo.modelUsed.split("/").pop()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
