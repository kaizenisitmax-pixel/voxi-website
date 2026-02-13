import {
  Home,
  Building2,
  Factory,
  MoreHorizontal,
  Palette,
  Hammer,
  Thermometer,
  // Dekorasyon - Ev
  Minus,
  Square,
  Snowflake,
  Flower2,
  Crown,
  Landmark,
  TreePine,
  Diamond,
  Leaf,
  Cog,
  // Dekorasyon - Ticari
  Hotel,
  UtensilsCrossed,
  Monitor,
  Coffee,
  Store,
  ShoppingBag,
  Droplets,
  // Dekorasyon - Endüstriyel
  Eye,
  Users,
  CookingPot,
  // Dekorasyon - Diğer
  Flower,
  Sun,
  CloudSun,
  Waves,
  // Yapı - Ev
  Container,
  BoxSelect,
  House,
  Triangle,
  Layers,
  // Yapı - Ticari
  Building,
  Car,
  ShoppingCart,
  // Yapı - Endüstriyel
  Warehouse,
  Wrench,
  Sprout,
  Zap,
  // Yapı - Diğer
  PanelTop,
  Tent,
  Fence,
  Dumbbell,
  // İklimlendirme - Ev
  Flame,
  Wind,
  ShieldCheck,
  Fan,
  // İklimlendirme - Ticari
  Cpu,
  ArrowUpFromLine,
  Sparkles,
  // İklimlendirme - Endüstriyel
  Recycle,
  // İklimlendirme - Diğer
  Mountain,
  // Araçlar
  Wand2,
  Sofa,
  Eraser,
  Paintbrush,
  Grid3x3,
  type LucideIcon,
} from "lucide-react";

/* ─── Kategoriler ─── */

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const categories: Category[] = [
  { id: "ev", label: "Ev", icon: Home },
  { id: "ticari", label: "Ticari", icon: Building2 },
  { id: "endustriyel", label: "Endüstriyel", icon: Factory },
  { id: "diger", label: "Diğer", icon: MoreHorizontal },
];

/* ─── Hizmet Tipleri ─── */

export interface ServiceType {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const serviceTypes: ServiceType[] = [
  {
    id: "dekorasyon",
    label: "Dekorasyon",
    icon: Palette,
    description: "İç mekan tasarımı ve dekorasyon",
  },
  {
    id: "yapi",
    label: "Yapı",
    icon: Hammer,
    description: "Çelik yapı ve modern mimari",
  },
  {
    id: "iklimlendirme",
    label: "İklimlendirme",
    icon: Thermometer,
    description: "Isıtma, soğutma ve havalandırma",
  },
];

/* ─── Fotoğraf İpuçları ─── */

export const photoTips: Record<string, string> = {
  dekorasyon:
    "Odanın genel görünümünü çekin. Pencere ve kapılar görünsün.",
  yapi: "Arsanın veya mevcut yapının fotoğrafını çekin.",
  iklimlendirme:
    "Mekanın genel görünümünü ve mevcut sistemi çekin.",
};

/* ─── Stiller (Dinamik: kategori + hizmet tipine göre) ─── */

export interface StyleOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

type StyleKey = `${string}_${string}`; // category_serviceType

export const styleMap: Record<StyleKey, StyleOption[]> = {
  /* ── DEKORASYON ── */
  ev_dekorasyon: [
    { id: "modern", label: "Modern Minimalist", icon: Minus },
    { id: "minimalist", label: "Minimalist", icon: Square },
    { id: "iskandinav", label: "İskandinav", icon: Snowflake },
    { id: "bohem", label: "Bohem", icon: Flower2 },
    { id: "luks", label: "Lüks", icon: Crown },
    { id: "klasik", label: "Klasik", icon: Landmark },
    { id: "rustik", label: "Rustik", icon: TreePine },
    { id: "artdeco", label: "Art Deco", icon: Diamond },
    { id: "japandi", label: "Japandi", icon: Leaf },
    { id: "endustriyel_sik", label: "Endüstriyel Şık", icon: Cog },
  ],
  ticari_dekorasyon: [
    { id: "otel_lobisi", label: "Otel Lobisi", icon: Hotel },
    { id: "restoran", label: "Restoran", icon: UtensilsCrossed },
    { id: "ofis", label: "Ofis", icon: Monitor },
    { id: "kafe", label: "Kafe", icon: Coffee },
    { id: "magaza", label: "Mağaza", icon: Store },
    { id: "butik", label: "Butik", icon: ShoppingBag },
    { id: "spa", label: "Spa & Wellness", icon: Droplets },
  ],
  endustriyel_dekorasyon: [
    { id: "fabrika_ofisi", label: "Fabrika Ofisi", icon: Factory },
    { id: "showroom", label: "Showroom", icon: Eye },
    { id: "toplanti_salonu", label: "Toplantı Salonu", icon: Users },
    { id: "yemekhane", label: "Yemekhane", icon: CookingPot },
  ],
  diger_dekorasyon: [
    { id: "bahce_dekor", label: "Bahçe Dekor", icon: Flower },
    { id: "teras_dekor", label: "Teras Dekor", icon: Sun },
    { id: "balkon_dekor", label: "Balkon Dekor", icon: CloudSun },
    { id: "havuz_cevresi", label: "Havuz Çevresi", icon: Waves },
  ],

  /* ── YAPI ── */
  ev_yapi: [
    { id: "celik_villa", label: "Çelik Villa", icon: Home },
    { id: "konteyner_ev", label: "Konteyner Ev", icon: Container },
    { id: "prefabrik", label: "Prefabrik", icon: BoxSelect },
    { id: "tiny_house", label: "Tiny House", icon: House },
    { id: "cati_kati", label: "Çatı Katı", icon: Triangle },
    { id: "dubleks", label: "Dubleks", icon: Layers },
  ],
  ticari_yapi: [
    { id: "celik_magaza", label: "Çelik Mağaza", icon: Store },
    { id: "ofis_binasi", label: "Ofis Binası", icon: Building },
    { id: "otopark", label: "Otopark", icon: Car },
    { id: "avm", label: "AVM", icon: ShoppingCart },
    { id: "otel_binasi", label: "Otel Binası", icon: Hotel },
  ],
  endustriyel_yapi: [
    { id: "celik_fabrika", label: "Çelik Fabrika", icon: Factory },
    { id: "depo_hangar", label: "Depo / Hangar", icon: Warehouse },
    { id: "atolye", label: "Atölye", icon: Wrench },
    { id: "sera", label: "Sera", icon: Sprout },
    { id: "soguk_hava_deposu", label: "Soğuk Hava Deposu", icon: Snowflake },
    { id: "enerji_santrali", label: "Enerji Santrali", icon: Zap },
  ],
  diger_yapi: [
    { id: "dis_cephe", label: "Dış Cephe", icon: PanelTop },
    { id: "celik_pergola", label: "Çelik Pergola", icon: Tent },
    { id: "korkuluk", label: "Korkuluk", icon: Fence },
    { id: "havuz_yapisi", label: "Havuz Yapısı", icon: Waves },
    { id: "spor_tesisi", label: "Spor Tesisi", icon: Dumbbell },
  ],

  /* ── İKLİMLENDİRME ── */
  ev_iklimlendirme: [
    { id: "merkezi_isitma", label: "Merkezi Isıtma", icon: Flame },
    { id: "klima", label: "Klima", icon: Wind },
    { id: "isi_yalitimi", label: "Isı Yalıtımı", icon: ShieldCheck },
    { id: "gunes_enerjisi", label: "Güneş Enerjisi", icon: Sun },
    { id: "havalandirma", label: "Havalandırma", icon: Fan },
  ],
  ticari_iklimlendirme: [
    { id: "vrf", label: "VRF Sistem", icon: Cpu },
    { id: "chiller", label: "Chiller", icon: Thermometer },
    { id: "rooftop", label: "Rooftop Ünite", icon: ArrowUpFromLine },
    { id: "temiz_oda", label: "Temiz Oda", icon: Sparkles },
    { id: "mutfak_havalandirma", label: "Mutfak Havalandırma", icon: CookingPot },
  ],
  endustriyel_iklimlendirme: [
    { id: "fabrika_havalandirma", label: "Fabrika Havalandırma", icon: Factory },
    { id: "endustriyel_sogutma", label: "Endüstriyel Soğutma", icon: Snowflake },
    { id: "atik_isi_geri_kazanim", label: "Atık Isı Geri Kazanım", icon: Recycle },
  ],
  diger_iklimlendirme: [
    { id: "havuz_isitma", label: "Havuz Isıtma", icon: Waves },
    { id: "sera_iklimlendirme", label: "Sera İklimlendirme", icon: Sprout },
    { id: "toprak_kaynakli", label: "Toprak Kaynaklı Isı Pompası", icon: Mountain },
    { id: "dis_mekan_isitma", label: "Dış Mekan Isıtma", icon: Flame },
  ],
};

export function getStyles(
  categoryId: string | null,
  serviceId: string | null
): StyleOption[] {
  if (!categoryId || !serviceId) return [];
  const key = `${categoryId}_${serviceId}` as StyleKey;
  return styleMap[key] ?? [];
}

/* ─── Araçlar ─── */

export interface ToolOption {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const tools: ToolOption[] = [
  {
    id: "redesign",
    label: "Yeniden Tasarla",
    icon: Wand2,
    description: "Mekanı tamamen yeniden tasarla",
  },
  {
    id: "furnish",
    label: "Döşe",
    icon: Sofa,
    description: "Boş odaya mobilya ekle",
  },
  {
    id: "remove",
    label: "Mobilya Sil",
    icon: Eraser,
    description: "Mevcut mobilyaları kaldır",
  },
  {
    id: "wallpaint",
    label: "Duvar Boya",
    icon: Paintbrush,
    description: "Duvar rengini değiştir",
  },
  {
    id: "floor",
    label: "Zemin Değiştir",
    icon: Grid3x3,
    description: "Zemin malzemesini değiştir",
  },
];
