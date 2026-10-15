# Memento Mori

A calm, local-first view of your life in weeks, months or years, with a Stats tab. No backend, no API keys, no tracking: everything lives in your browser's localStorage.

## Commands
```bash
npm install        # install dependencies
npm run dev        # development server (http://localhost:5173)
npm run build      # type-check and build into dist/
npm run preview    # preview the production build
```

## Deploy to Netlify
**From GitHub (recommended, auto-redeploys)**
1. Push this folder to a GitHub repository.
2. In Netlify: *Add new site → Import an existing project → GitHub*, pick the repo.
3. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`). Click *Deploy*.
4. Every `git push` to the production branch now triggers a rebuild and redeploy automatically.

**Manual upload**
1. Run `npm run build`.
2. In Netlify: *Add new site → Deploy manually*, then drag the generated `dist` folder onto the page.

## Conventions
- Day maths uses local calendar days, so daylight-saving changes never shift results.
- Week *i* covers days 7i to 7i+6 since birth. Total weeks = ceil(lifespan days / 7); completed weeks = floor(days lived / 7); the next cell is the current week.
- Month and year steps clamp to month end: a Feb 29 birthday is observed on Feb 28 in non-leap years.
- The end date is a hypothetical point from your chosen lifespan, not a prediction.
- Weeks left in the year count from today to Jan 1 (whole weeks, plus leftover days); weeks left in life = total weeks minus completed weeks, so the current week counts as left. The app re-reads the date every 30 s and on tab focus.
- Styling is plain CSS with variables and system font fallbacks (no remote fonts); date maths is in `src/lib/time.ts`, persistence in `src/lib/store.ts`.
