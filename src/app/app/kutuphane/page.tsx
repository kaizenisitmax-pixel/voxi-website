"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Sparkles, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface Design {
  id: string;
  original_image_url: string;
  ai_image_url: string;
  category: string;
  style: string;
  service_type: string;
  processing_status: string;
  created_at: string;
}

export default function KutuphanePage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    async function fetchDesigns() {
      const supabase = supabaseRef.current;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDesigns(data as Design[]);
      }
      setLoading(false);
    }

    fetchDesigns();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Az önce";
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  // Get unique categories for filters
  const categoryLabels: Record<string, string> = {
    ev: "Ev",
    ticari: "Ticari",
    endustriyel: "Endüstriyel",
    diger: "Diğer",
  };

  const uniqueCategories = [...new Set(designs.map((d) => d.category))];
  const filters = [
    "Tümü",
    ...uniqueCategories.map((c) => categoryLabels[c] || c),
  ];

  // Filter designs
  const filteredDesigns = designs.filter((d) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        d.style.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.service_type.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    // Category filter
    if (activeFilter !== "Tümü") {
      const categoryKey = Object.entries(categoryLabels).find(
        ([, label]) => label === activeFilter
      )?.[0];
      if (categoryKey && d.category !== categoryKey) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
        <p className="mt-4 text-sm text-text-tertiary">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      {/* Başlık */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kütüphanem</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {designs.length} tasarım
          </p>
        </div>
        <Link href="/app">
          <Button className="h-10 rounded-xl bg-accent-black px-5 text-sm font-medium text-white hover:bg-accent-black/90 btn-press">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Tasarım
          </Button>
        </Link>
      </div>

      {/* Arama ve Filtre */}
      {designs.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              placeholder="Tasarım ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-xl border-border-light bg-white pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus-visible:ring-accent-black"
            />
          </div>
          {filters.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-all btn-press ${
                    activeFilter === filter
                      ? "border-accent-black bg-accent-black text-white"
                      : "border-border-light bg-white text-text-secondary hover:border-text-tertiary"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {filteredDesigns.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {filteredDesigns.map((design) => {
            const styleName = design.style
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            const categoryName =
              categoryLabels[design.category] || design.category;
            const isProcessing = design.processing_status === "processing";

            return (
              <Link key={design.id} href={`/app/tasarim/${design.id}`}>
                <div className="group overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm transition-shadow hover:shadow-md">
                  {/* Görsel */}
                  <div className="relative aspect-4/3 w-full bg-warm-bg">
                    {design.ai_image_url ? (
                      <img
                        src={design.ai_image_url}
                        alt={styleName}
                        className="h-full w-full object-cover"
                      />
                    ) : design.original_image_url ? (
                      <img
                        src={design.original_image_url}
                        alt="Orijinal"
                        className="h-full w-full object-cover opacity-60"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Sparkles className="h-8 w-8 text-text-tertiary/40" />
                      </div>
                    )}
                    {isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                    <div className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-medium text-text-primary backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
                      {styleName}
                    </div>
                  </div>
                  {/* Bilgi */}
                  <div className="p-3 sm:p-4">
                    <h3 className="truncate text-xs font-semibold text-text-primary sm:text-sm">
                      {categoryName} — {styleName}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] text-text-tertiary sm:text-xs">
                        {(design.service_type || "").charAt(0).toUpperCase() +
                          (design.service_type || "").slice(1)}
                      </span>
                      <span className="text-[10px] text-text-tertiary sm:text-xs">
                        ·
                      </span>
                      <span className="text-[10px] text-text-tertiary sm:text-xs">
                        {formatDate(design.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Boş Durum */}
      {designs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border-light bg-white">
            <Sparkles className="h-8 w-8 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Henüz tasarımınız yok
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            İlk tasarımınızı oluşturun!
          </p>
          <Link href="/app">
            <Button className="mt-6 h-11 rounded-xl bg-accent-black px-6 text-sm font-medium text-white hover:bg-accent-black/90 btn-press">
              <Plus className="mr-2 h-4 w-4" />
              İlk Tasarımını Oluştur
            </Button>
          </Link>
        </div>
      )}

      {/* Filtrede sonuç yok */}
      {designs.length > 0 && filteredDesigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-text-tertiary">
            Aramanızla eşleşen tasarım bulunamadı.
          </p>
        </div>
      )}
    </div>
  );
}
