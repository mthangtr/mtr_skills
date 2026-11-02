# Conflict Check Reference

## Search Protocol

Search the top 2–3 names of a batch **before** recommending any of them. Run one name per search; combined queries return shallow results.

Queries, in order:
1. `"<Name> software company"` (or `"<Name> company"` for coined names)
2. `"<Name> technology company <target-market country>"` for each expansion market
3. If needed: `"<Name> trademark"`

Also check near variants: one letter off (Kelex/Kalex for Kaelex) and sound-alikes (Forfex/Forex, Synar/Synapse).

## Risk Rubric

| Level | Signal | Action |
|---|---|---|
| Hard stop | Same-name software or SaaS company in a target market; a famous open-source tool; a registered or pending trademark in Nice class 9 or 42 | Drop |
| High | Well-funded tech startup (any sector) using the name; listed company; name locked to a common word (Zolar → solar) | Drop unless the user insists |
| Medium | Several small software firms abroad; scam or crypto association; dominated SEO (laws, celebrities, NASA projects) | Mention; keep as backup |
| Low | Only small companies in unrelated industries; forum usernames; no software usage | Candidate |

A near variant (one letter off, same root plus a suffix, or a sound-alike) of a Hard stop or High name inherits that level when it is in the same industry; otherwise rate it one level lower.

Report results with citations. Use one line per conflict: who, which industry, how big.

## Saturation Lessons (examples observed)

These show patterns, not current status. Re-search any name before citing it as a conflict.

- Short real Latin words were almost all taken in software:
  - Fornax: IT groups in Hungary and Turkey, a Malaysian e-government product, and NASA's cloud platform.
  - Incus: a Linux container manager.
  - Pollex: PCB and ERP software.
  - Vectis: CFD, CCTV and company-secretarial software.
- Grand words were heavily taken: Empyrean had three significant software companies, one of them a listed EDA vendor.
- A Southeast Asian check caught a regional conflict: Mekar, which means "blossom" in Indonesian and Malay, belonged to an Indonesian fintech, and Mekari was a leading Indonesian SaaS company.
- Two-root coinages were clean: Orvex had only small firms outside software; Kaelex had only a forum username.

## Handoff Checklist (not legal advice)

1. **Today:** register domain variants (.com, .io, .ai, plus local ccTLD) and social handles. Fallbacks like get<name>.com or <name>.app are fine early on.
2. **Self-search trademarks:**
   - The national IP office database (Vietnam: WIPO Publish at wipopublish.ipvietnam.gov.vn)
   - WIPO Global Brand Database
   - WIPO Madrid Monitor for international filings designating the target markets
3. **Classes:** for SaaS and apps, Nice **9** (downloadable software, mobile apps) and **42** (SaaS, software development). Nice classes are not business-registration codes.
4. **File before public launch** in first-to-file jurisdictions (Vietnam included).
5. **Expand regionally** with a Madrid Protocol application based on the home filing.
6. **Recommend a trademark agent** for a full clearance search. Fees, fast-track options and laws change; search the current rules for the user's country before quoting numbers.
