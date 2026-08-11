# NutriMatch — Comprehensive Project Context & Implementation Overview 🌾

> **Platform Overview**: NutriMatch is an evidence-based child nutrition mapping and aid coordination platform designed to bridge the gap between rural child malnutrition statistics and targeted humanitarian aid. It enables NGOs, donors, and government program managers to view localized deficiency data, receive scientifically calculated food/intervention recommendations, detect duplicate aid distribution, and track pledges transparently.

---

## 1. Core Features Implemented

### 📊 A. Interactive Deficiency Dashboard
- **Dual Visualizations**: Seamless toggle between an interactive **Leaflet Map View** (pinpointing village coordinates across India) and a structured **List View**.
- **District Deficiency Heatmap**: Stacked bar visualization rendering multi-nutrient deficiency profiles (Iron, Vitamin A, Zinc, Iodine, Folate) across high-burden districts.
- **Dynamic Filtering**: Real-time filtering by **State** (Maharashtra, Rajasthan, Uttar Pradesh, Madhya Pradesh) and **Deficiency Severity** (Severe, Moderate, Mild).
- **Summary Metrics**: Real-time KPI counter tracking total villages monitored, children reached, active NGO interventions, and monthly donor pledges.

### 🧠 B. Weighted Recommendation Engine
- **Nutritional Scoring Algorithm**: Calculates an overall suitability score for localized food interventions using a multi-factor weighted formula:
  $$\text{Score} = (0.40 \times \text{Nutrient Match}) + (0.25 \times \text{Local Availability}) + (0.25 \times \text{Cost}) + (0.10 \times \text{Shelf Life})$$
  *(Weighted further by a 1.2× factor for severe deficiencies).*
- **Top 3 Interventions per Village**: Dynamically ranks the 3 best food recommendations tailored to a village's top micronutrient gaps.
- **Radar Charts & Score Breakdown**: Interactive visual representation of score metrics alongside scientific citations.

### 🤝 C. NGO Aid Coordination & Overlap Detection
- **Aid Distribution Logging**: Field staff can register new distribution activities (e.g. Fortified Rice, Vitamin A Capsules, IFA Tablets).
- **Smart Overlap Alerts**: Automatic detection algorithm that flags when two or more NGOs are distributing aid addressing the **same micronutrient deficiency in the same village**, preventing resource wastage and duplication.
- **Activity Status Tracker**: Ability to mark interventions as active or completed.

### 🎁 D. 3-Step Donor Pledge System
- **Need-Based Village Selection**: Donors browse villages filtered by urgency and deficiency profile.
- **Pledge Flow**:
  1. *Select Intervention*: Choose a recommended food/supplement item.
  2. *Choose Contribution Type*: Pledge monetary aid (in INR) or physical items.
  3. *Impact Confirmation*: Receive an instant calculated summary of how many children will benefit from the pledge.

### 🌐 E. Multilingual & Theme Engine
- **Full i18n Internationalization**: 100% translation coverage across **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** including menus, badges, food names, deficiency labels, and overlap alerts.
- **Dark Mode**: Complete Tailwind CSS dark theme with persistent navbar toggle.
- **Role-Based Authorization**: Switch contexts between **NGO Staff**, **Individual Donors**, and **Program Managers**.

---

## 2. Official Data Sources & Scientific Resources

All statistics, nutrient profiles, and medical guidelines used in NutriMatch are sourced directly from official Indian government surveys and scientific institutions:

| Resource / Entity | Source Authority | Data Provided & Usage |
| :--- | :--- | :--- |
| **NFHS-5 (2019–2021)** | Ministry of Health and Family Welfare (MoHFW), Govt. of India & IIPS Mumbai | District factsheets for Child Anemia (<11.0 g/dl), Women Anemia, Stunting, Wasting, Vitamin A coverage, and Iodized salt uptake across Washim, Nandurbar, Dholpur, Bahraich, Sheopur, Palghar, Barmer, and Chandauli. |
| **ICMR-NIN IFCT 2017** | National Institute of Nutrition (ICMR-NIN), Hyderabad | Exact micronutrient composition per 100g for Indian staple foods (e.g. Code `A012` Sugarcane Jaggery: 11.4mg Iron; Code `B004` Masoor Dal: 7.6mg Iron, 145mcg Folate; Code `D021` Moringa Leaves: 28.2mg Iron, 11,300mcg Beta-Carotene). |
| **FSSAI Fortification** | Food Safety and Standards Authority of India | Standards for Double Fortified Salt (30 PPM Iodine + 800–1100 PPM Iron) and Fortified Rice Kernels (FRK). |
| **MoHFW Health Programs** | Ministry of Health and Family Welfare | Guidelines from Anemia Mukt Bharat (AMB) & WIFS Programme (Weekly Iron and Folic Acid tablets: 60mg elemental iron + 500mcg Folic Acid). |
| **WHO Guidelines** | World Health Organization | Clinical protocols for Vitamin A supplementation in infants and Zinc-ORS combination in diarrhea management. |
| **Census 2011 & LGD** | Registrar General of India & Ministry of Panchayati Raj | Local Government Directory (LGD) Gram Panchayat boundaries and rural child demographic proportions (0–5 age group: ~15–22% of rural population). |

---

## 3. Data Pipeline & Backend Architecture

### 🛠️ Ingestion Scripts (`backend/scripts/`)
1. **`ingest_nfhs5.js`**: Parses district factsheet indicator metrics into `backend/data/processed_nfhs5_indicators.json`.
2. **`ingest_ifct2017.js`**: Ingests ICMR-NIN food composition matrix into `backend/data/processed_ifct2017_foods.json`.

### 🗄️ Database Schema (`database/schema.sql`)
- **`villages`**: Stores village metadata, coordinates, population, and child population.
- **`deficiency_records`**: Stores prevalence percentages, severity levels, and source factsheet references.
- **`official_indicators`**: Stores raw district-level NFHS-5 indicator codes.
- **`ifct_foods`**: Stores ICMR-NIN food codes, category, and micronutrient densities.
- **`ngo_activities` & `donor_pledges`**: Manages aid activities, overlap grouping, and donor commitments.

---

## 4. Repository & Security Management

- **GitHub Repository**: Connected and pushed to [https://github.com/FarukhChaudhary/NutriMatch.git](https://github.com/FarukhChaudhary/NutriMatch.git).
- **Security & Secret Protection**:
  - Configured [.gitignore](file:///c:/Users/chaud/OneDrive/Desktop/ai%20hackathon/nutrimatch/.gitignore) to exclude sensitive environment variables (`.env`, `backend/.env`), node modules, logs, and database binaries from public commits.
  - Created `.env.example` templates ([backend/.env.example](file:///c:/Users/chaud/OneDrive/Desktop/ai%20hackathon/nutrimatch/backend/.env.example)) for developer setup.

---

## 5. Technology Stack Summary

- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet / React-Leaflet, Recharts, Lucide-React icons, React Router v6.
- **Backend API**: Node.js, Express, PostgreSQL / SQLite (`pg`, `sequelize`, `bcryptjs`, `jsonwebtoken`).
- **Data Ingestion**: ES Module CLI scripts (`npm run ingest`).
