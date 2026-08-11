# NutriMatch — Module Development Log

> A narrative record of how NutriMatch was built, module by module. Written to support project walkthroughs, demos, and pitch presentations.

---

## Module 1: Database Schema

**What it does:** Defines the relational data model for NutriMatch — villages, deficiency records, food recommendations, NGO activities, donor pledges, and users.

**Why it exists:** All other modules depend on a shared data contract (PRD: Data Model section). Having an explicit schema ensures consistency between the frontend mock layer and any future PostgreSQL production deployment.

**How it works technically:**
- Schema lives in `database/schema.sql` (PostgreSQL + UUID extension)
- 6 tables: `users`, `villages`, `deficiency_records`, `food_recommendations`, `ngo_activities`, `donor_pledges`
- `deficiency_type` and `severity` use CHECK constraints (enums) for data integrity
- Indexed on village_id, ngo_id, donor_id for common query patterns
- Sequelize ORM models are the intended production layer; for demo, the frontend imports from `mockData.js` directly

**Key files:** `database/schema.sql`

**Assumptions / Simplifications:**
- No actual database connection in the demo — all data is in-memory via `mockData.js`
- UUID generation via `uuid-ossp` extension (PostgreSQL 14+)

---

## Module 2: Mock Data Layer

**What it does:** Provides 8 sample villages with NFHS-5-style deficiency prevalence data, 16 food recommendations, NGO activities, and donor pledges — all structured to mirror the DB schema.

**Why it exists:** Enables the frontend to function without a live database, making local development and hackathon demos fast and dependency-free (PRD: "Use placeholder/sample data structured like NFHS-5 district-level statistics").

**How it works technically:**
- `src/data/mockData.js` exports `VILLAGES`, `DEFICIENCY_RECORDS`, `FOOD_RECOMMENDATIONS`, `NGO_ACTIVITIES`, `DONOR_PLEDGES`, `USERS`
- Also exports `computeScore(rec)` and `getTopRecommendations(villageId)` — the recommendation engine functions used directly in the frontend
- Villages span Maharashtra, Rajasthan, UP, and MP with realistic lat/lng for the Leaflet map
- Deficiency prevalence figures are modelled after NFHS-5 district-level statistics for high-burden districts

**Key files:** `src/data/mockData.js`

**Assumptions:** Data is hardcoded for demo; a real deployment would seed from CSV exports of NFHS-5 district reports.

---

## Module 3: Recommendation Engine

**What it does:** Given a village's deficiency profile, computes and ranks the top 3 food/intervention recommendations using a weighted composite score.

**Why it exists:** PRD requirement: "given a village's deficiency profile, output top 3 ranked food/intervention suggestions using a weighted scoring formula."

**How it works technically:**
- Scoring formula: `score = (nutrient_match × 0.40) + (local_availability × 0.25) + (cost × 0.25) + (shelf_life × 0.10)`
- Weights reflect that nutritional efficacy (0.40) is most important, followed equally by local accessibility and cost (0.25 each), with shelf life as a secondary factor (0.10)
- A `severityWeight` multiplier (1.2 for severe, 1.0 for moderate, 0.8 for mild) scales the score so severe deficiencies surface higher-ranked recommendations even when two deficiency types are tied on base score
- Results are sorted descending and sliced to top 3
- Each recommendation carries a `citation` string linking to WHO/ICMR/FSSAI/UNICEF sources

**Key files:** `src/data/mockData.js` (functions `computeScore`, `getTopRecommendations`), `backend/routes/recommendations.js`

**Assumptions:** Weights are manually calibrated for this prototype. A production system would run regression against observed intervention outcomes.

---

## Module 4: Design System & Global Styles

**What it does:** Establishes the visual language of NutriMatch — warm saffron/teal palette, typography, severity color system, dark mode palette, CSS utility classes.

**Why it exists:** PRD UI/UX spec: "feel trustworthy, calm, and human," "colorblind accessible," "warm and simple for donors, data-rich for NGO staff."

**How it works technically:**
- `tailwind.config.js` defines custom color tokens: `saffron` (primary brand), `teal` (secondary/success), `warm` (neutral), `severity` (mild/moderate/severe mapped to amber/orange/red), `deficiency` (iron/vitamin_a/zinc/iodine/folate each with a distinct hue)
- `src/index.css` adds Tailwind directives, custom `severity-pill` component class, `card-hover` transition, `skeleton` loader, and `gradient-text` utility
- Google Fonts: `Inter` (body) + `Outfit` (display/headings) loaded in `index.html`
- Dark mode uses Tailwind `darkMode: 'class'` — the `dark` class is toggled on `<html>` by ThemeContext

**Key files:** `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `index.html`

**Assumptions:** Dark mode palette is hand-tuned for contrast; not an automatic inversion.

---

## Module 5: i18n (Internationalization)

**What it does:** Enables the UI to display in English, Hindi, and Marathi with a single language switcher in the navigation bar. Numbers, dates, and currency adapt to locale.

**Why it exists:** PRD: "Implement an i18n system with language switcher… Hindi and Marathi for the NGO/field-facing screens first, since that's where non-English-fluent users are most likely."

**How it works technically:**
- Three JSON translation files: `src/i18n/en.json`, `hi.json`, `mr.json` — all sharing the same key structure (namespaced: `nav.*`, `common.*`, `deficiency.*`, `dashboard.*`, `village.*`, `recommendation.*`, `ngo.*`, `donor.*`, `auth.*`)
- `LanguageContext.jsx` provides a `t(key)` hook that splits dotted keys and walks the active language object
- Numbers/dates/currency use `Intl.NumberFormat` and `Intl.DateTimeFormat` with locale strings (`en-IN`, `hi-IN`, `mr-IN`)
- Language switcher is in `Navbar.jsx` — clicking shows a dropdown of 3 language options with flag emoji
- Village/place names remain in English (Latin script) as they appear in official records

**Key files:** `src/i18n/en.json`, `src/i18n/hi.json`, `src/i18n/mr.json`, `src/context/LanguageContext.jsx`, `src/components/Navbar.jsx`

**Assumptions:** Translation was done manually for prototype; production would use a professional translation service. Marathi and Hindi cover all screen labels but not recommendation `description` text (English kept for accuracy).

---

## Module 6: Dark Mode

**What it does:** Provides a full dark mode toggle accessible from the navigation bar, with a redesigned dark palette ensuring heatmaps, charts, severity badges, and cards remain legible.

**Why it exists:** PRD: "Implement a full dark mode toggle… don't just invert colors, redesign the palette for dark mode contrast."

**How it works technically:**
- `ThemeContext.jsx` stores `dark: boolean` in React state (app-level, not localStorage per spec)
- Toggling adds/removes the `dark` class on `document.documentElement`
- Tailwind `dark:` variants are applied throughout all components (cards, badges, charts, inputs, modals)
- Severity colours in dark mode shift slightly lighter (e.g., `dark:text-red-300` instead of `text-red-800`) to maintain contrast on dark backgrounds
- Chart colours remain unchanged (they're baked into Recharts `fill`/`stroke` props), but chart backgrounds and grid lines use Tailwind dark variants
- The toggle button shows Sun/Moon icon from `lucide-react`

**Key files:** `src/context/ThemeContext.jsx`, `src/components/Navbar.jsx` (toggle button), all page/component files (dark: variants)

**Assumptions:** Dark mode state is session-only (resets on refresh) as specified in the PRD ("persisted via app state, not browser storage").

---

## Module 7: Auth & Role-Based Access

**What it does:** Provides login/registration with three roles (NGO, Individual Donor, Program Manager) and gates the NGO Portal page behind authentication.

**Why it exists:** PRD: "Role-based accounts: NGO, Individual Donor, Program Manager." Different roles see different navigation items and pages.

**How it works technically:**
- `AuthContext.jsx` provides `login(email, password)`, `register(name, email, role, org)`, `logout()`, and `user` state
- For the demo, login matches against `USERS` in `mockData.js` by email (password not checked — any password works)
- Role guards are implemented inline: the NGO Dashboard checks `if (!user)` and shows a login prompt with redirect
- The Navbar conditionally shows the "NGO Portal" link only for `ngo` and `program_manager` roles
- The backend `backend/routes/auth.js` implements real JWT auth with bcrypt password hashing for production use
- Demo accounts are listed on the Login page for quick access

**Key files:** `src/context/AuthContext.jsx`, `src/pages/Login.jsx`, `src/components/Navbar.jsx`, `backend/routes/auth.js`

**Assumptions:** JWT auth is fully implemented in backend but frontend uses a simplified mock for demo speed. Production would wire frontend to `/api/auth/login` and store JWT in memory.

---

## Module 8: Deficiency Dashboard

**What it does:** The main landing page showing all tracked villages with deficiency profiles, a stacked bar chart heatmap of prevalence data, summary statistics, and list/map view toggling.

**Why it exists:** PRD Core Feature 1: "village/district cards + heatmap showing prevalence of 5 key deficiencies, filterable by region and severity."

**How it works technically:**
- `Dashboard.jsx` aggregates stats (total children, active NGOs, monthly pledges) from mock data
- Stacked `BarChart` (Recharts) shows each village on the X axis with bars for each of the 5 deficiency types — colour-coded per `DEFICIENCY_COLORS`
- Filters: state dropdown and severity dropdown; `useMemo` re-filters `VILLAGES` on change
- View toggle: `list` renders a 4-column grid of `VillageCard`; `map` renders `MapView` (Leaflet)
- Empty state shown when no villages match filters; skeleton loaders for the loading state
- Custom `CustomTooltip` component gives accessible chart hover context

**Key files:** `src/pages/Dashboard.jsx`, `src/components/VillageCard.jsx`, `src/components/MapView.jsx`

**Assumptions:** Data is loaded synchronously from mock layer; a real implementation would fetch from `/api/villages` with a loading spinner during the API call.

---

## Module 9: Village Detail & Recommendation View

**What it does:** Deep-dive page for a single village: deficiency profile, radar chart, top 3 ranked recommendations with score breakdowns and citations, NGO activity log, donor pledges, and overlap alert.

**Why it exists:** PRD Core Features 1 + 2 + 3: deficiency profile display, ranked recommendations with citation, NGO overlap detection flag.

**How it works technically:**
- `VillageDetail.jsx` reads `useParams().id` and looks up village, deficiencies, recommendations, activities, pledges from mock data
- `getTopRecommendations(villageId)` from `mockData.js` runs the scoring engine and returns top 3
- `RadarChart` (Recharts) visualises all 5 deficiency prevalence values for the village
- Overlap detection: checks `activeActivities` for multiple records with the same `deficiency_addressed` value; renders an `AlertTriangle` banner if detected
- `RecommendationCard` shows rank badge (#1/#2/#3), food name, deficiency type, plain-language description, 4 score bars, citation block, and "Pledge Toward This" link

**Key files:** `src/pages/VillageDetail.jsx`, `src/components/RecommendationCard.jsx`, `src/components/DeficiencyBadge.jsx`

**Assumptions:** Overlap detection uses same-`deficiency_addressed` as the overlap criterion; production would also check `item_distributed` semantic similarity.

---

## Module 10: NGO Coordination Layer

**What it does:** A dashboard for NGO users to view their active village interventions, log new activities, mark interventions complete, and see real-time overlap alerts across all active NGOs.

**Why it exists:** PRD Core Feature 3: "NGO accounts can log active villages and what they're distributing; system flags when another NGO/donor is already active in the same village with overlapping aid."

**How it works technically:**
- `NgoDashboard.jsx` maintains local `activities` state (seeded from mock data)
- Overlap detection runs on every render: groups `allActiveActivities` by `${village_id}-${deficiency_addressed}` key; any group with >1 entry is flagged
- "Log Activity" button opens a modal form with village selector, item field, deficiency type, date, and notes
- Submitting adds a new activity to state (simulated POST; would call `/api/activities` in production)
- "Mark Complete" sets activity status to `completed` with today's end date
- Auth guard: shows a friendly login prompt (not a redirect) if user is not logged in

**Key files:** `src/pages/NgoDashboard.jsx`, `backend/routes/activities.js`

**Assumptions:** Overlap detection is in-memory; production would query the database for all active activities across all NGOs.

---

## Module 11: Donor Flow

**What it does:** A 3-step pledging experience for individual donors: browse villages by need → choose a recommendation to support → pledge amount or item → receive an impact summary.

**Why it exists:** PRD Core Feature 4: "individual users can browse villages by need, see why a recommendation exists, and pledge food or funds toward it; receive a simple post-pledge impact summary."

**How it works technically:**
- `DonorBrowse.jsx`: searchable, filterable village list optimised for donors — warm teal hero, urgency colour bar (red/orange/amber by severity), deficiency dots, "~X children affected" estimate, direct Pledge button
- `PledgeFlow.jsx`: 3-step form with progress bar
  - Step 1: choose which recommendation to fund (shows top 3 ranked recs for the village)
  - Step 2: choose money (INR, with quick-select buttons: ₹500/1000/2500/5000) or item (text field); guest-pledge allowed with login nudge
  - Step 3: impact summary card — estimated children helped (formula: `(amount / 250) × 30`), village, recommendation, amount formatted with `Intl`
- No payment gateway — pledge is simulated (mocked POST); production would integrate Razorpay/PayU

**Key files:** `src/pages/DonorBrowse.jsx`, `src/pages/PledgeFlow.jsx`, `backend/routes/pledges.js`

**Assumptions:** Payment is fully mocked. Impact estimate (`children helped`) uses a rough proxy formula for demo purposes.

---

## Module 12: Map View (Leaflet)

**What it does:** An interactive map showing all tracked villages as circle markers, sized by deficiency prevalence and coloured by worst severity, with popup detail on click.

**Why it exists:** PRD: "heatmap showing prevalence of 5 key deficiencies" — the Leaflet map provides geographic context for regional deficiency patterns.

**How it works technically:**
- `MapView.jsx` dynamically imports Leaflet to avoid SSR issues
- `L.circleMarker` radius scales with `maxPrevalence / 3`, clamped to 12–28px
- Marker colour set by `getVillageSeverityColor()` — checks deficiency records for `severe` → `#c0392b`, `moderate` → `#e06c2e`, else `#f0ab3f`
- OpenStreetMap tiles with standard attribution
- Popup HTML shows village name, district, and all deficiency records with prevalence
- A legend in the bottom-left explains colour coding + circle-size semantics

**Key files:** `src/components/MapView.jsx`

**Assumptions:** Leaflet CSS loaded via CDN in `index.html`; no tile server needed (public OSM). Map state (zoom/centre) resets on remount.

---

*This log was compiled at the end of the build phase. Modules 1–5 form the infrastructure layer; Modules 6–12 are the feature layer. Build order was chosen to enable each feature module to import from the data and infrastructure layers below it.*
