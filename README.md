# MovieVerse Client

Public React application for browsing titles, search, reviews, profiles, favourites and watchlists.

## Stack

React, Vite, React Router, Axios, Tailwind CSS and Lucide.

## Structure

`src/api` contains the Axios client; `components` reusable UI; `context` shared session/theme/toast/storefront state; `pages` route screens; `routes` authorization; `utils` shared helpers.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Environment

```env
VITE_API_ORIGIN=https://api.example.com
```

The origin defaults to `http://localhost:5000` locally and is required for production builds. Do not expose server secrets in Vite variables.

## Deployment

Build with `npm run build`, deploy `dist/` with SPA fallback, and configure the server CORS policy for this deployed origin. Route screens are lazily loaded; shared providers and protected routes are composed in `src/App.jsx`.