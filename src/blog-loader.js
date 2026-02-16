import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

const VIRTUAL_MODULE_ID = 'virtual:blog-posts'
const RESOLVED_ID = '\0' + VIRTUAL_MODULE_ID

export default function blogLoader() {
  return {
    name: 'blog-loader',

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID
    },

    load(id) {
      if (id !== RESOLVED_ID) return

      const blogDir = path.resolve(process.cwd(), 'content/blog')
      const files = fs.readdirSync(blogDir)
        .filter(f => f.endsWith('.md'))
        .sort()

      const posts = files.map((file, index) => {
        const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8')
        const { data, content } = matter(raw)
        const html = marked(content.trim())

        return {
          id: index + 1,
          title: data.title,
          category: data.category,
          date: data.date,
          excerpt: data.excerpt,
          readTime: data.readTime,
          content: html,
        }
      })

      return `export const BLOG_POSTS = ${JSON.stringify(posts, null, 2)};`
    },

    handleHotUpdate({ file, server }) {
      if (file.includes('content/blog') && file.endsWith('.md')) {
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      }
    },
  }
}
