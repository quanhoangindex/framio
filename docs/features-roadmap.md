# Framio — niche pivot & feature roadmap

**Positioning:** the photobooth that makes you laugh. Strips designed to be *reacted to*, not admired. Effects are the hero; the booth ritual (3 shots, instant-camera reveal, frames) is the stable core that memes flow through.

**Who it's for:** friend groups and chronically-online 16–24s who screen-record funny things for the group chat and stories — not people editing aesthetic photo dumps.

---

## 1. The three pillars

### Pillar A — Funny effects (the hero)

Build on the existing effect pipeline (ASCII/Game Boy pattern: rAF loop → sample canvas → stylized render). Each new effect is a renderer + settings panel.

**Tier 1 — pipeline reuse, ship fast (each ~1 day)**
| Effect | Look | Why it's funny |
|---|---|---|
| Thermal cam | Predator heat-map palette on luminance | Everyone looks like a crime documentary |
| CCTV | Grayscale, scanlines, corner timestamp, "CAM 02" label | Instant liminal/cursed energy |
| 2000s webcam | 320×240 upscale, noise, warm cast, burned-in datestamp | Millennial nostalgia bait |
| Deep-fried | Crushed saturation, JPEG artifacts, sharpen loop | The meme aesthetic |
| VHS | Chroma shift, tracking lines, occasional row glitch | Retro horror-comedy |

**Tier 2 — frame/compose-level (each 1–2 days)**
| Effect | Look |
|---|---|
| Breaking news | Lower-third banner "BREAKING: local legend spotted", ticker text |
| Wanted poster | Sepia strip frame, "WANTED — REWARD $000" typography |
| Album cover | Square crop, Parental Advisory sticker, tracklist on back |
| Yearbook | Oval vignette, "Most likely to ___" caption slot |

**Tier 3 — face-aware (needs face detection lib, ~1 week; only after validation)**
Googly eyes, giant-head mode, face-swap between the 3 strip shots.

### Pillar B — Impact captions (meme text on strips)

**Flow:**
1. Strip composes → reveal plays → details dialog now shows **"Add caption"**.
2. Caption editor: text input + 3 styles (Impact top/bottom white-with-black-stroke, tabloid headline, handwritten scrawl) + position per-photo or across the strip.
3. Canvas re-composes with caption baked in → replaces the gallery entry → download/share.

Also: caption presets ("me explaining", "nobody: / me:", "POV:") as one-tap chips — lowers the blank-input barrier.

### Pillar C — Prompt engine (the pose director, for shy users)

Solves: "I don't know what to do in front of a camera." Manufactures funny outcomes.

**Flow:**
1. In strip mode, a new **Director** toggle (clapperboard icon) appears in the strip progress column.
2. User picks a prompt pack: Random · Drama school · Villain arc · Awkward family photo · K-drama · Boy band.
3. One shutter press runs the whole strip: countdown shows the PROMPT huge on screen ("Shot 1: act SHOCKED") → 3s → capture → next prompt → capture → next → capture.
4. Reveal plays; optionally each prompt prints as a small caption under its photo in the strip (ties Pillar B + C together).
5. Reroll button on each prompt for prompts users refuse to do.

Content: ~8 packs × 6 prompts, plain JSON — cheap to write, easy to A/B, community-submittable later.

---

## 2. Suggested build order

1. **Prompt engine** — biggest UX differentiation, zero new rendering tech, makes every existing effect funnier. (~2–3 days)
2. **Thermal + CCTV + 2000s webcam** — three Tier-1 effects to make "Effects" feel deep. Rename the ASCII/GB tabs into one **Effects** tab with a grid. (~3 days)
3. **Impact captions** — completes the meme loop: pose → effect → caption → share. (~2 days)
4. **Story-sized export** — 9:16 canvas with the strip centered; one tap. Ship whenever, it's small. (~1 day)
5. Tier-2 frames, then face-aware only if survey/interviews demand it.

**Engineering enabler (do during step 2):** generalize the effect pipeline into a registry (`effects/[id]/render.ts + settings`) so each new effect is a plug-in, not a copy-paste of the GB integration.

---

## 3. Survey changes for the niche (applied to the build sheet)

- **Q8 rows replaced** with trade-off pairs that separate "pretty" users from "funny" users — including "filters that make you look ridiculous" vs "look good", meme captions, and pose prompts.
- **New Q10:** "A friend sends you a photobooth strip. Which is funnier to receive?" — cute & aesthetic / absolutely cursed / depends. This single question validates the niche.
- Q9 (camera reveal reaction) unchanged — still tests shareability of the ritual.

## 4. Positioning line candidates (test in interviews)

- "The photobooth that doesn't take itself seriously."
- "Booth pics, but cursed."
- "Come take normal photos. Leave with evidence."
