import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import preact from '@astrojs/preact'

export default defineConfig({
  site: 'https://www.finance-forge.ai',
  integrations: [mdx(), sitemap(), preact({ compat: true })],
  output: 'static',
  // Redirect map — keep in sync with src/redirects.ts (canonical source of truth)
  redirects: {
    '/index.html': '/',
  },
})
