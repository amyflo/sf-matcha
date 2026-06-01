# Matcha Finder

Find matcha cafes in San Francisco with AI-powered recommendations, served as printable receipt cards.

**Live site:** [exa-matcha.netlify.app](https://exa-matcha.netlify.app)

## What it does

Describe what you're looking for — a quiet spot in the Mission, ceremonial grade, outdoor seating — and get grounded cafe recommendations pulled from Yelp, Google Maps, Tripadvisor, and other review sources via [Exa](https://exa.ai). Results render as receipt-style cards with photos, ratings, menu picks, and maps.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Exa](https://exa.ai) for web-grounded search
- [Tailwind CSS 4](https://tailwindcss.com)
- Deployed on [Netlify](https://netlify.com)

## Local development

```bash
pnpm install
cp .env.example .env
# Add your Exa API key to .env, or pull from Netlify:
# netlify env:pull
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Without an `EXA_API_KEY`, the API returns example cafe data so you can develop the UI offline.

## Environment variables

| Variable | Description |
|----------|-------------|
| `EXA_API_KEY` | [Exa API key](https://dashboard.exa.ai) for live recommendations |

Set in Netlify under **Site configuration → Environment variables** (scope: Builds, Functions, Runtime). For local dev, use a `.env` file or `netlify env:pull`.

## Deploy

The site is configured for Netlify with the OpenNext adapter. Connect the repo, set `EXA_API_KEY`, and deploy.

```bash
netlify deploy --prod
```

## License

MIT
