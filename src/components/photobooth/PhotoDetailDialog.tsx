"use client";

import { CapturedPhoto } from "@/types";
import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { STRIP_FRAMES } from "@/lib/strip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

type Props = {
  photo: CapturedPhoto | null;
  onClose: () => void;
};

export default function PhotoDetailDialog({ photo, onClose }: Props) {
  const { themes, removePhoto } = usePhotoboothStore();

  if (!photo) return null;

  const isStrip = photo.themeId === "strip";
  const isAscii = photo.themeId === "ascii";
  const frame = isStrip
    ? STRIP_FRAMES.find((f) => f.id === photo.frameId) ?? STRIP_FRAMES[0]
    : undefined;
  const theme = !isStrip && !isAscii
    ? themes.find((t) => t.id === photo.themeId)
    : undefined;

  const typeLabel = isStrip ? "Photo strip" : "Photo";
  const styleLabel = isStrip
    ? `${frame?.name} frame`
    : isAscii
      ? "ASCII mode"
      : theme?.name ?? "Original";

  const captured = new Date(photo.capturedAt);
  const capturedLabel = captured.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const download = () => {
    const a = document.createElement("a");
    a.href = photo.dataUrl;
    const ext = photo.dataUrl.startsWith("data:image/jpeg") ? "jpg" : "png";
    a.download = `framio-${photo.id}.${ext}`;
    a.click();
  };

  const remove = () => {
    removePhoto(photo.id);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{typeLabel}</DialogTitle>
          <DialogDescription>{capturedLabel}</DialogDescription>
        </DialogHeader>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.dataUrl}
          alt={typeLabel}
          className="w-full max-h-[55vh] object-contain rounded-lg bg-muted/40 border border-border"
        />

        <div className="flex flex-col gap-1.5 text-[13px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Style</span>
            <span className="font-medium">{styleLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">{typeLabel}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={remove}
            className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
          <Button size="sm" onClick={download} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
