// src/services/timelapseService.ts
// VOXI Supplier Studio — Timelapse Video Üretim Servisi
// Kling O1 (fal.ai) ile öncesi/sonrası video üretimi

import { createClient } from '@/lib/supabase/client';
import { spendCredits, refundCredits } from './creditService';
import type { VideoOptions, VideoDuration, TimelapseStatus } from '@/types/supplier';

function getSupabase() {
  return createClient();
}

// ==========================================
// SUPPLIER TIMELAPSE BAŞLAT
// ==========================================

export async function startSupplierTimelapse(params: {
  firmId: string;
  beforeImageUrl: string;   // Öncesi fotoğraf (gerçek)
  afterImageUrl: string;    // Sonrası fotoğraf (gerçek)
  options: VideoOptions;
  duration: VideoDuration;
}): Promise<string> {
  const supabase = getSupabase();
  const { firmId, beforeImageUrl, afterImageUrl, options, duration } = params;

  // 1. Timelapse job oluştur
  const { data: job, error: jobError } = await supabase
    .from('timelapse_jobs')
    .insert({
      firm_id: firmId,
      original_image_url: beforeImageUrl,
      ai_image_url: afterImageUrl,
      before_image_url: beforeImageUrl,
      category: options.category,
      aspect_ratio: options.aspectRatio,
      music_track: options.musicTrack,
      logo_overlay: options.logoOverlay,
      text_overlay: options.textOverlay,
      cta_type: options.ctaType,
      cta_value: options.ctaValue,
      source: 'supplier',
      status: 'queued',
      progress: 0,
    })
    .select()
    .single();

  if (jobError) throw new Error(`Job oluşturulamadı: ${jobError.message}`);

  // 2. Kredi kontrol ve harcama
  try {
    const { charged } = await spendCredits(firmId, duration, job.id);

    // credits_charged güncelle
    await supabase
      .from('timelapse_jobs')
      .update({ credits_charged: charged })
      .eq('id', job.id);
  } catch (err: unknown) {
    // Kredi yetersiz — job'u sil
    await supabase.from('timelapse_jobs').delete().eq('id', job.id);
    throw err;
  }

  // 3. Edge Function'ı tetikle (async video üretim)
  const { error: fnError } = await supabase.functions.invoke('supplier-timelapse-start', {
    body: {
      jobId: job.id,
      beforeImageUrl,
      afterImageUrl,
      duration,
      options,
    },
  });

  if (fnError) {
    console.error('Edge function tetiklenemedi:', fnError);
    // Job'u failed yap ama kredi iade etme (edge function retry edebilir)
    await updateJobStatus(job.id, 'failed', 0, 'Pipeline başlatılamadı');
  }

  return job.id;
}

// ==========================================
// TEK FOTOĞRAF MODU (AI sonrası üretir)
// ==========================================

export async function startSinglePhotoTimelapse(params: {
  firmId: string;
  photoUrl: string;         // Tek fotoğraf (öncesi VEYA sonrası)
  isBeforePhoto: boolean;   // true = öncesi, false = sonrası
  options: VideoOptions;
  duration: VideoDuration;
}): Promise<string> {
  const supabase = getSupabase();
  const { firmId, photoUrl, isBeforePhoto, options, duration } = params;

  // Tek fotoğraf modunda AI diğer kareyi üretecek
  const { data: job, error } = await supabase
    .from('timelapse_jobs')
    .insert({
      firm_id: firmId,
      original_image_url: photoUrl,
      ai_image_url: null, // AI üretecek
      before_image_url: isBeforePhoto ? photoUrl : null,
      category: options.category,
      aspect_ratio: options.aspectRatio,
      music_track: options.musicTrack,
      logo_overlay: options.logoOverlay,
      text_overlay: options.textOverlay,
      cta_type: options.ctaType,
      cta_value: options.ctaValue,
      source: 'supplier',
      status: 'queued',
      progress: 0,
    })
    .select()
    .single();

  if (error) throw new Error(`Job oluşturulamadı: ${error.message}`);

  const { charged } = await spendCredits(firmId, duration, job.id);
  await supabase
    .from('timelapse_jobs')
    .update({ credits_charged: charged })
    .eq('id', job.id);

  await supabase.functions.invoke('supplier-timelapse-start', {
    body: {
      jobId: job.id,
      photoUrl,
      isBeforePhoto,
      isSinglePhoto: true,
      duration,
      options,
    },
  });

  return job.id;
}

// ==========================================
// JOB DURUMU TAKİBİ (Realtime)
// ==========================================

export function subscribeToJob(
  jobId: string,
  onUpdate: (status: TimelapseStatus, progress: number, videoUrl?: string) => void
) {
  const supabase = getSupabase();
  const channel = supabase
    .channel(`timelapse-${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'timelapse_jobs',
        filter: `id=eq.${jobId}`,
      },
      (payload: { new: { status: TimelapseStatus; progress: number; final_video_url?: string } }) => {
        const { status, progress, final_video_url } = payload.new;
        onUpdate(status, progress, final_video_url || undefined);
      }
    )
    .subscribe();

  // Cleanup fonksiyonu döndür
  return () => {
    supabase.removeChannel(channel);
  };
}

// ==========================================
// JOB DURUMU GÜNCELLE (Edge Function'dan çağrılır)
// ==========================================

export async function updateJobStatus(
  jobId: string,
  status: TimelapseStatus,
  progress: number,
  errorMessage?: string
) {
  const supabase = getSupabase();
  const updates: Record<string, unknown> = { status, progress };
  if (errorMessage) updates.error_message = errorMessage;
  if (status === 'completed') updates.completed_at = new Date().toISOString();

  await supabase
    .from('timelapse_jobs')
    .update(updates)
    .eq('id', jobId);
}

// ==========================================
// VİDEO KAYDET (Pipeline tamamlandığında)
// ==========================================

export async function saveCompletedVideo(params: {
  firmId: string;
  jobId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  category: string;
  durationSeconds: number;
  aspectRatio: string;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('firm_videos')
    .insert({
      firm_id: params.firmId,
      timelapse_job_id: params.jobId,
      title: params.title,
      category: params.category,
      video_url: params.videoUrl,
      thumbnail_url: params.thumbnailUrl,
      duration_seconds: params.durationSeconds,
      aspect_ratio: params.aspectRatio,
      is_public: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Video kaydedilemedi: ${error.message}`);
  return data;
}

// ==========================================
// FİRMA VİDEOLARI
// ==========================================

export async function getMyVideos(firmId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('firm_videos')
    .select('*')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function deleteVideo(videoId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('firm_videos')
    .delete()
    .eq('id', videoId);

  if (error) throw new Error(`Video silinemedi: ${error.message}`);
}

export async function toggleVideoVisibility(videoId: string, isPublic: boolean) {
  const supabase = getSupabase();
  await supabase
    .from('firm_videos')
    .update({ is_public: isPublic })
    .eq('id', videoId);
}

// ==========================================
// FOTOĞRAF YÜKLEME (Supabase Storage — Web File API)
// ==========================================

export async function uploadProjectPhoto(
  firmId: string,
  file: File,
  type: 'before' | 'after'
): Promise<string> {
  const supabase = getSupabase();
  const fileName = `supplier/${firmId}/${type}-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from('designs')
    .upload(fileName, file, { contentType: file.type || 'image/jpeg' });

  if (error) throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);

  const { data } = supabase.storage.from('designs').getPublicUrl(fileName);
  return data.publicUrl;
}
