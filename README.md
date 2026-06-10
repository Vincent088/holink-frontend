# HoLink Frontend

A production-minded frontend prototype for HoLink — a link-in-bio, short link, and creator page platform. Built as part of the HoLink Frontend Engineer Screening Test.

---

## Tech Stack

| Area              | Technology                                              |
| ----------------- | ------------------------------------------------------- |
| Framework         | Vue 3 (`^3.5.34`) with `<script setup>` Composition API |
| Language          | TypeScript (`~6.0.2`)                                   |
| State Management  | Pinia (`^3.0.4`)                                        |
| Routing           | Vue Router (`^4.6.4`)                                   |
| Styling           | Tailwind CSS (`^3.4.19`)                                |
| Component Library | Reka UI / shadcn-vue (`^2.9.9`)                         |
| Build Tool        | Vite (`^8.0.12`)                                        |
| Unit Testing      | Vitest (`^4.1.8`) + jsdom                               |
| E2E Testing       | Playwright (`^1.60.0`)                                  |
| Icons             | Lucide Vue Next                                         |
| Drag & Drop       | vuedraggable                                            |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Install Playwright browsers (for E2E tests only)

```bash
npx playwright install chromium
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Script                | Description                            |
| --------------------- | -------------------------------------- |
| `npm run dev`         | Start development server               |
| `npm run build`       | Type-check and build for production    |
| `npm run preview`     | Preview production build               |
| `npm test`            | Run unit tests (single run)            |
| `npm run test:watch`  | Run unit tests in watch mode           |
| `npm run test:ui`     | Run unit tests with Vitest UI          |
| `npm run test:e2e`    | Run E2E tests (auto-starts dev server) |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI       |

---

## Main Features

### Dashboard — Profile Editor

- Edit username, display name, bio, and avatar image URL
- Duplicate username detection across all users
- Direct link to the public profile page

### Dashboard — Link Manager

- Add links with title and URL
- Edit links inline
- Delete links with confirmation dialog
- Enable / disable individual links via toggle
- Drag-and-drop reordering with persistence
- Up / down button reordering for keyboard and mobile
- Search and filter links by title, URL, or platform
- Import multiple URLs at once (paste one per line)
- Loading and success feedback on all actions

### Public Profile Page

- Visitor-facing page at `/p/:username`
- Shows only active links, sorted by order
- Skeleton loading animation while fetching
- Click tracking on every link
- Open Graph and Twitter Card meta tags for social sharing
- Inline "profile not found" state if username does not exist

### Not Found Pages

- **Public** (`/p/nonexistent-username`) — visitor-friendly message showing the specific `@username` that was not found, no dashboard button
- **Dashboard** (`/dashboard/unknown-route`) — full dashboard layout with "Go to Dashboard" button
- **Generic** (any other invalid URL) — standalone not-found card with "Go to Dashboard" button

---

## Advanced Logic Features

All 8 optional challenges were implemented:

| #   | Feature                            | Description                                                                                                                                                         |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **URL Parser & Platform Detector** | Automatically detects Instagram, YouTube, TikTok, WhatsApp, marketplace (Tokopedia, Shopee, Lazada, Amazon), website, or unknown based on URL hostname              |
| 2   | **UTM Builder**                    | Per-link UTM source, medium, and campaign fields; generates final URL appended with UTM parameters when a visitor clicks                                            |
| 3   | **Click Tracking Simulation**      | `trackEvent()` helper logs events to `console` and stores them in `localStorage`; tracks `link_clicked`, `link_added`, `profile_saved`, and `public_profile_viewed` |
| 4   | **Draft vs Published State**       | Links can be saved as draft (changes visible only in dashboard) or published (changes go live on public page immediately)                                           |
| 5   | **Undo Delete**                    | After confirming deletion a toast appears for 5 seconds with an Undo button that restores the link                                                                  |
| 6   | **Search / Filter**                | Real-time search across link title, URL, and platform type with an empty state message when no results match                                                        |
| 7   | **Import Multiple URLs**           | Paste multiple URLs (one per line) via an import dialog; each valid URL is auto-detected for platform and added as a separate link                                  |
| 8   | **Slug Validation**                | Username only accepts lowercase letters, numbers, hyphens, and underscores (regex enforced with clear error message)                                                |

---

## Technical Explanation

### Component and State Structure

The app is split into two main areas:

- **`src/views/dashboard/`** — authenticated user views (profile editor, link manager, layout)
- **`src/views/public/`** — visitor-facing views (public profile, not found)
- **`src/components/app/`** — shared domain components (`LinkCard`, `PlatformBadge`, `AppInput`, etc.)
- **`src/components/ui/`** — base design system components (Button, Input, Dialog, etc.)
- **`src/composables/`** — business logic extracted from views (`useLinkManager`, `useProfileEditor`)
- **`src/stores/`** — Pinia store (`user.ts`) as the single source of truth for all user and link data
- **`src/utils/`** — pure utility functions (URL normalization, platform detection, validation, analytics)
- **`src/services/`** — API service layer (`mockHandlers.ts`) that simulates a REST API using `localStorage`

The Pinia store holds all data in memory during the session. The mock API layer reads and writes from `localStorage` to simulate persistence across page refreshes. This separation means swapping in a real HTTP client requires only changes to `src/services/`.

### URL Validation and Normalization

All URL handling lives in `src/utils/url.ts`:

1. **`normalizeUrl(value)`** — trims whitespace, blocks dangerous protocols (`javascript:`, `data:`, `file:`, `vbscript:`), and prepends `https://` to bare domains (e.g. `instagram.com/user` → `https://instagram.com/user`).
2. **`isValidUrl(value)`** — validates using the browser's native `URL` constructor, and only accepts `http:` or `https:` protocols.
3. **`detectPlatform(url)`** — extracts the hostname and matches it against known platform patterns to return a typed platform label.

Validation is always applied in two steps: normalize first, then validate the normalized output. This means users can type bare URLs naturally without needing to add `https://` manually.

### Dashboard and Public Page Data Consistency

Both views read from the same Pinia store. When a user saves changes in the dashboard, the store updates immediately and the `localStorage`-backed mock API is updated synchronously. The public profile page fetches data through the same service layer, so any saved changes are reflected immediately when the public page is opened or refreshed.

The **draft vs published** feature adds one layer: draft changes are stored separately on each `HoLinkItem` under a `draft` field. The dashboard shows draft values for editing, while the public page only reads the live (published) fields. Publishing merges the draft into the live fields and clears the draft.

### Connecting to Real APIs

The app is already structured for a real backend. To connect:

1. Replace `src/services/mockHandlers.ts` with real `fetch` / `axios` calls to the backend endpoints.
2. The `httpClient.ts` abstraction layer already exists — swap the mock flag (`VITE_MOCK_API`) to `false` and point `baseURL` to the real API.
3. Add an authentication interceptor to attach a JWT or session token to every request.
4. Replace the single-user Pinia store with multi-user session management (login, logout, token refresh).
5. The `useLinkManager` and `useProfileEditor` composables call the store, not the API directly — no component changes are needed.

---

## Known Limitations and Trade-offs

- **No authentication flow** — the app auto-authenticates a single default user. Multi-user scenarios require manually seeding `localStorage`. In production this is handled by the API and a login page.
- **Client-side Open Graph tags** — OG meta tags are injected by JavaScript after the page loads. This works for platforms that execute JavaScript (WhatsApp, Slack, Twitter), but server-side rendering (e.g. Nuxt) would be needed for full crawler compatibility (Facebook, Google).
- **Single user only** — the prototype simulates one user. The data model and store support multiple users, but there is no registration or user-switching UI.
- **Mock API latency** — API delays are simulated with small timeouts to show loading states, but real network latency and error handling (timeouts, 5xx responses) are not fully simulated.
- **Base64 image storage** — avatar upload converts the file to a base64 string and stores it in `localStorage`. This works for the prototype but is not suitable for production (base64 images are ~33% larger than the original and quickly approach the localStorage 5MB limit). A real implementation would upload to cloud storage (e.g. S3 pre-signed URL) and store only the URL.

---

## What Would Be Improved With More Time

- **Server-Side Rendering (Nuxt)** — for proper OG tag support, SEO, and initial page load performance on the public profile page.
- **Real authentication** — login, registration, OAuth (Google/GitHub), and JWT session management.
- **Link analytics dashboard** — visualize click events per link over time using the already-stored event data.
- **More platform detectors** — expand detection to cover LinkedIn, Twitter/X, Threads, Twitch, Spotify, and other common creator platforms.
- **CI/CD pipeline** — run unit and E2E tests automatically on every pull request using GitHub Actions.
- **UI polish** — refine spacing, typography, and micro-interactions across the dashboard and public profile page; add transition animations for card entries, smoother drag-and-drop feedback, and a more polished empty state design to better match a production creator tool.
