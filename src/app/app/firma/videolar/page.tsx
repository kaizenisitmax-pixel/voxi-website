"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Video,
  Share2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyFirm } from "@/services/supplierService";
import {
  getMyVideos,
  deleteVideo,
  toggleVideoVisibility,
} from "@/services/timelapseService";
import type { Firm, FirmVideo } from "@/types/supplier";

export default function VideoGalleryPage() {
  const router = useRouter();
  const [firm, setFirm] = useState<Firm | null>(null);
  const [videos, setVideos] = useState<FirmVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const f = await getMyFirm();
      if (!f) {
        router.replace("/app/firma/kayit");
        return;
      }
      setFirm(f);
      const v = await getMyVideos(f.id);
      setVideos(v);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (video: FirmVideo) => {
    const text = `${video.title || "Proje videosu"} - ${firm?.name}\n${video.video_url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title || "Video", url: video.video_url });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      await deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleTogglePublic = async (video: FirmVideo) => {
    const newState = !video.is_public;
    await toggleVideoVisibility(video.id, newState);
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, is_public: newState } : v))
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-text-primary" />
      </div>
    );
  }

  // Empty
  if (videos.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center px-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-light bg-white">
          <Video className="h-7 w-7 text-text-tertiary" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-text-secondary">
          Henüz video yok
        </h2>
        <p className="mt-2 text-center text-sm text-text-tertiary">
          Supplier Studio&apos;dan ilk videonuzu oluşturun
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Videolarım</h1>
        <span className="text-sm text-text-tertiary">{videos.length} video</span>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-text-primary">Videoyu Sil</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Bu video kalıcı olarak silinecek. Emin misiniz?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-border-light py-3 text-sm font-semibold text-text-secondary hover:bg-warm-bg transition-colors btn-press"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition-colors btn-press"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video List */}
      <div className="space-y-3">
        {videos.map((video) => (
          <div
            key={video.id}
            className="overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm"
          >
            {/* Thumbnail */}
            <div className="relative">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title || "Video"}
                  className="h-[200px] w-full object-cover bg-border-light"
                />
              ) : (
                <div className="flex h-[200px] w-full items-center justify-center bg-border-light">
                  <Video className="h-8 w-8 text-text-tertiary" />
                </div>
              )}

              {/* Duration badge */}
              <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
                {video.duration_seconds ? `${video.duration_seconds}s` : "--"}
              </span>

              {/* Aspect ratio badge */}
              <span className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
                {video.aspect_ratio}
              </span>
            </div>

            {/* Info */}
            <div className="px-4 py-3">
              <p className="truncate text-base font-semibold text-text-primary">
                {video.title || "İsimsiz Video"}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                {new Date(video.created_at).toLocaleDateString("tr-TR")}
                {" · "}
                {video.view_count} görüntülenme
              </p>
            </div>

            {/* Actions */}
            <div className="flex border-t border-border-light">
              <button
                onClick={() => handleShare(video)}
                className="flex flex-1 items-center justify-center gap-2 py-2.5 text-text-primary transition-colors hover:bg-warm-bg"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-xs font-medium">Paylaş</span>
              </button>

              <div className="w-px bg-border-light" />

              <button
                onClick={() => handleTogglePublic(video)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 py-2.5 transition-colors hover:bg-warm-bg",
                  video.is_public ? "text-green-600" : "text-text-tertiary"
                )}
              >
                {video.is_public ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">
                  {video.is_public ? "Herkese Açık" : "Gizli"}
                </span>
              </button>

              <div className="w-px bg-border-light" />

              <button
                onClick={() => setDeleteConfirm(video.id)}
                className="flex flex-1 items-center justify-center gap-2 py-2.5 text-red-500 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-xs font-medium">Sil</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
