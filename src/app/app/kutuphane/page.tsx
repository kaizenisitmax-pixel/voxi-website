import Link from "next/link";
import { Sparkles, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const designs = [
  {
    id: "1",
    title: "Salon — Modern Minimalist",
    style: "Modern",
    room: "Salon",
    date: "2 saat önce",
  },
  {
    id: "2",
    title: "Yatak Odası — Skandinav",
    style: "Skandinav",
    room: "Yatak Odası",
    date: "1 gün önce",
  },
  {
    id: "3",
    title: "Mutfak — Rustik",
    style: "Rustik",
    room: "Mutfak",
    date: "3 gün önce",
  },
  {
    id: "4",
    title: "Banyo — Japandi",
    style: "Japandi",
    room: "Banyo",
    date: "5 gün önce",
  },
  {
    id: "5",
    title: "Ofis — Industrial",
    style: "Industrial",
    room: "Ofis",
    date: "1 hafta önce",
  },
  {
    id: "6",
    title: "Çocuk Odası — Bohem",
    style: "Bohem",
    room: "Çocuk Odası",
    date: "2 hafta önce",
  },
];

const filters = ["Tümü", "Salon", "Yatak Odası", "Mutfak", "Banyo", "Ofis"];

export default function KutuphanePage() {
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
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder="Tasarım ara..."
            className="h-11 rounded-xl border-border-light bg-white pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus-visible:ring-accent-black"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((filter, i) => (
            <button
              key={filter}
              className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-all btn-press ${
                i === 0
                  ? "border-accent-black bg-accent-black text-white"
                  : "border-border-light bg-white text-text-secondary hover:border-text-tertiary"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {designs.map((design) => (
          <Link key={design.id} href={`/app/tasarim/${design.id}`}>
            <div className="group overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm transition-shadow hover:shadow-md">
              {/* Görsel */}
              <div className="relative aspect-4/3 w-full bg-warm-bg">
                <div className="flex h-full items-center justify-center">
                  <Sparkles className="h-8 w-8 text-text-tertiary/40" />
                </div>
                <div className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-medium text-text-primary backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
                  {design.style}
                </div>
              </div>
              {/* Bilgi */}
              <div className="p-3 sm:p-4">
                <h3 className="truncate text-xs font-semibold text-text-primary sm:text-sm">
                  {design.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] text-text-tertiary sm:text-xs">
                    {design.room}
                  </span>
                  <span className="text-[10px] text-text-tertiary sm:text-xs">
                    ·
                  </span>
                  <span className="text-[10px] text-text-tertiary sm:text-xs">
                    {design.date}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Boş Durum */}
      {designs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-border-light">
            <Sparkles className="h-8 w-8 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Henüz tasarım yok
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            İlk tasarımını oluşturmak için başla.
          </p>
          <Link href="/app">
            <Button className="mt-6 h-11 rounded-xl bg-accent-black px-6 text-sm font-medium text-white hover:bg-accent-black/90 btn-press">
              <Plus className="mr-2 h-4 w-4" />
              İlk Tasarımını Oluştur
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
