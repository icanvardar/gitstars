# gitstars

Turn any public GitHub repo's stars into a clean, cinematic video. Everything runs in the browser: no sign-in, no server.

## Fork it

```bash
npm install
npm run dev      # app at localhost:5173
npm run studio   # edit the videos in Remotion Studio
```

- Change the videos in `src/video` (styles, tiers, themes, formats).
- Set `SITE_URL` in `.env` to your domain for OG images, the canonical link and the sitemap.
- Deploy `dist/` anywhere static. `wrangler.toml` is set up for Cloudflare Workers.

Video rendering uses [Remotion](https://remotion.dev), which needs a [company license](https://remotion.dev/license) for teams of 4 or more.
