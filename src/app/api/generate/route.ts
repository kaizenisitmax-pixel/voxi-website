/**
 * POST /api/generate — Start AI design generation
 *
 * Dual-path: controlnet (dekorasyon) vs flux (yapı)
 * - controlnet: image as base64, strength/scale/ddim_steps
 * - flux: control_image as URL, guidance/num_inference_steps
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  getModelForDesign,
  buildEnhancedPrompt,
  calculateModelCost,
  estimateProcessingTime,
  getToolStrength,
  creativityToParams,
  REPLICATE_MODELS,
} from "@/lib/replicate-model-mapping";

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

export async function POST(request: Request) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "AI servisi yapilandirilmamis" }, { status: 500 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const category = formData.get("category") as string;
    const serviceType = formData.get("serviceType") as string;
    const style = formData.get("style") as string;
    const tool = formData.get("tool") as string;
    const customPrompt = (formData.get("customPrompt") as string) || undefined;
    const creativity = parseInt((formData.get("creativity") as string) || "50", 10);

    if (!imageFile || !category || !serviceType || !style || !tool) {
      return NextResponse.json(
        { error: "Eksik parametreler: image, category, serviceType, style, tool gerekli" },
        { status: 400 }
      );
    }

    // 3. Upload image to Supabase Storage
    const filename = `originals/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filename, imageFile, {
        contentType: imageFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: `Fotograf yuklenemedi: ${uploadError.message}` }, { status: 500 });
    }

    const { data: { publicUrl: originalImageUrl } } = supabase.storage.from("media").getPublicUrl(filename);

    // 4. Select model
    const modelConfig = getModelForDesign(serviceType, category, style);
    const finalModel = modelConfig || REPLICATE_MODELS.interior_design;
    const isFlux = finalModel.modelType === 'flux';

    // 5. Build prompt
    const prompt = buildEnhancedPrompt(serviceType, category, style, tool, customPrompt);

    // 6. Calculate parameters from creativity slider
    const creativityParams = creativityToParams(creativity, finalModel.modelType);
    const toolStrength = getToolStrength(serviceType, tool);
    const seed = Math.floor(Math.random() * 2147483647);

    console.log("=== REPLICATE REQUEST ===");
    console.log("Model:", finalModel.modelId, `(${finalModel.modelType})`);
    console.log("Prompt:", prompt);
    console.log("Seed:", seed);
    console.log("Creativity:", creativity);
    console.log("Tool:", tool);
    console.log("isFlux:", isFlux);

    let replicateBody: Record<string, unknown>;

    if (isFlux) {
      // ─── FLUX PATH (yapı) ───
      // flux-canny-pro: control_image (URL), prompt, guidance, num_inference_steps
      const guidance = creativityParams.guidance;
      const steps = finalModel.steps || 35;

      console.log("Flux guidance:", guidance, "| Steps:", steps);
      console.log("Control image URL:", originalImageUrl);

      replicateBody = {
        ...(finalModel.version ? { version: finalModel.version } : { model: finalModel.modelId }),
        input: {
          prompt,
          control_image: originalImageUrl,
          num_outputs: 1,
          num_inference_steps: steps,
          guidance,
          output_format: "jpg",
          output_quality: 90,
          seed,
        },
      };
    } else {
      // ─── CONTROLNET PATH (dekorasyon) ───
      // adirik/interior-design: image (base64), prompt, strength, scale, ddim_steps
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${imageFile.type || "image/jpeg"};base64,${base64}`;

      const strength = toolStrength ?? creativityParams.strength;
      const scale = finalModel.scale || 9.0;
      const steps = finalModel.steps || 30;
      const resolution = finalModel.resolution || 768;

      console.log("Controlnet strength:", strength, "| Scale:", scale, "| Steps:", steps);

      replicateBody = {
        version: finalModel.version || REPLICATE_MODELS.interior_design.version,
        input: {
          image: dataUrl,
          prompt,
          a_prompt: "best quality, extremely detailed, photo realistic, 8k uhd, professional photography, natural lighting, accurate proportions, coherent design",
          n_prompt: "longbody, lowres, bad anatomy, bad proportions, cropped, worst quality, low quality, blurry, black image, dark image, unrealistic, mixed room types, inconsistent style",
          num_samples: 1,
          image_resolution: resolution,
          detect_resolution: resolution,
          ddim_steps: steps,
          guess_mode: false,
          strength,
          scale,
          seed,
          eta: 0.0,
        },
      };
    }

    console.log("=========================");

    // 7. Call Replicate API
    const replicateResponse = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(replicateBody),
    });

    if (!replicateResponse.ok) {
      const errBody = await replicateResponse.json().catch(() => null);
      console.error("Replicate API error:", errBody);
      return NextResponse.json(
        { error: `AI servisi hatasi: ${errBody?.detail || replicateResponse.status}` },
        { status: 502 }
      );
    }

    const prediction = await replicateResponse.json();
    const predictionId = prediction.id;

    // 8. Save design record
    const { data: design, error: designError } = await supabase
      .from("designs")
      .insert({
        user_id: user.id,
        original_image_url: originalImageUrl,
        ai_image_url: "",
        category,
        style,
        tool,
        service_type: serviceType,
        prompt,
        processing_status: "processing",
        replicate_id: predictionId,
        model_used: finalModel.modelId,
        estimated_cost: calculateModelCost(finalModel),
        creativity_level: creativity,
      })
      .select()
      .single();

    if (designError || !design) {
      console.error("Design insert error:", designError);
      return NextResponse.json(
        { error: `Tasarim kaydi olusturulamadi: ${designError?.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      designId: design.id,
      predictionId,
      status: "processing",
      modelUsed: finalModel.modelId,
      modelType: finalModel.modelType,
      estimatedTime: estimateProcessingTime(finalModel),
      estimatedCost: calculateModelCost(finalModel),
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Beklenmeyen bir hata olustu" }, { status: 500 });
  }
}
