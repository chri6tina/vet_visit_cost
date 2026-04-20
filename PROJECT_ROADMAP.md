# VetVisitCost.com – Development Roadmap

This document serves as our shared source of truth for building VetVisitCost.com. We'll update it as we complete phases and pivot to new ones.

---

## ✅ Phase 0: Setup & UI Framework (Completed)
- [x] Bootstrapped Next.js App Router with Tailwind CSS v4.
- [x] Configured modern glassmorphic UI components, typography (Inter), and animations (Framer Motion).
- [x] Built the dynamic Homepage Search Interface (`/`).
- [x] Designed the "Was My Bill Fair?" Interactive Tool (`/bill-check`).
- [x] Set up the Programmatic SEO Procedure Page layout (`/cost/[procedure-slug]`).
- [x] Created the Pet Insurance Estimator Affiliate Tool (`/pet-insurance`).
- [x] Drafted the initial SQL constraints, indexing, and tables (`supabase/schema.sql`).
- [x] Initiated frontend routes for Vet Directory (`/vets`) and Low Cost Programs (`/low-cost-vets`).

---

## 🚧 Phase 1: Database Configuration & Data Seeding
**Goal:** Hook up the real database and fill it with initial data so the application is totally functional.

- [ ] **Supabase Instantiation:** Connect the `NEXT_PUBLIC_SUPABASE_URL` and anon keys securely to `.env.local`.
- [ ] **Database Migration:** Run `supabase/schema.sql` via the Supabase dashboard or CLI to create the tables (`procedures`, `vets`, `price_reports`, `state_procedure_costs`).
- [ ] **Data Seed Script (`scripts/seed.js`):** Write a one-off ingest script to parse JSON/CSV files containing the core 50 procedures and state distributions.
- [ ] **Validate Live Data Flow:** Verify the Supabase JS client correctly fetches and logs seeded procedure data in our local terminal.

---

## 🔍 Phase 2: Programmatic SEO & Dynamic Routing
**Goal:** Power the SEO engine by replacing mock data with real edge data.

- [ ] **Dynamic Procedure Data:** Update `/cost/[procedure-slug]/page.js` to fetch `avg_cost_low`, `avg_cost_high`, and state breakdowns directly from Supabase.
- [ ] **Generate Static Params:** Implement `generateStaticParams()` in Next.js to pre-compile the top 50 procedures natively for blazing fast load speeds.
- [ ] **Schema Automation:** Ensure the `MedicalProcedure` schema markup updates dynamically based on the fetched database response.
- [ ] **Location Routes (`/cost/[procedure]/[state]`):** Implement hierarchical routing for city/state SEO pages.

---

## 📍 Phase 3: Maps & The Vet Directory
**Goal:** Build out the interactive map UI and spatial querying for finding local vets.

- [ ] **Mapbox GL Integration:** Set up `react-map-gl` and Mapbox public token.
- [ ] **Vet Finder Spatial Query:** Build the Supabase Edge Function or RPC logic utilizing the PostGIS `location geography(POINT)` indices to return vets within an *X* mile radius of a ZIP string.
- [ ] **Directory Page (`/vets`):** Implement the Split-Screen UI (Map on the right, list with badges on the left).
- [ ] **Low-Cost Clinics Page (`/low-cost-vets`):** Same as above, heavily optimized for filtering non-profits and income-based resources.

---

## 💬 Phase 4: User Growth Loops (UGC)
**Goal:** Finalize functionality that enables crowdsourced price reports and reviews.

- [ ] **Price Submission Pipeline:** Connect the forms on `/bill-check` and `/cost/[slug]` to insert data into the `price_reports` table.
- [ ] **Vet Review Pipeline:** Create the form for pet-owners to submit standardized 1-5 star reviews on individual vet profile routes (`/vets/[slug]`).
- [ ] **Admin Dashboard / Moderation:** Basic overview to approve/deny community reports before they're factored into the general averages.

---

## 🤖 Phase 5: Autonomous AI Agents (The "Auto-Scale" Engine)
**Goal:** Build a hands-off, self-updating data machine using chron jobs and AI scrapers to endlessly expand our dataset without manual entry.

- [ ] **Data Discovery Agent (`/api/agents/discover`):** Builds a pipeline where an AI continuously scans for missing cities/ZIP codes and adds them to a queue.
- [ ] **Data Enrichment Agent:** An AI worker that automatically researches and extracts realistic top vet clinics & low-cost clinics for a target ZIP, injecting them directly into the Supabase `vets` and `low_cost_programs` tables.
- [ ] **Price Update Pipeline:** A cron-triggered agent (via GitHub Actions or Vercel Cron) that periodically verifies and updates national/state averages using live competitive data.
- [ ] **Automated SEO Generator:** Generate new dynamic city pages automatically as the Agent discovers and populates new regions.

---

## 🚀 Phase 6: Polish & Deployment
- [ ] Implement Vercel Analytics / Plausible tracking.
- [ ] QA Mobile Responsiveness aggressively.
- [ ] Configure the `robots.txt` and `sitemap.xml` for our thousands of generated SEO pages.
- [ ] Trigger Vercel Production Build for `vetvisitcost.com`. 

