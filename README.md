# Signalhouse — React version (real routes)

Two actual pages/routes — `/login` and `/dashboard` — instead of one page
that swaps content. Same CleverTap post-login logic as before.

## Routes

- `/login` — public. No CleverTap code runs here.
- `/dashboard` — protected. Redirects to `/login` if you're not authenticated
  (see `src/components/ProtectedRoute.jsx`).

## How the "init after login" guarantee works

1. `src/services/clevertap.js` — the CleverTap script tag is only created
   and inserted into the DOM inside `initCleverTap()`.
2. `initCleverTap()` is called from exactly one place: `AuthContext.login()`.
3. `LoginPage`'s submit handler calls `login(user)` — which sets auth state
   AND calls `initCleverTap()` — and only THEN navigates to `/dashboard`.
4. Every other CleverTap helper checks the internal `ctInitialized` flag
   first and no-ops if called before login.
5. `DashboardPage`'s logout button calls `logout()` (resets the flag +
   calls CleverTap's own `.logout()`), then navigates back to `/login`.

Your CleverTap Account ID (`4W7-4R8-R65Z`) and region (`eu1`) are already
set in `src/services/clevertap.js`.

## No session persistence (by design)

Auth state lives in React state only (`AuthContext`), not localStorage —
so a manual page refresh logs you out and sends you back to `/login`. This
is intentional for this demo: it keeps the CleverTap init tied to one clear
event (the login submit), with no separate "restore session on boot" code
path that could silently do its own (delayed) init — which is what commonly
causes the "only works after reload" symptom in real integrations. If you
add persistence later, restore the session AND call `initCleverTap()`
together in the same effect, not as two separate steps.

## Project structure

```
src/
  services/clevertap.js       # all CleverTap logic lives here
  context/AuthContext.jsx     # login/logout state, calls initCleverTap()
  components/ProtectedRoute.jsx
  pages/LoginPage.jsx         # route: /login
  pages/DashboardPage.jsx     # route: /dashboard
  App.jsx                     # route definitions
  main.jsx                    # entry point
  index.css                   # all styling
```

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`) — it'll
redirect you to `/login` first.

## Build & deploy

```bash
npm run build
```

Output goes to `dist/`. Since this uses client-side routing, your static
host needs a fallback rule so `/dashboard` doesn't 404 on a direct refresh
or shared link — e.g. Netlify's `_redirects` file with `/* /index.html 200`,
or Vercel's rewrites in `vercel.json`. Ask me if you want that file added
for your specific host.
