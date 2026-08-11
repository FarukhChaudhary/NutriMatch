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

## Official Data Sources & Citations

NutriMatch integrates official public health surveys, food composition databases, and national nutrition guidelines:

### 1. District Deficiency Surveys (NFHS-5)
- **Source**: **National Family Health Survey (NFHS-5, 2019–2021)**
- **Publishing Authority**: Ministry of Health and Family Welfare (MoHFW), Govt. of India & International Institute for Population Sciences (IIPS), Mumbai.
- **Repository / Dataset**: Open IIPS District Factsheets & scraped dataset ([pratapvardhan/NFHS-5](https://github.com/pratapvardhan/NFHS-5)).
- **Key Indicators Tracked**:
  - *Children age 6-59 months who are anaemic (<11.0 g/dl)*
  - *Non-pregnant women age 15-49 years who are anaemic (<12.0 g/dl)*
  - *Children under 5 years who are stunted (height-for-age)*
  - *Children under 5 years who are severely wasted (weight-for-height)*
  - *Households consuming iodised salt (>15 ppm)*

### 2. Food Composition & Micronutrient Matrix (ICMR-NIN IFCT 2017)
- **Source**: **Indian Food Composition Tables (IFCT 2017)**
- **Publishing Institution**: National Institute of Nutrition (NIN), Indian Council of Medical Research (ICMR), Department of Health Research, MoHFW, Hyderabad.
- **Data Portal**: [ifct2017.github.io](https://ifct2017.github.io)
- **Key Food Composition Entries**:
  - `Code A012`: Sugarcane Jaggery (*Gur*) — Iron: 11.4 mg / 100g
  - `Code B004`: Masoor Dal (*Lens culinaris*) — Iron: 7.6 mg / 100g, Folate: 145 mcg / 100g
  - `Code D021`: Moringa Leaf (*Moringa oleifera*) — Iron: 28.2 mg / 100g, Vitamin A: 11,300 mcg / 100g
  - `Code D005`: Orange Carrot (*Daucus carota*) — Vitamin A (Beta-Carotene): 8,285 mcg / 100g
  - `Code H010`: White Sesame Seeds (*Til*) — Zinc: 7.8 mg / 100g, Iron: 14.6 mg / 100g

### 3. Food Fortification & Clinical Guidelines
- **FSSAI Fortification Standards**: Food Safety and Standards Authority of India ([fortification.fssai.gov.in](https://fortification.fssai.gov.in)) — *Double Fortified Salt (DFS)* & *Fortified Rice Kernels (FRK)*.
- **MoHFW WIFS / Anemia Mukt Bharat**: Weekly Iron and Folic Acid Supplementation Programme guidelines (60 mg elemental iron + 500 mcg Folic Acid).
- **World Health Organization (WHO)**: *Guideline on Micronutrient Fortification & Vitamin A / Zinc-ORS supplementation*.

## Module Log
See [`MODULE_LOG.md`](./MODULE_LOG.md) for a full development narrative suitable for project walkthroughs and pitches.

