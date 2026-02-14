"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Camera,
  X,
  Loader2,
  Sparkles,
  Info,
  AlertCircle,
  MessageCircle,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  categories,
  serviceTypes,
  getStyles,
  getTools,
  getDetailQuestions,
  getQuickTags,
  photoTips,
} from "@/lib/design-data";
import {
  getModelForDesign,
  estimateProcessingTime,
  calculateModelCost,
  buildEnhancedPrompt,
  creativityToParams,
  REPLICATE_MODELS,
} from "@/lib/replicate-model-mapping";
import type { StyleOption, QuestionGroup } from "@/lib/design-data";

type DesignTab = "quick" | "advanced";

export default function TasarlaPage() {
  const router = useRouter();

  /* ── Core selections ── */
  const [category, setCategory] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [tool, setTool] = useState<string>("redesign");
  const [creativity, setCreativity] = useState(50);

  /* ── Photo ── */
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /* ── Tab & Advanced mode ── */
  const [tab, setTab] = useState<DesignTab>("quick");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showNegative, setShowNegative] = useState(false);

  /* ── Details (for iklimlendirme) ── */
  const [details, setDetails] = useState<Record<string, string[]>>({});

  /* ── Generation ── */
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<{
    modelUsed: string;
    estimatedTime: number;
    estimatedCost: number;
  } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Derived ── */
  const availableStyles = getStyles(category, service);
  const availableTools = getTools(service);
  const quickTags = getQuickTags(category, service);
  const detailQuestions = getDetailQuestions(category, service);
  const isIklimlendirme = service === "iklimlendirme";
  const canGenerate = !!(photoFile && category && service && style && !isIklimlendirme);

  const tip = service ? photoTips[service] : null;

  // Reset dependent state when category/service changes
  useEffect(() => {
    setStyle(null);
    setTool("redesign");
    setSelectedTags([]);
    setFreeText("");
    setNegativePrompt("");
    setDetails({});
  }, [category, service]);

  // Cleanup polling/timer on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ── Image handlers ── */
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

  /* ── Tag toggle ── */
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  /* ── Detail chip toggle (for iklimlendirme form) ── */
  const toggleDetail = useCallback(
    (groupId: string, option: string, multiple: boolean) => {
      setDetails((prev) => {
        const current = prev[groupId] || [];
        if (multiple) {
          const next = current.includes(option)
            ? current.filter((o) => o !== option)
            : [...current, option];
          return { ...prev, [groupId]: next };
        }
        return { ...prev, [groupId]: current[0] === option ? [] : [option] };
      });
    },
    []
  );

  /* ── Custom prompt from tags + freeText ── */
  const customPrompt = useMemo(() => {
    const parts: string[] = [];
    if (selectedTags.length > 0) parts.push(selectedTags.join(", "));
    if (freeText.trim()) parts.push(freeText.trim());
    return parts.join(", ");
  }, [selectedTags, freeText]);

  /* ── Preview prompt ── */
  const previewPrompt = useMemo(() => {
    if (!category || !service || !style) return "";
    return buildEnhancedPrompt(service, category, style, tool, customPrompt || undefined);
  }, [category, service, style, tool, customPrompt]);

  /* ── Model info ── */
  const modelInfo = useMemo(() => {
    if (!category || !service || !style) return null;
    const m = getModelForDesign(service, category, style);
    return m || REPLICATE_MODELS.interior_design;
  }, [category, service, style]);

  /* ── Generate ── */
  const handleGenerate = async () => {
    if (!photoFile || !category || !service || !style) return;

    setIsGenerating(true);
    setGenerationError(null);
    setElapsedSeconds(0);

    const finalModel = modelInfo || REPLICATE_MODELS.interior_design;
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
      formData.append("creativity", creativity.toString());
      if (customPrompt) formData.append("customPrompt", customPrompt);

      const startRes = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const startData = await startRes.json();

      if (!startRes.ok) {
        throw new Error(startData.error || "Tasarım başlatılamadı");
      }

      const { designId, predictionId } = startData;

      const pollStatus = async () => {
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
            setGenerationError(statusData.error || "Tasarım başarısız oldu");
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
        error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu"
      );
    }
  };

  /* ═══════════════════════════════════════════
     GENERATING OVERLAY
     ═══════════════════════════════════════════ */
  if (isGenerating) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
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
                setIsGenerating(false);
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
    );
  }

  /* ═══════════════════════════════════════════
     MAIN LAYOUT — TEK EKRAN
     ═══════════════════════════════════════════ */
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* ────────────────────────────────
            SOL PANEL — Fotoğraf + Yaratıcılık
            ──────────────────────────────── */}
        <div className="space-y-5">
          {/* Photo upload */}
          {!photo ? (
            <div
              className={cn(
                "flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors md:min-h-[400px]",
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
                  ref={fileInputRef}
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
                className="aspect-4/3 w-full object-cover"
              />
              <button
                onClick={() => {
                  setPhoto(null);
                  setPhotoFile(null);
                }}
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

          {/* Photo tip */}
          {tip && (
            <div className="flex items-start gap-3 rounded-xl border border-border-light bg-white p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
              <p className="text-xs leading-relaxed text-text-secondary">{tip}</p>
            </div>
          )}

          {/* Creativity slider */}
          <div className="rounded-2xl border border-border-light bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Yaratıcılık</span>
              <span className="text-xs tabular-nums text-text-tertiary">{creativity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={creativity}
              onChange={(e) => setCreativity(Number(e.target.value))}
              className="w-full accent-accent-black"
            />
            <div className="mt-1.5 flex justify-between text-[10px] text-text-tertiary">
              <span>Orijinale Sadık</span>
              <span>Yaratıcı</span>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────
            SAĞ PANEL — Seçimler
            ──────────────────────────────── */}
        <div className="space-y-5">
          {/* Tab switcher */}
          <div className="flex rounded-xl border border-border-light bg-white p-1">
            <button
              onClick={() => setTab("quick")}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                tab === "quick"
                  ? "bg-accent-black text-white"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Hızlı
            </button>
            <button
              onClick={() => setTab("advanced")}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                tab === "advanced"
                  ? "bg-accent-black text-white"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Gelişmiş
            </button>
          </div>

          {/* ── 1. Mekan (Category) ── */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Mekan
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all btn-press",
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

          {/* ── 2. Hizmet (Service Type) ── */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Hizmet
            </p>
            <div className="flex flex-wrap gap-2">
              {serviceTypes.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setService(svc.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all btn-press",
                    service === svc.id
                      ? "border-accent-black bg-accent-black text-white"
                      : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
                  )}
                >
                  <svc.icon className="h-4 w-4" />
                  {svc.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── İklimlendirme Uyarı ── */}
          {isIklimlendirme && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border-light bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-bg">
                  <Info className="h-6 w-6 text-text-tertiary" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">
                  AI Tasarım Yakında
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  İklimlendirme kategorisinde AI görsel tasarım henüz desteklenmiyor.
                  Uzmanlarımızla iletişime geçerek profesyonel destek alabilirsiniz.
                </p>
              </div>

              {/* İklimlendirme detail questions */}
              {detailQuestions.length > 0 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-text-primary">Projenizi tanımlayın</p>
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
            </div>
          )}

          {/* ── 3. Stil (Dynamic) ── */}
          {!isIklimlendirme && (
            <>
              <div>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Stil
                </p>
                {availableStyles.length > 0 ? (
                  <div className="-mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none md:flex-wrap md:overflow-visible">
                      {availableStyles.map((s: StyleOption) => (
                        <button
                          key={s.id}
                          onClick={() => setStyle(s.id)}
                          className={cn(
                            "flex w-[90px] shrink-0 flex-col items-center gap-2 rounded-2xl border p-3 transition-all btn-press md:w-[100px]",
                            style === s.id
                              ? "border-2 border-accent-black bg-selected-bg"
                              : "border border-border-light bg-white hover:border-text-tertiary"
                          )}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warm-bg">
                            <s.icon className="h-4 w-4 text-text-primary" />
                          </div>
                          <span className="text-center text-[11px] font-medium leading-tight text-text-primary">
                            {s.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border-light bg-white p-6 text-center">
                    <p className="text-xs text-text-tertiary">
                      Mekan ve hizmet tipi seçin
                    </p>
                  </div>
                )}
              </div>

              {/* ═══ ADVANCED MODE EXTRAS ═══ */}
              {tab === "advanced" && (
                <div className="space-y-5">
                  {/* Tool selection */}
                  {availableTools.length > 0 && (
                    <div>
                      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Araç
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableTools.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all btn-press",
                              tool === t.id
                                ? "border-accent-black bg-accent-black text-white"
                                : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
                            )}
                          >
                            <t.icon className="h-4 w-4" />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick tags */}
                  {quickTags.length > 0 && (
                    <div>
                      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Hızlı Etiketler
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all btn-press",
                              selectedTags.includes(tag)
                                ? "border-accent-black bg-accent-black text-white"
                                : "border-border-light bg-white text-text-primary hover:border-text-tertiary"
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Free text prompt */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                      Tasarım Promptu
                    </p>
                    <textarea
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      placeholder="Tasarımınızı detaylandırın... Örn: Geniş pencereler, açık mutfak, bahçeye bakan teras"
                      rows={4}
                      className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-black focus:outline-none focus:ring-2 focus:ring-accent-black/20 resize-none"
                    />
                  </div>

                  {/* AI Prompt Enrich button (placeholder) */}
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-light bg-white py-2.5 text-xs font-medium text-text-secondary hover:border-text-tertiary hover:text-text-primary transition-colors btn-press"
                    title="Yakında"
                    disabled
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    AI ile Prompt Zenginleştir
                    <span className="rounded bg-border-light px-1.5 py-0.5 text-[10px] text-text-tertiary">yakında</span>
                  </button>

                  {/* Negative prompt (collapsible) */}
                  <div>
                    <button
                      onClick={() => setShowNegative(!showNegative)}
                      className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors"
                    >
                      {showNegative ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      Olmasın (Negative Prompt)
                    </button>
                    {showNegative && (
                      <textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="Olmasını istemediğiniz öğeler... Örn: karanlık, dar alan, eski mobilya"
                        rows={2}
                        className="mt-2 w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-black focus:outline-none focus:ring-2 focus:ring-accent-black/20 resize-none"
                      />
                    )}
                  </div>

                  {/* Prompt preview */}
                  {previewPrompt && (
                    <div className="rounded-xl bg-[#F0EDE8] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <ClipboardList className="h-3.5 w-3.5 text-text-tertiary" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                          Oluşan Prompt
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-text-secondary font-mono wrap-break-word">
                        &ldquo;{previewPrompt}&rdquo;
                      </p>
                      {modelInfo && (
                        <p className="mt-2 text-[10px] text-text-tertiary">
                          Model: {modelInfo.modelId.split("/").pop()} (~{estimateProcessingTime(modelInfo)}s, ${calculateModelCost(modelInfo).toFixed(3)})
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ GENERATE BUTTON ═══ */}
              <Button
                className="h-14 w-full rounded-xl bg-accent-black text-base font-semibold text-white hover:bg-accent-black/90 btn-press disabled:opacity-40"
                disabled={!canGenerate}
                onClick={handleGenerate}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Tasarımı Başlat
              </Button>

              {!photoFile && category && service && style && (
                <p className="text-center text-xs text-text-tertiary">
                  Devam etmek için fotoğraf yükleyin
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
