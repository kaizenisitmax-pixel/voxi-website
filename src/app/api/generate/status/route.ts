/**
 * GET /api/generate/status?predictionId=xxx&designId=xxx
 *
 * Polls Replicate prediction status and updates design record when complete.
 *
 * Returns:
 *   - { status: 'processing' }
 *   - { status: 'completed', aiImageUrl, designId }
 *   - { status: 'failed', error }
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

export async function GET(request: Request) {
  try {
    // Auth check
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

    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get("predictionId");
    const designId = searchParams.get("designId");

    if (!predictionId || !designId) {
      return NextResponse.json(
        { error: "predictionId ve designId gerekli" },
        { status: 400 }
      );
    }

    // Check Replicate status
    const response = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Prediction durumu alinamadi" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.status === "succeeded") {
      const outputUrl = Array.isArray(data.output) ? data.output[0] : data.output;

      // Update design record
      await supabase
        .from("designs")
        .update({
          ai_image_url: outputUrl,
          processing_status: "completed",
        })
        .eq("id", designId);

      return NextResponse.json({
        status: "completed",
        aiImageUrl: outputUrl,
        designId,
      });
    }

    if (data.status === "failed" || data.status === "canceled") {
      // Update design record
      await supabase
        .from("designs")
        .update({ processing_status: "failed" })
        .eq("id", designId);

      return NextResponse.json({
        status: "failed",
        error: data.error || "Tasarim basarisiz oldu",
      });
    }

    // Still processing
    return NextResponse.json({
      status: "processing",
      replicateStatus: data.status,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Durum sorgulanamadi" },
      { status: 500 }
    );
  }
}
