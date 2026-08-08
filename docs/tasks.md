# Framio — execution plan

*Companion to the [project charter](./project-charter.md). Owner column: **You** = uniquely human work, **Claude** = delegate to AI, **Both** = you decide/filter, Claude executes. Check things off as they land.*

## Delegation principle

You own **taste, people, judgment, and narrative** — comedy writing, interviews, community presence, on-camera content, kill/keep calls, and the first-person story. Claude owns the **mechanical middle** — refactors, renderers, boilerplate, drafts, data crunching. Anything Claude drafts that touches humor or public voice gets your pass before it ships.

---

## Phase 1 — Product core (~2 weeks)

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 1.1 | Effect registry refactor (ASCII/GB → plugins) | Claude | Do first; everything builds on it. Interview story: extensible system design |
| 1.2 | Prompt engine — mechanics (Director toggle, auto-sequence, prompts on strips) | Claude | |
| 1.3 | Prompt packs — write & curate the actual prompts | **You** | Claude generates candidates; you filter for what makes your friends laugh. Test on 3 real people before shipping |
| 1.4 | Tier-1 effects: thermal, CCTV, 2000s webcam | Claude | |
| 1.5 | Effect names & descriptions | **You** | Naming is comedy; "CCTV" vs "Security Cam" matters |
| 1.6 | Effects tab consolidation (ASCII + GB + new, one grid) | Claude | |
| 1.7 | Impact captions — editor mechanics | Claude | |
| 1.8 | Caption preset chips ("POV:", "nobody:"…) | **You** | Same rule as 1.3 |
| 1.9 | Story-sized 9:16 export | Claude | |
| 1.10 | Quality pass: iOS Safari + Android Chrome on real devices | **Both** | Claude fixes; only you can hold the phones |
| 1.11 | Friends test session — watch 3 people use it, say nothing | **You** | The pre-launch usability test. Note where they hesitate |

## Phase 2 — Launch infrastructure (~1 week, start in parallel with late Phase 1)

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 2.1 | Vercel deploy + custom domain | **Both** | Claude preps config; you own the account & domain choice |
| 2.2 | Analytics (Plausible/Umami) + events: strip composed, effect used, download, caption | Claude | |
| 2.3 | OG cards, favicon, meta | Claude | |
| 2.4 | "Thanks for playing" screen + feedback link + survey link | Claude | Your warm-audience survey funnel |
| 2.5 | CI: typecheck + lint + test on push | Claude | |
| 2.6 | Domain name decision | **You** | Brand call |

## Phase 3 — Distribution & learning (~2–3 weeks calendar)

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 3.1 | Reveal/effect clips for TikTok & IG | **You** | Your presence is the content; Claude can storyboard |
| 3.2 | r/SideProject + community posts | **You** | Real-person voice; Claude drafts, you rewrite in your words |
| 3.3 | Community participation (be a member, not a link-dropper) | **You** | The anti-spam lesson |
| 3.4 | 5+ user interviews | **You** | Claude preps guide & synthesizes notes; rapport is yours |
| 3.5 | Weekly analytics review → kill/keep decisions | **Both** | Claude crunches; you decide |
| 3.6 | Ship top-requested feature | **Both** | |
| 3.7 | decisions.md — one paragraph per major call | **You** | First person; raw material for the case study |

## Phase 4 — CV packaging (~3 days; highest ROI per hour)

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 4.1 | README: architecture diagram, screenshots, decisions | **Both** | Claude drafts structure; your voice on the "why" |
| 4.2 | Case-study writeup (problem → research → build → metrics) | **You** | Only compelling in first person. Claude edits, never authors |
| 4.3 | Tests on pure logic: composeStrip, dithering, prompt engine | Claude | Enough to show craft, not 100% coverage |
| 4.4 | Interview prep: rehearse the 3 stories (quota bug, registry design, niche pivot) | **You** | |

## Critical path

1.1 → 1.2/1.4 → 1.10 → 2.1 → 3.1/3.2 — everything else flexes around it. Deploy (2.1) as early as a strip works end-to-end on mobile; a live URL beats a perfect local build.

## Definition of done (from charter)

Live domain · 300+ users · 1,000+ strips · Lighthouse ≥90 mobile · 5+ interviews · case study published.
