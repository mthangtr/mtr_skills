# Art direction: boards, directions, iteration, motion

## Reference boards: take / skip

When the user gives references (links, screenshots, a Figma or Mobbin board), pasting them in unannotated produces a Frankenstein page, with each part lifted from a different reference. Turn each reference into one line:

```
REF  <name or file>
TAKE <the one mechanism: "photos float around the edges while the headline holds the centre">
SKIP <what not to carry over: "their yellow, their font">
```

Read the images with the Read tool before writing the lines. Put the lines in the Direction Card. A reference with no TAKE line gets dropped.

Good sources by section: Mobbin (real shipped apps; filter by section such as hero, pricing or settings), Saaspo (SaaS landing pages), Navbar Gallery, CTA.gallery, Landing Love (motion), Rebrand / Logo System (identities), and `references/images/` in this skill.

## Directions: one per world, then choose

Committing to the first idea is the main reason AI design feels predictable. When there is time for it (a new brand, a new landing page, a redesign):

1. Write 3 Direction Cards with **3 different worlds** (or one per reference), keeping product truth the same.
2. Build **only the hero** for each: same copy, same product card, a different world, surface, palette and type.
3. Render all three with `scripts/shot.mjs` and score them against the rubric (concept, surface, palette, type).
4. Pick one, or merge deliberately ("A's world with C's type"), then build the rest section by section.

Skip this for a small change to an existing product UI; there, the existing brand is the world.

## Iterating: talk like an art director

"Make it pop" or "more premium" changes nothing. Name the change in the vocabulary of the craft:
- "The project cards feel flat and predictable. Put them on a curved 3D path, smaller toward the edges, so the headline holds the centre."
- "Drop 'in New York' from the headline and let it scale up; remove the two labels under the cards."
- "Push the type: a heavy all-caps headline running edge to edge, the world showing through the counters."

Iterate **one section at a time** and lock each before starting the next.

## Motion: direct it, never just "add animations"

Unspecified motion comes out robotic. Write each motion like a shot list:
- **Headline:** staggered mask reveal. Each word slides up from `translateY(110%)` inside an `overflow:hidden` line, 60–80ms stagger, 700ms, `cubic-bezier(.2,.7,.1,1)`.
- **The world:** settles once. Fade from 0 plus scale 1.04 → 1 over 1.2s, or a dither that resolves from coarse to fine cells. It never loops behind text.
- **Product card:** rises 16px and fades in after the headline; numbers tick over with NumberFlow.
- **Scroll:** scroll-linked storytelling is fine (a ruler that tracks real data, a scene that advances), as long as **every static frame is complete on its own**. Follow the energy curve: one surge is the loud moment, and the rest moves quietly or not at all. Everything is visible by default.
- **Reduced motion:** wrap everything in `@media (prefers-reduced-motion: no-preference)`. The static frame must already be the finished design.

## Real assets

Swap placeholders for real assets before calling a page done: the user's own photos, an image-generation MCP if one is connected, or treated openly licensed photos from `scripts/photo.mjs`. An empty grey rectangle where a picture belongs caps the page at 7/10.

## From practitioners (YouTube research, Nov 2026)

**Interview questions that produce a signature move.** Ask the user, or answer them yourself in the Direction Card:
1. What must the visitor believe by the end? Answer in one sentence, not with a feature list.
2. What is one thing this site should do that no site you've seen does? That becomes the signature move.
3. What is the energy curve: where is the page calm and where is it intense? The usual answer is **quiet, then one surge**: one section is the only loud thing, and the premium feel comes from the restraint everywhere else.
4. What real assets exist? That decides how much is generated and how much is graded from what you own.

**Directions, not blends.** When exploring, write each direction as aesthetic + reference + intent + guardrails, and say "do NOT blend directions". Keep the hero image slot as a flat CSS stand-in until a direction is chosen, and don't spend image generation on directions you'll throw away. Practitioners explore 5–10 options; 3 is the minimum.

**Widget first.** For product pages, ask for about 8 variants of the page's main widget (the answer card, the receipt, the log card) before the page. Build the page around the winner. The signature object usually decides the page.

**A tweaks panel instead of re-prompting.** Add a small on-page panel on the dev server for heading font, weight, tracking, size and accent, plus a "Copy CSS" button. Tune by eye, then freeze the result as tokens. That's faster and cheaper than regenerating for each type or colour change.

**A grade ladder for the hero photo.** Start from black and white, then try one warm grade ("golden hour", "alpine glow") on the subject only, and pick with an on-page switcher. Then check the hero-to-content transition: "it shouldn't seem like a drastic change."

**Give iteration notes in exact geometry.** Write "40pt rows, 6pt inset, 13px labels", not "tighter". Write "change one thing at a time" for motion.

**Bento rule.** Only a third to a half of the tiles show UI. The rest carry a single number, a sentence or the world.

**Animated demos use few words.** Inside motion demos, keep on-screen copy to 3–7 real words per beat; viewers can't read more while things move. Static product UI keeps full real data.
