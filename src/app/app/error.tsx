"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Bir hata oluştu</h2>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500">
        {error.message || "Beklenmeyen bir hata. Lütfen tekrar deneyin."}
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-gray-400">Hata kodu: {error.digest}</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button
          onClick={reset}
          className="h-10 rounded-xl bg-gray-900 px-6 text-sm text-white hover:bg-gray-800"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Tekrar Dene
        </Button>
        <Link href="/app">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-gray-200 px-6 text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </Link>
      </div>
    </div>
  );
}
