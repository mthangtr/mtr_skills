---
name: premium-saas-taste
description: Use when designing or redesigning a SaaS landing page, marketing site, product dashboard, brand identity or app screen that must feel premium, tasteful and studio-made rather than AI-generated, especially when output comes back "clean but generic", "not slop but no taste", cream-paper serif, purple-glow, KPI-card dashboard, or interchangeable with competitors.
---

# Premium SaaS Taste

## Core principle

Premium SaaS work is **world first, UI second**. The studios in `references/images/` start from one picture of a *world* (a sky, a forest at dawn, a survey map, a marble statue, a field of ASCII). They treat it so it looks designed rather than downloaded, take the palette **from** it, and set a very quiet UI on top. The world carries the brand. The UI stays nearly boring.

An agent without this skill reaches for a *style* instead ("cream paper, serif headline, italic accent word, mono labels"). The result is clean and accurate, and it looks like every other AI page. The fix is not more polish. It is choosing a world before choosing any CSS.

## Step 0: Choose the mode

Choose the mode from the **surface**, not the product (the same split as `/impeccable`):
- **Persuade:** landing pages, pricing, marketing, brand sheets. The world leads (Steps 1–5).
- **Operate:** app screens, dashboards, settings, editors, AI chat. The task leads; the brand is quiet precision (Steps 1–4 for the brand, then **Step 5b**, not Step 5).

A product's landing page is Persuade; its app is Operate. Onboarding is Persuade on the first screen and Operate after that.

**With `/impeccable` (recommended pairing):** this skill sets the direction and `/impeccable` builds and polishes.
1. Fill in the Direction Card here (Step 1) and write it into the project's `DESIGN.md` under "Direction", plus the mode, into the surface brief. Impeccable treats `DESIGN.md` as pinned direction ("the brief wins").
2. Build with `/impeccable` (its new-work flow, craft floor and finish review), following this skill's Persuade or Operate rules.
3. Verify here: `scripts/shot.mjs`, then the rubric list in `references/checks.md` (target ≥ 90%).

If the two skills disagree on an Operate surface, **keep the chrome neutral**: no coloured sidebar or shell, and the accent only on the one primary, the selection and the owned meaning. None of the 14 premium apps in `references/app-reference.md` colours its shell. Write the decision into DESIGN.md so impeccable's reviewer respects it.

## Step 1: Write the Direction Card (before any code)

Fill every field and write it into the project's `DESIGN.md` under "Direction" (create the file if needed). Keep direction notes out of shipped source code. A field you cannot fill means you are not ready to code.

```
DIRECTION CARD
Product truth : <who uses it, the one moment it matters, one real number/output it produces>
World         : <a place, material or object from the CUSTOMER's life, not from "tech"; one sentence a photographer could shoot>
Surface       : <source + treatment from the table below, and WHERE it appears (hero full-bleed / plates / app frame edges)>
Palette       : <sampled from the surface: ground, ink, accent (+ the ONE meaning the accent has), proportions e.g. 60/25/10/5>
Type          : <display family + weight + size + tracking; text family; the one type move>
Signature move: <one thing someone would describe to a friend: "the hero is a dithered survey map and the log card sits on it like a clipboard">
References    : <only if the user gave any: one TAKE / SKIP line per reference (see references/art-direction.md)>
Components    : <foundation restyled (radius, colours, type) + specialists by name, e.g. "shadcn @ radius 6, Sonner, NumberFlow" (see references/components.md)>
Default check : <name the closest default look below and the 2+ features you are NOT sharing with it>
```

**For a new brand or landing page, explore before committing.** Write three cards with three different worlds, build only the hero for each, render and score them, then pick one. How to do this, and how to direct iteration and motion in concrete terms, is in `references/art-direction.md`.

### Choosing the world

Start from the customer, not the product category. Ask: what do they look at all day, or what do they wish they were looking at?

| Product feels like… | World families that work | Reference image |
|---|---|---|
| Calm intelligence, AI assistant, cloud | Sky, clouds, horizon light, mist | `hero-world-photos`, `hero-nature-worlds`, `backgrounds-treated` |
| Physical operations (construction, energy, logistics, farming) | Survey / topographic map, terrain at dawn, dunes, site light | `hero-painterly-grain`, `landing-light-mesh` |
| Money, CRM, legal (needs prestige) | Classical statue, engraving, fresco, gold object, duotone print | `landing-collage-statues`, `landing-full-pages`, `brand-systems-quaev-1` (Monarch) |
| Infra, security, devtools, deep tech | Instrument / HUD: brackets, ticks, coordinates, ASCII or halftone of one object; a dithered or pixel landscape | `hero-directions-dark`, `hero-directions-hud`, `live-browserbase-dither-agents-cta` |
| Light, precise, "engineered" (any category, light mode) | Blueprint frame: visible 1px container rails, crop marks at frame corners, hatched gutter bands between sections, small "+" crosshairs | `x-light-cropmark-frame`, `live-accessgrid-rails` |
| Institutional, education, "serious" AI | Architecture and interiors: a library, a concrete stair, a lit atrium | `live-contralabs-paintings` |
| Brand-led (strong mark, little imagery) | **The mark as the world:** the logo blown up into a blurred chromatic aura, scattered with tiny brand glyphs (seeds, "@", part numbers) | `x-mark-as-world-glyphs` |
| Any product with a physical paper trail | **The artifact as the world:** the real document or object of the trade becomes the material of the UI, such as a carbon-copy form, a case file with stamps, an order ticket on a rail, a key cabinet, a patent drawing. It needs no photo; the material (paper stock, stamps, perforations, handwriting) carries the brand. | Tallow ticket ledger (Step 5) |
| Consumer, wellness, creative | A single tactile 3D object or a soft natural macro (flower, fur, glass) | `brand-systems-quaev-2` |
| Trading, high-energy, night work | Near-black with one light band leaking in from outside the frame | `dashboard-dark-aurora`, `hero-atmosphere-ascii` |

**Open at least two of the matching images now** (Read tool) and name the mechanism you are taking. `references/teardown.md` explains every image.

## Step 2: Build the surface

**Photographs first.** Almost every 9–10 reference is a real photograph or render that has been *treated*. Procedural noise on its own tops out around 8/10 for surface. In order of preference:
1. The user's own imagery (brand shoot, product photos, AI-generated key visual). Ask for it.
2. An openly licensed photo of the world: `node scripts/photo.mjs "construction site dusk crane" assets/photos 6` downloads reusable candidates from Wikimedia Commons with `credits.json`. Open every candidate and pick the one with a clear silhouette and one light source. Credit it in the footer.
3. Procedural surfaces (below) when there is no network, or as the world for abstract products.

**Generating images?** (with an image MCP or your user's tools) Brief the image like a shoot: one subject, one light source, the palette, and **empty space where the headline will sit**.

**Which photos to treat.** Documentary photos (real customers or the product in use, as in `live-primefold-documentary`) stay *untreated*: colour-grade them toward the palette and crop them tightly. *World* photos (sky, landscape, object, texture) are always treated. Line art or illustration alone can also carry a world if it is drawn as one system (`live-steel-line-art-world`).

**Treat world photos** so they look designed rather than downloaded: `source:'image'` with `dither` (a 3–4 colour ramp from your palette gives a print, as with the ember crane in `references/images/photo-treatments.jpg`), `halftone` in one ink, `ascii`, or `none` plus grain, a duotone CSS filter and a gradient scrim. A raw stock photo is the "template" look.

**One rendering language per world.** Don't mix a grainy photographic field with thin vector line art (a drawn crane, an SVG skyline): they clash, and judges mark it down. Annotations on top (pins, leader lines, labels) are UI, and that's fine.

Copy `scripts/surface.js` into the project; it has no dependencies.

```html
<canvas class="world" aria-hidden="true"></canvas>
<script src="surface.js"></script>
<script>
  Surface.render(document.querySelector('.world'), {
    source: 'contour',                         // sky | aurora | dunes | contour | mesh | image
    colors: ['#e9e4d8', '#9a917c', '#d9531e'], // source inputs (see header of surface.js)
    treatment: 'none',                         // none | dither | halftone | ascii | pixel
    cell: 6, grain: 0.05, seed: 12,            // image: pass { source:'image', image:'photo.jpg' }
  }).then(s => Surface.applyPalette(s.palette)); // sets --surface-1..5, --surface-accent, --surface-dark, --surface-light
</script>
```

`references/images/surface-gallery.png` shows every source and treatment. Recipes that match the references:

| Look | Options |
|---|---|
| Cobalt halftone clouds | `sky`, `['#1838d8','#3f66f0','#fff']`, `halftone`, cell 5, paper `#1838d8`, ink `#fff` |
| 8-bit dusk sky behind an app | `sky`, `['#5d7f8c','#a9b9b0','#f1dfb8']`, `dither`, cell 9 |
| Grain aurora (dark product) | `aurora`, `['#07070c','#4b2bd6','#b9a2ff','#f0b8ff']`, grain .07 |
| ASCII light band | `aurora`, `['#0a0a0a','#ff5a1f','#ffb36b']`, `ascii`, cell 9 |
| Dune at dusk | `dunes`, `['#1a0f0c','#5a2414','#b4441d','#e8743a']`, grain .06 |
| Survey map | `contour`, `[paper, line, accent]`, grain .04 |

Surface rules:
- **A world has light.** At least one region of the surface carries real saturation or a strong light/dark contrast: the sky's blue, the lamp's amber, the horizon glow, a dark band with a lit edge. A grey line drawing on a grey ground is a diagram, not a world, and it scores like flat paper. If the world is a map or drawing, put it on a lit or tinted ground (dusk slate, cobalt, ember) or add the light source it implies.
- **Landing pages:** the hero is the world, full-bleed or inside a framed plate. Repeat the same surface at smaller scale in 1–3 later plates (feature cards, CTA band) so the page reads as one world (`landing-full-pages`: Orbit).
- **Product UI:** the surface lives at the **edges**: behind the app frame, in the page header band, in one "answer" card, in empty states. Tables, charts and forms sit on flat neutral panels. Never put a gradient behind data.
- **The world is in the first mobile screen.** At 390×844 the world must be visible above the fold: behind the headline (inside a calm zone), as a band directly under the nav, or as the top half of the hero. A mobile hero of plain text, with the photo pushed below the fold, loses the whole concept on the device most people see first.
- **Calm zone under text.** Behind the headline and body copy, fade the surface out so no line, dot or glyph crosses a letter. The one deliberate exception is depth layering: a cut-out photo subject may sit *in front of* a giant display word (`x-giant-word-behind-subject`), as long as the word stays readable. Body copy is never crossed. Mask the canvas, or lay a ground-coloured gradient over it:
  ```css
  .world { -webkit-mask-image: radial-gradient(ellipse 55% 60% at 22% 55%, transparent 0 35%, #000 80%);
                   mask-image: radial-gradient(ellipse 55% 60% at 22% 55%, transparent 0 35%, #000 80%); }
  ```
  Text that can't move goes on a solid or frosted plate. Check contrast on the rendered result.
- **The surface never uses the accent.** Draw the surface in its own tones and keep the accent for UI meaning. A contour line in the accent colour makes the accent mean "decoration" as well.
- **Annotations anchor, as one system.** Coordinates, labels and pins on the world must point at something real (a pin on the flagged item, a number that matches a card row). A label floating in the middle of nowhere reads as noise. Every pin gets the same short leader and the same caption style, and callouts align to one grid. A leader never cuts diagonally across the photo's subject: link a pin to a far card by its number, or with a short orthogonal leader.

## Step 3: Take the palette from the surface

Read the result of `Surface.palette` (or eyedrop the photo). Build tokens **only** from it:

- `--ground`: the surface's lightest or darkest cluster, nudged toward neutral.
- `--ink`: near-black or near-white sampled toward the surface hue (never `#000`/`#fff` on a coloured world).
- `--accent`: `palette.accent`. Give it **one meaning** ("needs action", "on track"). Use it on ≤ 5% of the screen: the primary button and the one flagged row.
- Tints of the accent for status chips. Other status colours are desaturated to sit inside the palette.
- **Selection, the primary button and status are three different jobs.** In testing, the most common failure was one gold or yellow used for the CTA, the selected item *and* a verdict tag. Give selection an ink outline or a ground tint, keep the CTA in ink, and give the accent to one of these jobs only.
- **Categories get a categorical set, not the accent.** When the product has real categories (agent roles, product lines, sites, sources), give them a set of 3–6 hues sampled from the surface at matched lightness. The accent keeps its single meaning on top of them.

Write the proportions on the card and keep to them. As in the Sorvane guidelines (`brand-guidelines-sorvane-1`), colour has rules of meaning and of quantity.

## Step 4: Typography

Set type for the world, not for "premium":

- **Display:** a neutral grotesk, large (56–96px desktop), **tracking −0.035 to −0.05em, line-height 0.95–1.05**. The tight tracking is what holds across almost all strong sites, so treat it as fixed. Weight follows the world:
  - **calm or atmospheric world** (sky, mist, landscape): 300–450;
  - **confident, product-first or graphic world:** 500–700, set very tight (`x-motif-continuity-heavy-type`, `live-ferndesk-split-demo`). 500 is the most common weight on live premium sites.

  Good families: Geist, Inter Tight, Instrument Sans, Hanken Grotesk, Manrope, Familjen Grotesk.
- **The one type move.** Pick one that fits the world, and **use it once per page**:
  - an **inline object** inside the headline: a photo pill, a live UI chip or a tiny icon in place of a word;
  - a **highlighter block** behind 1–3 words (`x-highlighter-headline`, `live-browserbase-dither-agents-cta`);
  - a **giant word behind the subject**: the wordmark or a key word set huge, with a cut-out photo subject in front (`x-giant-word-behind-subject`);
  - a condensed, pixel or dot-matrix display face, for instruments and terminals (Doto, Silkscreen, Big Shoulders Display);
  - a two-tone headline (second clause at 40–55% opacity). **Hero only.** Other anti-slop skills now list the grey second line as an AI tell when it repeats.
- **Big numbers get their own voice.** Hero numbers ("4:52 PM", "$4,812", "98.4%") use a contrasting cut: the display face at weight 200 and a much larger size, or a condensed or numeral face with tabular figures. If every heading and every number is the same light grotesk, the page reads flat, which is the most common 8/10 typography score.
- **Mono depends on the product.**
  - **Dev, infra, agent and CAD tools:** mono may be part of the instrument voice: nav, buttons with keyboard hints such as `SIGN IN [S]`, and labels (`live-steel-line-art-world`).
  - **Everything else:** mono is for machine values only (numbers in tables, IDs, timestamps, coordinates). Names of people, authors, journals and descriptive labels ("Chen et al.", "Machine translation") are human text and use the sans, even inside a source card. Column headers, axis titles, section eyebrows and kickers use the sans (12–13px, medium, muted ink, sentence case). More than about 6 mono labels outside tables on such a page is the paper-edition tic.
- **Text:** 15–17px, regular, the same family or one pairing. Two families maximum.
- **Serif:** the failure is the *combination* "cream ground + serif + italic accent word + terracotta", not serif itself. A light or condensed serif display is fine on a photo, dark or saturated ground (forest green with grain, architecture, classical paintings: `live-contralabs-paintings`). Never use the italic accent word.

## Step 5: Compose

Landing page skeleton (vary it; don't follow it as a template):
1. **Hero = world, with product proof.** Choose the headline position from what anchors the hero:
   - **World photo or object carries it:** anchor the headline to the left third or bottom-left, and leave the world room.
   - **A full product frame sits below:** a centred headline stack over the frame is fine. This is the most common strong layout (`live-ferndesk-split-demo` shows a split variant).

   Product proof is real UI: one card with one real number floating in the world, or a full app frame showing real states, often a self-playing demo with tabs and a progress bar.

   CTA: one primary in the ink colour, 40–44px tall. Use a pill or a rectangle to match the page's radius system, and add at most one quiet secondary.

   **AI and dev products:** the secondary may be an *agent* CTA, such as "Set up with your agent", "Copy agent prompt" or a "Works with Claude · ChatGPT · Gemini" row. A prompt box can replace the CTA, but a lone prompt box with a model chip is becoming a cliché.
2. **Logo/proof strip** sitting on the world's bottom edge or directly under it. On mobile it becomes a 2-column grid or a single scrolling row; names never wrap mid-name.
3. **Product truth sections:** real UI fragments with specific data, set on plates of the surface.
4. **Close:** the world returns (a plate or band) with the CTA. The footer is small and quiet.

**Rhythm: the world returns at least every ~1.5 viewport heights.** Sketch the page as a strip of bands before coding and label each band's *shape*. Never put two of the same shape next to each other. Shapes to alternate:

| Shape | Example |
|---|---|
| World band (full-bleed surface, dark or saturated) | hero, a single statement on the map, the closing CTA |
| Split 5/7 or 7/5 on ground | the memo next to the log it produced |
| Plate grid of unequal sizes on ground, with the surface inside 1–2 plates | big plate with the report, two small plates with numbers |
| Single huge number or sentence | "4:52 pm", centred or hard left, lots of air |
| Index or list (rows, hairlines) | today's flags across 14 projects |

A run of three or more ground-coloured left/right splits is the template rhythm the judge marks down as "composition 7". The same goes for **section openers**: if every section starts "small label, headline left, paragraph right", vary it. Try a headline alone across the full width, a number first, an opener set inside the plate, or no opener at all (let the artefact speak).

**Optional signature devices**, at most one or two per page:
- A **giant wordmark as the footer**, set edge to edge.
- **The nav as a designed object:** a notch hanging from the top edge, a boxed island with utilities in the corners, or a bar that becomes an inset card on scroll.
- **Notched or tabbed section edges**.
- **One motif carried from the hero into the product UI**, for example the hero's grid of squares becoming the app's tiles (`x-motif-continuity-heavy-type`).

**No orphan strips.** A section heading must belong to its content band: set it over the band's calm zone or make it the band's top edge. Never leave it alone on a thin strip of ground above the band.

**Data tables on a landing page get a composed moment**, such as a dark band or a framed board on a crop of the world. A plain full-width table on flat ground reads as filler.

**The signature move must read in a still screenshot.** Motion can add to it, but the static frame has to show the idea on its own: leader lines from the pins on the world to the rows of the card, the stamp on the report, the light falling on the one flagged row.

## Step 5b: Operate mode (app, dashboard, settings, editor, AI chat)

**The world does not get a hero in an app.** Everything above Step 5 is Persuade-mode thinking. In an app the user is inside a task, so the brand shows up as precision, not spectacle. When builders transplanted landing-page moves into apps (a giant banner headline, a dithered photo band, a photo chip inside the answer), blind judges and the user saw noise and slop every time. Where they apply, follow `/impeccable`'s Operate rules (one family, a fixed rem scale, restrained colour, standard affordances). This section adds the taste layer on top.

**Where the brand lives in an app (choose 2–3):**
- the logo and the active nav state, in the accent;
- the selection or focus colour, and the one primary button;
- **one small contained artifact** tied to the world: the patent figure thumbnail in a source card, the ticket shape of a summary row, the key tag on a member row. It must be small, inside a component, and carry data;
- empty, onboarding, login and loading states, where the world can be full-strength;
- the type and number voice: tabular figures and one considered sans.

**Never** put the world behind the nav, tables, forms, the chat, or a page-wide banner. In real premium apps (`references/app-reference.md`, 14 screens), saturated colour covers 0.2–2% of the window, and the brand is spent on **one filled button**, the selection state and the logo. When the app is shown on a marketing page, onboarding or login, the world **frames the window from outside** (Cursor's painting, Granola's collage, Linear's gradient).

**Structure rules:**
- **The task object dominates.** The table, thread, editor, board or list takes at least half of the first viewport. A summary or "answer" is a compact row or one sentence at app scale (page title 20–28px, body 14–15px), never a banner that pushes the task below the fold. A stats row is fine **when it works**, for example count tabs that filter the table (Stripe, `mobbin-dashboard-density`).
- **One button height per density.** All toolbar and panel-header buttons share one height (for example 32px); only inline row actions may be smaller. Switchers and avatars are not buttons.
- **Small text is legible, not just 12px.** 12px secondary text needs ≥4.5:1 contrast and sentence case; all-caps or faint-grey 12px reads as 10px to a reviewer, so make it 13px or darken it.
- **Patterned data fills keep labels off the pattern.** Hatching for conflict, out-of-service or overlap is data, but its label sits on a solid plate inside the block or beside it, never on the stripes. Keep status to 4 by folding, not by listing more in the legend: a consequence (an overlap caused by a late truck) uses the status that caused it, an interaction state (selected, proposed, dragging) uses the neutral selection style, and a structural fact (closed, out of service) dims the row. The same status looks identical everywhere it appears (board, table, details pane): one badge style, not text in one place and a pill in another.
- **One radius family across breakpoints.** Filter chips at 390 use the same radius as buttons and inputs; switching to full pills on mobile reads as a second component set.
- **Action budget:** one primary action per view and no more than 3 visible secondary actions per region; everything else goes in a `⋯` menu or a contextual toolbar that appears on selection. A stepper (previous / Today / next) is one control only when it is drawn as one joined segmented unit; three separate outline buttons count as three. Repeated row actions ("Send to door" on every row) count once if they share one quiet style, otherwise show them on hover or selection.
- **Badge budget:** one badge style, no more than 4 status states (for example neutral, positive, warning, critical) with consistent labels. Numbered circles and counters appear only where they carry data the user needs right now. **One chip per row:** a table row carries at most one chip or pill. Every other attribute is plain text ("Hobart, Kingston +2"), never a second set of tiles, and never empty placeholder boxes for values that are absent.
- **Links are ink, not accent.** Inline links and text actions are underlined ink or the ink at 70%. Only the one meaning that owns it gets the accent (for example "needs action").
- **The artifact speaks through shape and material, not a second typeface.** A key tag, door plate or ticket stub uses the UI family (or mono for real codes) inside a distinctive shape: punched hole, plate border, perforation. Setting artifact labels in a condensed or display face makes the judges fail O3.
- **Panels with a sticky footer have no dead band:** the footer sits directly under the content, or the content fills the panel.
- **One type voice per line.** Don't mix sans, mono and small caps within a row. Mono goes in its own column (IDs, times, amounts).
- **Spacing groups things, not boxes.** At most one level of container nesting. Use hairline rules and whitespace before reaching for another card.
- **Density follows the task:** 36–44px rows for operating (queues, members, logs) and 48–56px for deciding. Use a column grid, with numbers tabular and right-aligned.
- **Defer secondary information** to a details pane, drawer, disclosure or tooltip. A three-pane layout is only for when the third pane is used on every visit.
- **Settings:** a narrow content column with controls on the right, a live preview, or a drawer for editing a row. Don't use a wall of cards.
- **States:** design at least one non-happy state on screen (empty, loading skeleton, pending, error or in progress).
- **No empty frame regions or clipped panels:** sidebars and panels have no gap over ~200px at 1440×900, and no half-cut heading at the top of a scroll area.
- **Charts:** a unit or dot chart with a stated unit where data is countable (`x-unit-dot-charts`); otherwise a clean, labelled line or bar chart. Annotate the one thing that matters.
- **Inline markers keep their size but grow their hit area at 390.** Citation numbers, footnote pins and inline chips stay small visually; give each a transparent ≥44px tap area (`position:relative` plus a `::after` with `inset:-13px`), or repeat the citations as a tappable "Sources (3)" row under the answer. An 18px marker fails the phone check.
- **Ghost and text actions at 390 look tappable:** give them a visible 44px row or pill (padding, a hairline, or a full-width row with an icon). Bare text links pass the measurement but fail the eye.
- **Chip and tab rows at 390 wrap to two lines, or become a select.** A horizontal scroller that cuts a chip in half at the screen edge reads as broken in a static frame (judges fail U11 every time).
- **Short sidebars end on purpose:** put the secondary block (metadata, user, help) directly under the nav list, or pin the list to the bottom. Don't leave a 100–150px gap between them.
- **At 390px the app is redesigned, not shrunk:** tables become row cards with the key number on the right, the sidebar becomes a top bar or sheet, charts get at most 6 ticks with 12px labels, and the primary action is within thumb reach.

Check against `references/app-reference.md` (premium app screens) before finishing.

## How to decide the details

Every "simple" element (a button, a card, an input) is a stack of small decisions, and most of the options are equally fine. Taste is not agonising over each one. It is knowing which decisions matter and settling the rest fast. For each detail, run this order:

1. **Does it carry the concept?** The world, the signature move, the one type move and the accent's meaning get real deliberation and exploration. Everything else does not.
2. **Does a constraint decide it?** Before reaching for preference, look for a fact that breaks the tie: touch has no hover, so controls that only appear on hover don't exist on phones; iOS zooms inputs under 16px; a phone has no Shift key; the text must pass contrast on the surface; the thumb needs a 44px target; the data is 7 digits wide. Constraints settle most ties.
3. **Does a convention decide it?** If people already know the answer (up-arrow means send, × means remove, ⌘K opens search, Enter submits), use it. Spend novelty only where the concept lives.
4. **Otherwise pick one, write it down, move on.** When options are equivalent, choose, record the choice as a token or in the Direction Card, and apply it everywhere. Consistency beats the "best" option chosen differently in three places.

Then apply four habits:

- **Every addition displaces something.** Each element you add must remove, merge or demote another. When secondary actions pile up, they share one entry point (a "+", a menu, a "More" row) and the primary action stays alone. The usual path is: add, it gets crowded, group things, simplify. You end up back near the start, and that is the design working.
- **One home per piece of information.** Each state, number or message lives in exactly one place. Ask where the user already looks for it: progress and errors belong in the content stream, not as chrome on the control; the answer belongs in the answer band, not repeated in a KPI tile.
- **Design through time, not one frame.** List the states before styling: empty, typing, loading, success, error, overflowing (long text, many items, a huge number), first use and returning use. Decide where the element sits and how it moves between them. A component that only looks right in its happy path is a mock-up, not a design.
- **Say no, keep the non-negotiable small.** Stakeholders will each want a banner, badge, streak or upsell in the prime space. Refuse what doesn't serve the user's task. Keep the truly required (legal, accessibility) and make it as small and quiet as possible. Accessibility checks (focus ring, labels on icon buttons, target size) come early, because they will reverse aesthetic choices made late.

Two warning signs:
- **Scope drift:** a detail is turning into its own product (a sketch pad that grows layers, an inspector, slides). Stop, and ship the smallest version.
- **Looping:** you have changed the same choice three times. Pick by the order above and lock it.

## Step 6: Render, judge, fix (required)

1. `node scripts/shot.mjs page.html shots/page` renders 1440×900, 1440 at true full height, and real 390px mobile emulation. It needs only Chrome and Node 22+. It also:
   - prints a **craft audit** for both widths: horizontal overflow, text under 11px, clipped text, text overlapping text, contrast failures on solid backgrounds, and single-word orphans in headings;
   - prints **Operate metrics**: type sizes in use (cap 5), largest size, distinct button heights (aim for 2–3) and tap targets under 40px at 390 (aim for 0). These map to rubric items O4, O2, O9 and U12;
   - writes **full-resolution tiles** (`-full-1.png`, `-mobile-1.png` …), one viewport each.

   Fix every audit line before scoring; they are free points. Then read the tiles, not just the whole-page image, because downscaled pages hide exactly the defects that judges mark.
2. Answer the **rubric list** in `references/checks.md` (U + P items for Persuade, U + O for Operate) from the screenshots and tiles, next to two reference images. Fix every failure, then re-render. Models can't reliably grade taste on a 1–10 scale (Anthropic's Claude Design team found that only yes/no and objective checks work), so don't chase a score.
3. Made several pages or directions? Run `node scripts/diversity.mjs a.html b.html …`. If two of them share a display font and a main hue, one defaulted.
4. The bar is **≥ 90% of the applicable items**. Stop when you reach it, or after 3 fix rounds. Report it as `Operate · 28/30 (93%) · fails: O6, U10`. **The final judge of taste is the user's eyes:** show them the hero and the 390 screenshot, and ask. For a coarse second opinion, `references/rubric.md` (1–10, as the median of 3 fresh judges) is acceptable but weak evidence.

Craft gates that fail screenshots most often:
- **390px:** no horizontal overflow. Use `max-width:100%`, `min-width:0` on grid children, `clamp()` for display sizes, no `white-space:nowrap` on headlines, and tables that become stacked rows or scroll inside their own container.
- **Content visible by default.** Scroll-reveal may only *enhance* (`@media (prefers-reduced-motion: no-preference)` plus a class added by JS). Unrevealed content must never be invisible in a static render.
- No empty cards, half-empty charts, or a tall page with blank space under the last section. Blocks side by side **end together**: match their heights by content (trim or add a real line), by vertical centring, or by offsetting one block on purpose. A short card beside a tall one leaves a dead band, and judges mark it every time.
- **Small type has a floor.** Labels, timestamps, axis ticks and table metadata are ≥ 12px (≥ 13px in condensed or light faces, which turn to hairlines). Secondary text on dark grounds is at least 60% luminance, not a soft grey.
- **Overlays share one inset.** Callouts, pins and cards laid on a photo keep the same inset from the image edge (for example 24px). Nothing sits flush against a crop, and nothing breaks out of its container's edge.
- **Line breaks are designed.** Use `text-wrap: balance` on every heading and `text-wrap: pretty` on paragraphs and table cells. Give table columns explicit widths so cells break on one or two deliberate lines. Check both widths for a single word alone on a heading's last line and fix it (shorter copy, `max-width` in `ch`, or `&nbsp;` between the last two words).

Craft is the criterion that fails most often, and it fails on details only visible at full size. Before scoring, crop the 390 screenshot into 2–3 full-resolution pieces and read every line.

## Default looks to check against

If the page shares **three** features with any of these, go back to Step 1:

| Default | Features |
|---|---|
| Paper edition | cream/off-white paper, serif headline with one italic accent word, mono eyebrow labels everywhere, a city pair or "now booking" |
| Launch page | black, purple glow, tilted screenshot, gradient text |
| KPI dashboard | four equal KPI cards with sparklines on top, then a chart, then a table |
| Dark dev tool | near-black, neon green/cyan code, terminal chrome everywhere |
| Acid accent | near-black ground with one acid-green, lime or vermilion accent, used on everything that matters |
| Broadsheet | hairline rules everywhere, zero radius, dense newspaper columns, serif plus small caps |
| Studio portfolio (the overcorrection) | off-white, giant headline, numbered mono labels, a clock in the header |

**This skill's own default (avoid it too).** In testing, agents using this skill drifted toward one house look: a dithered photo in navy or azure, Hanken Grotesk, and a light display weight. Two independent runs on the same brief even invented the same world. Before you commit, check the Direction Card against it:
- **Treatment:** dither is one option among several. Choose from the world: grain for photographs of people, halftone for print or industry, a clean graded photo for documentary, an artifact material (paper, stamps) for products with a paper trail, line art for engineering.
- **Typeface:** don't open with Hanken Grotesk or Geist by habit. Choose a display face with a reason tied to the world: a condensed face for signage or industry, a grotesk with character, or a serif on dark or photo grounds.
- **Hue:** if the world's natural colour isn't blue, the page isn't blue.
- **The obvious world:** write the first world that comes to mind, then pick a second, less literal one, and use it if it's stronger.

**Model fingerprints.** The model doesn't know its own habits, so check for them explicitly. These recur in AI-made UI and read as "Claude made this":
- a 3–4px accent bar down the left edge of cards;
- a pulsing or blinking green status dot;
- cards nested inside cards ("container soup");
- a teal or indigo accent sprinkled everywhere;
- the grey second line on every heading, or one italic or coloured word in every headline;
- `rounded-2xl` on everything, with the same soft shadow;
- emoji or sparkle icons as section bullets;
- "Trusted by" logos in faded grey under every hero;
- a lone prompt box with a model chip as the only product proof.

Remove each one you find, or justify it in the Direction Card.

## Common mistakes

| Mistake | Fix |
|---|---|
| Choosing the palette first (cream + burnt orange "because premium") | Palette comes from the surface (Step 3). |
| A surface that is decoration only, e.g. a dotted grid or faint noise | The surface must depict the world; you should be able to name what it shows. |
| A bare CSS radial gradient as the "atmosphere" | Use a source with structure (`sky`, `aurora` band, `dunes`) plus grain or a treatment. |
| The surface behind tables and charts | Move it to the frame edge or the header band; keep data flat. |
| Display weight picked by habit (always bold, or always light) | Pick the weight from the world (Step 4), and always set it tight (−0.035 to −0.05em). Loose tracking is the real tell. |
| The accent used for links, icons, tags and charts at once | One meaning, ≤ 5% of the screen. |
| Losing product truth while chasing the look | Keep specific numbers, names and states. The world frames the product; it does not replace it. |

## Related

- Use `impeccable` after this skill for audit, polish, accessibility and hardening. This skill decides the direction; impeccable perfects the execution.
- `references/teardown.md`: what each reference image does.
- `references/art-direction.md`: reference boards (take/skip), three-direction exploration, art-director iteration language, motion shot-lists.
- `references/components.md`: foundations to restyle, specialist libraries (Sonner, Vaul, cmdk, NumberFlow), and the one-standout-moment rule.
- `references/checks.md`: **the rubric list**: 14 universal, 10 Persuade and 16 Operate yes/no items. The quality bar is ≥ 90% of the applicable items.
- `references/app-reference.md`: premium app screens (Operate mode) and how they bring brand in without noise.
- `references/rubric.md`: the 1–10 criteria, kept as a coarse second opinion, with calibration data.
- `scripts/diversity.mjs`: across several outputs, flags pages that share a display font and a main hue (a sign of defaulting).
