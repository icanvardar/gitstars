import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/** Social cards need absolute URLs, so `%SITE_URL%` in index.html becomes the deployed origin. */
function siteUrl(origin: string): Plugin {
  return {
    name: 'gitstars:site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', origin.replace(/\/$/, '')),
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), siteUrl(env.SITE_URL ?? '')],
    build: {
      target: 'es2022',
    },
  }
})
