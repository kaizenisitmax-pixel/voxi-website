"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Phone,
  Mail,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "select" | "phone" | "phone-otp" | "email" | "email-sent";

export default function GirisPage() {
  const [mode, setMode] = useState<AuthMode>("select");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const handlePhoneSubmit = async () => {
    if (!phone) return;
    setLoading(true);
    setError("");

    const formattedPhone = phone.startsWith("+") ? phone : `+90${phone}`;

    const { error } = await getSupabase().auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      setError(error.message);
    } else {
      setMode("phone-otp");
    }
    setLoading(false);
  };

  const handleOtpVerify = async () => {
    if (!otp) return;
    setLoading(true);
    setError("");

    const formattedPhone = phone.startsWith("+") ? phone : `+90${phone}`;

    const { error } = await getSupabase().auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/app";
    }
    setLoading(false);
  };

  const handleEmailSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setError("");

    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setError("");
      setMode("email-sent");
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setLoading(true);
    setError("");

    const { error } = await getSupabase().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-warm-bg">
      {/* Header */}
      <header className="border-b border-border-light bg-warm-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-md items-center px-4">
          {mode !== "select" ? (
            <button
              onClick={() => {
                setMode("select");
                setError("");
              }}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors btn-press"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 items-start justify-center px-4 pt-12 md:pt-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">VOXI</h1>
            <p className="mt-2 text-text-secondary">
              {mode === "select" && "Hesabına giriş yap veya kaydol"}
              {mode === "phone" && "Telefon numaranla devam et"}
              {mode === "phone-otp" && "Doğrulama kodunu gir"}
              {mode === "email" && "E-posta adresinle devam et"}
              {mode === "email-sent" && "E-postanı kontrol et"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Auth Card */}
          <div className="rounded-2xl border border-border-light bg-white p-6 shadow-sm">
            {/* Select Mode */}
            {mode === "select" && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="h-12 w-full justify-start gap-3 rounded-xl border-border-light bg-white text-left text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
                  onClick={() => setMode("phone")}
                >
                  <Phone className="h-5 w-5 text-text-tertiary" />
                  Telefon ile devam et
                </Button>

                <Button
                  variant="outline"
                  className="h-12 w-full justify-start gap-3 rounded-xl border-border-light bg-white text-left text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
                  onClick={() => setMode("email")}
                >
                  <Mail className="h-5 w-5 text-text-tertiary" />
                  E-posta ile devam et
                </Button>

                <div className="relative py-4">
                  <Separator className="bg-border-light" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-text-tertiary">
                    veya
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="h-12 w-full justify-start gap-3 rounded-xl border-border-light bg-white text-left text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google ile devam et
                </Button>

                <Button
                  variant="outline"
                  className="h-12 w-full justify-start gap-3 rounded-xl border-border-light bg-white text-left text-sm font-medium text-text-primary hover:bg-warm-bg btn-press"
                  onClick={() => handleOAuthLogin("apple")}
                  disabled={loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Apple ile devam et
                </Button>
              </div>
            )}

            {/* Phone */}
            {mode === "phone" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Telefon Numarası
                  </label>
                  <div className="flex gap-2">
                    <div className="flex h-12 items-center rounded-xl border border-border-light bg-warm-bg px-3 text-sm text-text-secondary">
                      +90
                    </div>
                    <Input
                      type="tel"
                      placeholder="5XX XXX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 rounded-xl border-border-light bg-white text-text-primary placeholder:text-text-tertiary focus-visible:ring-accent-black"
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
                  onClick={handlePhoneSubmit}
                  disabled={loading || !phone}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Devam Et
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* OTP */}
            {mode === "phone-otp" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Doğrulama Kodu
                  </label>
                  <p className="mb-3 text-sm text-text-tertiary">
                    +90{phone} numarasına gönderilen 6 haneli kodu gir.
                  </p>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="h-12 rounded-xl border-border-light bg-white text-center text-lg tracking-[0.3em] text-text-primary placeholder:text-text-tertiary focus-visible:ring-accent-black"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <Button
                  className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
                  onClick={handleOtpVerify}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Doğrula"
                  )}
                </Button>
                <button
                  onClick={() => {
                    setOtp("");
                    handlePhoneSubmit();
                  }}
                  className="w-full text-center text-sm text-text-tertiary hover:text-text-primary transition-colors"
                >
                  Tekrar gönder
                </button>
              </div>
            )}

            {/* Email */}
            {mode === "email" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    E-posta Adresi
                  </label>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-border-light bg-white text-text-primary placeholder:text-text-tertiary focus-visible:ring-accent-black"
                    autoFocus
                  />
                </div>
                <Button
                  className="h-12 w-full rounded-xl bg-accent-black text-base font-medium text-white hover:bg-accent-black/90 btn-press"
                  onClick={handleEmailSubmit}
                  disabled={loading || !email}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Giriş Linki Gönder
                      <Mail className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-text-tertiary">
                  E-posta adresine tek kullanımlık giriş linki gönderilecek.
                </p>
              </div>
            )}

            {/* Email Sent Confirmation */}
            {mode === "email-sent" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-bg">
                  <Mail className="h-6 w-6 text-text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Giriş linki gönderildi
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    <span className="font-medium">{email}</span> adresine
                    giriş linki gönderdik. E-postanı kontrol et.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMode("email");
                    setError("");
                  }}
                  className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
                >
                  Tekrar gönder
                </button>
              </div>
            )}
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-text-tertiary">
            Devam ederek{" "}
            <Link href="#" className="underline hover:text-text-secondary">
              Kullanım Şartlarını
            </Link>{" "}
            ve{" "}
            <Link href="#" className="underline hover:text-text-secondary">
              Gizlilik Politikasını
            </Link>{" "}
            kabul etmiş olursun.
          </p>
        </div>
      </div>
    </div>
  );
}
