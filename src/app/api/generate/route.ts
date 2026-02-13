/**
 * POST /api/generate — Start AI design generation
 *
 * Receives FormData:
 *   - image: File (user photo)
 *   - category: string (ev, ticari, endustriyel, diger)
 *   - serviceType: string (dekorasyon, yapi, iklimlendirme)
 *   - style: string (modern, celik_fabrika, etc.)
 *   - tool: string (redesign, furnish, etc.)
 *
 * Returns:
 *   - { designId, predictionId, status: 'processing' }
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  getModelForDesign,
  buildEnhancedPrompt,
  calculateModelCost,
  estimateProcessingTime,
  getToolStrength,
  REPLICATE_MODELS,
} from "@/lib/replicate-model-mapping";

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "AI servisi yapilandirilmamis" },
        { status: 500 }
      );
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const category = formData.get("category") as string;
    const serviceType = formData.get("serviceType") as string;
    const style = formData.get("style") as string;
    const tool = formData.get("tool") as string;
    const customPrompt = (formData.get("customPrompt") as string) || undefined;

    if (!imageFile || !category || !serviceType || !style || !tool) {
      return NextResponse.json(
        { error: "Eksik parametreler: image, category, serviceType, style, tool gerekli" },
        { status: 400 }
      );
    }

    // 3. Upload image to Supabase Storage (web-native File API)
    const filename = `originals/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filename, imageFile, {
        contentType: imageFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: `Fotograf yuklenemedi: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl: originalImageUrl },
    } = supabase.storage.from("media").getPublicUrl(filename);

    // 4. Convert image to base64 for Replicate
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${imageFile.type || "image/jpeg"};base64,${base64}`;

    // 5. Select model using getModelForDesign (same mapping as mobile)
    const modelConfig = getModelForDesign(serviceType, category, style);
    const finalModel = modelConfig || REPLICATE_MODELS.interior_design;

    console.log(`Model: ${finalModel.modelId} (${finalModel.description || ""})`);
    console.log(`Cost: $${calculateModelCost(finalModel)}`);
    console.log(`ETA: ${estimateProcessingTime(finalModel)}s`);

    // 6. Build enhanced prompt (same logic as mobile + user details)
    const prompt = buildEnhancedPrompt(serviceType, category, style, tool, customPrompt);
    console.log("Prompt:", prompt);

    // 7. Start Replicate prediction — apply tool-specific strength override
    const version =
      finalModel.version || REPLICATE_MODELS.interior_design.version;
    const toolStrength = getToolStrength(serviceType, tool);
    const strength = toolStrength ?? finalModel.strength ?? 0.8;
    const scale = finalModel.scale || 9.0;
    const steps = finalModel.steps || 30;
    const resolution = finalModel.resolution || 768;

    // Generate random seed for unique results every time
    const seed = Math.floor(Math.random() * 2147483647);

    console.log("=== REPLICATE REQUEST ===");
    console.log("Model:", finalModel.modelId);
    console.log("Version:", version);
    console.log("Prompt:", prompt);
    console.log("Seed:", seed);
    console.log("Strength:", strength);
    console.log("Scale:", scale);
    console.log("Steps:", steps);
    console.log("Resolution:", resolution);
    console.log("Tool:", tool, "| Strength override:", toolStrength);
    console.log("CustomPrompt:", customPrompt || "(none)");
    console.log("Image size:", imageFile.size, "bytes");
    console.log("Image type:", imageFile.type);
    console.log("=========================");

    const replicateResponse = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version,
        input: {
          image: dataUrl,
          prompt,
          a_prompt:
            "best quality, extremely detailed, photo realistic, 8k uhd, professional photography, natural lighting, accurate proportions, coherent design",
          n_prompt:
            "longbody, lowres, bad anatomy, bad proportions, cropped, worst quality, low quality, blurry, black image, dark image, unrealistic, mixed room types, inconsistent style",
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
      }),
    });

    if (!replicateResponse.ok) {
      const errBody = await replicateResponse.json().catch(() => null);
      console.error("Replicate API error:", errBody);
      return NextResponse.json(
        {
          error: `AI servisi hatasi: ${errBody?.detail || replicateResponse.status}`,
        },
        { status: 502 }
      );
    }

    const prediction = await replicateResponse.json();
    const predictionId = prediction.id;

    // 8. Save design record to Supabase (status: processing)
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
      estimatedTime: estimateProcessingTime(finalModel),
      estimatedCost: calculateModelCost(finalModel),
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata olustu" },
      { status: 500 }
    );
  }
}
