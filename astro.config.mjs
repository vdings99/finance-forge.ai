import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import preact from '@astrojs/preact'

export default defineConfig({
  site: 'https://www.finance-forge.ai',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => Boolean(page) && !page.includes('undefined'),
    }),
    preact({ compat: true }),
  ],
  output: 'static',
})
