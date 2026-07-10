"use client";

import {
    useRef,
    useCallback,
    useEffect,
    useState,
    useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import Webcam from "react-webcam";
import { filterToCSS } from "@/lib/themes";
import { renderAsciiFrame } from "@/lib/ascii";
import { renderGameboyFrame } from "@/lib/gameboy";
import { composeStrip, STRIP_FRAMES, STRIP_PHOTO_COUNT } from "@/lib/strip";
import { AsciiSettings, GameboySettings, ThemeFilter } from "@/types";
import {
    RefreshCw,
    Timer,
    ShieldAlert,
    VideoOff,
    GalleryVertical,
    Zap,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    filter: ThemeFilter;
    asciiSettings: AsciiSettings;
    gameboySettings: GameboySettings;
    onCapture: (dataUrl: string) => void;
    onStripComplete?: (dataUrl: string, frameId: string) => void;
};

type CameraError = "permission_denied" | "no_camera" | "other";

const ASCII_FRAME_INTERVAL = 1000 / 18;

// ─── Sound effects ───────────────────────────────────────────
// Singleton, preloaded audio: creating Audio at play time meant the short
// (0.73s) flash transient was lost to first-load latency. These elements are
// fetched and decoded before the moment, so playback is instant.
const FLASH_SOUND_START = 0.07; // skip leading silence in the file

// Print sound: play the 0.97s → 3.66s segment (≈2.69s, matches eject motion)
const PRINT_SOUND_START = 0.97;
const PRINT_SOUND_END = 3.66;

let flashAudio: HTMLAudioElement | null = null;
let printAudio: HTMLAudioElement | null = null;

function ensureSounds() {
    if (typeof Audio === "undefined") return;
    if (!flashAudio) {
        flashAudio = new Audio("/sounds/flashsound.mp3");
        flashAudio.preload = "auto";
        flashAudio.load();
    }
    if (!printAudio) {
        printAudio = new Audio("/sounds/printsound.mp3");
        printAudio.preload = "auto";
        printAudio.load();
    }
}

function playFlashSound() {
    ensureSounds();
    if (!flashAudio) return;
    try {
        flashAudio.currentTime = FLASH_SOUND_START;
    } catch {}
    flashAudio.volume = 1;
    flashAudio.play().catch(() => {});
}

function playPrintSound() {
    ensureSounds();
    if (!printAudio) return;
    const a = printAudio;
    try {
        a.currentTime = PRINT_SOUND_START;
    } catch {}
    const stopAt = () => {
        if (a.currentTime >= PRINT_SOUND_END) {
            a.pause();
            a.removeEventListener("timeupdate", stopAt);
        }
    };
    a.addEventListener("timeupdate", stopAt);
    a.play().catch(() => {});
}

export default function CameraView({
    filter,
    asciiSettings,
    gameboySettings,
    onCapture,
    onStripComplete,
}: Props) {
    const webcamRef = useRef<Webcam>(null);
    const asciiCanvasRef = useRef<HTMLCanvasElement>(null);
    const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef(0);
    const [facingMode, setFacingMode] = useState<"user" | "environment">(
        "user",
    );
    const [cameraError, setCameraError] = useState<CameraError | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [stripMode, setStripMode] = useState(false);
    const [stripShots, setStripShots] = useState<string[]>([]);
    const [stripFrameId, setStripFrameId] = useState(STRIP_FRAMES[0].id);
    const [isComposing, setIsComposing] = useState(false);
    const [reveal, setReveal] = useState<{
        dataUrl: string;
        frameId: string;
    } | null>(null);

    const [flashOn, setFlashOn] = useState(false);
    const [screenFlash, setScreenFlash] = useState(false);
    // SSR-safe client check: false during server render, true after mount
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const filterCSS = filterToCSS(filter);
    const mirrored = facingMode === "user";
    const effectActive = asciiSettings.enabled || gameboySettings.enabled;

    useEffect(() => {
        if (!effectActive) {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            return;
        }

        if (!sampleCanvasRef.current) {
            sampleCanvasRef.current = document.createElement("canvas");
        }

        const loop = (time: number) => {
            rafRef.current = requestAnimationFrame(loop);
            const video = webcamRef.current?.video;
            const canvas = asciiCanvasRef.current;
            const sampleCanvas = sampleCanvasRef.current;
            if (!video || !canvas || !sampleCanvas || video.readyState < 2)
                return;
            if (time - lastFrameTimeRef.current < ASCII_FRAME_INTERVAL) return;
            lastFrameTimeRef.current = time;

            if (
                canvas.width !== video.videoWidth ||
                canvas.height !== video.videoHeight
            ) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }
            if (asciiSettings.enabled) {
                renderAsciiFrame(
                    video,
                    canvas,
                    sampleCanvas,
                    asciiSettings,
                    mirrored,
                );
            } else {
                renderGameboyFrame(
                    video,
                    canvas,
                    sampleCanvas,
                    gameboySettings,
                    mirrored,
                );
            }
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [asciiSettings, gameboySettings, effectActive, mirrored]);

    useEffect(() => {
        let mounted = true;
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                // Release immediately — Webcam component manages its own stream
                stream.getTracks().forEach((t) => t.stop());
            })
            .catch((err: Error) => {
                if (!mounted) return;
                const name = (err as DOMException).name ?? "";
                if (
                    name === "NotAllowedError" ||
                    name === "PermissionDeniedError"
                ) {
                    setCameraError("permission_denied");
                } else if (
                    name === "NotFoundError" ||
                    name === "DevicesNotFoundError"
                ) {
                    setCameraError("no_camera");
                } else {
                    setCameraError("other");
                }
            });
        return () => {
            mounted = false;
        };
    }, []);

    /** Capture a frame with the theme filter baked into the pixels. */
    const captureFrame = useCallback((): string | null => {
        if (effectActive && asciiCanvasRef.current) {
            return asciiCanvasRef.current.toDataURL("image/jpeg", 0.92);
        }
        const video = webcamRef.current?.video;
        if (!video || video.readyState < 2) return null;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        if (filterCSS) ctx.filter = filterCSS;
        if (mirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.92);
    }, [effectActive, filterCSS, mirrored]);

    const finishStrip = useCallback(
        (shots: string[]) => {
            const frame =
                STRIP_FRAMES.find((f) => f.id === stripFrameId) ??
                STRIP_FRAMES[0];
            setIsComposing(true);
            composeStrip(shots, frame)
                .then((dataUrl) => {
                    setStripShots([]);
                    setReveal({ dataUrl, frameId: frame.id }); // camera reveal animation
                })
                .finally(() => setIsComposing(false));
        },
        [stripFrameId],
    );

    const performCapture = useCallback(() => {
        setIsCapturing(true);
        setTimeout(() => setIsCapturing(false), 200);

        const dataUrl = captureFrame();
        if (!dataUrl) return;

        if (stripMode) {
            if (stripShots.length >= STRIP_PHOTO_COUNT || isComposing) return;
            const next = [...stripShots, dataUrl];
            setStripShots(next);
            if (next.length === STRIP_PHOTO_COUNT) finishStrip(next);
            return;
        }
        onCapture(dataUrl);
    }, [
        onCapture,
        captureFrame,
        stripMode,
        stripShots,
        isComposing,
        finishStrip,
    ]);

    // Screen-fill flash: webcams have no hardware flash, so the whole screen
    // goes white to light the subject, then the frame is captured mid-flash.
    const capture = useCallback(() => {
        if (!flashOn) {
            performCapture();
            return;
        }
        setScreenFlash(true);
        setTimeout(() => {
            performCapture();
            setTimeout(() => setScreenFlash(false), 180);
        }, 300);
    }, [flashOn, performCapture]);

    // Reveal animation: flash (0.5s) -> eject (0.95s, 2.69s long, synced to
    // the print sound segment) -> deliver the strip (details dialog)
    useEffect(() => {
        if (!reveal) return;
        ensureSounds(); // fetch + decode with 600ms of headroom
        const flashT = setTimeout(playFlashSound, 600);
        const printT = setTimeout(playPrintSound, 1600);
        const doneT = setTimeout(() => {
            onStripComplete?.(reveal.dataUrl, reveal.frameId);
            setReveal(null);
        }, 4750);
        return () => {
            clearTimeout(flashT);
            clearTimeout(printT);
            clearTimeout(doneT);
        };
    }, [reveal, onStripComplete]);

    const startCountdown = useCallback(() => {
        if (countdown !== null) return;
        setCountdown(3);
    }, [countdown]);

    useEffect(() => {
        if (countdown === null) return;

        const timeout = setTimeout(() => {
            if (countdown === 1) {
                capture();
                setCountdown(null);
            } else {
                setCountdown((prev) => (prev !== null ? prev - 1 : null));
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [countdown, capture]);

    const toggleCamera = () =>
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));

    if (cameraError) {
        const isPermission = cameraError === "permission_denied";
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground rounded-2xl bg-card border border-border">
                {isPermission ? (
                    <ShieldAlert className="w-10 h-10 opacity-30" />
                ) : (
                    <VideoOff className="w-10 h-10 opacity-30" />
                )}
                <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                        {isPermission
                            ? "Camera access blocked"
                            : "No camera found"}
                    </p>
                    <p className="text-xs mt-1 max-w-[240px] leading-relaxed">
                        {isPermission
                            ? "Click the camera icon in the address bar, choose Allow, then reload"
                            : "Connect a camera and reload the page"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                videoConstraints={{ facingMode }}
                mirrored={mirrored}
                className={cn(
                    "absolute inset-0 w-full h-full object-cover",
                    effectActive && "opacity-0",
                )}
                style={{ filter: effectActive ? "none" : filterCSS || "none" }}
            />

            {effectActive && (
                <canvas
                    ref={asciiCanvasRef}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* Capture flash */}
            <div
                className={cn(
                    "absolute inset-0 bg-white pointer-events-none transition-opacity duration-200",
                    isCapturing ? "opacity-50" : "opacity-0",
                )}
            />

            {/* Strip mode: vertical progress column (Figma 10:45) + frame picker */}
            {stripMode && (
                <div className="absolute top-4 inset-x-4 flex items-start justify-between pointer-events-none">
                    <div className="flex flex-col gap-2 items-center justify-center px-[12.8px] py-[8.8px] rounded-[18px] bg-[rgba(0,0,0,0.35)] border-[0.8px] border-[rgba(255,255,255,0.1)] backdrop-blur-xl pointer-events-auto">
                        {Array.from({ length: STRIP_PHOTO_COUNT }).map(
                            (_, i) =>
                                stripShots[i] ? (
                                    <img
                                        key={i}
                                        src={stripShots[i]}
                                        alt={`Shot ${i + 1}`}
                                        className="w-[56px] h-[40px] rounded-[9px] object-cover border border-white/40"
                                    />
                                ) : (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-[56px] h-[40px] rounded-[9px] border-[0.8px] border-dashed flex items-center justify-center text-[11px] leading-[16.5px]",
                                            i === stripShots.length
                                                ? "border-[rgba(255,255,255,0.7)] text-white"
                                                : "border-[rgba(255,255,255,0.3)] text-[rgba(255,255,255,0.6)]",
                                        )}>
                                        {i + 1}
                                    </div>
                                ),
                        )}
                        {stripShots.length > 0 && (
                            <button
                                onClick={() => setStripShots([])}
                                className="w-6 h-6 rounded-full bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all"
                                title="Restart strip">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-black/35 backdrop-blur-xl border border-white/10 pointer-events-auto">
                        {STRIP_FRAMES.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setStripFrameId(f.id)}
                                className={cn(
                                    "w-6 h-6 rounded-full border transition-all",
                                    stripFrameId === f.id
                                        ? "border-white scale-110"
                                        : "border-white/25 hover:border-white/60",
                                )}
                                style={{ backgroundColor: f.background }}
                                title={f.name}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Composing indicator */}
            {isComposing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <span className="text-white text-sm font-medium animate-pulse">
                        Creating your strip…
                    </span>
                </div>
            )}

            {/* Strip reveal — fullscreen portal, topmost layer (Figma 27:289) */}
            {reveal &&
                mounted &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 [animation:reveal-fade-in_0.25s_ease-out_both]">
                        {/* full-screen flash */}
                        <div className="absolute inset-0 bg-white pointer-events-none [animation:reveal-screen-flash_1s_ease-out_0.6s_both]" />
                        <div className="scale-[0.65] sm:scale-90 lg:scale-100 origin-center">
                            <div className="relative w-[365px] h-[516px] [animation:reveal-pop_0.35s_ease-out_both]">
                                {/* camera body — public/camera.png */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/camera.png"
                                    alt=""
                                    className="absolute left-0 top-0 w-[365px] h-auto z-10 select-none pointer-events-none"
                                    draggable={false}
                                />
                                {/* flashpoint blink + glow */}
                                <div className="absolute left-[292px] top-[33px] w-[11px] h-[10px] bg-white z-20 [animation:reveal-flash-blink_1s_ease-out_0.6s_both]" />
                                <div className="absolute left-[262px] top-[3px] w-[70px] h-[70px] rounded-full bg-white blur-xl z-20 [animation:reveal-flash-blink_1s_ease-out_0.6s_both]" />
                                {/* the real strip ejects below the slot in 3D perspective (Figma 29:384) */}
                                <div
                                    className="absolute left-[31px] top-[251px] w-[301px] z-20"
                                    style={{
                                        perspective: "700px",
                                        // clip only the top edge (hides the not-yet-ejected part);
                                        // sides/bottom stay open so the perspective flare isn't cut
                                        clipPath:
                                            "inset(0px -300px -600px -300px)",
                                    }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={reveal.dataUrl}
                                        alt="Photo strip"
                                        className="w-full origin-top shadow-[0_24px_48px_rgba(0,0,0,0.55)] [animation:reveal-eject_2.69s_cubic-bezier(0.22,1,0.36,1)_1.6s_both]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}

            {/* Countdown overlay — camera stays visible, soft vignette + animated number */}
            {countdown !== null && (
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.4) 100%)",
                    }}>
                    {/* key re-triggers animations on every tick */}
                    <div
                        key={countdown}
                        className="relative flex items-center justify-center">
                        <span className="absolute w-44 h-44 rounded-full border-2 border-white/50 [animation:countdown-ring_0.9s_ease-out_forwards]" />
                        <span
                            className="text-white font-bold tabular-nums select-none [animation:countdown-pop_0.9s_ease-out_forwards]"
                            style={{
                                fontSize: "clamp(80px, 15vw, 140px)",
                                textShadow:
                                    "0 0 60px rgba(255,255,255,0.45), 0 2px 24px rgba(0,0,0,0.5)",
                                letterSpacing: "-0.04em",
                            }}>
                            {countdown}
                        </span>
                    </div>
                </div>
            )}

            {/* Controls — clover cluster (Figma 88:180): strip / timer / flip / flash */}
            <div className="absolute bottom-4 inset-x-0 flex items-end justify-center pointer-events-none">
                <div className="relative w-[160px] h-[160px] pointer-events-auto">
                    {/* clover body — one SVG path, union of the four lobes */}
                    <svg
                        className="absolute inset-0 pointer-events-none "
                        viewBox="0 0 208 208"
                        width="160"
                        height="160"
                        aria-hidden>
                        <path
                            d="M 104 19.21 A 60 60 0 1 1 188.79 104 A 60 60 0 1 1 104 188.79 A 60 60 0 1 1 19.21 104 A 60 60 0 1 1 104 19.21 Z"
                            fill="rgba(10,10,10,0.7)"
                            stroke="white"
                            strokeOpacity="0.1"
                            strokeWidth="1.5 "
                        />
                    </svg>

                    {/* sparkle — negative-space star between the lobes (Figma "Subtract"),
                        defined in the 160px space, centered exactly at (80,80) */}
                    <svg
                        className="absolute inset-0 pointer-events-none"
                        viewBox="0 0 160 160"
                        width="160"
                        height="160"
                        aria-hidden>
                        <path
                            d="M 80 20 A 60 60 0 0 0 140 80 A 60 60 0 0 0 80 140 A 60 60 0 0 0 20 80 A 60 60 0 0 0 80 20 Z"
                            fill="rgba(255,255,255,0.14)"
                        />
                    </svg>

                    {/* top-left: photo strip mode */}
                    <button
                        onClick={() => {
                            setStripMode((prev) => {
                                if (prev) setStripShots([]);
                                return !prev;
                            });
                        }}
                        className={cn(
                            "absolute left-[20px] top-[20px] w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all active:scale-90",
                            stripMode
                                ? "bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                                : "bg-[rgba(255,255,255,0.15)] border-[0.8px] border-[rgba(255,255,255,0.2)] text-white hover:bg-white/25",
                        )}
                        title="Photo strip mode (3 shots)">
                        <GalleryVertical className="w-4 h-4" />
                    </button>

                    {/* top-right: 3s timer */}
                    <button
                        onClick={startCountdown}
                        disabled={countdown !== null}
                        className="absolute right-[20px] top-[20px] w-[34px] h-[34px] rounded-full bg-[rgba(255,255,255,0.15)] border-[0.8px] border-[rgba(255,255,255,0.2)] text-white flex items-center justify-center hover:bg-white/25 active:scale-90 transition-all disabled:opacity-40 disabled:pointer-events-none"
                        title="3-second timer">
                        <Timer className="w-4 h-4" />
                    </button>

                    {/* bottom-left: flip camera */}
                    <button
                        onClick={toggleCamera}
                        className="absolute left-[20px] bottom-[20px] w-[34px] h-[34px] rounded-full bg-[rgba(255,255,255,0.15)] border-[0.8px] border-[rgba(255,255,255,0.2)] text-white flex items-center justify-center hover:bg-white/25 active:scale-90 transition-all"
                        title="Flip camera">
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    {/* bottom-right: screen-fill flash toggle */}
                    <button
                        onClick={() => setFlashOn((prev) => !prev)}
                        className={cn(
                            "absolute right-[20px] bottom-[20px] w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all active:scale-90",
                            flashOn
                                ? "bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                                : "bg-[rgba(255,255,255,0.15)] border-[0.8px] border-[rgba(255,255,255,0.2)] text-white hover:bg-white/25",
                        )}
                        title={
                            flashOn ? "Flash on (screen fill)" : "Flash off"
                        }>
                        <Zap
                            className={cn("w-4 h-4", flashOn && "fill-current")}
                        />
                    </button>

                    {/* center shutter (inset 27.88% -> 71px) */}
                    <button
                        onClick={capture}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[71px] h-[71px] rounded-full bg-white drop-shadow-[0px_6px_12px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-transform"
                        title="Take photo">
                        <span className="absolute inset-[5px] rounded-full bg-white border-[0.8px] border-[rgba(0,0,0,0.1)]" />
                    </button>
                </div>
            </div>

            {/* Screen-fill flash — fullscreen white burst, above everything */}
            {mounted &&
                createPortal(
                    <div
                        className={cn(
                            "fixed inset-0 z-[200] bg-white pointer-events-none transition-opacity duration-150",
                            screenFlash ? "opacity-100" : "opacity-0"
                        )}
                    />,
                    document.body
                )}
        </div>
    );
}
