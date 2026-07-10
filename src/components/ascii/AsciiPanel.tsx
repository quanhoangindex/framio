"use client";

import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { AsciiCharset, AsciiColorMode } from "@/types";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[18px] border-[0.8px] border-[rgba(255,255,255,0.08)] bg-[#070707] p-[12.8px]",
        className
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.275px] text-[#636363]">
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
        <span className="text-[12px] text-[#ebebeb]">{label}</span>
        <span className="text-[12px] tabular-nums text-[#636363]">
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

const CHARSET_OPTIONS: { id: AsciiCharset; label: string; preview: string }[] = [
  { id: "full", label: "Full", preview: "@%#*+=-:. " },
  { id: "minimal", label: "Minimal", preview: "#:. " },
  { id: "blocks", label: "Blocks", preview: "█▓▒░ " },
  { id: "simple", label: "Simple", preview: "#+. " },
  { id: "custom", label: "Custom", preview: "" },
];

export default function AsciiPanel() {
  const { asciiSettings, updateAsciiSettings, resetAsciiSettings } =
    usePhotoboothStore();
  const s = asciiSettings;

  return (
    <div className="flex flex-col gap-3">
      {/* Enable toggle (Figma 34:402) */}
      <div className="flex items-center justify-between rounded-[18px] border-[0.8px] border-[rgba(255,255,255,0.08)] bg-[#070707] p-[12.8px]">
        <div className="flex items-center gap-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/thumb-ascii.png"
            alt=""
            className="h-7 w-7 rounded-[12px] border border-[#1a1a1a] object-cover shadow-[0px_0px_7.3px_0px_rgba(216,216,216,0.25)] select-none"
            draggable={false}
          />
          <span className="text-[14px] font-medium leading-[13px] text-[#ebebeb]">
            ASCII Mode
          </span>
        </div>
        <Switch
          checked={s.enabled}
          onCheckedChange={(enabled) => updateAsciiSettings({ enabled })}
        />
      </div>

      {!s.enabled && (
        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          Turn on ASCII Mode to render the camera feed as characters instead
          of a filtered photo.
        </p>
      )}

      {s.enabled && (
        <>
          <Section title="Detail">
            <SliderRow
              label="Resolution"
              value={s.resolution}
              min={40}
              max={200}
              step={2}
              onChange={(resolution) => updateAsciiSettings({ resolution })}
            />
          </Section>

          <Section title="Character set">
            <Select<AsciiCharset>
              value={s.charset}
              onValueChange={(charset) => {
                if (charset) updateAsciiSettings({ charset });
              }}
            >
              <SelectTrigger className="bg-[#020202] border-[rgba(255,255,255,0.08)] rounded-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHARSET_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    <span className="flex items-center gap-2">
                      {opt.label}
                      {opt.preview && (
                        <span className="text-muted-foreground">
                          {opt.preview}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {s.charset === "custom" && (
              <input
                type="text"
                value={s.customChars}
                onChange={(e) =>
                  updateAsciiSettings({ customChars: e.target.value })
                }
                placeholder="Sparse → dense, e.g.  .:-=+*#%@"
                className="h-8 w-full rounded-[12px] border-[0.8px] border-[rgba(255,255,255,0.08)] bg-[#020202] px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            )}
          </Section>

          <Section title="Tone">
            <SliderRow
              label="Brightness"
              value={s.brightness}
              min={-100}
              max={100}
              onChange={(brightness) => updateAsciiSettings({ brightness })}
            />
            <SliderRow
              label="Contrast"
              value={s.contrast}
              min={0}
              max={200}
              onChange={(contrast) => updateAsciiSettings({ contrast })}
            />
          </Section>

          <Section title="Colors">
            <div className="grid grid-cols-2 rounded-[12px] bg-[#0d0d0d] p-[3px]">
              {(["mono", "color"] as AsciiColorMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateAsciiSettings({ colorMode: mode })}
                  className={cn(
                    "h-7 rounded-[9px] text-[12px] font-medium capitalize transition-all",
                    s.colorMode === mode
                      ? "bg-[#020202] text-[#ebebeb] shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
                      : "text-[#636363] hover:text-[#ebebeb]"
                  )}
                >
                  {mode === "mono" ? "Mono" : "Colored"}
                </button>
              ))}
            </div>

            {s.colorMode === "mono" && (
              <div className="flex items-center gap-4">
                <label className="flex flex-1 items-center justify-between text-[12px] text-[#ebebeb]">
                  Text
                  <input
                    type="color"
                    value={s.textColor}
                    onChange={(e) =>
                      updateAsciiSettings({ textColor: e.target.value })
                    }
                    className="h-6 w-9 cursor-pointer rounded-[9px] border-[0.8px] border-[rgba(255,255,255,0.08)] bg-transparent p-0.5"
                  />
                </label>
                <label className="flex flex-1 items-center justify-between text-[12px] text-[#ebebeb]">
                  Background
                  <input
                    type="color"
                    value={s.backgroundColor}
                    onChange={(e) =>
                      updateAsciiSettings({ backgroundColor: e.target.value })
                    }
                    className="h-6 w-9 cursor-pointer rounded-[9px] border-[0.8px] border-[rgba(255,255,255,0.08)] bg-transparent p-0.5"
                  />
                </label>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#ebebeb]">Invert</span>
              <Switch
                checked={s.invert}
                onCheckedChange={(invert) => updateAsciiSettings({ invert })}
              />
            </div>
          </Section>

          <button
            onClick={resetAsciiSettings}
            className="flex items-center justify-center gap-1.5 self-start px-1 text-[12px] text-[#636363] transition-colors hover:text-[#ebebeb]"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to defaults
          </button>
        </>
      )}
    </div>
  );
}
