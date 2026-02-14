"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CreditCard,
  PlusCircle,
  Gift,
  Undo2,
  MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyFirm } from "@/services/supplierService";
import { getCredits, getTransactions } from "@/services/creditService";
import type {
  Firm,
  FirmCredits,
  CreditTransaction,
  CreditPack,
} from "@/types/supplier";
import { CREDIT_PACKS, VIDEO_DURATION_CREDITS } from "@/types/supplier";

export default function CreditPurchasePage() {
  const router = useRouter();
  const [firm, setFirm] = useState<Firm | null>(null);
  const [credits, setCredits] = useState<FirmCredits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [selectedPack, setSelectedPack] = useState<string>("agency");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const f = await getMyFirm();
      if (!f) {
        router.replace("/app/firma/kayit");
        return;
      }
      setFirm(f);

      const [c, t] = await Promise.all([
        getCredits(f.id),
        getTransactions(f.id),
      ]);
      setCredits(c);
      setTransactions(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pack: CreditPack) => {
    // TODO: iyzico entegrasyonu
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      setNotice(
        `${pack.name} paketi (${pack.credits} kredi = ${pack.price}₺) — iyzico entegrasyonu henüz yapılmadı.`
      );
    }, 1000);
  };

  // Loading
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-text-primary" />
      </div>
    );
  }

  const selected = CREDIT_PACKS.find((p) => p.id === selectedPack)!;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {/* Notice */}
      {notice && (
        <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {notice}
          <button
            onClick={() => setNotice(null)}
            className="ml-2 font-medium underline"
          >
            Kapat
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════
          BAKİYE KARTI
         ══════════════════════════════════════ */}
      <div className="rounded-2xl bg-accent-black p-6 text-white">
        <p className="text-xs font-medium text-white/50">Kredi Bakiyesi</p>
        <p className="mt-1 text-5xl font-bold tabular-nums">{credits?.balance || 0}</p>
        <p className="mt-1 text-sm font-semibold text-green-400">
          {credits?.free_remaining
            ? `+ ${credits.free_remaining} ücretsiz hak`
            : "Ücretsiz hak kalmadı"}
        </p>

        {/* Kaç video yapılabilir */}
        <div className="mt-5 flex border-t border-white/10 pt-4">
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold tabular-nums">
              {Math.floor((credits?.balance || 0) / VIDEO_DURATION_CREDITS["30s"])}
            </p>
            <p className="mt-0.5 text-xs text-white/50">30sn video</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold tabular-nums">
              {Math.floor((credits?.balance || 0) / VIDEO_DURATION_CREDITS["20s"])}
            </p>
            <p className="mt-0.5 text-xs text-white/50">20sn video</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          KREDİ PAKETLERİ
         ══════════════════════════════════════ */}
      <h2 className="mb-3.5 mt-7 text-lg font-bold text-text-primary">
        Kredi Paketleri
      </h2>

      <div className="space-y-2.5">
        {CREDIT_PACKS.map((pack) => {
          const videosPerPack = Math.floor(
            pack.credits / VIDEO_DURATION_CREDITS["30s"]
          );
          const perVideo = Math.round(pack.price / videosPerPack);
          const isSelected = selectedPack === pack.id;

          return (
            <button
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className={cn(
                "relative w-full rounded-2xl border-2 bg-white p-4 text-left transition-all btn-press",
                isSelected
                  ? "border-accent-black bg-[#FAFAF8]"
                  : "border-border-light hover:border-text-tertiary"
              )}
            >
              {/* Popüler badge */}
              {pack.popular && (
                <span className="absolute -top-2.5 right-4 rounded-md bg-accent-black px-2.5 py-0.5 text-[10px] font-bold text-white">
                  En Popüler
                </span>
              )}

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={cn(
                      "text-base font-bold",
                      isSelected ? "text-text-primary" : "text-text-secondary"
                    )}
                  >
                    {pack.name}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs",
                      isSelected ? "text-text-secondary" : "text-text-tertiary"
                    )}
                  >
                    {pack.credits} kredi
                  </p>
                </div>
                <p
                  className={cn(
                    "text-2xl font-bold tabular-nums",
                    isSelected ? "text-text-primary" : "text-text-secondary"
                  )}
                >
                  {pack.price}₺
                </p>
              </div>

              {/* Footer */}
              <div className="mt-3 flex justify-between border-t border-border-light pt-2.5">
                <span
                  className={cn(
                    "text-xs",
                    isSelected ? "text-text-secondary" : "text-text-tertiary"
                  )}
                >
                  {videosPerPack} video (30sn)
                </span>
                <span
                  className={cn(
                    "text-xs",
                    isSelected ? "text-text-secondary" : "text-text-tertiary"
                  )}
                >
                  video başı ~{perVideo}₺
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════
          SATIN AL BUTONU
         ══════════════════════════════════════ */}
      <Button
        className="mt-4 h-14 w-full rounded-xl bg-accent-black text-base font-bold text-white hover:bg-accent-black/90 btn-press"
        disabled={purchasing}
        onClick={() => handlePurchase(selected)}
      >
        {purchasing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            {selected.name} — {selected.price}₺ Satın Al
          </>
        )}
      </Button>

      {/* ══════════════════════════════════════
          İŞLEM GEÇMİŞİ
         ══════════════════════════════════════ */}
      {transactions.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3.5 text-lg font-bold text-text-primary">
            İşlem Geçmişi
          </h2>

          <div className="rounded-2xl border border-border-light bg-white">
            {transactions.slice(0, 10).map((tx, idx) => {
              const icon = getTransactionIcon(tx.type);
              const isLast = idx === Math.min(transactions.length, 10) - 1;

              return (
                <div
                  key={tx.id}
                  className={cn(
                    "flex items-center justify-between px-4 py-3",
                    !isLast && "border-b border-border-light"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", icon.bg)}>
                      {icon.element}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {tx.description}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {new Date(tx.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-base font-bold tabular-nums",
                      tx.amount >= 0 ? "text-green-600" : "text-red-500"
                    )}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TRANSACTION ICON HELPER
// ==========================================

function getTransactionIcon(type: string) {
  switch (type) {
    case "purchase":
      return {
        element: <PlusCircle className="h-4 w-4 text-blue-600" />,
        bg: "bg-blue-50",
      };
    case "free":
      return {
        element: <Gift className="h-4 w-4 text-green-600" />,
        bg: "bg-green-50",
      };
    case "refund":
      return {
        element: <Undo2 className="h-4 w-4 text-blue-600" />,
        bg: "bg-blue-50",
      };
    case "spend":
    default:
      return {
        element: <MinusCircle className="h-4 w-4 text-red-500" />,
        bg: "bg-red-50",
      };
  }
}
