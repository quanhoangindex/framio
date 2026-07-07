"use client";

import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { CapturedPhoto } from "@/types";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Images } from "lucide-react";

type Props = {
  onPhotoClick?: (photo: CapturedPhoto) => void;
};

export default function PhotoGallery({ onPhotoClick }: Props) {
  const { photos, removePhoto, clearPhotos } = usePhotoboothStore();

  const downloadPhoto = (dataUrl: string, id: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `framio-${id}.png`;
    a.click();
  };

  const downloadAll = () => {
    photos.forEach((p) => downloadPhoto(p.dataUrl, p.id));
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2.5 py-10 text-muted-foreground">
        <Images className="w-7 h-7 opacity-30" />
        <p className="text-sm text-center leading-relaxed">
          No photos yet —<br />strike a pose!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Actions */}
      <div className="flex justify-end gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadAll}
          className="h-7 text-xs gap-1.5 px-2.5"
        >
          <Download className="w-3 h-3" />
          Download all
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearPhotos}
          className="h-7 text-xs gap-1.5 px-2.5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </Button>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick?.(photo)}
            className="relative group rounded-xl overflow-hidden bg-muted aspect-square border border-border cursor-pointer"
          >
            <img
              src={photo.dataUrl}
              alt="Captured photo"
              className={
                photo.themeId === "strip"
                  ? "w-full h-full object-contain"
                  : "w-full h-full object-cover"
              }
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadPhoto(photo.dataUrl, photo.id);
                }}
                className="w-8 h-8 rounded-full bg-white/12 border border-white/15 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/22 active:scale-90 transition-all"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(photo.id);
                }}
                className="w-8 h-8 rounded-full bg-white/12 border border-white/15 backdrop-blur-sm text-white flex items-center justify-center hover:bg-rose-500/50 active:scale-90 transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
