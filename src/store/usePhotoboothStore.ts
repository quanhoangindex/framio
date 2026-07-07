import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";
import { Theme, CapturedPhoto, AsciiSettings } from "@/types";
import { DEFAULT_THEMES } from "@/lib/themes";
import { DEFAULT_ASCII_SETTINGS } from "@/lib/ascii";

type PhotoboothStore = {
  // Themes
  themes: Theme[];
  activeThemeId: string;
  setActiveTheme: (id: string) => void;
  toggleFavourite: (id: string) => void;

  // ASCII effect
  asciiSettings: AsciiSettings;
  updateAsciiSettings: (patch: Partial<AsciiSettings>) => void;
  resetAsciiSettings: () => void;

  // Photos
  photos: CapturedPhoto[];
  addPhoto: (dataUrl: string, themeId: string, frameId?: string) => CapturedPhoto;
  removePhoto: (id: string) => void;
  clearPhotos: () => void;
};

export const usePhotoboothStore = create<PhotoboothStore>()(
  persist(
    (set) => ({
      // ─── Themes ────────────────────────────────────────────
      themes: DEFAULT_THEMES,
      activeThemeId: "none",

      setActiveTheme: (id) => set({ activeThemeId: id }),

      toggleFavourite: (id) =>
        set((state) => ({
          themes: state.themes.map((t) =>
            t.id === id ? { ...t, favourite: !t.favourite } : t
          ),
        })),

      // ─── ASCII effect ──────────────────────────────────────
      asciiSettings: DEFAULT_ASCII_SETTINGS,

      updateAsciiSettings: (patch) =>
        set((state) => ({
          asciiSettings: { ...state.asciiSettings, ...patch },
        })),

      resetAsciiSettings: () => set({ asciiSettings: DEFAULT_ASCII_SETTINGS }),

      // ─── Photos ────────────────────────────────────────────
      photos: [],

      addPhoto: (dataUrl, themeId, frameId) => {
        const photo: CapturedPhoto = {
          id: crypto.randomUUID(),
          dataUrl,
          themeId,
          frameId,
          capturedAt: new Date(),
        };
        set((state) => ({ photos: [photo, ...state.photos] }));
        return photo;
      },

      removePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        })),

      clearPhotos: () => set({ photos: [] }),
    }),
    {
      name: "photoboost-storage",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        themes: state.themes,
        photos: state.photos,
        asciiSettings: state.asciiSettings,
      }),
    }
  )
);
