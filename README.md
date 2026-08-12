# Job Tracker

A personal job application tracker built with Astro and React, backed by Supabase for auth and data, and deployed on Cloudflare Workers.

## Features

- **Dashboard** — application count, response rate, overdue follow-ups, and a weekly momentum chart
- **Applications table** — sortable, filterable list of every application
- **Board** — drag-and-drop Kanban view across `Applied → Phone Screen → Interview → Offer / Rejected`
- **Magic-link auth** — passwordless sign-in via Supabase Auth

## Stack

- [Astro](https://astro.build) (SSR, `output: "server"`) + [React](https://react.dev) islands
- [Supabase](https://supabase.com) — Postgres + Auth
- [Tailwind CSS v4](https://tailwindcss.com)
- [@dnd-kit](https://dndkit.com) for drag-and-drop
- [Cloudflare Workers](https://workers.cloudflare.com) via `@astrojs/cloudflare`

## Development

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your Supabase project's URL and anon key.

## Commands

| Command               | Action                                      |
| :--------------------- | :------------------------------------------ |
| `npm install`          | Install dependencies                         |
| `npm run dev`           | Start the dev server at `localhost:4321`     |
| `npm run build`         | Build for production                         |
| `npm run preview`       | Preview the production build locally         |
| `npx wrangler deploy`   | Deploy to Cloudflare Workers                 |

## Deployment

This project deploys to Cloudflare Workers. `wrangler.jsonc` configures the Worker and static assets binding; Cloudflare auto-provisions the KV namespace (sessions) and Images binding on first deploy.

```sh
npm run build
npx wrangler deploy
```
