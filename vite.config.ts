import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Crawlers and social cards need absolute URLs: `%SITE_URL%` in index.html becomes the deployed
 * origin, and the canonical link and sitemap are only emitted once that origin is known.
 */
function seo(rawOrigin: string): Plugin {
  const origin = rawOrigin.replace(/\/$/, '')
  return {
    name: 'gitstars:seo',
    transformIndexHtml: (html) => ({
      html: html.replaceAll('%SITE_URL%', origin),
      tags: origin ? [{ tag: 'link', attrs: { rel: 'canonical', href: `${origin}/` }, injectTo: 'head' }] : [],
    }),
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', ...(origin ? ['', `Sitemap: ${origin}/sitemap.xml`] : [])]
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })
      if (!origin) return
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>
`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), seo(env.SITE_URL || 'https://gitstars.lol')],
    build: {
      target: 'es2022',
    },
  }
})
