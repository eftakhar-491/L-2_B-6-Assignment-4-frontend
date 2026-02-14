# Frontend – FoodHub Web

Next.js 15 app router UI for the FoodHub platform. Provides public marketing pages, browsing meals/providers, cart/checkout flows, and role-aware admin/provider dashboards.

## Tech Stack
- Next.js 15 (App Router), React 19
- Tailwind CSS + shadcn/ui (Radix) components
- Framer Motion animations
- Better Auth client (cookies) for email/password + Google
- Sonner toasts, React Hook Form + Zod for forms

## Scripts
- `pnpm dev` – start dev server
- `pnpm build` – production build
- `pnpm start` – start built app
- `pnpm lint` – lint

## Environment (.env.local)
```
# API base (one of these)
NEXT_PUBLIC_API_URL=http://localhost:5000
# or
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Better Auth client (if overriding defaults)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:5000/api/auth
```
`NEXT_PUBLIC_API_URL` is used by `service/http.ts` to talk to the backend; cookies are included by default.

## Project Structure (key paths)
- `app/` – routes and pages (app router)
  - `layout.tsx` – root layout
  - `page.tsx` – landing page (hero, featured, CTA, etc.)
  - `admin/`, `super-admin/`, `provider/` – role dashboards
  - `auth/` – auth flows (verify, reset, etc.)
  - `cart/`, `checkout/`, `orders/`, `profile/` – customer flows
  - `components/` – page-specific UI sections
- `components/` – shared UI primitives (icons, theme provider, ui)
- `context/` – `AuthContext`, `AppContext`
- `service/` – API wrappers (`http.ts`, `user.ts`, `cart.ts`, etc.)
- `hooks/` – custom hooks (mobile, toast)
- `styles/` – global styles (Tailwind)

## API Client Notes
- Base URL comes from `NEXT_PUBLIC_API_URL` (fallback `NEXT_PUBLIC_BACKEND_URL` or `http://localhost:5000`).
- Requests include cookies unless `skipAuth` is set.
- Helpers `unwrap`/`unwrapList` normalize `{ data: ... }` envelopes.

## Getting Started
1) Install deps
```bash
pnpm install
```
2) Add `.env.local` with the values above
3) Run dev server
```bash
pnpm dev
```
4) Open http://localhost:3000

## Build & Deploy
```bash
pnpm build
pnpm start   # serves .next/standalone
```
Next config allows unoptimized images and ignores TS build errors; fix type issues before production.

## Styling & Theming
- Tailwind + CSS variables in `app/globals.css` define the dark neon palette.
- `ThemeProvider` (next-themes) is initialized in `app/providers.tsx`.

## Auth Flows
- Better Auth mounted at `/api/auth` (backend). Email verification, reset, and Google are enabled.
- Client uses cookies; ensure backend CORS includes the frontend origin.

## Key Pages
- Public: landing (`/`), categories/providers/meals, auth flows under `/auth/*`
- Customer: `cart`, `checkout`, `orders`, `profile`
- Provider: `provider/*` for menu/orders management
- Admin: `admin/*` for users/orders/categories
- Super Admin: `super-admin/*` for platform oversight

## Troubleshooting
- CORS/auth cookies: backend must allow the exact frontend origin and use HTTPS in production.
- API 404: confirm `NEXT_PUBLIC_API_URL` points to the backend and includes protocol.
- Images: unoptimized images are allowed; add allowed domains if switching to optimized images.
