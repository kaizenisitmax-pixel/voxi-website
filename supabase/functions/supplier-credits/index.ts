// supabase/functions/supplier-credits/index.ts
// VOXI Supplier Studio — Kredi Satın Alma Edge Function
// iyzico ödeme callback'i bu fonksiyonu tetikler

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// const IYZICO_API_KEY = Deno.env.get('IYZICO_API_KEY')!;
// const IYZICO_SECRET_KEY = Deno.env.get('IYZICO_SECRET_KEY')!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CREDIT_PACKS: Record<string, { credits: number; price: number }> = {
  starter: { credits: 50, price: 149 },
  pro: { credits: 150, price: 399 },
  agency: { credits: 500, price: 999 },
  enterprise: { credits: 1500, price: 2499 },
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { action, firmId, packId, paymentRef, userId } = await req.json();

    // ==========================================
    // ACTION: checkout — Ödeme başlat
    // ==========================================
    if (action === "checkout") {
      const pack = CREDIT_PACKS[packId];
      if (!pack) {
        return jsonResponse({ error: "Geçersiz paket" }, 400);
      }

      // Firma kontrol
      const { data: firm } = await supabase
        .from("firms")
        .select("id, name, owner_id")
        .eq("id", firmId)
        .single();

      if (!firm) {
        return jsonResponse({ error: "Firma bulunamadı" }, 404);
      }

      // TODO: iyzico checkout form oluştur
      // const iyzicoForm = await createIyzicoCheckout({
      //   price: pack.price,
      //   paidPrice: pack.price,
      //   basketId: `credit-${firmId}-${Date.now()}`,
      //   buyer: { id: userId, name: firm.name },
      //   basketItems: [{
      //     id: packId,
      //     name: `${pack.credits} Kredi Paketi`,
      //     category: 'VOXI Kredi',
      //     price: pack.price,
      //   }],
      //   callbackUrl: `${SUPABASE_URL}/functions/v1/supplier-credits`,
      // });

      return jsonResponse({
        success: true,
        message: "iyzico checkout hazır",
        pack,
        // checkoutFormContent: iyzicoForm.checkoutFormContent,
      });
    }

    // ==========================================
    // ACTION: callback — iyzico ödeme tamamlandı
    // ==========================================
    if (action === "callback") {
      const pack = CREDIT_PACKS[packId];
      if (!pack) {
        return jsonResponse({ error: "Geçersiz paket" }, 400);
      }

      // TODO: iyzico ödeme doğrulama
      // const verification = await verifyIyzicoPayment(paymentRef);
      // if (!verification.success) throw new Error('Ödeme doğrulanamadı');

      // Mevcut kredi bilgisini al
      const { data: currentCredits } = await supabase
        .from("firm_credits")
        .select("*")
        .eq("firm_id", firmId)
        .single();

      if (!currentCredits) {
        return jsonResponse({ error: "Kredi hesabı bulunamadı" }, 404);
      }

      // Kredi ekle
      const { error: updateError } = await supabase
        .from("firm_credits")
        .update({
          balance: currentCredits.balance + pack.credits,
          total_purchased: currentCredits.total_purchased + pack.credits,
          updated_at: new Date().toISOString(),
        })
        .eq("firm_id", firmId);

      if (updateError) throw updateError;

      // İşlem kaydı
      await supabase.from("credit_transactions").insert({
        firm_id: firmId,
        type: "purchase",
        amount: pack.credits,
        description: `${pack.credits} Kredi Paketi (${pack.price} TL)`,
        payment_ref: paymentRef || `manual-${Date.now()}`,
      });

      // Push bildirim (opsiyonel)
      // await sendPushNotification(userId, `${pack.credits} kredi yüklendi!`);

      return jsonResponse({
        success: true,
        newBalance: currentCredits.balance + pack.credits,
        creditsAdded: pack.credits,
      });
    }

    // ==========================================
    // ACTION: balance — Bakiye sorgula
    // ==========================================
    if (action === "balance") {
      const { data } = await supabase
        .from("firm_credits")
        .select("*")
        .eq("firm_id", firmId)
        .single();

      return jsonResponse({ success: true, credits: data });
    }

    return jsonResponse({ error: "Geçersiz action" }, 400);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("supplier-credits error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
