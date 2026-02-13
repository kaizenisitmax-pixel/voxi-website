import Link from "next/link";
import { Sparkles, Filter, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const designs = [
  {
    id: "1",
    title: "Salon - Modern Minimalist",
    style: "Modern",
    room: "Salon",
    date: "2 saat once",
  },
  {
    id: "2",
    title: "Yatak Odasi - Skandinav",
    style: "Skandinav",
    room: "Yatak Odasi",
    date: "1 gun once",
  },
  {
    id: "3",
    title: "Mutfak - Rustik",
    style: "Rustik",
    room: "Mutfak",
    date: "3 gun once",
  },
  {
    id: "4",
    title: "Banyo - Japandi",
    style: "Japandi",
    room: "Banyo",
    date: "5 gun once",
  },
  {
    id: "5",
    title: "Ofis - Industrial",
    style: "Industrial",
    room: "Ofis",
    date: "1 hafta once",
  },
  {
    id: "6",
    title: "Cocuk Odasi - Bohem",
    style: "Bohem",
    room: "Cocuk Odasi",
    date: "2 hafta once",
  },
];

const filters = ["Tumu", "Salon", "Yatak Odasi", "Mutfak", "Banyo", "Ofis"];

export default function KutuphanePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kutuphanem</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {designs.length} tasarim
          </p>
        </div>
        <Link href="/app/tasarla">
          <Button className="h-10 rounded-xl bg-accent-black px-5 text-sm font-medium text-white hover:bg-accent-black/90 btn-press">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Tasarim
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder="Tasarim ara..."
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {designs.map((design) => (
          <Link key={design.id} href={`/app/tasarim/${design.id}`}>
            <div className="group overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm transition-shadow hover:shadow-md">
              {/* Image */}
              <div className="relative aspect-4/3 w-full bg-warm-bg">
                <div className="flex h-full items-center justify-center">
                  <Sparkles className="h-8 w-8 text-text-tertiary/50" />
                </div>
                {/* Style Badge */}
                <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-text-primary backdrop-blur-sm">
                  {design.style}
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="truncate text-sm font-semibold text-text-primary">
                  {design.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs text-text-tertiary">
                    {design.room}
                  </span>
                  <span className="text-xs text-text-tertiary">·</span>
                  <span className="text-xs text-text-tertiary">
                    {design.date}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State (hidden when there are designs) */}
      {designs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-bg">
            <Sparkles className="h-8 w-8 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Henuz tasarim yok
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Ilk tasarimini olusturmak icin basla.
          </p>
          <Link href="/app/tasarla">
            <Button className="mt-6 h-11 rounded-xl bg-accent-black px-6 text-sm font-medium text-white hover:bg-accent-black/90 btn-press">
              <Plus className="mr-2 h-4 w-4" />
              Ilk Tasarimini Olustur
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
