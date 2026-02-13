import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Camera,
  FolderOpen,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    icon: Camera,
    title: "Yeni Tasarim",
    description: "Oda fotografini yukle",
    href: "/app/tasarla",
  },
  {
    icon: FolderOpen,
    title: "Kutuphanem",
    description: "Tum tasarimlarini gor",
    href: "/app/kutuphane",
  },
];

const recentDesigns = [
  {
    id: "1",
    title: "Salon - Modern Minimalist",
    style: "Modern",
    date: "2 saat once",
    status: "Tamamlandi",
  },
  {
    id: "2",
    title: "Yatak Odasi - Skandinav",
    style: "Skandinav",
    date: "1 gun once",
    status: "Tamamlandi",
  },
  {
    id: "3",
    title: "Mutfak - Rustik",
    style: "Rustik",
    date: "3 gun once",
    status: "Tamamlandi",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Hosgeldin
        </h1>
        <p className="mt-1 text-text-secondary">
          Evini donusturmeye hazir misin?
        </p>
      </div>

      {/* CTA Card */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border-light bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-warm-bg px-3 py-1 text-xs font-medium text-text-secondary">
              <Sparkles className="h-3 w-3" />
              AI Tasarim
            </div>
            <h2 className="text-xl font-semibold text-text-primary md:text-2xl">
              Odani fotografla, AI tasarlasin
            </h2>
            <p className="mt-2 text-text-secondary">
              Bir fotograf yukle, tarzi sec, saniyeler icinde sonucu gor.
            </p>
          </div>
          <Link href="/app/tasarla">
            <Button className="h-12 w-full rounded-xl bg-accent-black px-6 text-base font-medium text-white hover:bg-accent-black/90 btn-press md:w-auto">
              Tasarima Basla
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="group rounded-2xl border border-border-light bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-warm-bg">
                <action.icon className="h-5 w-5 text-text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                {action.title}
              </h3>
              <p className="mt-0.5 text-xs text-text-tertiary">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border-light bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-tertiary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">Tasarimlar</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-text-primary">3</p>
        </div>
        <div className="rounded-2xl border border-border-light bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-tertiary">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Bu Hafta</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-text-primary">2</p>
        </div>
        <div className="rounded-2xl border border-border-light bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-tertiary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Kredi</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-text-primary">3</p>
        </div>
      </div>

      {/* Recent Designs */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Son Tasarimlar
          </h2>
          <Link
            href="/app/kutuphane"
            className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
          >
            Tumunu Gor
          </Link>
        </div>
        <div className="space-y-3">
          {recentDesigns.map((design) => (
            <Link key={design.id} href={`/app/tasarim/${design.id}`}>
              <div className="group flex items-center gap-4 rounded-2xl border border-border-light bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                {/* Thumbnail placeholder */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-warm-bg">
                  <Sparkles className="h-5 w-5 text-text-tertiary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-text-primary">
                    {design.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-md bg-warm-bg px-2 py-0.5 text-xs text-text-secondary">
                      {design.style}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {design.date}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
