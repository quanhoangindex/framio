"use client";

import { useState } from "react";
import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { CapturedPhoto } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CameraView from "@/components/camera/CameraView";
import ThemeSelector from "@/components/themes/ThemeSelector";
import AsciiPanel from "@/components/ascii/AsciiPanel";
import GameboyPanel from "@/components/gameboy/GameboyPanel";
import PhotoGallery from "@/components/photobooth/PhotoGallery";
import PhotoDetailDialog from "@/components/photobooth/PhotoDetailDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Images } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { themes, activeThemeId, asciiSettings, gameboySettings, addPhoto, photos } =
    usePhotoboothStore();
  const activeTheme = themes.find((t) => t.id === activeThemeId) ?? themes[0];
  const [detailPhoto, setDetailPhoto] = useState<CapturedPhoto | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const handleCapture = (dataUrl: string) => {
    const themeId = asciiSettings.enabled
      ? "ascii"
      : gameboySettings.enabled
        ? "gameboy"
        : activeThemeId;
    addPhoto(dataUrl, themeId);
    toast.success("Photo captured!");
  };

  const handleStripComplete = (dataUrl: string, frameId: string) => {
    const photo = addPhoto(dataUrl, "strip", frameId);
    toast.success("Photo strip saved to gallery!");
    setDetailPhoto(photo); // preview details right after composing
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 h-14 border-b border-border px-5 flex items-center justify-between">
        {/* Framio logo (Figma 10:227) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Framio" className="h-7 w-auto select-none" draggable={false} />
        <button
          onClick={() => setGalleryOpen(true)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full border-[0.8px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] text-[13px] font-medium text-[#ebebeb] hover:bg-[rgba(255,255,255,0.12)] active:scale-95 transition-all"
          title="Open gallery"
        >
          <Images className="w-3.5 h-3.5" />
          Gallery
          {photos.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[15px] h-[15px] px-[4px] text-[10px] leading-[15px] font-semibold bg-[#fdfeff] text-[#2f2f2f] rounded-full">
              {photos.length > 99 ? "99+" : photos.length}
            </span>
          )}
        </button>
      </header>

      {/* Main layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Camera section */}
        <section className="shrink-0 h-[42vh] min-h-[240px] p-4 lg:h-auto lg:min-h-0 lg:flex-1">
          <CameraView
            filter={activeTheme.filter}
            asciiSettings={asciiSettings}
            gameboySettings={gameboySettings}
            onCapture={handleCapture}
            onStripComplete={handleStripComplete}
          />
        </section>

        {/* Side panel */}
        <aside className="flex-1 min-h-0 lg:flex-none lg:w-[360px] border-t lg:border-t-0 lg:border-l border-border flex flex-col">
          <Tabs defaultValue="themes" className="flex flex-col h-full min-h-0">
            <TabsList
              variant="line"
              className="w-full rounded-none border-b-[0.8px] border-[rgba(255,255,255,0.08)] justify-start px-[12px] pt-[6px] pb-[0.8px] h-auto group-data-horizontal/tabs:h-auto bg-transparent gap-0 overflow-x-auto"
            >
              <TabsTrigger
                value="themes"
                className="flex-1 h-[36px]! rounded-t-[8px]! rounded-b-none! text-[13px] font-medium text-[#636363]! hover:text-[#ebebeb]! data-active:text-[#ebebeb]! data-active:bg-[rgba(255,255,255,0.1)]! data-active:border-transparent! after:bg-[#ebebeb]! after:bottom-[-0.8px]! after:h-[2px]! px-[8.8px]"
              >
                Themes
              </TabsTrigger>
              <TabsTrigger
                value="ascii"
                className="flex-1 h-[36px]! rounded-t-[8px]! rounded-b-none! text-[13px] font-medium text-[#636363]! hover:text-[#ebebeb]! data-active:text-[#ebebeb]! data-active:bg-[rgba(255,255,255,0.1)]! data-active:border-transparent! after:bg-[#ebebeb]! after:bottom-[-0.8px]! after:h-[2px]! px-[14.8px] gap-1.5"
              >
                ASCII
                {asciiSettings.enabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="gameboy"
                className="flex-1 h-[36px]! rounded-t-[8px]! rounded-b-none! text-[13px] font-medium text-[#636363]! hover:text-[#ebebeb]! data-active:text-[#ebebeb]! data-active:bg-[rgba(255,255,255,0.1)]! data-active:border-transparent! after:bg-[#ebebeb]! after:bottom-[-0.8px]! after:h-[2px]! px-[14.8px] gap-1.5"
              >
                GB
                {gameboySettings.enabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="favourites"
                className="flex-1 h-[36px]! rounded-t-[8px]! rounded-b-none! text-[13px] font-medium text-[#636363]! hover:text-[#ebebeb]! data-active:text-[#ebebeb]! data-active:bg-[rgba(255,255,255,0.1)]! data-active:border-transparent! after:bg-[#ebebeb]! after:bottom-[-0.8px]! after:h-[2px]! px-[8.8px]"
              >
                Favourites
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4">
              <TabsContent value="themes" className="mt-0">
                <ThemeSelector />
              </TabsContent>
              <TabsContent value="ascii" className="mt-0">
                <AsciiPanel />
              </TabsContent>
              <TabsContent value="gameboy" className="mt-0">
                <GameboyPanel />
              </TabsContent>
              <TabsContent value="favourites" className="mt-0">
                <ThemeSelector showFavouritesOnly />
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </main>

      {/* Gallery dialog */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] grid-rows-[auto_1fr]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Gallery
              {photos.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[15px] h-[15px] px-[4px] text-[10px] leading-[15px] font-semibold bg-[#fdfeff] text-[#2f2f2f] rounded-full">
                  {photos.length > 99 ? "99+" : photos.length}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto -mx-1 px-1">
            <PhotoGallery onPhotoClick={setDetailPhoto} />
          </div>
        </DialogContent>
      </Dialog>

      <PhotoDetailDialog
        photo={detailPhoto}
        onClose={() => setDetailPhoto(null)}
      />
    </div>
  );
}
