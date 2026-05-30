# Content Editing Guide — finance-forge.ai

This guide is for content editors (CPAs, financial writers) who need to update the site without deep development knowledge. You will be editing plain text files — Markdown (`.md`, `.mdx`) and JSON — and the site rebuilds automatically when you push changes.

---

## 1. How to run the site locally

1. Install [Node.js](https://nodejs.org/) (version 18 or later).
2. Open a terminal in the project folder.
3. Run `npm install` (only needed the first time, or after dependencies change).
4. Run `npm run dev` — the site will open at `http://localhost:4321`.
5. Edit files and the browser will refresh automatically.

To do a full production build (same as what Vercel runs):

```
npm run build
```

If the build succeeds, your changes are safe to push.

---

## 2. How to add a new page

1. Pick the right folder under `src/content/pages/`. For example:
   - Tax article → `src/content/pages/personal-tax/`
   - Calculator → `src/content/pages/calculators/`
   - Province page → `src/content/pages/provinces/`
2. Copy an existing `.md` or `.mdx` file in that folder as a template.
3. Update the front-matter block at the top of the file (between the `---` lines):

```yaml
---
title: "Your Page Title"
description: "A one-sentence summary for search engines."
breadcrumb: ["Home", "Personal Tax"]
archetype: "article"          # hub | article | datatable | calculator | utility | province | glossary | log
revised: "2026-05-30"
toc: true
lead: "An optional introductory sentence displayed below the title."
---
```

4. Write your content below the front-matter in standard Markdown.
5. Save, run `npm run build` to check for errors, commit, and push.

---

## 3. How to edit existing copy

1. Find the `.md` or `.mdx` file for the page you want to edit. Pages live in `src/content/pages/`.
2. Edit the Markdown content as needed.
3. **Important:** Update the `revised` date in the front-matter to today's date (YYYY-MM-DD format).
4. Save, build, commit, and push.

---

## 4. How to update a tax rate table

Tax data lives in JSON files, not in Markdown. Each tax year has its own folder:

```
src/data/tax/2025/federal.json
src/data/tax/2025/on.json     ← Ontario
src/data/tax/2025/bc.json     ← British Columbia
... etc.
```

To update a rate:

1. Open the correct JSON file (e.g. `src/data/tax/2025/federal.json`).
2. Find the bracket or rate you need to change.
3. Update the number.
4. If the CRA has officially confirmed these numbers, set `"verified": true` in the file. If the numbers are still preliminary (e.g. based on expected indexation), set `"verified": false`.
5. Save, run `npm run build`, commit, and push.

---

## 5. The October indexation update (annual checklist)

Every fall, the CRA announces the inflation indexation factor for the next tax year. Here is the step-by-step process:

1. **Get the CRA announcement.** Look for the CRA news release with the indexation factor (usually published in late November for the following year).

2. **Create the new year folder.** Copy the previous year's folder:
   ```
   cp -r src/data/tax/2025 src/data/tax/2026
   ```

3. **Update bracket thresholds.** In each provincial and federal JSON file in the new folder:
   - Multiply each bracket threshold by (1 + indexation factor). Round to the nearest dollar.
   - Update the basic personal amount and other indexed amounts.

4. **Update CPP and EI figures.** The CRA announces these separately — update the contribution rates, maximums, and exemption amounts.

5. **Mark as preliminary.** Set `"verified": false` in each file until the CRA confirms final numbers.

6. **Verify once confirmed.** When the CRA releases final numbers (usually in January), compare your figures, correct any discrepancies, and set `"verified": true`.

7. **Build and check.** Run `npm run build` — the build must succeed with no errors.

8. **Commit and push.** Vercel will deploy automatically once you push to the main branch.

---

## 6. How to add a glossary term

1. Create a new `.md` file in `src/content/glossary/`. Name it using a URL-friendly slug (e.g. `rrsp.md`, `capital-gains.md`).
2. Add this front-matter:

```yaml
---
term: "RRSP"
letter: "R"
definition: "A Registered Retirement Savings Plan is a tax-deferred savings account for retirement."
seeAlso: ["tfsa", "rrif"]
revised: "2026-05-30"
---
```

3. You can add longer Markdown content below the front-matter if desired.
4. Save, build, commit, and push.

---

## 7. How to post a What's New entry

1. Create a new `.md` file in `src/content/whatsnew/`. Name it with a date prefix (e.g. `2026-05-30-new-calculator.md`).
2. Add this front-matter:

```yaml
---
title: "New RRSP Withdrawal Calculator"
date: "2026-05-30"
summary: "A new calculator helps estimate tax on RRSP withdrawals at different income levels."
category: "calculator"
---
```

   Category options: `tax`, `calculator`, `site`, `budget`, `regulation`, `general`

3. Write the full entry content in Markdown below the front-matter.
4. Save, build, commit, and push. The entry will also appear in the RSS feed automatically.

---

## 8. How to change the menu

The site navigation is defined in `src/data/navigation.yaml`. Each top-level item can have children (dropdown items):

```yaml
- label: "Personal Tax"
  children:
    - label: "Federal Tax Brackets"
      href: "/personal-tax/federal-tax-brackets"
    - label: "Tax Credits"
      href: "/personal-tax/tax-credits"

- label: "About"
  href: "/about"
```

Edit this file, save, build, and push.

---

## 9. How to rebrand

The site's visual identity is controlled by a few files:

- **Accent colour:** Change `--accent` in `src/styles/tokens.css` (line with `#0a66ff`). This one change updates all links, buttons, active states, and key figures across the entire site.
- **Site name and tagline:** Edit `src/data/site.yaml`.
- **Fonts:** Change `--font-sans` and `--font-display` in `src/styles/tokens.css`, and update the `@font-face` declarations in `src/styles/global.css`.

---

## 10. How to add a new tax year

This is essentially the same as the October indexation update (see section 5). The key steps:

1. Copy the previous year's data folder: `cp -r src/data/tax/2025 src/data/tax/2026`
2. Update all bracket thresholds and amounts using the indexation factor.
3. Update CPP/EI contribution rates and maximums.
4. Set `"verified": false` until CRA confirmation.
5. Create or update any pages that reference the tax year.
6. Run `npm run build` to verify everything compiles.
7. Commit and push.

---

## Notes

- **OG image:** The default Open Graph image is an SVG placeholder at `public/og-default.svg`. A proper 1200×630 PNG (`public/og-default.png`) should be created from a design tool for best social sharing results.
- **Newsletter signup:** The footer has a newsletter signup form stub. It is not connected to any service yet — look for the `data-stub` attribute in `src/components/Footer.astro` when ready to connect.
- **Redirects:** If you rename or move a page, add a redirect in both `src/redirects.ts` and the `redirects` object in `astro.config.mjs`.
- **Never copy text** from other sites (especially taxtips.ca). All prose must be original.
