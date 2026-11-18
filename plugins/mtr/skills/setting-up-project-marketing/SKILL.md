---
name: setting-up-project-marketing
description: Use when a project, product, shop, agency or SaaS needs its marketing set up, audited or refreshed — "setup marketing", "bộ tài liệu marketing", "kế hoạch marketing", GTM plan, ads plan, launch plan, growth plan — or when a marketing/ folder must be created or updated for any repo or business.
---

# Setting Up Project Marketing

## Overview

Every project gets the same `marketing/` documentation set: same files, same order, same source tags. The owner can open any project and find unit economics in `01`, experiments in `08`, decisions in `10`.

**Core principle:** money math and evidence come before channels. A plan the owner cannot check against their own numbers is not usable.

Write in Vietnamese and keep technical terms in English (CAC, ICP, funnel, ROAS, churn). Copy meant for another market (Japanese site, English ads) is written in that language and marked `[Draft — cần native review]`.

## Step 1 — Classify the project

Read everything available first: README, docs, pricing, landing page, code, data. Then pick one **primary** branch (plus an optional secondary branch for hybrids). Write the choice and the reason in `00-brief.md`.

| Branch | Signals |
|---|---|
| **B2B SaaS** | Subscription, seats/accounts, trial or demo, business buyers |
| **Dev tool / PLG** | Open source, CLI/API/SDK, free tier, self-serve signup, developers as users |
| **B2C / Ecommerce** | Physical or digital goods, orders, carts, marketplaces (Shopee, Amazon) |
| **Dịch vụ / Agency** | Contracts, projects, retainers, proposals, people capacity; also quote-based B2B production (đồng phục, in ấn, gia công) |

Pick the branch by **how revenue is won** (checkout vs signup vs quote/contract), not by industry. A business with two revenue streams gets one primary and one secondary branch; each stream gets its own unit economics in `01`. Dev tool / PLG projects use the B2B SaaS formulas for LTV, churn and payback.

## Step 2 — Restate the goal as math

Before you plan anything, turn the owner's goal into the funnel volume it requires, working backward from the goal with the branch formulas below.

- **Goal is an outcome** (customers, revenue, MRR): compute the volume needed at each funnel stage, month by month.
- **Goal is a budget** ("spend $3.000", "lên 100 triệu"): compute how many customers that budget must buy to stay under the CAC ceiling, and the cost per stage this implies.
- **Goal is filling capacity** ("lấp đầy xưởng", "full team"): convert the free capacity into orders/clients per month for each revenue stream, and compare which stream fills it at lower cost and higher contribution.
- **No new goal stated** (refresh): carry forward the previous goal, mark it for confirmation, and put "chốt target" in the README top 3.
- **Goal is ambiguous** ("500 khách": total or new?): state the interpretation you used, and show the result under the other reading too.

**Calendar check:** list holidays and seasonal peaks/dips that fall inside the plan window (Tết, Black Friday, 年末年始, fiscal year ends) and adjust the monthly targets.

**Capacity check (every branch):** compare the required volume with what the business can handle: sales and onboarding people, delivery headcount, stock and fulfilment, infra cost, cash. The constraint that binds first goes in the verdict.

**Verdict:** one of
- `Reachable`
- `Reachable with conditions: <resources, data or changes needed>`
- `Not reachable in timeframe: <binding constraint> → <proposed alternative target>`

**CAC/CPA ceiling (default, tag `[Giả định]`, the owner can change it):**
- Subscription: the lower of contribution LTV / 3 and 12 months of payback.
- Ecommerce: first-order contribution margin (hard ceiling); target = 70% of that.
- Services with retainers/long contracts: 3 months of gross profit per client. One-off orders/projects: 50% of first-order gross profit, until repeat data exists.

When an input is missing (SKU mix, per-order vs per-unit cost, fee rate), derive it from the data you have where possible, tag it `[Giả định]` with the derivation, and list it in the missing-data section.

## Step 3 — Research

- **Competitors:** use WebSearch/WebFetch to check 3–5 alternatives (pricing, positioning, offer, ads in Meta Ad Library or Google Ads Transparency). Each fact carries its URL and access date. Use competitor names from memory only if tagged `[Cần kiểm chứng]`.
- **Legal and ad policy for every market the project sells to:** search for the law currently in force, with dates. Cover privacy and consent for remarketing, advertising claims, comparative advertising, influencer disclosure, cold calls and emails, and industry-specific claim rules (food, cosmetics, health, finance). Starting points, to be re-verified each time:
  - Vietnam: Luật Bảo vệ dữ liệu cá nhân 2025, in force since 01/01/2026. Luật Quảng cáo also restricts direct comparison with named competitors and superlatives ("nhất", "số 1") without proof, so check current text before planning comparison pages.
  - Japan: 景品表示法, including the stealth-marketing rule; 特定電子メール法 for email.
  - Global B2B or developer audiences: GDPR and CAN-SPAM.
- **Community and platform rules for launch channels** (Show HN, subreddits, Product Hunt, marketplaces): read the current rules page before planning a launch.
- **Legal sources:** prefer the official text (thuvienphapluat, vbpl.vn, e-Gov, government sites). A claim sourced only from a news or law-firm summary is tagged `[Cần kiểm chứng]`.
- **If research tools are unavailable, or sites block fetching:** fill the slot with `[Cần dữ liệu: <what, where to get it>]`.

## Step 4 — Write the documentation set

Create every file below, in this order. A file that does not apply yet still exists, with one line: `Chưa áp dụng vì <reason>; kích hoạt khi <condition>`.

Topic-specific extras go after `10`, as `11-<topic>.md`, `12-<topic>.md`, and so on, one per deliverable someone outside the core team will use:

- `sales-playbook`
- `launch-<channel>`
- `agency-brief` (when an external agency or freelancer runs execution)
- `website-<lang>` (site map + copy)
- `investor-plan`
- `case-study-program`

Calculation scripts go in `marketing/_calc/` so the team can rerun them with real data.

**Deadline mode** (owner needs it today or within a day):
- Write `README`, `00`, `01`, `05`, `10` and the urgent `11-…` in full.
- Keep the other core files as short stubs: required headings, known facts, and a `Status: Stub — <next step>` line. Competitor and legal research may be partial, with gaps tagged `[Cần dữ liệu]`.
- The claims register in `04` is always written in full when any copy, ads or brief leaves the core team, even if the rest of `04` is a stub.
- Mark the stubs `Stub` in the README status table.

The set stays complete in structure, and depth follows urgency.

| File | Required sections |
|---|---|
| `README.md` | Status table (file, status: Stub/Draft/Validated/Outdated, last updated); **Top 3 quyết định owner cần chốt**; source-tag legend; reading order for each audience (owner, agency or freelancer, investor) |
| `00-brief.md` | Project facts with sources; branch and reason; owner's goal → restated math → feasibility verdict; constraints (budget, people, capacity, cash); missing data list |
| `01-unit-economics.md` | Branch formulas filled with real numbers; break-even; **max CAC/CPA ceiling**; sensitivity table (3 scenarios); cash-flow or payback note |
| `02-market-competitors.md` | Segments; bottom-up sizing (number of reachable customers × price), with all inputs tagged; competitor matrix (URL + date); market-gap hypotheses |
| `03-customer-research.md` | ICP and personas marked as hypotheses; pains, jobs, buying triggers, objections; interview script (questions about past behaviour, not opinions); evidence log table (date, source, quote, implication) |
| `04-positioning-offer.md` | Positioning statement; Feature → Benefit → Business outcome table; offer design; pricing notes; **Claims register** (claim, evidence, allowed yes/no) |
| `05-channel-plan.md` | Channels ranked for this branch, with why/why not; funnel stage for each channel; budget split into test vs conditional tranches with **gates** (metric, threshold, date); 30/60/90 roadmap with owners |
| `06-creative-content.md` | Angle × hook × format matrix, tied to `03` insights; copy and script drafts; content calendar; asset checklist |
| `07-tracking-metrics.md` | Event taxonomy (name, trigger, properties, destination); UTM convention; KPI definitions with formulas; source of truth for each KPI (backend/CRM/billing, not the ad platform); weekly dashboard; review ritual |
| `08-experiments.md` | Backlog table: ID, hypothesis, metric, success threshold, budget/time, decision rule, status, result |
| `09-retention-growth.md` | Lifecycle (onboarding/activation/repeat/renewal), retention metric, expansion or referral loops, churn-reason taxonomy |
| `10-decisions-log.md` | Dated entries: decision, data behind it, alternatives rejected, review date |

### Source tags

Every number and every factual claim carries one of these tags:

- `[Nguồn: <file or person>]`: given by the project
- `[Tính toán: <formula or _calc function>]`: derived from tagged inputs
- `[Research: <URL>, <YYYY-MM-DD>]`: found externally (name the original source when the page quotes another)
- `[Giả định]`: your planning choice or a practitioner rule of thumb (`[Giả định — rule of thumb]`); replace it once data exists
- `[Cần kiểm chứng]`: recalled from memory or from a secondary source; verify before relying on it
- `[Cần dữ liệu]`: unknown; the slot is left open, with where to get it

A table whose cells share one origin carries a single tag in its caption. In scenario tables, tag the input rows; output rows are `[Tính toán]`. Dates and section numbering need no tag. Copy for another market additionally carries `[Draft — cần native review]`.

A testimonial, case study, review, statistic or benchmark has only two valid states: real with a source, or an empty template slot. Anonymised real stories are fine.

When the owner asks for invented proof or unsourced benchmarks, write an entry in `10-decisions-log.md`: the request, why it was not done (legal or trust risk, with a source), and the replacement, such as a program to collect real stories or the sourced numbers that do exist. Then point to that entry in the README.

## Branch modules

Use the primary branch's module across files 01, 05, 07 and 09.

### B2B SaaS
- **Economics:** ARPA; gross margin (GM); monthly churn. LTV ≈ ARPA × GM / churn. CAC = sales and marketing spend / new paying customers. CAC payback = CAC / (ARPA × GM). NRR = (start MRR + expansion − contraction − churned) / start MRR. Magic number = (Δ quarterly recurring revenue × 4) / prior-quarter sales and marketing spend.
- **Funnel:** visitor → signup/trial or demo → activated (define the event) → paid → retained → expanded.
- **Channels to consider:** search intent (Google), comparison/SEO pages, LinkedIn for buyer roles, partners/integrations, outbound, content for the buying committee.
- **Traps:**
  - Optimising cost per signup.
  - Ignoring activation and churn.
  - Assuming a single buyer; map founder, evaluator and user.
  - Telesales and onboarding capacity capping new customers per month.
  - Comparison pages that name competitors where local ad law restricts it.

### Dev tool / PLG
- **Economics:** cost to serve a free user (infra per unit × typical usage, including storage/retention and query/compute, not only ingest); margin per paid tier at **full quota**; free→paid rate; PQL rate.
- **Funnel:** discover (GitHub, docs, HN, Reddit) → install/signup → first value event (define it, e.g. "first log received") → habitual use → team invite → paid → expansion.
- **Channels to consider:** docs and tutorials, GitHub README, community launches (follow each community's rules; never solicit upvotes), integrations, dev-focused search ads, newsletters/sponsorships.
- **Traps:**
  - Stars and signups as success metrics.
  - Paid ads that bring free users who lose money.
  - A pricing tier that loses money at full quota.
  - A launch post linking to a signup wall; Show HN expects something people can try.
  - Running ads and a community launch on the same days, so the sources can't be separated.

### B2C / Ecommerce
- **Economics:** contribution margin per order = AOV − COGS − packaging − shipping subsidy − payment/marketplace fees. Break-even ROAS = AOV / contribution margin. New-customer CAC = spend / first-time buyers. MER = total revenue / total marketing spend. Repeat rate; 90/180-day LTV in contribution terms.
- **Funnel:** impression → click → product view → add to cart → checkout → purchase → repeat.
- **Channels to consider:** Meta/TikTok creative-led ads, marketplace ads, search/shopping, creators/UGC, email/Zalo/SMS for repeat purchases.
- **Traps:**
  - Trusting platform ROAS: it counts repeat and organic buyers. Check it against new-customer revenue from the backend, and plan an incrementality test in `08`: a geo or time holdout, or a new-customer-only code per channel.
  - Scaling budget in one jump.
  - Ignoring returns, COD failures, marketplace fees, stock and production/fulfilment capacity.
  - When an external agency runs the ads: the shop must own the ad account and pixel, the brief goes in `11-agency-brief.md`, and reporting uses shop data.

### Dịch vụ / Agency
- **Economics:** contract value × duration × gross margin = gross profit per client; CAC ceiling from that; sales cycle length; delivery capacity (people) as a hard limit.
- **Funnel:** lead → qualified (SQL) → meeting → proposal → won → delivered → renewal/referral. Win rate; pipeline coverage = open pipeline value / target.
- **Channels to consider:** referrals and partners first, case studies, matching platforms/directories, targeted outbound (follow local law; respect opt-outs), events, founder-led content.
- **Traps:** targets that ignore the sales cycle; selling capacity you don't have; fake proof.

## Step 5 — Verify before reporting

- [ ] All 11 core files exist, in order, with every required section (or are marked Stub in deadline mode)
- [ ] Every number has a source tag; every `[Tính toán]` has been recomputed with a script in `marketing/_calc/`
- [ ] The capacity check is in the verdict
- [ ] The feasibility verdict and max CAC/CPA appear in `00`/`01` and are used as gates in `05`
- [ ] Competitor and legal facts carry URL + date, or are tagged `[Cần dữ liệu]`/`[Cần kiểm chứng]`
- [ ] The claims register covers every claim used in `06`
- [ ] Each budget tranche has a gate; each experiment has a decision rule

## Refresh mode

When `marketing/` already exists in this structure: read it, update the affected sections in place, change their status and date in the README, and add a `10-decisions-log.md` entry describing the change. Keep the owner's edits.

When the folder has a non-standard structure: move the old files unchanged into `marketing/_archive/<YYYY-MM-DD>/` (never delete them), build the standard set by carrying their content over, and record the mapping (old file → new file) in `10`. When new facts contradict a project file outside `marketing/` (README pricing, for example), list the conflict in the README top 3 rather than editing that file.

## Report to the owner

Lead with the answer to their question (for example "ROAS 4x chưa chứng minh có lãi"). Then give the top 3 decisions they must make, the missing data that blocks validation, and the file list. When their request conflicts with the math or the law, say so plainly and show the alternative inside the docs.

## Common mistakes

| Mistake | Fix |
|---|---|
| File set shaped around the immediate question only | Always the 11 core files; put the urgent topic in `11-…` and in the README's top 3 |
| Different tag styles across files | Use only the six tags above |
| Benchmarks pulled from memory to look convincing | Use `[Research: URL, date]`, or leave the slot as `[Cần dữ liệu]` |
| Legal reference from memory (possibly superseded) | Search for the current law and cite it with a date |
| Plan judged on ad-platform numbers | Source of truth = backend, CRM or billing |
| "Spend the whole budget" taken literally | Test tranche + conditional tranche with gates |
