// src/types/supplier.ts
// VOXI Supplier Studio — TypeScript Tipleri

export interface Firm {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  sector: FirmSector;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  city: string | null;
  district: string | null;
  description: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type FirmSector =
  | 'dekorasyon'
  | 'tadilat'
  | 'yapi'
  | 'bahce'
  | 'tesisat'
  | 'emlak'
  | 'diger';

export const SECTOR_LABELS: Record<FirmSector, string> = {
  dekorasyon: 'Dekorasyon',
  tadilat: 'Tadilat',
  yapi: 'Yapı / İnşaat',
  bahce: 'Bahçe / Peyzaj',
  tesisat: 'Tesisat / İklimlendirme',
  emlak: 'Gayrimenkul',
  diger: 'Diğer',
};

export interface FirmCredits {
  id: string;
  firm_id: string;
  balance: number;
  free_remaining: number;
  total_purchased: number;
  total_spent: number;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  firm_id: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus' | 'free';
  amount: number;
  description: string | null;
  payment_ref: string | null;
  timelapse_job_id: string | null;
  created_at: string;
}

export interface FirmVideo {
  id: string;
  firm_id: string;
  timelapse_job_id: string | null;
  title: string | null;
  category: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  aspect_ratio: '9:16' | '16:9' | '1:1';
  is_public: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
}

// Video üretim seçenekleri
export interface VideoOptions {
  category: FirmSector;
  duration: VideoDuration;
  aspectRatio: '9:16' | '16:9' | '1:1';
  musicTrack: MusicTrack;
  logoOverlay: boolean;
  textOverlay: {
    title?: string;
    location?: string;
    firmName?: string;
  } | null;
  ctaType: 'phone' | 'whatsapp' | 'website' | 'teklif_al' | null;
  ctaValue: string | null;
}

export type VideoDuration = '20s' | '30s' | '40s' | '60s';
export type MusicTrack = 'auto' | 'epic' | 'corporate' | 'ambient' | 'sessiz';

export const VIDEO_DURATION_CREDITS: Record<VideoDuration, number> = {
  '20s': 3,
  '30s': 5,
  '40s': 8,
  '60s': 12,
};

export const VIDEO_DURATION_LABELS: Record<VideoDuration, string> = {
  '20s': '20 saniye',
  '30s': '30 saniye',
  '40s': '40 saniye',
  '60s': '60 saniye',
};

export const MUSIC_LABELS: Record<MusicTrack, string> = {
  auto: 'Otomatik',
  epic: 'Epik',
  corporate: 'Kurumsal',
  ambient: 'Ambient',
  sessiz: 'Sessiz',
};

// Kredi paketleri
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number; // TL
  popular?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'starter', name: 'Başlangıç', credits: 50, price: 149 },
  { id: 'pro', name: 'Profesyonel', credits: 150, price: 399 },
  { id: 'agency', name: 'Ajans', credits: 500, price: 999, popular: true },
  { id: 'enterprise', name: 'Kurumsal', credits: 1500, price: 2499 },
];

// Timelapse job status
export type TimelapseStatus =
  | 'queued'
  | 'generating_keyframes'
  | 'generating_clips'
  | 'merging'
  | 'post_processing'
  | 'completed'
  | 'failed';

export const STATUS_LABELS: Record<TimelapseStatus, string> = {
  queued: 'Sırada',
  generating_keyframes: 'Kareler üretiliyor...',
  generating_clips: 'Video oluşturuluyor...',
  merging: 'Birleştiriliyor...',
  post_processing: 'Son işlemler...',
  completed: 'Tamamlandı',
  failed: 'Hata oluştu',
};
