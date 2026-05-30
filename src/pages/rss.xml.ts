import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const entries = await getCollection('whatsnew')
  const sorted = entries.sort((a, b) => b.data.date.localeCompare(a.data.date))
  return rss({
    title: "finance-forge.ai — What's New",
    description:
      'Latest updates on tax rates, calculators, and Canadian personal finance from finance-forge.ai',
    site: context.site!,
    items: sorted.map((e) => ({
      title: e.data.title,
      pubDate: new Date(e.data.date),
      description: e.data.summary,
      link: `/whats-new/${e.slug}`,
    })),
  })
}
