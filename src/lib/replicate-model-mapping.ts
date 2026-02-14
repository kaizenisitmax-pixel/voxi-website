/**
 * VOXI - Replicate Model Mapping Configuration
 * Kategori, Alt Kategori ve Stil bazinda optimize edilmis model secimi
 *
 * İki model ailesi:
 *   - controlnet: adirik/interior-design (dekorasyon) — base64 image input
 *   - flux: black-forest-labs/flux-canny-pro (yapı) — URL control_image input
 */

export type ModelType = 'controlnet' | 'flux';

export interface ReplicateModelConfig {
  modelId: string;
  modelType: ModelType;
  version?: string;
  // controlnet params
  strength?: number;
  scale?: number;
  // flux params
  guidance?: number;
  // shared
  steps?: number;
  resolution?: number;
  costPerRun?: number;
  averageTime?: number;
  description?: string;
}

// ==========================================
// MODEL TANIMLARI
// ==========================================

export const REPLICATE_MODELS: Record<string, ReplicateModelConfig> = {
  // ─── DEKORASYON (controlnet ailesi) ───
  interior_design: {
    modelId: 'adirik/interior-design',
    modelType: 'controlnet',
    version: '76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38',
    strength: 0.8,
    scale: 9.0,
    steps: 30,
    resolution: 768,
    costPerRun: 0.007,
    averageTime: 8,
    description: 'Genel ic mekan tasarimi - hizli ve dengeli',
  },

  controlnet_interior: {
    modelId: 'jagilley/controlnet-interior-design',
    modelType: 'controlnet',
    strength: 0.85,
    scale: 8.5,
    steps: 25,
    resolution: 768,
    costPerRun: 0.01,
    averageTime: 12,
    description: 'ControlNet ile yapi korumali tasarim',
  },

  luxury_interior: {
    modelId: 'adirik/t2i-adapter-sdxl-depth-midas',
    modelType: 'controlnet',
    strength: 0.7,
    scale: 11.0,
    steps: 40,
    resolution: 1024,
    costPerRun: 0.025,
    averageTime: 20,
    description: 'Luks ve detayli tasarimlar icin SDXL tabanli',
  },

  commercial_spaces: {
    modelId: 'timbrooks/instruct-pix2pix',
    modelType: 'controlnet',
    strength: 0.75,
    scale: 9.0,
    steps: 30,
    resolution: 768,
    costPerRun: 0.012,
    averageTime: 10,
    description: 'Ticari mekanlar icin kontrollu duzenleme',
  },

  outdoor_design: {
    modelId: 'adirik/interior-design',
    modelType: 'controlnet',
    version: '76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38',
    strength: 0.75,
    scale: 9.0,
    steps: 30,
    resolution: 768,
    costPerRun: 0.007,
    averageTime: 8,
    description: 'Dis mekan tasarimi',
  },

  // ─── YAPI (flux ailesi) ───
  flux_canny_pro: {
    modelId: 'black-forest-labs/flux-canny-pro',
    modelType: 'flux',
    guidance: 30,
    steps: 35,
    resolution: 1024,
    costPerRun: 0.02,
    averageTime: 15,
    description: 'Flux Canny Pro — yapi formunu koruyarak retexture',
  },

  flux_depth_pro: {
    modelId: 'black-forest-labs/flux-depth-pro',
    modelType: 'flux',
    guidance: 30,
    steps: 30,
    resolution: 1024,
    costPerRun: 0.022,
    averageTime: 14,
    description: 'Flux Depth Pro — derinlik haritasi ile 3D yapi korumasi',
  },
};

// ==========================================
// KATEGORI -> MODEL MAPPING
// ==========================================

export const MODEL_MAPPING: Record<string, Record<string, Record<string, ReplicateModelConfig | null>>> = {
  dekorasyon: {
    ev: {
      modern: REPLICATE_MODELS.interior_design,
      minimalist: REPLICATE_MODELS.interior_design,
      iskandinav: REPLICATE_MODELS.interior_design,
      bohem: REPLICATE_MODELS.controlnet_interior,
      rustik: REPLICATE_MODELS.controlnet_interior,
      luks: REPLICATE_MODELS.luxury_interior,
      klasik: REPLICATE_MODELS.luxury_interior,
      art_deco: REPLICATE_MODELS.luxury_interior,
      japandi: REPLICATE_MODELS.interior_design,
      endustriyel_sik: REPLICATE_MODELS.interior_design,
    },
    ticari: {
      otel_lobisi: REPLICATE_MODELS.commercial_spaces,
      restoran: REPLICATE_MODELS.commercial_spaces,
      ofis: REPLICATE_MODELS.commercial_spaces,
      kafe: REPLICATE_MODELS.commercial_spaces,
      magaza: REPLICATE_MODELS.commercial_spaces,
      butik: REPLICATE_MODELS.commercial_spaces,
      spa: REPLICATE_MODELS.luxury_interior,
    },
    endustriyel: {
      fabrika_ofisi: REPLICATE_MODELS.interior_design,
      showroom: REPLICATE_MODELS.commercial_spaces,
      toplanti_salonu: REPLICATE_MODELS.commercial_spaces,
      yemekhane: REPLICATE_MODELS.interior_design,
    },
    diger: {
      bahce_dekor: REPLICATE_MODELS.outdoor_design,
      teras_dekor: REPLICATE_MODELS.outdoor_design,
      balkon_dekor: REPLICATE_MODELS.outdoor_design,
      havuz_cevresi: REPLICATE_MODELS.outdoor_design,
    },
  },

  // YAPI: Tum stiller flux-canny-pro (yapi formunu korur)
  yapi: {
    ev: {
      celik_villa: REPLICATE_MODELS.flux_canny_pro,
      konteyner_ev: REPLICATE_MODELS.flux_canny_pro,
      prefabrik: REPLICATE_MODELS.flux_canny_pro,
      tiny_house: REPLICATE_MODELS.flux_canny_pro,
      cati_kati: REPLICATE_MODELS.flux_canny_pro,
      dubleks: REPLICATE_MODELS.flux_canny_pro,
    },
    ticari: {
      celik_magaza: REPLICATE_MODELS.flux_canny_pro,
      ofis_binasi: REPLICATE_MODELS.flux_depth_pro,
      otopark: REPLICATE_MODELS.flux_canny_pro,
      avm: REPLICATE_MODELS.flux_depth_pro,
      otel_binasi: REPLICATE_MODELS.flux_canny_pro,
    },
    endustriyel: {
      celik_fabrika: REPLICATE_MODELS.flux_canny_pro,
      depo_hangar: REPLICATE_MODELS.flux_canny_pro,
      atolye: REPLICATE_MODELS.flux_canny_pro,
      sera: REPLICATE_MODELS.flux_canny_pro,
      soguk_hava_deposu: REPLICATE_MODELS.flux_canny_pro,
      enerji_santrali: REPLICATE_MODELS.flux_depth_pro,
    },
    diger: {
      dis_cephe: REPLICATE_MODELS.flux_canny_pro,
      celik_pergola: REPLICATE_MODELS.flux_canny_pro,
      korkuluk: REPLICATE_MODELS.flux_canny_pro,
      havuz_yapisi: REPLICATE_MODELS.flux_canny_pro,
      spor_tesisi: REPLICATE_MODELS.flux_canny_pro,
    },
  },

  iklimlendirme: {
    ev: { merkezi_isitma: null, klima: null, isi_yalitimi: null, gunes_enerjisi: null, havalandirma: null },
    ticari: { vrf: null, chiller: null, rooftop: null, temiz_oda: null, mutfak_havalandirma: null },
    endustriyel: { fabrika_havalandirma: null, endustriyel_sogutma: null, atik_isi_geri_kazanim: null },
    diger: { havuz_isitma: null, sera_iklimlendirme: null, toprak_kaynakli: null, dis_mekan_isitma: null },
  },
};

// ==========================================
// STYLE-SPECIFIC PROMPT ENHANCEMENTS
// ==========================================

export const STYLE_PROMPT_ENHANCEMENTS: Record<string, string> = {
  modern: 'clean lines, contemporary furniture, neutral colors, open space, natural light',
  minimalist: 'minimal furniture, white walls, simple design, uncluttered, Scandinavian style',
  iskandinav: 'light wood, white and gray tones, cozy textiles, hygge atmosphere, functional design',
  luks: 'elegant furniture, marble surfaces, chandeliers, rich textures, gold accents, high-end materials',
  klasik: 'traditional furniture, ornate details, warm colors, timeless design, crown molding',
  art_deco: 'geometric patterns, bold colors, metallic accents, vintage glamour, 1920s style',
  bohem: 'colorful textiles, plants, eclectic mix, layered textures, artistic pieces',
  rustik: 'natural wood, exposed beams, stone accents, earthy tones, cozy atmosphere',
  japandi: 'Japanese minimalism, Scandinavian warmth, natural materials, wabi-sabi, neutral palette',
  endustriyel_sik: 'exposed brick, metal fixtures, raw materials, urban loft, industrial elegance',
  otel_lobisi: 'luxury hospitality, grand entrance, elegant lobby, premium furnishings',
  restoran: 'dining atmosphere, ambient lighting, table settings, warm ambiance',
  ofis: 'professional workspace, ergonomic furniture, collaborative areas, corporate design',
  kafe: 'cozy seating, coffee bar, casual atmosphere, natural light, welcoming ambiance',
  magaza: 'retail display, well-lit space, product showcasing, modern shelving',
  butik: 'exclusive atmosphere, curated displays, premium finishes, intimate space',
  spa: 'serene atmosphere, natural materials, water elements, calming tones, zen design',
  celik_villa: 'modern steel structure, large windows, contemporary architecture, industrial elegance',
  konteyner_ev: 'shipping container home, creative adaptation, compact living, industrial chic',
  prefabrik: 'prefabricated building, modular design, quick assembly, modern finish',
  tiny_house: 'compact living, smart storage, minimalist design, mobile home',
  celik_fabrika: 'industrial steel building, wide span, high ceiling, functional layout',
  depo_hangar: 'warehouse structure, steel frame, large doors, efficient storage',
  sera: 'greenhouse structure, glass and steel, climate controlled, agricultural',
  bahce_dekor: 'lush plants, outdoor furniture, natural landscaping, pathways, water features',
  teras_dekor: 'outdoor seating, pergola, planters, ambient lighting, entertainment area',
  balkon_dekor: 'small space design, railing planters, cozy seating, vertical garden',
  havuz_cevresi: 'pool surroundings, sun loungers, cabana, tropical plants',
  dis_cephe: 'building facade, modern cladding, architectural lighting, curb appeal',
  celik_pergola: 'steel pergola, outdoor shade, climbing plants, modern design',
  fabrika_ofisi: 'industrial office, exposed brick, open ceiling, modern furnishings',
  showroom: 'product display space, dramatic lighting, clean layout, brand-focused',
  toplanti_salonu: 'conference room, large table, tech-equipped, professional atmosphere',
};

// ==========================================
// MODEL SELECTION
// ==========================================

export function getModelForDesign(
  serviceType: string,
  category: string,
  style: string
): ReplicateModelConfig | null {
  const serviceMapping = MODEL_MAPPING[serviceType];
  if (!serviceMapping) return REPLICATE_MODELS.interior_design;

  const categoryMapping = serviceMapping[category];
  if (!categoryMapping) return REPLICATE_MODELS.interior_design;

  let model = categoryMapping[style];

  if (!model) {
    const models = Object.values(categoryMapping).filter(Boolean);
    model = models[0] || REPLICATE_MODELS.interior_design;
  }

  if (!model) return REPLICATE_MODELS.interior_design;

  return model;
}

export function getStylePromptEnhancement(style: string): string {
  return STYLE_PROMPT_ENHANCEMENTS[style] || '';
}

// ==========================================
// TOOL-SPECIFIC CONFIGS
// ==========================================

export interface ToolConfig {
  strength: number;
  promptPrefix: string;
}

export const DEKORASYON_TOOL_CONFIG: Record<string, ToolConfig> = {
  redesign:  { strength: 0.8,  promptPrefix: 'Redesign this space,' },
  furnish:   { strength: 0.7,  promptPrefix: 'Add furniture to empty room,' },
  remove:    { strength: 0.95, promptPrefix: 'Remove furniture and objects, clean empty room' },
  wallpaint: { strength: 0.9,  promptPrefix: 'Change wall color,' },
  floor:     { strength: 0.85, promptPrefix: 'Change floor material,' },
};

export const YAPI_TOOL_CONFIG: Record<string, ToolConfig> = {
  redesign:  { strength: 0.8,  promptPrefix: 'Design a' },
  transform: { strength: 0.75, promptPrefix: 'Transform this building/area into' },
};

export function getToolStrength(serviceType: string, tool: string): number | null {
  if (serviceType === 'dekorasyon') return DEKORASYON_TOOL_CONFIG[tool]?.strength ?? null;
  if (serviceType === 'yapi') return YAPI_TOOL_CONFIG[tool]?.strength ?? null;
  return null;
}

// ==========================================
// CREATIVITY SLIDER → PARAMETER MAPPING
// ==========================================

/**
 * Yaraticilik slider'ini model parametresine cevirir
 * @param creativity 0-100 slider degeri
 * @param modelType controlnet veya flux
 * @returns { strength, guidance } — modele gore biri kullanilir
 */
export function creativityToParams(creativity: number, modelType: ModelType): {
  strength: number;
  guidance: number;
} {
  const clamped = Math.max(0, Math.min(100, creativity));

  if (modelType === 'flux') {
    // Yapi: guidance = 10 (serbest) → 60 (prompt'a cok sadik)
    return {
      strength: 0.8,
      guidance: 10 + (clamped / 100) * 50,
    };
  }

  // Dekorasyon: strength = 0.30 (orijinale sadik) → 0.95 (tamamen yaratici)
  return {
    strength: 0.30 + (clamped / 100) * 0.65,
    guidance: 30,
  };
}

// ==========================================
// PROMPT BUILDING
// ==========================================

export function buildEnhancedPrompt(
  serviceType: string,
  category: string,
  style: string,
  tool: string,
  customPrompt?: string
): string {
  const styleEnhancement = getStylePromptEnhancement(style);
  const readableStyle = style.replace(/_/g, ' ');

  const categoryContext: Record<string, string> = {
    ev: 'residential',
    ticari: 'commercial',
    endustriyel: 'industrial',
    diger: 'outdoor',
  };
  const categoryDesc = categoryContext[category] || 'residential';

  let prompt = '';

  if (serviceType === 'yapi') {
    const yapiConfig = YAPI_TOOL_CONFIG[tool];
    if (yapiConfig) {
      prompt = `${yapiConfig.promptPrefix} ${categoryDesc} ${readableStyle} style building structure`;
    } else {
      prompt = `Design a ${categoryDesc} ${readableStyle} style building structure`;
    }
    prompt += ', architectural design, steel construction';
  } else if (serviceType === 'dekorasyon') {
    const dekorConfig = DEKORASYON_TOOL_CONFIG[tool];
    if (dekorConfig) {
      prompt = `${dekorConfig.promptPrefix} ${categoryDesc} interior design, ${readableStyle} style`;
    } else {
      prompt = `Redesign this space, ${categoryDesc} interior design, ${readableStyle} style`;
    }
  } else {
    prompt = `Redesign this space, ${categoryDesc}, ${readableStyle} style`;
  }

  if (styleEnhancement) prompt += `, ${styleEnhancement}`;
  if (customPrompt) prompt += `, ${customPrompt}`;
  prompt += ', professional, photorealistic, high quality, 8k, maintain room structure';

  return prompt;
}

// ==========================================
// COST & TIME
// ==========================================

export function calculateModelCost(model: ReplicateModelConfig, count: number = 1): number {
  return (model.costPerRun || 0.01) * count;
}

export function estimateProcessingTime(model: ReplicateModelConfig, count: number = 1): number {
  return (model.averageTime || 10) * count;
}
