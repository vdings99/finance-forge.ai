# finance-forge.ai — Site Guide

A guide for adding pages, editing the menu, and maintaining the site. Written for a non-developer.

---

## Running the site locally

```
npm run dev
```

Open http://localhost:4321 in your browser. Changes to Markdown files and `navigation.yaml` reload automatically.

To build the production site:

```
npm run build
```

---

## 1. Adding a page

1. Create a new `.md` or `.mdx` file in `src/content/pages/` (or a subfolder).
2. Copy this front-matter template to the top of the file:

```yaml
---
title: "Your Page Title"
description: "One sentence for search engines."
breadcrumb: ["Home", "Section Name"]
section: "section-slug"          # matches the URL segment, e.g. "personal-tax"
archetype: "article"             # home | hub | article | datatable | calculator | utility
revised: "2026-05-29"            # update this date whenever you change the page
toc: true                        # set to false to hide the table of contents
---
```

3. Write your content in Markdown below the `---` closing line.
4. Save the file. The page URL is derived from the file path:
   - `src/content/pages/personal-tax/filing.md` → `/personal-tax/filing`
   - `src/content/pages/about.md` → `/about`
   - `src/content/pages/calculators/index.md` → `/calculators`

### Archetypes

| Archetype    | Use for                                                   | Layout applied                       |
|--------------|-----------------------------------------------------------|--------------------------------------|
| `home`       | The home page only                                        | Full-width hero + resource links     |
| `hub`        | Section landing pages (lists of links grouped by H2)     | Full-width with TOC                  |
| `article`    | Prose pages with inline data tables and callouts         | Narrow-measure (70ch) offset right   |
| `datatable`  | Heavy numeric reference tables (tax brackets, etc.)      | Full-width, scrollable tables        |
| `calculator` | Calculator pages (use `CalculatorShell` component)       | `CalculatorShell` two-column layout  |
| `utility`    | About, Privacy, Contact, What's New, plain prose pages   | Simple narrow prose                  |

### Using components in `.mdx` files

Import a component at the top of the file, then use it as a tag:

```mdx
import Callout from '../../components/Callout.astro'
import DataTable from '../../components/DataTable.astro'

<Callout type="tip">
Your tip text here.
</Callout>

<DataTable
  caption="Optional table caption"
  headers={["Column A", "Column B"]}
  rows={[
    ["Row 1 A", "$1,234"],
    ["Row 2 A", "$5,678"],
  ]}
/>
```

Callout types: `tip` (red rule), `note` (blue rule), `warning` (amber rule).

---

## 2. Changing the menu

Open `src/data/navigation.yaml` and edit it. The structure is:

```yaml
- label: "My Top-Level Link"    # text shown in the nav bar
  href: "/my-page"              # URL

- label: "My Dropdown"          # no href = renders as a dropdown trigger
  children:
    - label: "Sub-page 1"
      href: "/sub-page-1"
    - label: "Sub-page 2"
      href: "/sub-page-2"
```

Save the file and the menu updates automatically. The sitemap page at `/sitemap` also regenerates.

---

## 3. Editing a tip, table, or date

- **Edit a callout:** Open the `.mdx` file and change the text inside `<Callout>…</Callout>`.
- **Edit a data table:** Open the `.mdx` file and change the strings inside the `rows={[…]}` array of the `<DataTable>` component.
- **Update the "Revised:" date:** Change the `revised: "YYYY-MM-DD"` field in the page's front-matter. The date tag on the page updates automatically.

---

## 4. Rebranding

### Change the accent colour

Open `src/styles/tokens.css` and find this line near the top:

```css
--accent: #E2231A;   /* Swiss signal red (default) */
```

Change the hex value. The new colour applies to every link, dropdown indicator, callout rule, focus ring, and "Revised" tag across the entire site.

### Change type scale or fonts

All type sizes and font stacks are in `src/styles/tokens.css` under `/* ── Typography */`. Change `--font-display`, `--font-body`, or `--font-data` to swap typefaces. Change `--step-*` values to resize the scale.

Self-hosted font files are in `public/fonts/`. To use a different typeface, add its `.woff2` file there and update the matching `@font-face` rule in `src/styles/global.css`.

### Change the site name, tagline, or social links

Open `src/data/site.yaml`:

```yaml
name: "finance-forge.ai"
tagline: "Free financial guidance for Canadians"
social:
  - platform: "LinkedIn"
    href: "https://linkedin.com/…"
```

The footer, header, and page titles all read from this file.

### Change the footer disclaimer

Edit the `disclaimer:` field in `src/data/site.yaml`.

---

## 5. Project structure at a glance

```
finance-forge.ai/
├─ src/
│  ├─ content/
│  │  ├─ pages/           ← every page is one .md/.mdx file here
│  │  └─ config.ts        ← front-matter schema (don't usually need to touch)
│  ├─ data/
│  │  ├─ navigation.yaml  ← THE MENU — edit this to change the nav
│  │  └─ site.yaml        ← site name, tagline, socials, disclaimer
│  ├─ components/         ← Header, Footer, Callout, DataTable, etc.
│  ├─ layouts/            ← BaseLayout, PageLayout
│  ├─ pages/              ← Astro routing (don't usually need to touch)
│  └─ styles/
│     ├─ tokens.css       ← ALL design tokens (colours, type, spacing)
│     └─ global.css       ← global styles, component styles
├─ public/
│  └─ fonts/              ← self-hosted .woff2 font files
└─ README.md              ← this file
```

---

## Acceptance checklist (§9)

- [x] Full nav tree from §3 works on desktop (dropdowns) and mobile (drawer)
- [x] One example of each archetype: home, hub, article, datatable, calculator, utility
- [x] Breadcrumb, in-page TOC, Callout, DataTable, and "Revised" tag all render from front-matter / MDX — no hard-coded copy in components
- [x] Swiss execution: 12-col grid, baseline rhythm, hairline rules, three-voice typography, tabular numerals, single accent, heavy white space, flush-left ragged-right
- [x] All design values live in `tokens.css`; accent + fonts swappable in one place
- [x] No taxtips.ca prose; all placeholders marked `[TODO: …]`
- [x] README enables a non-developer to add pages and edit the menu
- [x] No features beyond the brief (no working calculators, no search backend, no CMS in this phase)
