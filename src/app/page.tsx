"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Camera,
  Layers,
  ChevronRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Fotografla",
    description:
      "Odanin bir fotografini cek. Yapay zeka gerisini halletsin.",
  },
  {
    icon: Sparkles,
    title: "AI Tasarla",
    description:
      "Stil tercihini sec, saniyeler icinde profesyonel tasarim al.",
  },
  {
    icon: Layers,
    title: "Karsilastir",
    description:
      "Once ve sonra gorunumlerini yan yana kiyasla.",
  },
];

const testimonials = [
  {
    name: "Ayse K.",
    text: "Salon tasarimimi 30 saniyede degistirdi. Inanamadim!",
    rating: 5,
  },
  {
    name: "Mehmet D.",
    text: "Mimarima gosterdim, ayni tasarimi uyguladik. Muhtesem.",
    rating: 5,
  },
  {
    name: "Zeynep A.",
    text: "Her odami tek tek denedim. Basit ve hizli.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border-light bg-warm-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-text-primary">
            VOXI
          </Link>
          <Link href="/giris">
            <Button
              variant="default"
              className="h-10 rounded-xl bg-accent-black px-6 text-sm font-medium text-white hover:bg-accent-black/90 btn-press"
            >
              Giris Yap
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-light bg-white px-4 py-2 text-sm text-text-secondary">
              <Sparkles className="h-4 w-4 text-text-tertiary" />
              <span>Hayal Et &middot; G&ouml;r &middot; Yapt&#305;r</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-6xl md:leading-tight">
              Hayal et,
              <br />
              VOXI tasarlasin.
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg text-text-secondary md:text-xl">
              Odanin bir fotografini yukle, istedigin tarzi sec. VOXI
              saniyeler icinde profesyonel ic mekan tasarimi olusturur.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/giris">
                <Button className="h-12 w-full rounded-xl bg-accent-black px-8 text-base font-medium text-white hover:bg-accent-black/90 btn-press sm:w-auto">
                  Ucretsiz Dene
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#nasil-calisir">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl border-border-light bg-white px-8 text-base font-medium text-text-primary hover:bg-white/80 btn-press sm:w-auto"
                >
                  Nasil Calisir?
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-text-tertiary">
              Kredi karti gerektirmez. Ilk 3 tasarim ucretsiz.
            </p>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mx-auto max-w-4xl px-4 pb-16">
          <div className="relative overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm">
            <div className="aspect-video w-full bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-bg">
                  <Sparkles className="h-8 w-8 text-text-tertiary" />
                </div>
                <p className="text-sm text-text-tertiary">
                  Once / Sonra onizleme gelecek
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="nasil-calisir" className="border-t border-border-light bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl">
              Nasil calisir?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Uc basit adimda hayalindeki evi tasarla.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border-light bg-warm-bg p-8 transition-shadow hover:shadow-md"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-border-light">
                  <feature.icon className="h-5 w-5 text-text-primary" />
                </div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-sm font-medium text-text-tertiary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border-light">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl">
              Kullanicilar ne diyor?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Binlerce kullanici VOXI ile evlerini donusturdu.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-border-light bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-text-primary text-text-primary"
                    />
                  ))}
                </div>
                <p className="mb-4 text-text-secondary">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <p className="text-sm font-medium text-text-primary">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border-light bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl">
              Evini donusturmeye hazir misin?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Hemen basla, ilk 3 tasarimin ucretsiz.
            </p>
            <Link href="/giris">
              <Button className="mt-8 h-12 rounded-xl bg-accent-black px-8 text-base font-medium text-white hover:bg-accent-black/90 btn-press">
                Hemen Basla
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-text-tertiary">
              2025 VOXI. Tum haklari saklidir.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                Gizlilik
              </Link>
              <Link
                href="#"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                Kullanim Sartlari
              </Link>
              <Link
                href="#"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                Iletisim
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
