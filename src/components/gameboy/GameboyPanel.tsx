"use client";

import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { GameboyDither } from "@/types";
import { GAMEBOY_PALETTES } from "@/lib/gameboy";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </span>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  suffix = "",
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground">{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
    </div>
  );
}

const DITHER_OPTIONS: { id: GameboyDither; label: string }[] = [
  { id: "bayer", label: "Bayer" },
  { id: "diffusion", label: "Diffusion" },
  { id: "none", label: "None" },
];

export default function GameboyPanel() {
  const { gameboySettings, updateGameboySettings, resetGameboySettings } =
    usePhotoboothStore();
  const s = gameboySettings;

  return (
    <div className="flex flex-col gap-3">
      {/* Enable toggle (Figma 34:421) */}
      <div className="flex items-center justify-between rounded-[18px] border-[0.8px] border-[rgba(255,255,255,0.08)] bg-[#070707] p-[12.8px]">
        <div className="flex items-center gap-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/thumb-gameboy.png"
            alt=""
            className="h-7 w-7 rounded-[12px] border border-[#1a1a1a] object-cover shadow-[0px_0px_7.3px_0px_rgba(216,216,216,0.25)] select-none"
            draggable={false}
          />
          <span className="text-[14px] font-medium leading-[13px] text-[#ebebeb]">
            Game Boy Mode
          </span>
        </div>
        <Switch
          checked={s.enabled}
          onCheckedChange={(enabled) => updateGameboySettings({ enabled })}
        />
      </div>

      {!s.enabled && (
        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          Turn on Game Boy Mode to render the camera like a 1998 Game Boy
          Camera — chunky pixels, four shades, pure nostalgia.
        </p>
      )}

      {s.enabled && (
        <>
          <Section title="Detail">
            <SliderRow
              label="Resolution"
              value={s.resolution}
              suffix="px"
              min={80}
              max={280}
              step={4}
              onChange={(resolution) => updateGameboySettings({ resolution })}
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              160px is the authentic Game Boy resolution.
            </p>
          </Section>

          <Section title="Palette">
            <div className="flex flex-col gap-1.5">
              {GAMEBOY_PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => updateGameboySettings({ paletteId: p.id })}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-2.5 py-2 transition-all",
                    s.paletteId === p.id
                      ? "border-primary/50 bg-primary/8"
                      : "border-border hover:border-border/80 hover:bg-muted/60"
                  )}
                >
                  <span className="text-xs font-medium">{p.name}</span>
                  <span className="flex gap-1">
                    {p.colors.map((c) => (
                      <span
                        key={c}
                        className="h-4 w-4 rounded-[4px] border border-white/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Dithering">
            <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-muted p-[3px]">
              {DITHER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateGameboySettings({ dither: opt.id })}
                  className={cn(
                    "h-7 rounded-md text-xs font-medium transition-all",
                    s.dither === opt.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Tone">
            <SliderRow
              label="Brightness"
              value={s.brightness}
              min={-100}
              max={100}
              onChange={(brightness) => updateGameboySettings({ brightness })}
            />
            <SliderRow
              label="Contrast"
              value={s.contrast}
              min={0}
              max={200}
              onChange={(contrast) => updateGameboySettings({ contrast })}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Invert</span>
              <Switch
                checked={s.invert}
                onCheckedChange={(invert) => updateGameboySettings({ invert })}
              />
            </div>
          </Section>

          <button
            onClick={resetGameboySettings}
            className="flex items-center justify-center gap-1.5 self-start px-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to defaults
          </button>
        </>
      )}
    </div>
  );
}
