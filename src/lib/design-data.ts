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
  RefreshCw,
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

/* ─── Araçlar (Hizmet tipine göre dinamik) ─── */

export interface ToolOption {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

// Dekorasyon — 5 araç (tüm modeller destekliyor)
export const dekorasyonTools: ToolOption[] = [
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

// Yapı — 2 araç (image-to-image, prompt yönlendirmeli)
export const yapiTools: ToolOption[] = [
  {
    id: "redesign",
    label: "Yapıyı Tasarla",
    icon: Wand2,
    description: "Seçilen stilde yapı tasarla",
  },
  {
    id: "transform",
    label: "Dönüştür",
    icon: RefreshCw,
    description: "Mevcut yapıyı/alanı dönüştür",
  },
];

// İklimlendirme — araç yok (modeller null, AI tasarım desteklenmiyor)
export const iklimlendirmeTools: ToolOption[] = [];

/**
 * Hizmet tipine göre kullanılabilir araçları döndürür
 */
export function getTools(serviceType: string | null): ToolOption[] {
  if (!serviceType) return [];
  switch (serviceType) {
    case "dekorasyon":
      return dekorasyonTools;
    case "yapi":
      return yapiTools;
    case "iklimlendirme":
      return iklimlendirmeTools;
    default:
      return dekorasyonTools;
  }
}

/** @deprecated — Geriye uyumluluk için, getTools() kullanın */
export const tools: ToolOption[] = dekorasyonTools;

/* ─── Tasarım Detayları (Prompt Builder hızlı seçenekleri) ─── */

export interface QuestionGroup {
  id: string;
  label: string;
  options: string[];
  multiple: boolean; // true = çoklu seçim, false = tekli
}

const detailQuestionsMap: Record<string, QuestionGroup[]> = {
  /* ══ DEKORASYON ══ */
  ev_dekorasyon: [
    {
      id: "oda_tipi",
      label: "Oda Tipi",
      options: ["salon", "yatak odası", "mutfak", "banyo", "çocuk odası", "çalışma odası", "antre", "yemek odası"],
      multiple: false,
    },
    {
      id: "renk_paleti",
      label: "Renk Paleti",
      options: ["nötr tonlar", "sıcak tonlar", "soğuk tonlar", "pastel", "koyu & dramatik", "doğal & toprak tonları"],
      multiple: false,
    },
    {
      id: "zemin",
      label: "Zemin Tercihi",
      options: ["parke", "seramik", "mermer", "halı", "beton", "doğal taş"],
      multiple: false,
    },
    {
      id: "aydinlatma",
      label: "Aydınlatma",
      options: ["doğal ışık ağırlıklı", "spot aydınlatma", "avize", "gizli LED", "endüstriyel aydınlatma"],
      multiple: false,
    },
    {
      id: "mobilya_yogunlugu",
      label: "Mobilya Yoğunluğu",
      options: ["minimal (az mobilya)", "dengeli", "dolu (çok mobilya)"],
      multiple: false,
    },
    {
      id: "ozel_istekler",
      label: "Özel İstekler",
      options: ["açık mutfak", "şömine", "kitaplık duvarı", "panoramik pencere", "iç bahçe", "sanat galerisi duvarı"],
      multiple: true,
    },
  ],

  ticari_dekorasyon: [
    {
      id: "mekan_tipi",
      label: "Mekan Tipi",
      options: ["lobi", "restoran salonu", "bar", "ofis açık alan", "toplantı odası", "resepsiyon", "bekleme salonu"],
      multiple: false,
    },
    {
      id: "atmosfer",
      label: "Atmosfer",
      options: ["lüks & premium", "sıcak & samimi", "modern & kurumsal", "enerjik & canlı", "sakin & huzurlu"],
      multiple: false,
    },
    {
      id: "kapasite",
      label: "Kapasite",
      options: ["küçük (1-20 kişi)", "orta (20-50 kişi)", "büyük (50-100 kişi)", "çok büyük (100+ kişi)"],
      multiple: false,
    },
    {
      id: "ozel_ogeler",
      label: "Özel Öğeler",
      options: ["bar tezgahı", "sahne/platform", "açık büfe alanı", "VIP bölüm", "dış mekan terası"],
      multiple: true,
    },
  ],

  endustriyel_dekorasyon: [
    {
      id: "alan_tipi",
      label: "Alan Tipi",
      options: ["fabrika ofisi", "showroom", "yemekhane", "dinlenme alanı", "toplantı odası"],
      multiple: false,
    },
    {
      id: "oncelik",
      label: "Öncelik",
      options: ["fonksiyonellik", "estetik", "ergonomi", "marka yansıtma"],
      multiple: true,
    },
  ],

  diger_dekorasyon: [
    {
      id: "alan",
      label: "Alan",
      options: ["bahçe", "teras", "balkon", "havuz çevresi", "çatı terası"],
      multiple: false,
    },
    {
      id: "stil_ogeleri",
      label: "Stil Öğeleri",
      options: ["bitki düzenlemesi", "su öğesi", "oturma alanı", "aydınlatma", "barbekü/mutfak", "pergola"],
      multiple: true,
    },
  ],

  /* ══ YAPI ══ */
  ev_yapi: [
    {
      id: "kat_sayisi",
      label: "Kat Sayısı",
      options: ["tek kat", "2 kat", "3 kat", "dubleks", "çatı katı"],
      multiple: false,
    },
    {
      id: "alan",
      label: "Tahmini Alan",
      options: ["50-100 m²", "100-200 m²", "200-350 m²", "350-500 m²", "500+ m²"],
      multiple: false,
    },
    {
      id: "cephe",
      label: "Cephe Malzemesi",
      options: ["cam cephe", "kompozit panel", "taş kaplama", "ahşap kaplama", "sıva + boya", "karma"],
      multiple: true,
    },
    {
      id: "cati",
      label: "Çatı Tipi",
      options: ["düz çatı", "eğimli çatı", "beşik çatı", "yeşil çatı", "teras çatı"],
      multiple: false,
    },
    {
      id: "mimari_ozellik",
      label: "Mimari Özellik",
      options: ["geniş pencereler", "teras/balkon", "garaj", "havuz", "iç avlu", "çelik konstrüksiyon görünür"],
      multiple: true,
    },
  ],

  ticari_yapi: [
    {
      id: "bina_tipi",
      label: "Bina Tipi",
      options: ["mağaza", "ofis binası", "otel", "AVM", "otopark"],
      multiple: false,
    },
    {
      id: "kat_sayisi",
      label: "Kat Sayısı",
      options: ["tek kat", "2-3 kat", "4-7 kat", "8+ kat"],
      multiple: false,
    },
    {
      id: "cephe",
      label: "Cephe",
      options: ["cam giydirme", "alüminyum kompozit", "taş/tuğla", "beton", "karma"],
      multiple: true,
    },
    {
      id: "ozel",
      label: "Özel",
      options: ["giriş saçağı", "tabela alanı", "yükleme rampası", "otopark girişi"],
      multiple: true,
    },
  ],

  endustriyel_yapi: [
    {
      id: "yapi_tipi",
      label: "Yapı Tipi",
      options: ["fabrika", "depo/hangar", "atölye", "sera", "soğuk hava deposu", "enerji santrali"],
      multiple: false,
    },
    {
      id: "aciklik",
      label: "Açıklık (Span)",
      options: ["10-20 m", "20-30 m", "30-50 m", "50+ m"],
      multiple: false,
    },
    {
      id: "yukseklik",
      label: "Yükseklik",
      options: ["6-8 m", "8-12 m", "12-16 m", "16+ m"],
      multiple: false,
    },
    {
      id: "tasiyici",
      label: "Taşıyıcı Sistem",
      options: ["çelik çerçeve", "uzay kafes", "portal çerçeve", "makas sistem"],
      multiple: false,
    },
    {
      id: "kaplama",
      label: "Kaplama",
      options: ["sandviç panel", "trapez sac", "polikarbon", "cam", "PE örtü (sera)"],
      multiple: false,
    },
    {
      id: "zemin",
      label: "Zemin",
      options: ["beton plak", "epoksi", "endüstriyel şap", "toprak (sera)"],
      multiple: false,
    },
    {
      id: "tesisat",
      label: "Tesisat",
      options: ["köprü vinç", "yükleme kapısı", "havalandırma sistemi", "yangın sistemi", "aydınlatma"],
      multiple: true,
    },
  ],

  diger_yapi: [
    {
      id: "yapi",
      label: "Yapı",
      options: ["dış cephe", "pergola", "korkuluk", "havuz", "spor tesisi"],
      multiple: false,
    },
    {
      id: "malzeme",
      label: "Malzeme",
      options: ["çelik", "alüminyum", "ahşap", "cam", "kompozit"],
      multiple: true,
    },
  ],

  /* ══ İKLİMLENDİRME (teklif talebi formu) ══ */
  ev_iklimlendirme: [
    {
      id: "mevcut_sistem",
      label: "Mevcut Sistem",
      options: ["yok", "kalorifer/radyatör", "klima (split)", "merkezi sistem", "yerden ısıtma", "diğer"],
      multiple: false,
    },
    {
      id: "ihtiyac",
      label: "İhtiyaç",
      options: ["ısıtma", "soğutma", "havalandırma", "yalıtım", "komple sistem"],
      multiple: true,
    },
    {
      id: "bolge",
      label: "Bölge / İklim",
      options: ["sıcak bölge", "ılıman bölge", "soğuk bölge", "çok soğuk bölge"],
      multiple: false,
    },
  ],
  ticari_iklimlendirme: [
    {
      id: "mevcut_sistem",
      label: "Mevcut Sistem",
      options: ["yok", "klima (split)", "merkezi sistem", "VRF", "chiller", "diğer"],
      multiple: false,
    },
    {
      id: "ihtiyac",
      label: "İhtiyaç",
      options: ["ısıtma", "soğutma", "havalandırma", "yalıtım", "komple sistem"],
      multiple: true,
    },
    {
      id: "bolge",
      label: "Bölge / İklim",
      options: ["sıcak bölge", "ılıman bölge", "soğuk bölge", "çok soğuk bölge"],
      multiple: false,
    },
  ],
  endustriyel_iklimlendirme: [
    {
      id: "mevcut_sistem",
      label: "Mevcut Sistem",
      options: ["yok", "endüstriyel soğutma", "fabrika havalandırma", "merkezi sistem", "diğer"],
      multiple: false,
    },
    {
      id: "ihtiyac",
      label: "İhtiyaç",
      options: ["ısıtma", "soğutma", "havalandırma", "yalıtım", "komple sistem"],
      multiple: true,
    },
    {
      id: "bolge",
      label: "Bölge / İklim",
      options: ["sıcak bölge", "ılıman bölge", "soğuk bölge", "çok soğuk bölge"],
      multiple: false,
    },
  ],
  diger_iklimlendirme: [
    {
      id: "mevcut_sistem",
      label: "Mevcut Sistem",
      options: ["yok", "havuz ısıtma", "sera sistemi", "dış mekan ısıtıcı", "diğer"],
      multiple: false,
    },
    {
      id: "ihtiyac",
      label: "İhtiyaç",
      options: ["ısıtma", "soğutma", "havalandırma", "komple sistem"],
      multiple: true,
    },
    {
      id: "bolge",
      label: "Bölge / İklim",
      options: ["sıcak bölge", "ılıman bölge", "soğuk bölge", "çok soğuk bölge"],
      multiple: false,
    },
  ],
};

/**
 * Kategori + hizmet tipine göre detay sorularını döndürür
 */
export function getDetailQuestions(
  categoryId: string | null,
  serviceId: string | null
): QuestionGroup[] {
  if (!categoryId || !serviceId) return [];
  const key = `${categoryId}_${serviceId}`;
  return detailQuestionsMap[key] ?? [];
}
