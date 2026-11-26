# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A personal Claude Code **plugin marketplace** (`mtr-skills`). There is no app, build step, or test suite — the product is skill content (Markdown) plus small helper scripts that skills tell Claude to run.

- `.claude-plugin/marketplace.json` — lists every plugin (`name`, `source`, `description`). Adding a plugin means adding an entry here **and** creating `plugins/<name>/.claude-plugin/plugin.json`.
- `plugins/<plugin>/skills/<skill>/SKILL.md` — one skill per directory. Frontmatter `name` must match the directory; `description` is the trigger text (phrased "Use when…" / "This skill should be used when…" with concrete user phrasings, sometimes Vietnamese).
- Supporting material sits beside `SKILL.md`: `references/` (long-form knowledge loaded on demand), `scripts/` (runnable helpers), `assets/` / `templates/`. SKILL.md stays short and points into these.

Single plugin: `mtr` (`plugins/mtr/`). Skills cover business (idea validation, offer definition, GTM), marketing (`setting-up-project-marketing`: standard `marketing/` doc set per project), design (presentation slides; `premium-saas-taste`: premium SaaS landing pages and app screens, used together with /impeccable), motion videos (`making-motion-videos`: HTML `seek(t)` pages rendered to video via headless Chromium), game (GDD doc sets, 2D/3D graphics techniques), and review (`stress-testing`: a bounded multi-agent Workflow script that stress-tests any artifact until a cold agent cannot dispute it, with a hard subagent cap).

## Versioning

`plugins/mtr/.claude-plugin/plugin.json` carries the plugin version.

## Running the helper scripts

Scripts are standalone CLIs; usage is in each file's header docstring/comment. Examples:

```bash
node plugins/mtr/skills/making-motion-videos/scripts/render.mjs lint <page.html>
```

Python deps (not pinned anywhere): `numpy`; ffmpeg/ffprobe on PATH. Quick sanity check for edited Python: `python3 -m py_compile <file>`. Workflow scripts (`stress-testing/scripts/stress-test.js`) are not standalone CLIs: Claude runs them through the Workflow tool, and `node --check` works once the `export` line is stripped.
