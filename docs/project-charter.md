# Framio — project charter

*The reference document. Every feature, design, and research decision gets checked against this. Last updated: July 2026.*

## Vision

An online photobooth that makes taking photos together joyful — starting as "the photobooth that makes you laugh" and growing into a place where people capture and keep shared moments, wherever they are.

## Owner's goals (in priority order)

1. **CV-worthy ownership** — a live, polished, measurably-used product that demonstrates end-to-end skill: product thinking, design execution, engineering quality, and iteration on real user data.
2. **Genuinely helpful** — serve people who love online photobooths: make posing easy for shy users, make results worth sharing, keep it free and instant (no install, no account walls).

## What "done well" looks like (success criteria)

| Dimension | Target |
|---|---|
| Live product | Deployed on a real domain, works on mobile + desktop, camera reveal flawless |
| Usage | 300+ unique users, 1,000+ strips composed (tracked via privacy-friendly analytics) |
| Quality bar | Zero console errors, Lighthouse ≥90 mobile, works on iOS Safari + Android Chrome |
| Evidence | README with architecture + screenshots; a short case-study writeup (problem → research → decisions → metrics) |
| User voice | 5+ interviews done, survey insights documented, one shipped feature traceable to research |

## Product principles

1. **The booth ritual is sacred** — 3 shots, the reveal, the strip. Features orbit it, never replace it.
2. **Funny over pretty** — when forced to choose, choose the laugh. Pretty exists elsewhere.
3. **Zero friction** — no login, no install, camera to strip in under 60 seconds.
4. **Show, don't ask** — lead with the product in marketing and research; forms and asks come after interest.
5. **Everything measurable** — every feature ships with a way to know if it's used.

## Division of labor

The owner invests in uniquely human work: **taste** (prompt packs, caption presets, effect naming — comedy is cultural), **people** (interviews, community presence, on-camera content), **judgment** (kill/keep calls, scope discipline), and **narrative** (decision log, case study, interview stories). AI executes the mechanical middle: refactors, renderers, boilerplate, drafts, and data crunching. Anything AI-drafted that touches humor or public voice gets a human pass before shipping. Detailed task-level ownership: see [tasks.md](./tasks.md).

## Roadmap phases

**Phase 1 — Foundation (now):** effect registry refactor, prompt engine, 3 Tier-1 funny effects, impact captions, story-sized export. Quality pass: mobile Safari testing, error handling, empty states.

**Phase 2 — Launch:** Vercel deploy + domain, privacy-friendly analytics (Plausible/Umami), OG/social cards, in-app feedback link, "built by" footer. Distribution per research plan (product-first, survey second).

**Phase 3 — Learn & iterate:** analytics review weekly, interviews from warm users, kill/keep decisions on effects, ship top-requested feature. Update this charter with findings.

**Phase 4 — Meaningful (validated only):** remote co-booth, shareable booth rooms for events, print-ordering — whichever the data justifies.

## Engineering quality bar (CV substance)

- Effect pipeline as plugin registry — the "I designed an extensible system" interview story
- Typed end-to-end, zero `any`, lint clean (already true — keep it)
- IndexedDB persistence layer (already an interview-worthy decision: quota story)
- Basic test coverage on the pure logic: strip composition, dithering, prompt engine
- CI on push (typecheck + lint + test), deploy previews per branch
- Written decision log: one paragraph per major choice, kept in docs/decisions.md

## Out of scope (say no to)

Accounts/auth, cloud photo storage, native apps, AI beautify filters, anything requiring a backend beyond static hosting — until Phase 4 data demands otherwise.
