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
import { Images, Palette } from "lucide-react";
import { toast } from "sonner";

const CONIC_DOT =
  "conic-gradient(from 90deg, #0095aa 0%, #41a9ab 11%, #908e96 23%, #de7280 34%, #e29a72 51%, #e5c264 67%, #73ac87 79%, #1d9ba1 88%, #0095aa 100%)";

const TAB_CLASS =
  "flex-1 h-[36px]! rounded-t-[8px]! rounded-b-none! text-[13px] font-medium text-[#636363]! hover:text-[#ebebeb]! data-active:text-[#ebebeb]! data-active:bg-[rgba(255,255,255,0.1)]! data-active:border-transparent! after:bg-[#ebebeb]! after:bottom-[-0.8px]! after:h-[2px]!";

/** The full feature panel — used in the desktop sidebar and the mobile bottom sheet. */
function PanelTabs({
  asciiEnabled,
  gameboyEnabled,
}: {
  asciiEnabled: boolean;
  gameboyEnabled: boolean;
}) {
  return (
    <Tabs defaultValue="themes" className="flex flex-col h-full min-h-0">
      <TabsList
        variant="line"
        className="w-full shrink-0 rounded-none border-b-[0.8px] border-[rgba(255,255,255,0.08)] justify-start px-[12px] pt-[6px] pb-[0.8px] h-auto group-data-horizontal/tabs:h-auto bg-transparent gap-0 overflow-x-auto"
      >
        <TabsTrigger value="themes" className={`${TAB_CLASS} px-[8.8px]`}>
          Themes
        </TabsTrigger>
        <TabsTrigger value="ascii" className={`${TAB_CLASS} px-[14.8px] gap-1.5`}>
          ASCII
          {asciiEnabled && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundImage: CONIC_DOT }}
            />
          )}
        </TabsTrigger>
        <TabsTrigger value="gameboy" className={`${TAB_CLASS} px-[14.8px] gap-1.5`}>
          GB
          {gameboyEnabled && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundImage: CONIC_DOT }}
            />
          )}
        </TabsTrigger>
        <TabsTrigger value="favourites" className={`${TAB_CLASS} px-[8.8px]`}>
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
  );
}

export default function Home() {
  const { themes, activeThemeId, asciiSettings, gameboySettings, addPhoto, photos } =
    usePhotoboothStore();
  const activeTheme = themes.find((t) => t.id === activeThemeId) ?? themes[0];
  const [detailPhoto, setDetailPhoto] = useState<CapturedPhoto | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const effectActive = asciiSettings.enabled || gameboySettings.enabled;

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
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
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
        {/* Camera — full-page on mobile (Figma 109:909), split view on desktop */}
        <section className="relative flex-1 min-h-0 p-4 lg:min-h-0">
          <CameraView
            filter={activeTheme.filter}
            asciiSettings={asciiSettings}
            gameboySettings={gameboySettings}
            onCapture={handleCapture}
            onStripComplete={handleStripComplete}
          />

          {/* Mobile: themes chip next to the camera control */}
          <button
            onClick={() => setSheetOpen(true)}
            className="lg:hidden absolute left-7 bottom-[76px] flex items-center gap-1.5 h-9 px-3 rounded-full bg-[rgba(10,10,10,0.7)] border-[0.8px] border-[rgba(255,255,255,0.2)] text-[13px] font-medium text-[#ebebeb] backdrop-blur-xl active:scale-95 transition-all"
            title="Themes & effects"
          >
            <Palette className="w-3.5 h-3.5" />
            Themes
            {effectActive && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundImage: CONIC_DOT }}
              />
            )}
          </button>
        </section>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-none lg:w-[360px] border-l border-border flex-col min-h-0">
          <PanelTabs
            asciiEnabled={asciiSettings.enabled}
            gameboyEnabled={gameboySettings.enabled}
          />
        </aside>
      </main>

      {/* Mobile bottom sheet — full feature panel slides up */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 [animation:reveal-fade-in_0.2s_ease-out_both]"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 h-[72dvh] rounded-t-[24px] bg-background border-t-[0.8px] border-x-[0.8px] border-[rgba(255,255,255,0.12)] flex flex-col overflow-hidden [animation:sheet-up_0.3s_cubic-bezier(0.32,0.72,0,1)_both]">
            <button
              onClick={() => setSheetOpen(false)}
              className="shrink-0 w-full pt-3 pb-1 flex justify-center"
              title="Close"
            >
              <span className="w-9 h-1 rounded-full bg-[rgba(255,255,255,0.25)]" />
            </button>
            <div className="flex-1 min-h-0 pb-[env(safe-area-inset-bottom)]">
              <PanelTabs
                asciiEnabled={asciiSettings.enabled}
                gameboyEnabled={gameboySettings.enabled}
              />
            </div>
          </div>
        </div>
      )}

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
