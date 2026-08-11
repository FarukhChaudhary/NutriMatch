# NutriMatch 🌾

> A child nutrition deficiency mapping and aid coordination platform — connecting NGOs and donors to verified, localized needs.

## Quick Start

```bash
# Install frontend dependencies
npm install

# Start the frontend dev server (runs on port 3000)
npm run dev
```

## Demo Accounts
Log in at `/login` with any of these emails (any password works in demo mode):

| Email | Role |
|-------|------|
| `akanksha@ngo.org` | NGO / Field Staff |
| `smile@ngo.org` | NGO / Field Staff |
| `priya@govt.in` | Program Manager |
| `rahul@email.com` | Individual Donor |

## Features
- **Deficiency Dashboard** — 8 villages with NFHS-5-style data, stacked bar heatmap, list/map views
- **Recommendation Engine** — Weighted scoring (nutrient × 0.4 + availability × 0.25 + cost × 0.25 + shelf life × 0.1), top 3 per village with citations
- **NGO Coordination** — Activity log, overlap detection, mark complete
- **Donor Flow** — Village browser → 3-step pledge → impact summary
- **Dark Mode** — Full Tailwind dark theme, toggle in navbar
- **Multilingual** — English, Hindi (हिंदी), Marathi (मराठी) with locale-aware formatting
- **Role-based Auth** — NGO / Donor / Program Manager

## Tech Stack
- React 18 + Vite + Tailwind CSS
- Recharts (bar charts, radar charts)
- Leaflet / react-leaflet (village map)
- React Router v6
- lucide-react (icons)

## Backend (Optional)
```bash
cd backend
npm install
npm run dev   # runs on port 5000
```

## Data
All demo data is modelled after NFHS-5 (2019-21) district-level statistics for high-burden districts in Maharashtra, Rajasthan, UP, and MP.

## Module Log
See [`MODULE_LOG.md`](./MODULE_LOG.md) for a full development narrative suitable for project walkthroughs and pitches.
