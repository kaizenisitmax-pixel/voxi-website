// src/services/creditService.ts
// VOXI Supplier Studio — Kredi Yönetimi
// Gelir modeli: 3 ücretsiz + sonrası API maliyeti x3 kredi karşılığı

import { createClient } from '@/lib/supabase/client';
import type {
  FirmCredits,
  CreditTransaction,
  VideoDuration,
} from '@/types/supplier';
import { VIDEO_DURATION_CREDITS } from '@/types/supplier';

function getSupabase() {
  return createClient();
}

// ==========================================
// KREDİ BAKİYESİ
// ==========================================

export async function getCredits(firmId: string): Promise<FirmCredits> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('firm_credits')
    .select('*')
    .eq('firm_id', firmId)
    .single();

  if (error) throw new Error(`Kredi bilgisi alınamadı: ${error.message}`);
  return data;
}

// ==========================================
// VİDEO ÜRETİM KONTROLü
// ==========================================

export interface CanGenerateResult {
  allowed: boolean;
  isFree: boolean;
  creditsNeeded: number;
  currentBalance: number;
  freeRemaining: number;
  reason?: string;
}

export async function canGenerate(
  firmId: string,
  duration: VideoDuration
): Promise<CanGenerateResult> {
  const credits = await getCredits(firmId);
  const needed = VIDEO_DURATION_CREDITS[duration];

  // Ücretsiz hakkı var mı?
  if (credits.free_remaining > 0) {
    return {
      allowed: true,
      isFree: true,
      creditsNeeded: 0,
      currentBalance: credits.balance,
      freeRemaining: credits.free_remaining,
    };
  }

  // Kredi yeterli mi?
  if (credits.balance >= needed) {
    return {
      allowed: true,
      isFree: false,
      creditsNeeded: needed,
      currentBalance: credits.balance,
      freeRemaining: 0,
    };
  }

  // Yetersiz
  return {
    allowed: false,
    isFree: false,
    creditsNeeded: needed,
    currentBalance: credits.balance,
    freeRemaining: 0,
    reason: `${needed} kredi gerekiyor, bakiyeniz ${credits.balance}`,
  };
}

// ==========================================
// KREDİ HARCAMA (Video üretim başlangıcında çağrılır)
// ==========================================

export async function spendCredits(
  firmId: string,
  duration: VideoDuration,
  timelapseJobId: string
): Promise<{ isFree: boolean; charged: number }> {
  const supabase = getSupabase();
  const check = await canGenerate(firmId, duration);
  if (!check.allowed) {
    throw new Error(check.reason || 'Yetersiz kredi');
  }

  const needed = VIDEO_DURATION_CREDITS[duration];

  if (check.isFree) {
    // Ücretsiz hakkı düş
    const { error: updateError } = await supabase
      .from('firm_credits')
      .update({
        free_remaining: check.freeRemaining - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('firm_id', firmId);

    if (updateError) throw new Error(`Kredi güncellenemedi: ${updateError.message}`);

    // İşlem kaydı
    await supabase.from('credit_transactions').insert({
      firm_id: firmId,
      type: 'free',
      amount: 0,
      description: `Ücretsiz video (${3 - check.freeRemaining + 1}/3)`,
      timelapse_job_id: timelapseJobId,
    });

    return { isFree: true, charged: 0 };
  }

  // Kredi düş
  const { error: updateError } = await supabase
    .from('firm_credits')
    .update({
      balance: check.currentBalance - needed,
      total_spent: (await getCredits(firmId)).total_spent + needed,
      updated_at: new Date().toISOString(),
    })
    .eq('firm_id', firmId);

  if (updateError) throw new Error(`Kredi düşülemedi: ${updateError.message}`);

  // İşlem kaydı
  await supabase.from('credit_transactions').insert({
    firm_id: firmId,
    type: 'spend',
    amount: -needed,
    description: `Timelapse video (${duration})`,
    timelapse_job_id: timelapseJobId,
  });

  return { isFree: false, charged: needed };
}

// ==========================================
// KREDİ SATIN ALMA (iyzico callback sonrası çağrılır)
// ==========================================

export async function addCredits(
  firmId: string,
  credits: number,
  paymentRef: string,
  description: string
): Promise<FirmCredits> {
  const supabase = getSupabase();
  const current = await getCredits(firmId);

  const { data, error } = await supabase
    .from('firm_credits')
    .update({
      balance: current.balance + credits,
      total_purchased: current.total_purchased + credits,
      updated_at: new Date().toISOString(),
    })
    .eq('firm_id', firmId)
    .select()
    .single();

  if (error) throw new Error(`Kredi eklenemedi: ${error.message}`);

  // İşlem kaydı
  await supabase.from('credit_transactions').insert({
    firm_id: firmId,
    type: 'purchase',
    amount: credits,
    description,
    payment_ref: paymentRef,
  });

  return data;
}

// ==========================================
// BAŞARISIZ VİDEO — KREDİ İADE
// ==========================================

export async function refundCredits(
  firmId: string,
  credits: number,
  timelapseJobId: string
): Promise<void> {
  const supabase = getSupabase();
  if (credits === 0) return; // Ücretsiz videoyu iade etme

  const current = await getCredits(firmId);

  await supabase
    .from('firm_credits')
    .update({
      balance: current.balance + credits,
      total_spent: current.total_spent - credits,
      updated_at: new Date().toISOString(),
    })
    .eq('firm_id', firmId);

  await supabase.from('credit_transactions').insert({
    firm_id: firmId,
    type: 'refund',
    amount: credits,
    description: 'Başarısız video — kredi iade',
    timelapse_job_id: timelapseJobId,
  });
}

// ==========================================
// İŞLEM GEÇMİŞİ
// ==========================================

export async function getTransactions(
  firmId: string,
  limit: number = 20
): Promise<CreditTransaction[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}
