import { defineCollection, z } from 'astro:content'

/**
 * Front-matter schema for every page in src/content/pages/
 * All fields are required unless marked optional (.optional()).
 */
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    /** Page <title> and main H1 */
    title: z.string(),

    /** Meta description for <head> */
    description: z.string(),

    /**
     * Breadcrumb trail — an array of labels shown before the page title.
     * The current page title is automatically appended as the last crumb.
     * Example: ["Home", "Personal Income Tax"]
     */
    breadcrumb: z.array(z.string()).default(['Home']),

    /**
     * Top-level section slug — used to highlight the active nav item.
     * Should match a top-level href segment, e.g. "personal-tax", "calculators"
     */
    section: z.string().optional(),

    /**
     * Page archetype — controls which inner layout is applied.
     * home | hub | article | datatable | calculator | utility
     */
    archetype: z.enum(['home', 'hub', 'article', 'datatable', 'calculator', 'utility']),

    /**
     * ISO 8601 date string (YYYY-MM-DD) — drives the "Revised:" tag.
     * Update this whenever you edit the page content.
     */
    revised: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'revised must be YYYY-MM-DD').optional(),

    /**
     * Show an in-page Table of Contents (generated from H2 headings).
     * Defaults to false.
     */
    toc: z.boolean().default(false),

    /**
     * Optional lead paragraph shown below the H1 and above body content.
     */
    lead: z.string().optional(),
  }),
})

export const collections = { pages }
