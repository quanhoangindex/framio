"use client";

import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { THEME_SWATCHES, FALLBACK_SWATCH } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { Heart, Sparkles } from "lucide-react";

type Props = {
  showFavouritesOnly?: boolean;
};

export default function ThemeSelector({ showFavouritesOnly = false }: Props) {
  const { themes, activeThemeId, setActiveTheme, toggleFavourite, asciiSettings, gameboySettings } =
    usePhotoboothStore();
  const effectActive = asciiSettings.enabled || gameboySettings.enabled;

  const displayed = showFavouritesOnly
    ? themes.filter((t) => t.favourite)
    : themes;

  if (showFavouritesOnly && displayed.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2.5 py-10 text-muted-foreground">
        <Sparkles className="w-7 h-7 opacity-30" />
        <p className="text-sm text-center leading-relaxed">
          No favourites yet —<br />tap the heart on any theme
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {effectActive && (
        <p className="rounded-lg border border-border bg-muted/50 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground">
          Themes are paused while {asciiSettings.enabled ? "ASCII" : "Game Boy"} Mode is active.
        </p>
      )}
      <div
        className={cn(
          "grid grid-cols-3 gap-2",
          effectActive && "pointer-events-none opacity-40"
        )}
      >
      {displayed.map((theme) => {
        const isActive = theme.id === activeThemeId;
        const swatch = THEME_SWATCHES[theme.id] ?? FALLBACK_SWATCH;
        return (
          <div key={theme.id} className="relative group">
            {/* Theme card — Figma: Container Active / Default */}
            <button
              onClick={() => setActiveTheme(theme.id)}
              className={cn(
                "w-full flex flex-col items-center gap-2 p-[10.8px] rounded-[18px] border-[0.8px] transition-all duration-150",
                isActive
                  ? "bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.4)]"
                  : "bg-transparent border-[rgba(45,45,45,0.4)] hover:bg-[rgba(255,255,255,0.03)]"
              )}
            >
              {/* Swatch — per-theme gradient + reversed-gradient dot */}
              <div
                className="w-full aspect-square rounded-[12px] border flex items-center justify-center"
                style={{
                  backgroundImage: swatch.gradient,
                  borderColor: swatch.border,
                }}
              >
                <div
                  className="w-8 h-8 rounded-[35%]"
                  style={{ backgroundImage: swatch.dotGradient }}
                />
              </div>
              <span className="text-[11px] font-medium leading-[11px] text-[#ebebeb] truncate w-full text-center">
                {theme.name}
              </span>
            </button>

            {/* Favourite button — Figma: Button Favourite (hover reveal) */}
            <button
              onClick={() => toggleFavourite(theme.id)}
              className={cn(
                "absolute top-1 right-1 w-7 h-7 rounded-full bg-[#282828] border border-[rgba(45,45,45,0.4)] flex items-center justify-center transition-all duration-150",
                theme.favourite
                  ? "opacity-100 text-rose-400"
                  : "opacity-0 group-hover:opacity-100 text-white hover:text-rose-400"
              )}
              title={theme.favourite ? "Remove favourite" : "Add to favourites"}
            >
              <Heart
                className={cn("w-4 h-4", theme.favourite && "fill-current")}
              />
            </button>
          </div>
        );
      })}
      </div>
    </div>
  );
}
