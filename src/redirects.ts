// In-repo redirect map — add entries here when renaming/moving pages.
// This is the canonical source of truth for redirects.
// When adding a redirect here, also update the `redirects` object in astro.config.mjs.
export const REDIRECTS: Record<string, string> = {
  // Legacy React SPA hash-based URLs (just in case):
  '/index.html': '/',
}
