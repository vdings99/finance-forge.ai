import { defineCollection, z } from 'astro:content'

// ── Shared field definitions ─────────────────────────────────────────────────────

/** Hub/section page index (existing pages/ collection) */
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    breadcrumb:  z.array(z.string()).default(['Home']),
    section:     z.string().optional(),
    archetype:   z.enum(['home', 'hub', 'article', 'datatable', 'calculator', 'utility', 'province', 'glossary', 'log']),
    revised:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toc:         z.boolean().default(false),
    lead:        z.string().optional(),
    taxYear:     z.number().optional(),
    order:       z.number().optional(),
    preview:     z.boolean().default(false), // true = calculator preview shell
  }),
})

/** Article / topic pages — all prose pages in the article library */
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    breadcrumb:  z.array(z.string()).default(['Home']),
    section:     z.string(),          // e.g. "personal-tax", "financial-planning"
    group:       z.string().optional(), // e.g. "tax-topics", "employee-topics"
    revised:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    taxYear:     z.number().optional(),
    toc:         z.boolean().default(true),
    lead:        z.string().optional(),
    order:       z.number().default(99),
    draft:       z.boolean().default(false),
  }),
})

/** Glossary entries */
const glossary = defineCollection({
  type: 'content',
  schema: z.object({
    term:       z.string(),
    letter:     z.string().length(1).toUpperCase(), // A–Z index key
    definition: z.string(),                          // short plain-text definition for meta
    seeAlso:    z.array(z.string()).default([]),      // slugs of related terms
    revised:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
})

/** What's New / newsletter archive entries */
const whatsnew = defineCollection({
  type: 'content',
  schema: z.object({
    title:    z.string(),
    date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    summary:  z.string(),    // one-line for the RSS feed & log index
    category: z.enum(['tax', 'calculator', 'site', 'budget', 'regulation', 'general']).default('general'),
  }),
})

export const collections = { pages, articles, glossary, whatsnew }
