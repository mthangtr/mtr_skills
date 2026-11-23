# Design rubric list (yes/no)

The quality bar is **at least 90% of the applicable items passing**. Every item is a yes/no question about something you can see in the screenshots. Answer from the 1440 and 390 screenshots and their full-resolution tiles, not from memory of the code. Why yes/no and not 1–10: models grade taste poorly on scales, while binary and objective checks hold up (Anthropic Claude Design team, 2026).

**Which items apply:** a Persuade surface (landing, pricing, brand sheet, marketing) uses **U + P** (24 items, so 22 must pass). An Operate surface (app, dashboard, settings, editor, chat/AI app) uses **U + O** (30 items, so 27 must pass). Onboarding flows use U + P + O16.

Report it as: `Operate · 28/30 (93%) · fails: O6, U10`.

## U · Universal (every surface)

- **U1** Can you name the world or brand in one noun phrase from the screenshot alone ("a key cabinet", "carbon-copy forms")?
- **U2** Does every colour trace to the ground, the ink, the accent or one deliberate categorical set, with no stray hue?
- **U3** Does the accent do exactly one job, rather than serving as CTA *and* selection *and* status?
- **U4** Is display and heading type tracked tight, with at most 2 families and at most 3 weights on the page?
- **U5** Is the page free of model fingerprints: a card-edge accent bar, a pulsing dot, nested cards, teal or indigo sprinkled about, emoji bullets, or a grey second line on every heading?
- **U6** Does it share fewer than 3 features with every default look (paper edition, launch page, KPI dashboard, dark dev tool, acid accent, broadsheet, studio portfolio, or this skill's own dither+navy+Hanken look)?
- **U7** Is the copy specific, with names, numbers and states only this product would have?
- **U8** Does every piece of text sit on a calm ground (a calm zone, plate or flat panel), never directly on busy texture?
- **U9** Is `shot.mjs`'s craft audit clean at 1440 and 390? Allow at most 2 judged-intentional items.
- **U10** Do side-by-side blocks end together, with no dead band over 100px?
- **U11** Is nothing cut off mid-content at a panel or viewport edge in the first viewport (no half-visible heading at the top of a scroll area)?
- **U12** At 390, is the layout redesigned rather than shrunk: tables become cards, nav collapses, and targets are at least 44px?
- **U13** Is all small type at least 12px, with secondary text clearly readable?
- **U14** Is there one icon style throughout, with the same stroke weight and size grid?

## P · Persuade (landing, pricing, brand sheet)

- **P1** Is the hero the world (a treated photo, artifact, object or mark) with real product proof visible above the fold?
- **P2** Is the world visible in the first 390×844 screen?
- **P3** Does the world return at least every ~1.5 viewport heights?
- **P4** Is there one type move (two-tone, highlighter, inline object or giant word), used exactly once?
- **P5** Are there no 3+ consecutive sections of the same shape, and no row of 3 identical cards?
- **P6** Does every section heading belong to its band, with no orphan strips?
- **P7** Can you see the signature move in a still screenshot?
- **P8** Is there one primary CTA per section, with any secondary visibly quieter?
- **P9** Do annotations and pins share one style and inset and point at real things?
- **P10** Is the footer quiet, with no four-column link farm?

## O · Operate (app, dashboard, settings, editor, chat)

- **O1** Is the user's primary task object (the table, thread, editor, list or board) visible and dominant in the first viewport, taking at least half the content area?
- **O2** Is there no marketing hero or banner in the app? The summary or "answer" should be a compact row or sentence at app scale, with a page title of 20–28px and no display type over 32px inside the app.
- **O3** Does one family carry the UI, with mono only for machine values and no display face in labels, buttons or data?
- **O4** Does the type scale have no more than 5 sizes, in a tight ratio (about 1.125–1.25)?
- **O5** Is there **at most one filled (solid) button** visible on the screen, with no more than 3 visible secondary actions (outline or ghost) per region and the rest in an overflow menu?
- **O6** Does status use no more than 4 states, each with one consistent pill or dot style, and no rainbow of badges?
- **O7** Is the page free of badge soup? Counters, numbered circles and chips appear only where they encode real data, and in one badge style.
- **O8** Does the brand world appear only in calm places (the logo, the selection accent, empty or onboarding states, one small contained artifact), never behind the nav, tables, forms or the chat?
- **O9** Is the component vocabulary consistent: the same button heights and shapes, the same inputs, the same radius everywhere?
- **O10** Is navigation standard and quiet (a side nav and/or top bar): an uncoloured, untextured sidebar with the active item shown as a neutral fill or accent text?
- **O11** Does density fit the task: rows of 36–44px for operating, 48–56px for deciding, columns aligned to a grid, and numbers tabular and right-aligned?
- **O12** Are sidebars and panels free of empty regions over 200px at 1440×900, with no clipped content?
- **O13** Is at least one state beyond the happy path designed and visible: empty, loading, pending, error or in progress?
- **O14** Is grouping done by spacing, with at most one level of container nesting (no box inside box inside box)?
- **O15** Is secondary information deferred to drawers, disclosure, tooltips or a details pane, rather than all shown at once?
- **O16** On mobile, does the primary task come first, with the nav collapsed and the main action within thumb reach?

## Diversity (across several outputs)

Run `node scripts/diversity.mjs a.html b.html …`. When two outputs share a display family **and** a main hue, one of them has defaulted. Change its world first.
