# Service Request Tracker

A small internal tool for logging, working on and closing service requests. Built with **Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS** against the Trendtive assessment API.

## Features

- **Request list** with title, priority, status and created date
- **Filters** for status and priority, plus pagination, all kept in the URL (e.g. `/?status=OPEN&priority=HIGH&page=1`), so a view survives a refresh and can be shared as a link
- **Create request** form with validation that matches the API rules
- **Request detail** with all fields and the full status history (newest first)
- **Status transitions** that follow the business rules: `OPEN → IN_PROGRESS → DONE`, with a required resolution note when closing a `HIGH` priority request
- **Loading skeletons**, helpful **empty states**, and the API's **error messages** shown to the user
- **Component tests** for the business-rule validation

## Getting started

### Requirements

- Node.js 20.9 or newer (developed on Node 26)
- npm

### 1. Install

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in the real values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `API_BASE_URL` | Base URL of the assessment API, without a trailing slash |
| `CANDIDATE_KEY` | Your candidate key, sent as the `X-Candidate` header |

Both variables are **server-only** (no `NEXT_PUBLIC_` prefix), so they are never sent to the browser. `.env.local` is git-ignored.

### 3. Run

```bash
npm run dev      # development server on http://localhost:3000
npm test         # component tests (watch mode)
npx vitest run   # component tests, single run
npm run build && npm start   # production build
```

## Project structure

```
app/
  page.tsx                    Request list (reads filters from the URL)
  requests/new/page.tsx       Create request page
  requests/[id]/page.tsx      Request detail + status history
  requests/[id]/not-found.tsx Friendly 404 for unknown request IDs
components/
  RequestList.tsx             Fetches and renders the list, empty and error states, pagination
  Filters.tsx                 Status/priority dropdowns that update the URL
  CreateRequestForm.tsx       Create form with client validation
  StatusTransition.tsx        "Move to next status" control with the HIGH-priority note rule
  Badge.tsx                   Coloured status/priority label
  *.test.tsx                  Component tests (Vitest + React Testing Library)
lib/
  api.ts                      Server-only API client (base URL, key header, error handling)
  actions.ts                  Server Actions for creating a request and changing its status
  validation.ts               Shared business rules (field limits, allowed transitions)
  types.ts                    Types for requests, history, pagination and API errors
  format.ts                   Date formatting
```

## Three decisions and why

### 1. All API calls happen on the server

The API key must stay secret, so the browser never talks to the API directly. Pages and lists are **Server Components** that call the API client, and changes (create, status update) go through **Server Actions**. `lib/api.ts` imports `server-only`, so importing it into browser code by mistake fails the build. All API errors go through one helper that turns the API's `{ error, message, status }` into a typed `ApiRequestError`, so every page shows errors the same way.

### 2. The URL is the single source of truth for the list view

Filters and the page number live only in the URL, not in component state. The filter dropdowns update the URL, and the server renders the list from it. This makes refresh and shareable links work with no extra syncing code. Because the URL is user input, it is validated first: unknown statuses or priorities are ignored and invalid page numbers fall back to the first page, so a bad link shows the normal list instead of an error. Page numbers in the URL are 0-based to match the API, and shown to users as 1-based.

### 3. Business rules defined once, with a clean, light design

- **Rules:** the validation rules live in `lib/validation.ts` and run both in the browser (instant feedback, no request) and again in the Server Action (browser checks can be bypassed). Allowed transitions are a single map (`OPEN → IN_PROGRESS → DONE`, `DONE → none`), and the UI only ever offers the *next* status, so invalid transitions can't be requested. The API still enforces everything, and its messages (`RESOLUTION_NOTE_REQUIRED`, `INVALID_TRANSITION`, `NOT_FOUND`) are shown if it rejects a change.
- **Design:** a neutral zinc palette on white keeps the focus on the data. Status and priority use **coloured badges** (e.g. red for HIGH, green for DONE) so a list can be scanned at a glance. **Skeletons** are sized like the real rows so the page doesn't jump, and they show on every filter or page change, not only on first load, because the API's ~300 ms delay would otherwise look like nothing happened. Layouts are **mobile-first** with Tailwind breakpoints, and forms use proper labels, `aria-invalid` and `role="alert"` for accessibility.

## Testing

Component tests use **Vitest** and **React Testing Library**. Server Actions are mocked, so tests check the browser-side rules without calling the live API.

- **CreateRequestForm:** blocks submission when the title is empty or over 100 characters; submits when the input is valid
- **StatusTransition:** requires a resolution note to close a HIGH priority request; doesn't require one for MEDIUM; only offers the next status; shows no control once a request is DONE

## What I would improve with more time

- **End-to-end tests** (e.g. Playwright) for the async Server Components and full flows. Vitest does not support async Server Components.
- **Real 404 status code:** `notFound()` runs inside a Suspense boundary after streaming starts, so unknown IDs show the not-found page with HTTP 200.
- **Timezone-aware dates:** dates are formatted on the server, so they use the server's timezone rather than the user's.
- **Optimistic status updates** so the badge changes instantly instead of after the ~300 ms round trip.
- **Search by title** and a page-size selector on the list.

## AI usage declaration

- **Gemini:** understanding the assessment brief, researching approaches and generating ideas.
- **Claude (Claude Code):** used throughout development as a coding assistant and tutor. For each phase of my plan it provided reference code with explanations (types, API client, components, Server Actions and tests), which I typed in myself, read through, tested against the live API and adjusted. I also used it to explain Next.js 16 concepts (Server Actions, Suspense with Cache Components, dynamic routes) and to debug errors (an npm peer-dependency conflict, route type generation and the dev server's cross-origin protection).

I planned the phases, wrote and ran every change myself, verified each phase manually and with tests, and can explain and modify the code.
