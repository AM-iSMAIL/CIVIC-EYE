<div align="center">

# 🏙️ CivicEye

### AI-Powered Civic Issue Reporting & City Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-civic--eye--two.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://civic-eye-two.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-f97316?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285f4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

> **"Report civic problems. Let AI understand them. Help build a better city."**

CivicEye bridges citizens and municipal departments through automated visual AI, real-time geospatial dispatch, and a comprehensive operations command center — all in a single platform.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [How It Works](#-how-it-works)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Role-Based Access Control](#-role-based-access-control)
- [AI Pipeline](#-ai-pipeline)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Admin Setup](#-admin-setup)
- [Deployment](#-deployment)

---

## 🌍 Overview

CivicEye is a full-stack civic intelligence platform built to modernize how cities detect and resolve infrastructure problems. Citizens report issues by photographing them — Google Gemini AI then classifies the damage, estimates hazard severity, and clusters duplicate reports. Municipal administrators manage the entire incident lifecycle through a dedicated Command Center with live Firestore subscriptions, priority queues, and geospatial maps.

### The Problem It Solves

- **Citizens** lack an easy, structured way to report civic issues with context
- **Municipal teams** receive unstructured complaints with no location, category, or severity data  
- **Duplicate reports** waste investigator time on the same incident
- **Response transparency** is almost always zero — citizens never know if their report was acted on

CivicEye eliminates all of these gaps.

---

## 🔗 Live Demo

| Environment | URL |
|-------------|-----|
| **Production** | https://civic-eye-two.vercel.app |
| **GitHub Repository** | https://github.com/AM-iSMAIL/CIVIC-EYE |

---

## ⚙️ How It Works

### Citizen Flow

```
1. CITIZEN opens CivicEye → sees AI splash screen → signs in with Google
2. CITIZEN taps "Report Issue" → browser activates rear-facing camera
3. CITIZEN captures photo → browser simultaneously captures GPS coordinates
4. GEMINI AI analyzes the photo → returns category, severity (1-10), hazard level,
   affected user groups, confidence score, and damage rationale
5. CITIZEN reviews AI assessment, optionally overrides category
6. CITIZEN submits → incident saved to Firestore with full metadata
7. DUPLICATE DETECTION ENGINE checks GPS (50m radius), category match,
   and semantic embedding similarity against existing reports
8. If duplicate: report clusters with existing incident, updates priority score
   If new: creates fresh incident cluster with canonical marker
9. PUBLIC MAP immediately shows the incident marker (sanitized, no PII)
10. CITIZEN tracks progress via My Reports & Notifications pages
```

### Admin Flow

```
1. ADMIN signs in → role verified from Firestore users/{uid}.role
2. ADMIN sees dedicated Command Center (separate nav, no citizen chrome)
3. ADMIN views live KPI dashboard: total incidents, critical count, resolution rate
4. ADMIN manages Incident Queue: filter by category, priority, status, hazard
5. ADMIN opens incident → inspects AI analysis, GPS location, photo evidence
6. ADMIN transitions status: reported → acknowledged → in_progress → resolved
7. ADMIN views Priority Queue: incidents ranked by composite score (0-100)
8. ADMIN explores Tactical Map: cluster markers with report count badges
9. ADMIN reviews Analytics: category distributions, severity heatmaps, resolution metrics
```

---

## ✨ Features

### 🔭 For Citizens
| Feature | Description |
|---------|-------------|
| **AI Splash Screen** | 60fps cinematic intro with geometric eye animation on first visit |
| **Google Sign-In** | Firebase Auth with automatic Firestore profile sync |
| **Camera Capture** | Native `getUserMedia` — mobile rear-facing camera prioritized |
| **GPS Geolocation** | High-accuracy coordinates (±Xm readout, staleness detection) |
| **Gemini AI Triage** | Real-time photo analysis: category, severity, hazard, confidence |
| **Incident Submission** | Firestore write with dual-collection privacy model |
| **My Reports** | Real-time list of personal submissions with status tracking |
| **Notifications** | Live status feed: Submitted → Acknowledged → In Progress → Resolved |
| **Civic Map** | Interactive Google Maps with live incident markers and filters |

### 🛡️ For Admins
| Feature | Description |
|---------|-------------|
| **Command Center Overview** | 6 live KPI cards (total, critical, in-progress, resolved, priority queue size, resolution rate) |
| **Incident Queue** | Multi-facet filters: search, category, priority tier, status, hazard level, sort order |
| **Incident Detail Modal** | Full AI analysis, GPS map embed, status history, photo preview |
| **Status Transitions** | Enforced lifecycle graph with confirmation dialogs |
| **Priority Queue** | Ranked triage feed sorted by composite priority score (DESC) |
| **Tactical Map** | Cluster markers with report count glyphs and status color coding |
| **Municipal Analytics** | SVG/CSS progress bars, category breakdowns, severity distributions |

---

## 🛠️ Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16 (App Router) | Full-stack React framework with server components |
| **TypeScript** | 5 | End-to-end type safety |
| **Tailwind CSS** | 4 | Utility-first styling via `@tailwindcss/postcss` |
| **Lucide React** | Latest | Vector icon library (zero raw emoji policy) |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Firebase Authentication** | Google Sign-In, session management |
| **Firebase Firestore** | Real-time NoSQL database for incidents, users, clusters |
| **Firebase Cloud Storage** | (configured, photo storage future phase) |
| **Next.js API Routes** | Server-side endpoints for AI, admin actions, clustering |

### AI & Intelligence
| Technology | Purpose |
|------------|---------|
| **Google Gemini 2.5 Flash** | Multimodal vision: photo classification, severity rating, damage rationale |
| **Gemini Embedding 001** | 3072-dimension semantic vectors for duplicate detection |
| **Zod** | Runtime validation of AI response schema |

### Maps & Geolocation
| Technology | Purpose |
|------------|---------|
| **Google Maps JavaScript API** | Interactive city map with `AdvancedMarkerElement` |
| **`@googlemaps/js-api-loader`** | Async Maps SDK loader |
| **Browser Geolocation API** | High-accuracy GPS coordinates (`enableHighAccuracy: true`) |
| **`geofire-common`** | Haversine distance calculation for duplicate detection (50m radius) |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Vercel** | Production hosting with edge functions |
| **GitHub** | Source control and CI/CD trigger |

---

## 🏗️ Architecture

### Collection Model

```
Firestore
├── users/{uid}                    ← Auth profiles + role (citizen | admin)
├── incidents/{incidentId}         ← Private reports (reporter PII, GPS, AI analysis)
├── publicIncidents/{incidentId}   ← Sanitized map data (NO reporter fields)
└── incidentClusters/{clusterId}   ← Aggregated duplicate clusters + priority scores
```

### Dual-Collection Privacy Model

Every incident submission performs an **atomic batch write**:
1. `incidents/{id}` — full private record including reporter UID, coordinates, AI output
2. `publicIncidents/{id}` — stripped version for the public map (category, severity, status, location only)

Firestore Security Rules enforce:
- `publicIncidents` → public **read**, authenticated write only via server
- `incidents` → authenticated **owner-only** read, server writes only
- No citizen can read another citizen's incident

### Priority Scoring Engine (`src/services/priority.ts`)

```
Priority Score (0–100) = 
  Severity Weight     (30%) × severity / 10
  Hazard Weight       (25%) × hazard flag
  Affected Groups     (15%) × affected group count  
  Report Count        (20%) × log₂(count) diminishing returns
  Recency             (10%) × time decay factor

Tiers:
  0–24   → Low
  25–49  → Medium
  50–74  → High
  75–100 → Critical
```

### Duplicate Detection Pipeline (`src/services/duplicateDetection.ts`)

```
Combined Score = 
  GPS Distance   (Haversine, radius = 50m)
  Category Match (exact = 1.0, compatible = 0.5, unrelated = 0.0)
  Semantic Sim   (Gemini embedding cosine similarity, 3072-dim vectors)
  Recency Decay  (temporal weight based on hours between reports)

≥ 0.80 → Duplicate   (cluster with existing)
0.65–0.79 → Possible Duplicate
< 0.65  → New Incident
```

### Status Lifecycle

```
reported ──► acknowledged ──► in_progress ──► resolved
    │               │               │
    └───────────────┴───────────────┴──────► rejected
                                                │
resolved ◄──────────────── in_progress ◄────────┘ (reinstatement)
```

---

## 🔐 Role-Based Access Control

CivicEye implements **strict role-based routing** — roles are enforced at the data, component, and routing layer simultaneously.

### Role Hierarchy

| Role | Description | Default |
|------|-------------|---------|
| `citizen` | Standard user — can report issues, view own reports | ✅ Default on sign-up |
| `admin` | Municipal operator — full Command Center access | Manually elevated via CLI |

### Enforcement Layers

| Layer | Mechanism |
|-------|-----------|
| **Firestore Rules** | `users/{uid}.role` checked server-side; citizens cannot self-promote |
| **React Context** | `AuthContext` exposes `isAdmin: boolean` via real-time `onSnapshot` |
| **Route Guard — Admin** | `AdminGuard` → `router.replace('/')` for citizens (no 403 card) |
| **Route Guard — Citizen** | `CitizenGuard` → `router.replace('/admin')` for admins |
| **Navbar** | Citizens see `citizenNavItems` only; Admin Hub link never appears |
| **App Shell** | `RootShell` suppresses Navbar/Footer entirely on `/admin/*` routes |

### Navigation Matrix

| User | Navbar Links |
|------|-------------|
| **Unauthenticated** | Home, Report Issue, Civic Map + Sign In |
| **Citizen** | Home, Report Issue, Civic Map, My Reports, Notifications + Sign Out |
| **Admin** | *(No citizen navbar)* Admin sidebar: Overview, Incident Queue, Civic Map, Analytics, Admin Hub |

### Route Authorization

```
Route            Unauth          Citizen         Admin
/                ✅ public        ✅ full          ✅ full
/report          → /login         ✅ full          ✅ full
/map             ✅ public        ✅ full          ✅ full
/my-reports      → /login         ✅ full          → /admin
/notifications   → /login         ✅ full          → /admin
/admin/*         sign-in prompt   → / (redirect)   ✅ admin shell
```

---

## 🤖 AI Pipeline

### Image Analysis (`/api/analyze-incident`)

```
POST /api/analyze-incident
Content-Type: multipart/form-data
Body: { image: File (≤15MB, JPEG/PNG/WebP) }

Response:
{
  category: "pothole" | "garbage" | "blocked_drain" | "streetlight" |
            "fallen_tree" | "water_leak" | "graffiti" | "noise" |
            "abandoned_vehicle" | "other",
  severity: 1–10,
  confidence: 0.0–1.0,
  hazardLevel: "none" | "low" | "medium" | "high" | "critical",
  affectedGroups: ["pedestrians", "drivers", "cyclists", ...],
  tags: string[],
  damageRationale: string,
  immediateActionRequired: boolean
}
```

**Processing steps:**
1. Validate file format and size (≤15MB)
2. Send to `gemini-2.5-flash` with structured JSON schema enforcement
3. Zod runtime validation against `CivicIncidentAnalysisSchema`
4. Return validated object — or intelligent heuristic fallback if API unavailable

### Semantic Duplicate Detection (`/api/process-clustering`)

```
POST /api/process-clustering
Body: { incidentId: string }

Steps:
1. Load new incident from Firestore
2. Fetch nearby incidents (GPS bounding box)
3. Generate Gemini embedding for description text
4. Compute combined duplicate score per candidate
5. If duplicate (≥0.80): merge into cluster, update priority
6. If new: create incidentClusters/{id} with canonical marker
7. Dedup public map pins (1 cluster = 1 marker)
```

---

## 🗄️ Database Schema

### `incidents/{incidentId}`
```typescript
{
  reporter: {
    uid: string
    displayName: string | null
    email: string | null
  }
  category: IssueCategory
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  status: "reported" | "acknowledged" | "in_progress" | "resolved" | "rejected"
  location: {
    latitude: number
    longitude: number
    accuracy: number         // metres
    capturedAt: Timestamp
  }
  aiAnalysis: {
    category: string
    severity: number
    confidence: number
    hazardLevel: string
    affectedGroups: string[]
    tags: string[]
    damageRationale: string
    immediateActionRequired: boolean
  }
  userConfirmation: {
    confirmed: boolean
    categoryOverride?: string
  }
  priority: {
    score: number            // 0-100
    tier: "low" | "medium" | "high" | "critical"
  }
  clusterId?: string
  duplicateAnalysis?: object
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `users/{uid}`
```typescript
{
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  role: "citizen" | "admin"
  createdAt: Timestamp
  lastLoginAt: Timestamp
}
```

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home (splash + landing)
│   ├── layout.tsx                # Root layout → RootShell
│   ├── login/page.tsx            # Identity portal
│   ├── report/page.tsx           # Citizen reporting workflow (4 steps)
│   ├── map/page.tsx              # Public civic map
│   ├── my-reports/page.tsx       # Citizen: own report history
│   ├── notifications/page.tsx    # Citizen: status update feed
│   └── admin/
│       ├── layout.tsx            # Admin shell (AdminLayout)
│       ├── page.tsx              # Command Center overview
│       ├── incidents/page.tsx    # Incident management table
│       ├── priority/page.tsx     # Priority triage queue
│       ├── map/page.tsx          # Tactical cluster map
│       └── analytics/page.tsx    # Municipal analytics
│
├── components/
│   ├── common/                   # Shared UI components
│   │   ├── Navbar.tsx            # Citizen-only navigation (citizenNavItems)
│   │   ├── RootShell.tsx         # Suppresses Navbar/Footer on /admin/*
│   │   ├── Footer.tsx            # Global footer
│   │   ├── Button.tsx            # Polymorphic button (primary/outline/ghost)
│   │   ├── Card.tsx              # Glass-effect card
│   │   ├── StatusBadge.tsx       # Status & severity badges
│   │   ├── IncidentCard.tsx      # Incident summary card
│   │   ├── EmptyState.tsx        # Zero-data placeholder
│   │   └── PageHeader.tsx        # Page title + breadcrumb
│   ├── admin/                    # Admin-only components
│   │   ├── AdminGuard.tsx        # Route guard → redirects citizens
│   │   ├── AdminLayout.tsx       # Admin shell with sidebar
│   │   ├── AdminSidebar.tsx      # Admin nav (Overview, Incident Queue, etc.)
│   │   ├── AdminHeader.tsx       # Page header with breadcrumbs + refresh
│   │   ├── DashboardStats.tsx    # KPI cards
│   │   ├── IncidentTable.tsx     # Filterable incident table
│   │   ├── IncidentFilters.tsx   # Multi-facet filter controls
│   │   ├── IncidentDetailModal.tsx # Full incident inspection modal
│   │   ├── StatusActions.tsx     # Status transition buttons + confirmation
│   │   ├── PriorityQueue.tsx     # Ranked priority feed
│   │   ├── AdminMap.tsx          # Tactical cluster map
│   │   └── AnalyticsCharts.tsx   # SVG/CSS analytics
│   ├── auth/
│   │   └── CitizenGuard.tsx      # Route guard → redirects admins
│   ├── report/                   # Reporting workflow components
│   │   ├── ReportProgress.tsx    # Step indicator
│   │   ├── CameraCapture.tsx     # getUserMedia camera UI
│   │   ├── LocationCapture.tsx   # GPS capture UI
│   │   ├── PhotoPreview.tsx      # Captured photo review
│   │   ├── AiAnalysisCard.tsx    # Gemini AI result display
│   │   ├── ReportSummaryCard.tsx # Step 4 review before submit
│   │   └── ReportSuccessCard.tsx # Post-submission confirmation
│   ├── map/
│   │   ├── CivicGoogleMap.tsx    # Google Maps with AdvancedMarkerElement
│   │   ├── MapFilters.tsx        # Category/severity/status filters
│   │   └── IncidentMapCard.tsx   # Marker click detail panel
│   └── splash/
│       ├── CivicEyeSplashScreen.tsx # Cinematic intro animation
│       └── CivicEyeLogo.tsx      # SVG geometric eye logo
│
├── context/
│   └── AuthContext.tsx           # Firebase Auth + role + isAdmin
│
├── hooks/
│   ├── useCamera.ts              # getUserMedia video stream hook
│   └── useGeolocation.ts         # Browser GPS hook with accuracy readout
│
├── services/
│   ├── firebase.ts               # Firebase singleton initialization
│   ├── auth.ts                   # signInWithGoogle, signOut, mapFirebaseUser
│   ├── firestore.ts              # createIncident, getIncidents, subscribe*
│   ├── storage.ts                # uploadIncidentPhoto (Firebase Storage)
│   ├── gemini.ts                 # analyzeCivicIncident (server-side only)
│   ├── admin.ts                  # Admin Firestore subscriptions + status updates
│   ├── duplicateDetection.ts     # Multi-signal duplicate scoring
│   ├── clustering.ts             # Cluster orchestration
│   └── priority.ts               # Priority score calculation engine
│
├── types/
│   ├── user.ts                   # CivicUser, FirestoreUserDoc, UserRole
│   ├── incident.ts               # IncidentDocument, IssueStatus, IssueCategory
│   ├── report.ts                 # ReportDraft (client-side memory model)
│   ├── analysis.ts               # CivicIncidentAnalysisSchema (Zod)
│   └── admin.ts                  # AdminStats, ALLOWED_STATUS_TRANSITIONS
│
├── config/
│   ├── site.ts                   # citizenNavItems, adminNavItems, categories, severities
│   ├── env.ts                    # Type-safe environment variable accessors
│   └── ai.ts                     # GEMINI_MODEL constant
│
└── app/api/
    ├── analyze-incident/route.ts  # POST: Gemini image analysis
    ├── process-clustering/route.ts # POST: duplicate detection + clustering
    └── admin/set-role/route.ts    # POST: secure role elevation (ADMIN_SETUP_SECRET)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A Firebase project with Firestore, Authentication (Google provider), and Storage enabled
- Google Cloud project with Maps JavaScript API and Gemini API enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/AM-iSMAIL/CIVIC-EYE.git
cd CIVIC-EYE

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Configure Environment Variables

Fill in `.env.local` — see [Environment Variables](#-environment-variables) below.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run Tests

```bash
# Priority scoring & duplicate detection unit tests
node tests/priority-and-duplicate.test.mjs

# Admin status transitions & auth unit tests
node tests/admin-status-and-auth.test.mjs
```

---

## 🔑 Environment Variables

Create `.env.local` from `.env.example`:

```bash
# ─── Firebase (Client-side) ──────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ─── Google Maps (Client-side) ───────────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# ─── Gemini AI (Server-side only — NEVER expose via NEXT_PUBLIC_) ────
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash          # optional override

# ─── Admin Setup (Server-side) ───────────────────────────────────────
ADMIN_SETUP_SECRET=your-secure-random-secret
```

---

## 🛡️ Admin Setup

To elevate a user to `admin` role:

```bash
# Using the CLI script
node scripts/set-admin.mjs <USER_EMAIL> <ADMIN_SETUP_SECRET>

# Or via the secure API endpoint
curl -X POST http://localhost:3000/api/admin/set-role \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "secret": "your-secure-secret"}'
```

The script updates `users/{uid}.role` to `"admin"` in Firestore. The role is read in real-time via `onSnapshot` — no re-login required.

**Security:** Firestore rules prevent citizens from self-promoting. The `set-role` API endpoint validates `ADMIN_SETUP_SECRET` server-side before any write.

---

## 🚢 Deployment

The app is deployed on **Vercel** with automatic CI/CD from the `main` branch.

### Deploy via Vercel CLI

```bash
# Production deploy
npx vercel --prod

# Or link and deploy
npx vercel link
npx vercel --prod
```

### Firestore Security Rules

Deploy the included security rules:

```bash
firebase deploy --only firestore:rules
```

### Environment Variables on Vercel

Set all variables from `.env.local` in your Vercel project dashboard under **Settings → Environment Variables**.

---

## 📊 Development Phases

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Next.js + TypeScript + Tailwind bootstrap, UI component library, core pages | ✅ Complete |
| 2 | Firebase Auth + Firestore user profile sync (Google Sign-In) | ✅ Complete |
| 3 | Real browser camera (`getUserMedia`) + GPS geolocation | ✅ Complete |
| 4 | Google Gemini multimodal vision AI triage integration | ✅ Complete |
| 5 | Real Firestore incident persistence with security rules | ✅ Complete |
| 6 | Google Maps visualization with live `AdvancedMarkerElement` incident markers | ✅ Complete |
| 7 | AI duplicate detection (GPS + semantic embeddings) + priority scoring engine | ✅ Complete |
| 8 | Admin Command Center (RBAC, live dashboard, incident queue, analytics) | ✅ Complete |
| 9 | Strict role-based UI separation (citizen nav vs admin nav, route guards) | ✅ Complete |

---

## 📄 License

MIT — feel free to fork, adapt, and build on top of CivicEye.

---

<div align="center">
Built with ❤️ using Next.js, Firebase, and Google Gemini AI
</div>
