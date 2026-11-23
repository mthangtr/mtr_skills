# Taste rubric (score each 1–10, integers)

Calibration: 10 = indistinguishable from the best studio work in the reference sheets. 9 = would sit next to them without anyone flinching. 7 = competent, clean, forgettable. 5 = template / AI default. 3 = broken or noisy.

| # | Criterion | What a 9 looks like | What drags it to 6 or below |
|---|---|---|---|
| 1 | **Concept** | One idea specific to this product drives surface, type, layout and one signature moment. Swap test: put a competitor's logo on it and it feels wrong. | Could be any SaaS. "Clean and modern" is the only idea. |
| 2 | **Signature surface** | The background is a designed, treated surface (processed photo, halftone, dither, ASCII, grain-atmosphere, 3D object) that you'd remember tomorrow, integrated with the content. | Flat white/black, a bare CSS gradient, purple-blue blur, a dotted grid "for texture". |
| 3 | **Palette** | Every colour traceable to the surface; neutrals + one accent with one meaning, used in deliberate proportion. | Accent sprinkled everywhere, unrelated colours, default indigo/violet. |
| 4 | **Typography** | Type alone looks designed: decisive display scale, considered weight (often light/regular display), tight tracking, a confident move (two-tone headline, condensed serif, mono data labels) that fits the concept. | Bold Inter everywhere, timid scale, the "paper edition" cliché (serif + one italic accent word + mono eyebrow labels on everything). |
| 5 | **Composition** | Clear reading order, decisive contrast, tempo changes between sections, at least one composition that is not a centred stack or a 3-card row. | Hero → logos → 3 cards → stats → CTA, every section the same width and padding. |
| 6 | **Product truth** | Real product UI with specific, plausible data and copy only this product could have. | Lorem-ish copy, fake round numbers, a gradient box where the product should be. |
| 7 | **Craft & restraint** | Spacing, alignment and contrast are clean at 1440 and 390; every decorative element earns its place; text on the surface is legible. | Overlaps, clipped text, low contrast on the background, glow/blur/icon confetti. |
| 8 | **Premium gestalt** | Feels expensive and calm, like the reference sheets. | Feels like a template, a hackathon, or an AI demo. |

Pass bar: **every criterion ≥ 9**.

How to judge so the number means something (measured Nov 2026):
- **Use the median of 3 fresh judges.** A single judge swings ±1 on the same screenshots.
- **Calibration.** The reference work this skill is built from scores *below* the bar under this rubric, judged blind:
  - Orbit CRM landing: min 5 (surface and palette 9; product truth 5)
  - prop-firm dashboard: min 5
  - Mist hero: min 2
  
  Pages built with this skill reached medians of 9/9/9/9/9/9/8/8 (landing) and 9/8/9/8/8/10/8/8 (dashboard). A strict judge must name three fixes, so it always finds something, and every round of fixes turns up new small notes.
- **Stop rule.** After 3 fix rounds, or when the median stops rising for two rounds, stop. The remaining 8s are noise or need inputs code can't provide, such as a real art-directed photo. Broad polish passes regressed scores twice in testing; only narrow, consensus-only bug-fix passes improved them.

Output (JSON only):
{"scores":{"concept":n,"surface":n,"palette":n,"typography":n,"composition":n,"product_truth":n,"craft":n,"gestalt":n},"weakest":"criterion","fixes":["the 3 most valuable concrete fixes, each one sentence"],"default_look":"none|paper-edition|launch-page|kpi-dashboard|dark-dev-tool|studio-portfolio"}
