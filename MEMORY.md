# CivicEye - Hierarchical Agent Memory

## 1. Project Overview & Mission
CivicEye is an AI-powered civic issue reporting and city intelligence platform. Citizens report civic issues (potholes, garbage piles, blocked storm drains, broken streetlights, fallen trees) by taking photos. Future phases will incorporate Google Gemini multimodal AI to analyze images, GPS to capture report coordinates, Firebase Firestore to store incidents and user data, Firebase Storage for images, and Google Maps Platform to visualize live city-wide incidents with a FastAPI backend.

**Core Vision:** "Report civic problems. Let AI understand them. Help build a better city."

---

## 2. Tech Stack & Versions
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **UI & Styling:** Tailwind CSS 4 (via `@tailwindcss/postcss`)
- **Iconography:** `lucide-react` (Vector icons strictly enforced, zero raw emojis)
- **Runtime:** Node.js v24.16.0
- **Planned Integrations (Future Phases):**
  - **Database:** Firebase Firestore
  - **Auth:** Firebase Authentication
  - **File Storage:** Firebase Cloud Storage
  - **AI Model:** Google Gemini API (Multimodal defect classification & severity rating)
  - **Maps:** Google Maps Platform (JavaScript API, Geocoding, Places)
  - **Geolocation:** Browser Geolocation API
  - **Backend:** FastAPI (Python)

---

## 3. Architecture & Core Decisions
- **Phase 1 Scope:** Pure frontend foundation. No hardcoded mock incident data, no simulated backend calls.
- **Iconography Standard:** Vector icons strictly using `lucide-react` for all controls, navigation, and badges. No emojis.
- **Centralized Environment Setup:** Environment keys documented in `.env.example` and accessed via type-safe accessors in `src/config/env.ts`. No hardcoded API keys or secrets.
- **Modularity:** Reusable component library in `src/components/common/` (`Navbar`, `Button`, `Card`, `PageHeader`, `StatusBadge`, `IncidentCard`, `EmptyState`, `Footer`).
- **Future-Ready Service Contracts:** Clean interface stubs in `src/services/` and domain models in `src/types/` to permit zero-restructure upgrades in future phases.
- **Firebase Foundation & Firestore Pipeline (Phase 2):**
  - Official Firebase Web SDK (`firebase`) with centralized singleton client initialization in `src/services/firebase.ts`.
  - Zero hardcoded keys: strictly driven by `NEXT_PUBLIC_FIREBASE_*` environment variables with graceful unconfigured and local fallback states.
  - Reusable React `AuthContext` (`src/context/AuthContext.tsx`) wrapping the root layout, exposing `currentUser`, `loading`, `isConfigured`, `signInWithGoogle()`, and `signOut()`.
  - Automatic Firestore user synchronization (`users/{uid}`) with server timestamps (`createdAt`, `lastLoginAt`) upon sign-in.
  - Full incident lifecycle in `src/services/firestore.ts`: `createIncident`, `getIncidents`, `subscribeToIncidents`, and `updateIncidentStatus` with resilient local caching.
  - Photo evidence storage in `src/services/storage.ts` via `uploadIncidentPhoto()` with fallback to inline data URL.
- **Multimodal AI Vision Defect Classification (Phase 2):**
  - Next.js server-side route `/api/analyze-image` powered by `@google/genai` (`gemini-1.5-flash`).
  - Automatically identifies defect category, estimates hazard severity, generates tags, and produces damage assessment rationale.
  - Built-in intelligent heuristic fallback when `GEMINI_API_KEY` is pending.
- **Phase 3 Real Camera & Browser Geolocation Architecture:**
  - `src/types/report.ts`: Client-side `ReportDraft` memory model (`photo`, `photoPreviewUrl`, `capturedAt`, `photoConfirmed`, `location`).
  - `src/hooks/useCamera.ts`: Native browser MediaDevices video stream (`getUserMedia`) prioritizing mobile rear-facing camera (`facingMode: { ideal: 'environment' }`), offscreen canvas frame capture, and leak-free track cleanup (`track.stop()`).
  - `src/hooks/useGeolocation.ts`: Real browser geolocation (`getCurrentPosition`) with `{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }`, human-friendly accuracy readout (±Xm), and staleness detection (>30s).
  - Modular UI components: `src/components/report/` (`ReportProgress`, `LocationCapture`, `CameraCapture`, `PhotoPreview`).
  - Strict privacy boundary: captured media and GPS coordinates remain strictly in client memory without writing to Firebase or Gemini in this phase.

- **Phase 4 Real Gemini Vision AI Triage Architecture:**
  - Official SDK: `@google/genai` initialized strictly server-side using `process.env.GEMINI_API_KEY` (never exposed via `NEXT_PUBLIC_` or client components).
  - Model: Centralized in `src/config/ai.ts` (`GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'`).
  - Schema & Validation: `src/types/analysis.ts` defines `CivicIncidentAnalysisSchema` with 10 strictly allowed categories, integer severity (1-10), confidence (0.0-1.0), hazard levels, affected user groups, and Zod runtime validation.
  - Server Service: `src/services/gemini.ts` implements `analyzeCivicIncident(imageBuffer, mimeType)` with structured JSON schema enforcement (`Type.OBJECT`) and comprehensive error mapping (400, 413, 429, 500, 502).
  - API Route: `src/app/api/analyze-incident/route.ts` accepts `multipart/form-data`, validates format/size (<=15MB), processes images temporarily in memory, and returns validated analysis.
  - Frontend Triage UI: `src/components/report/AiAnalysisCard.tsx` and updated `src/app/report/page.tsx` allow citizens to run visual AI triage, inspect severity meter and affected groups, and optionally override category while keeping AI fields distinct.
  - Strict Boundary: Zero Firebase Storage uploads, zero Firestore writes, zero Google Maps modifications. Browser GPS remains independent.

---

## 4. Progress & Roadmap
- [x] Phase 1: Next.js + TypeScript + Tailwind CSS bootstrap
- [x] Phase 1: Global design system & vector iconography integration (`lucide-react`)
- [x] Phase 1: Centralized environment & site configuration
- [x] Phase 1: Reusable UI Component Library (`Navbar`, `Button`, `Card`, `PageHeader`, `StatusBadge`, `IncidentCard`, `EmptyState`, `Footer`)
- [x] Phase 1: Route `/` (Home landing page with Hero, How It Works, and 4 Feature cards)
- [x] Phase 1: Route `/report` (Reporting workflow placeholders: Upload, Location, AI, Category, Severity, Description)
- [x] Phase 1: Route `/map` (Civic map explorer with Google Maps placeholder & category/severity/status filters)
- [x] Phase 1: Route `/admin` (Command center dashboard with KPI cards, category breakdown, priority, and empty states)
- **Phase 5 Real Firestore Incident Persistence Architecture:**
  - Collection: `incidents/{incidentId}` created via Firestore `addDoc()` using auto-generated document IDs.
  - Schema: Strongly-typed in `src/types/incident.ts` (`IncidentDocument`, `IncidentReporter`, `IncidentLocation`, `IncidentUserConfirmation`).
  - Separation of Concerns: Original `aiAnalysis` is preserved untouched. User override updates `category` while marking `userConfirmation.confirmed = false` and `userConfirmation.categoryOverride = overrideCategory`.
  - Authoritative Location & Auth: Browser GPS (`latitude`, `longitude`, `accuracy`, `capturedAt: Timestamp`) and `auth.currentUser` are strictly bound.
  - Zero Image Persistence: Strictly metadata; NO image files, Blobs, base64 strings, or URLs stored in Firestore or Cloud Storage.
  - Firestore Security Rules: `firestore.rules` enforces authenticated creation, author ownership (`reporter.uid == request.auth.uid`), coordinate range validation, and single-user read access.
  - UI Components: `ReportSummaryCard` (Step 4 review & double-submit prevention) and `ReportSuccessCard` (confirmation with copyable incident ID and reset flow).

- **Phase 6 Real Google Maps & Live Incident Markers Architecture:**
  - Dual Collection Privacy Model: Private reports with reporter identity stay in `incidents/{id}`, sanitized map data in `publicIncidents/{id}` (strictly NO reporter fields, NO auth tokens, NO image URLs).
  - Atomic Dual-Write: `createIncident` in `src/services/firestore.ts` writes both records atomically using `writeBatch(db)`.
  - Security Rules: `firestore.rules` allows public read on `publicIncidents`, and strictly ties creation to matching private incident writes via `existsAfter`/`getAfter` and user backfill via `exists`/`get`.
  - Maps API Engine: `@googlemaps/js-api-loader` functional API (`setOptions`, `importLibrary`), modern `AdvancedMarkerElement` with `PinElement`, severity colors (Critical: `#f43f5e`, High: `#f97316`, Medium: `#06b6d4`, Low: `#10b981`), category glyphs (P, W, G, D, etc.), and distinct pulsing user location marker.
  - UI Components: `CivicGoogleMap.tsx`, `IncidentMapCard.tsx` (detail inspection on marker click), `MapFilters.tsx` (category & severity filtering with live count badge).
  - Realtime: `subscribeToPublicIncidents` using Firestore `onSnapshot` with 100-doc limit, avoiding full page reloads.

---

## 4. Progress & Roadmap
- [x] Phase 1: Next.js + TypeScript + Tailwind CSS bootstrap
- [x] Phase 1: Global design system & vector iconography integration (`lucide-react`)
- [x] Phase 1: Centralized environment & site configuration
- [x] Phase 1: Reusable UI Component Library (`Navbar`, `Button`, `Card`, `PageHeader`, `StatusBadge`, `IncidentCard`, `EmptyState`, `Footer`)
- [x] Phase 1: Route `/` (Home landing page with Hero, How It Works, and 4 Feature cards)
- [x] Phase 1: Route `/report` (Reporting workflow placeholders: Upload, Location, AI, Category, Severity, Description)
- [x] Phase 1: Route `/map` (Civic map explorer with Google Maps placeholder & category/severity/status filters)
- [x] Phase 1: Route `/admin` (Command center dashboard with KPI cards, category breakdown, priority, and empty states)
- [x] Phase 2: Firebase Authentication & Firestore user profile sync (Google Sign-In, `users/{uid}` sync, route gate)
- [x] Phase 3: Real Browser Camera & GPS Geolocation (`useCamera`, `useGeolocation`, `ReportProgress`, `LocationCapture`, `CameraCapture`, `PhotoPreview`)
- [x] Phase 4: Google Gemini Multimodal Vision AI triage integration (`@google/genai`, `/api/analyze-incident`, `AiAnalysisCard`)
- [x] Phase 5: Real Firestore Incident Reports (`incidents/{incidentId}`, `createIncident`, `firestore.rules`, Step 4 Review & Success card)
- [x] Phase 6: Google Maps visualization & incident mapping (`CivicGoogleMap`, `AdvancedMarkerElement`, `publicIncidents`, `MapFilters`, `IncidentMapCard`)
- [x] Phase 7: Duplicate detection & priority clustering
- [x] Phase 8: Admin Command Center (Role-based access control, live Firestore dashboard, incident management table, priority queue, tactical map, municipal analytics, status transitions)
- [x] Phase 9: Strict Role-Based UI Separation (citizenNavItems vs adminNavItems, RootShell suppresses Navbar/Footer on /admin/*, AdminGuard hard-redirects citizens, CitizenGuard hard-redirects admins, My Reports page, Notifications page)
- [x] UI/UX: Futuristic AI Loading/Splash Screen & Identity Portal (Class AI white design language, geometric AI eye symbol, 60fps cinematic sequence, auto-transition)

---

## 5. Phase 7 Architecture: AI Duplicate Detection & Intelligent Priority Scoring
- **Audit-Preserving Clustering Philosophy:**
  - Individual citizen incident documents (`incidents/{id}`) are NEVER destroyed or merged. Auditability and citizen credit are strictly preserved.
  - Aggregated defect clusters live in `incidentClusters/{clusterId}` with `canonicalIncidentId` pointing to the earliest report.
- **Deterministic Priority Engine (`src/services/priority.ts`):**
  - Score range: 0–100 (integer, clamped).
  - Weights: Severity (30%), Hazard (25%), Affected Users (15%), Report Count (20%), Recency (10%).
  - Report Count Diminishing Returns: `Math.min(100, Math.round(15 + 25 * Math.log2(count)))`.
  - Tiers: Low (0–24), Medium (25–49), High (50–74), Critical (75–100).
- **Multi-Signal Duplicate Detection (`src/services/duplicateDetection.ts`):**
  - Distance: Real GPS Haversine via `geofire-common` (`radius = 50m`).
  - Category: Exact match (1.0), compatible taxonomy (0.5), unrelated (0.0).
  - Semantic Embeddings: Powered by Gemini (`gemini-embedding-001`), cosine similarity between 3072-dimension vectors.
  - Recency: Temporal decay based on elapsed hours between observations.
  - Duplicate Decision: Combined score `>= 0.80` qualifies as duplicate; `0.65–0.79` possible duplicate; `< 0.65` distinct.
- **Cluster Orchestration (`src/services/clustering.ts` & `/api/process-clustering`):**
  - Triggered post-submission, idempotent evaluation.
  - Updates cluster report count and recalculates consolidated priority.
  - Deduplicates public map pins so only 1 canonical marker renders for a cluster, featuring report count badges and priority metrics.
- **Automated Validation (`tests/priority-and-duplicate.test.mjs`):**
  - 10/10 unit tests passing covering mild defects, critical hazards, logarithmic diminishing returns, duplicate thresholds, spatial bounds, temporal decay, and vector cosine precision.

---

## 6. Phase 8 Architecture: Admin Command Center
- **Role-Based Authorization & Security:**
  - Role hierarchy: `citizen` (default) vs `admin`.
  - Stored in Firestore document `users/{uid}.role`.
  - Self-promotion blocked in `firestore.rules` (`request.resource.data.role == resource.data.role` on update unless `isAdmin()`).
  - Real-time role subscription in `src/context/AuthContext.tsx` via `onSnapshot(doc(db, 'users', uid))` exposing `isAdmin: boolean`.
  - Route Guard: `src/components/admin/AdminGuard.tsx` renders loading skeleton, authentication prompt for unauthenticated users, 403 Forbidden with UID for citizens, and admin content for verified operators.
  - Admin Role Elevation: Secure server-side route `/api/admin/set-role` protected by `ADMIN_SETUP_SECRET` and CLI tool `scripts/set-admin.mjs`.
- **Incident Status Transition Graph:**
  - Status lifecycle: `reported` -> `acknowledged` -> `in_progress` -> `resolved`.
  - Alternative path: `reported` / `acknowledged` / `in_progress` -> `rejected`.
  - Reopening: `resolved` -> `in_progress`.
  - Reinstatement: `rejected` -> `reported`.
  - Enforced in `src/types/admin.ts` (`ALLOWED_STATUS_TRANSITIONS`), `src/services/admin.ts` (`updateIncidentStatus`), and confirmed via interactive confirmation dialog (`StatusActions.tsx`).
  - System fields (`priority`, `duplicateAnalysis`, `clusterId`, `reporter`) are strictly immutable during status updates.
- **Admin Data Service (`src/services/admin.ts`):**
  - Real-time Firestore subscriptions for incidents with client-side multi-field filtering and sorting.
  - Priority Queue subscriber strictly ordered by `priority.score DESC`, `severity DESC`, `createdAt ASC`.
  - Cluster map subscriber streaming `incidentClusters`.
  - Firestore aggregation of live metrics for 6 core KPI cards.
- **Admin Command Center Routes:**
  - `/admin`: Command Center Overview with 6 live KPI cards, Top Priority feed, and Chronological Intake stream.
  - `/admin/incidents`: Incident Management Table with multi-facet filters (search, category, priority, status, hazard, sorting) and row inspection modal.
  - `/admin/priority`: Ranked triage queue consuming stored Phase 7 priority scores.
  - `/admin/map`: Tactical cluster map rendering consolidated markers with report count glyphs and status colors.
  - `/admin/analytics`: Municipal analytics with lightweight SVG/CSS progress bars and distributions.
- **Automated Validation (`tests/admin-status-and-auth.test.mjs`):**
  - 10/10 unit tests passing for valid/invalid transitions, client role defaults, system field immutability, and KPI/analytics mathematics.
