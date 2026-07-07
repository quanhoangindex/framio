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
import { Binary, RotateCcw } from "lucide-react";

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
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-3",
        className
      )}
    >
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
      {/* Enable toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <Binary className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium leading-none">
              ASCII Mode
            </span>
            <span className="mt-1 text-[11px] leading-none text-muted-foreground">
              Live text-art camera
            </span>
          </div>
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
              <SelectTrigger>
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
                className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
            <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-muted p-[3px]">
              {(["mono", "color"] as AsciiColorMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateAsciiSettings({ colorMode: mode })}
                  className={cn(
                    "h-7 rounded-md text-xs font-medium capitalize transition-all",
                    s.colorMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode === "mono" ? "Mono" : "Colored"}
                </button>
              ))}
            </div>

            {s.colorMode === "mono" && (
              <div className="flex items-center gap-4">
                <label className="flex flex-1 items-center justify-between text-xs text-foreground">
                  Text
                  <input
                    type="color"
                    value={s.textColor}
                    onChange={(e) =>
                      updateAsciiSettings({ textColor: e.target.value })
                    }
                    className="h-6 w-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
                  />
                </label>
                <label className="flex flex-1 items-center justify-between text-xs text-foreground">
                  Background
                  <input
                    type="color"
                    value={s.backgroundColor}
                    onChange={(e) =>
                      updateAsciiSettings({ backgroundColor: e.target.value })
                    }
                    className="h-6 w-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
                  />
                </label>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Invert</span>
              <Switch
                checked={s.invert}
                onCheckedChange={(invert) => updateAsciiSettings({ invert })}
              />
            </div>
          </Section>

          <button
            onClick={resetAsciiSettings}
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
