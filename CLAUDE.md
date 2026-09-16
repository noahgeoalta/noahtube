# NoahTube

Personal YouTube front-end PWA. Single-page app — all logic is in `js/app.js`, styles in `css/styles.css`, markup in `index.html`. No build step, no framework, no npm. Deploy by pushing to `main` (GitHub Pages or similar static host).

## Key architecture notes

- **YouTube Data API v3** — API key is hardcoded in `app.js` (`API_KEY`). Quota is the main constraint; avoid extra API calls.
- **All state is localStorage** — watch progress, custom playlists, sync code, search history. Keys all prefixed `nt_`.
- **Sync** — cross-device sync uses JSONBlob. Sync codes starting with `NT-` have the blob ID base36-encoded in the code itself so any device can connect without a prior lookup.
- **History** — saves video title, thumbnail, and timestamp in `wd.videos[vidId]` so the history tab shows real titles. Search video progress stored under `nt_sp_{videoId}`.
- **No backend** — keep it that way unless there's a strong reason.

## Development rules

- **Always push finished changes directly to `main`** unless Noah explicitly says to use a different branch.
- Do not open a PR unless Noah asks for one.
- Keep changes minimal — no refactors, abstractions, or new dependencies unless asked.
- Test the golden path mentally before pushing (no CI, no tests).
