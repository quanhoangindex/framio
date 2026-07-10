# Framio survey — Google Form build sheet

Copy each block into Google Forms. Settings first, then sections in order. Question types are named exactly as they appear in the Forms type dropdown. Set branching with the ⋮ menu → "Go to section based on answer".

## Form settings

- Title: Quick quiz: how do you take fun pics? (2 min)
- Description: I'm building a free online photobooth and want to make it actually good. 12 quick questions, anonymous unless you want early access at the end.
- Settings → Do NOT collect email addresses (keeps it anonymous, boosts completion)
- Settings → Show progress bar: ON
- Theme: something playful; upload a strip screenshot as header image

---

## Section 1 — About you (screener)

**Q1. How old are you?**
Type: Multiple choice · Required
- Under 16  → After section: **Submit form** (set per-option "Go to" → Submit form)
- 16–19
- 20–24
- 25–29
- 30 or older

**Q2. In the last 3 months, have you taken fun or aesthetic photos of yourself/friends? (booth apps, filters, instant cameras, photo strips…)**
Type: Multiple choice · Required
- Yes → Continue to next section
- No → Go to section: **Thanks anyway** (per-option "Go to" → final thank-you section)

---

## Section 2 — How you shoot

**Q3. Who do you usually take these photos with?**
Type: Checkboxes · Required
- Alone
- My partner
- Friends, together in person
- Friends, but remotely (on call / different places)
- Family

**Q4. On what?**
Type: Checkboxes · Required
- My phone
- Laptop / webcam
- A real photobooth (mall, arcade, events)
- An instant camera (Polaroid, Instax…)

**Q5. What do you actually DO with the photos after?** (pick all that are true)
Type: Checkboxes · Required
- Post to story / Reel / TikTok
- Send in group chat or DMs
- Keep them in my camera roll
- Print them / stick them somewhere
- Wallpaper or lockscreen
- Honestly, mostly nothing

**Q6. How often do you take photos like this?**
Type: Multiple choice · Required
- Every week or more
- A few times a month
- A few times a year
- Only special occasions (birthdays, trips, dates)

**Q7. What apps or tools do you use for this today?** (name any)
Type: Short answer · Optional

---

## Section 3 — What sounds fun

**Q8. How much do you want each of these?** (1 = don't care, 5 = need it)
Type: Multiple choice grid · Required
Rows:
- Lots of filter looks (retro, film, moody…)
- Photo strips with cute frames & captions
- Weird effects nobody else has (ASCII art, Game Boy pixel cam)
- Taking a booth session remotely with a friend on another phone
- One tap turns my strip into a story-sized post
Columns: 1 · 2 · 3 · 4 · 5
(Do NOT enable "one response per column" — this is a rating grid, not forced ranking)

**Q9. Imagine: you take 3 shots and a little instant camera on your screen prints your photo strip with sound. Your honest reaction?**
Type: Multiple choice · Required
- I'd screen-record that and post it
- Cute, but I probably wouldn't share it
- Not really my thing

---

## Section 4 — Your words

**Q10. You're telling a friend about an app like this. What would you call it / how would you describe it?**
Type: Short answer · Optional

**Q11. Finish the sentence: "I'd actually use this every week if ___"**
Type: Short answer · Optional

---

## Section 5 — Early access (optional)

**Q12. Want to try Framio early + chat with me for 20 min? Leave an @ or email.**
Type: Short answer · Optional
Description under question: I'll pick a few people for a quick video call — you'll get first access and can name a frame after yourself.

After section: Submit form.

---

## Section 6 — Thanks anyway (end screen for screened-out)

No questions. Description text: "Thanks for clicking! This one's aimed at frequent photo-takers, but Framio launches soon — keep an eye out. 📸"
After section: Submit form.

---

## Build checklist

1. Create the 6 sections first, then add questions, then wire branching (Q1 "Under 16" → Submit; Q2 "No" → Section 6).
2. Preview on your phone — most responses will come from TikTok/IG links.
3. Confirmation message (Settings → Presentation): "Done! If you left your @, watch your DMs 👀"
4. Test the full flow twice: once as a "Yes" respondent, once as screened-out.
