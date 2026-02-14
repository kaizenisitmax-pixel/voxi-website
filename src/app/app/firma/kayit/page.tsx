"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { createFirm } from "@/services/supplierService";
import { SECTOR_LABELS, type FirmSector } from "@/types/supplier";

const sectors = Object.entries(SECTOR_LABELS) as [FirmSector, string][];

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sector, setSector] = useState<FirmSector | null>(null);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      setError("Firma adı gerekli");
      return;
    }
    if (!sector) {
      setError("Sektör seçin");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createFirm({
        name: name.trim(),
        sector,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.replace("/app/firma");
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <Gift className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Hoş Geldiniz!</h2>
        <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">
          3 ücretsiz video hakkınız tanımlandı. Hemen ilk videonuzu oluşturun!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Firma Hesabı Aç
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary md:text-base">
          Projelerinizi AI timelapse videolara dönüştürün.
          <br />
          İlk 3 video ücretsiz!
        </p>
      </div>

      {/* Ücretsiz Banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
        <Gift className="h-5 w-5 shrink-0 text-green-600" />
        <span className="text-sm font-semibold text-green-700">
          3 video ücretsiz üretin, kaliteyi görün
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="space-y-5">
        {/* Firma Adı */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-text-secondary">
            Firma Adı <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Örn: ABC Dekorasyon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl border-border-light bg-white text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-black focus:ring-accent-black/20"
          />
        </div>

        {/* Sektör */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-text-secondary">
            Sektör <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {sectors.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSector(key)}
                className={cn(
                  "rounded-full border px-4 py-2.5 text-sm font-medium transition-all btn-press",
                  sector === key
                    ? "border-accent-black bg-accent-black text-white"
                    : "border-border-light bg-white text-text-secondary hover:border-text-tertiary"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Telefon */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-text-secondary">
            Telefon
          </label>
          <Input
            placeholder="0532 XXX XX XX"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 rounded-xl border-border-light bg-white text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-black focus:ring-accent-black/20"
          />
        </div>

        {/* Şehir */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-text-secondary">
            Şehir
          </label>
          <Input
            placeholder="İstanbul"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 rounded-xl border-border-light bg-white text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-black focus:ring-accent-black/20"
          />
        </div>

        {/* Kayıt Butonu */}
        <Button
          className="h-14 w-full rounded-xl bg-accent-black text-base font-bold text-white hover:bg-accent-black/90 btn-press disabled:opacity-40"
          disabled={loading || !name.trim() || !sector}
          onClick={handleRegister}
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : null}
          {loading ? "Oluşturuluyor..." : "Firma Hesabı Oluştur"}
        </Button>

        <p className="text-center text-xs text-text-tertiary">
          Hesap oluşturarak VOXI kullanım şartlarını kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}
