// src/services/supplierService.ts
// VOXI Supplier Studio — Firma İşlemleri

import { createClient } from '@/lib/supabase/client';
import type { Firm, FirmSector } from '@/types/supplier';

function getSupabase() {
  return createClient();
}

// Firma oluştur
export async function createFirm(data: {
  name: string;
  sector: FirmSector;
  phone?: string;
  whatsapp?: string;
  website?: string;
  city?: string;
  district?: string;
  description?: string;
}): Promise<Firm> {
  const supabase = getSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Giriş yapmalısınız');

  // Slug üret (server-side fonksiyon)
  const { data: slugResult } = await supabase
    .rpc('generate_firm_slug', { firm_name: data.name });

  const slug = slugResult || data.name.toLowerCase().replace(/\s+/g, '-');

  // Firma oluştur
  const { data: firm, error } = await supabase
    .from('firms')
    .insert({
      owner_id: user.user.id,
      name: data.name,
      slug,
      sector: data.sector,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      website: data.website || null,
      city: data.city || null,
      district: data.district || null,
      description: data.description || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Firma oluşturulamadı: ${error.message}`);

  // Kredi hesabı oluştur (3 ücretsiz hak dahil)
  await supabase.from('firm_credits').insert({
    firm_id: firm.id,
    balance: 0,
    free_remaining: 3,
  });

  return firm;
}

// Kullanıcının firmasını getir
export async function getMyFirm(): Promise<Firm | null> {
  const supabase = getSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('owner_id', user.user.id)
    .single();

  if (error) return null;
  return data;
}

// Firma güncelle
export async function updateFirm(
  firmId: string,
  updates: Partial<Omit<Firm, 'id' | 'owner_id' | 'slug' | 'created_at'>>
): Promise<Firm> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('firms')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', firmId)
    .select()
    .single();

  if (error) throw new Error(`Firma güncellenemedi: ${error.message}`);
  return data;
}

// Logo yükle
export async function uploadFirmLogo(
  firmId: string,
  file: File
): Promise<string> {
  const supabase = getSupabase();
  const fileName = `firms/${firmId}/logo-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('firms')
    .upload(fileName, file, { contentType: file.type || 'image/jpeg', upsert: true });

  if (uploadError) throw new Error(`Logo yüklenemedi: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from('firms')
    .getPublicUrl(fileName);

  // Firma kaydını güncelle
  await updateFirm(firmId, { logo_url: urlData.publicUrl });

  return urlData.publicUrl;
}

// Herkese açık firma sayfası (slug ile)
export async function getFirmBySlug(slug: string): Promise<Firm | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

// Firma videolarını getir (public)
export async function getFirmPublicVideos(firmId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('firm_videos')
    .select('*')
    .eq('firm_id', firmId)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}
