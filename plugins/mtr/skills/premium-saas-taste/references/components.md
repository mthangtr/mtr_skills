# Components: three kinds, three jobs

When AI builds a toast, drawer, command menu or animated number from scratch, it gets the feel wrong: toasts pile up, drawers can't be dragged, ⌘K breaks on the keyboard, and numbers jump. Use libraries for behaviour and spend the design effort on the world.

## 1. Foundations: behaviour, restyled

**shadcn/ui** (copies the code into your project), **Base UI**, or **Radix**. They handle focus, keyboard and accessibility for dialogs, popovers, menus, selects and tabs.

Default shadcn is now an AI look of its own: the same radius, the same zinc grey, the same Geist/Inter. Before using it, restyle the three things that carry personality:
- **Radius:** set `--radius` from the Direction Card (tight 4–6px for instruments and editorial, 10–14px for soft consumer).
- **Colour:** map `--background`, `--foreground`, `--muted`, `--border`, `--primary` and `--ring` to the surface palette (ground, ink, tints, accent). Don't leave the zinc defaults.
- **Type:** the card's display and text families, with tabular numerals for data.

## 2. Specialists: one component done right

Picks from Emil Kowalski's curated list (`emilkowalski/skills` → `pick-ui-library`):

| Need | Library |
|---|---|
| Toasts | Sonner |
| Drawers / bottom sheets (mobile) | Vaul |
| ⌘K command menu | cmdk |
| OTP input | input-otp |
| Animated numbers (prices, counters, live stats) | NumberFlow |
| Springs, layout and exit animation | motion |
| General charts / streaming charts | recharts / Liveline |
| Long lists and tables | Virtuoso |
| Drag and drop | dnd kit |

Plain CSS transitions are enough for hovers and fades.

## 3. Designed components: the standout moment

Finished, styled pieces you copy in: **Rare UI** (animated buttons, text effects, interactive backgrounds), **Magic UI** (150+ animated pieces on top of shadcn), **Aceternity** (landing-page effects: 3D cards, beams), **21st.dev** (a marketplace), and AI-product kits that cover streaming text, approval cards, diffs and agent screens.

**Rule: one standout moment per page.** One animated hero or one interactive background makes a page feel designed. Ten of them is the next AI look, where everything glows and moves and nothing stands out. If the world is already the surface, the standout moment is usually the *signature move* from the Direction Card, not a library effect.

## Getting the agent to use them

Name the library in the plan ("shadcn restyled to the card, Sonner for toasts, NumberFlow on the hero number") and install it through its CLI or registry, so the code lives in the project and can be edited.
