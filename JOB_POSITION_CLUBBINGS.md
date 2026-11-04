# Trapped Into Architecture (TI2A) - Canonical Job Position Clubbings

This document is the permanent source of truth for all job role normalizations, clubbings, and synonyms across **Trapped Into Architecture** (`trappedintoarchitecture.com`).

Whenever jobs are posted, filtered, searched, or analyzed in Analytics, these positions are grouped into their canonical categories.

---

## 1. Architectural Drafts Person
* **Canonical Title:** `Architectural Drafts Person`
* **Purpose:** Unifies all drafting, CAD, and drafting-specialist roles across architectural and interior design firms.
* **Clubbed Titles & Synonyms:**
  * `Draftsperson` / `Draftspersons` / `Drafts person`
  * `Draftsmen` / `Draftsman` / `Draftmens` / `Draftman` / `Draftperson`
  * `Draftswoman` / `Draftswomen`
  * `Draughtsman` / `Draughtsmen` / `Draughtsperson`
  * `2D Draftsman` / `3D Draftsman`
  * `Architectural Draftsperson` / `Architectural Draftsman`
  * `CAD Draftsman` / `AutoCAD Draftsman`
  * `Senior Draftsman`
  * `Draftsman (Interior)`

---

## 2. Junior Architect
* **Canonical Title:** `Junior Architect`
* **Purpose:** Unifies early-career, entry-level, assistant, and fresh-graduate architects.
* **Clubbed Titles & Synonyms:**
  * `Junior Architect` / `Junior Architects` / `Junior / Mid Architect`
  * `Jr. Architect` / `Jr Architect`
  * `Fresher Architect` / `Fresher architect` / `Fresh Architect` / `Freshers Architect`
  * `Assistant Architect` / `Architecture Assistant`
  * `Graduate Architect`
  * `Entry Level Architect`

---

## 3. 3D Visualizer
* **Canonical Title:** `3D Visualizer`
* **Purpose:** Unifies architectural visualizers, 3D artists, modelers, and render specialists.
* **Clubbed Titles & Synonyms:**
  * `3D Visualizer` / `3D Visualiser`
  * `3D Modeller` / `3D Artist`
  * `Architectural Visualizer`
  * `Render Artist` / `CGI Artist`

---

## 4. Architectural Intern
* **Canonical Title:** `Architectural Intern`
* **Purpose:** Unifies all student internships and architectural trainee roles.
* **Clubbed Titles & Synonyms:**
  * `Architectural Intern` / `Architectural Interns`
  * `Intern Architect` / `Intern Architects`
  * `Architecture Intern` / `Architecture Interns`
  * `Intern` / `Interns`
  * `Architecture Trainee` / `Trainee Architect`
  * `Design Intern`

---

## 5. Senior Architect
* **Canonical Title:** `Senior Architect`
* **Purpose:** Unifies experienced project leads, associates, and principal architects.
* **Clubbed Titles & Synonyms:**
  * `Senior Architect` / `Senior architect`
  * `Sr. Architect` / `Sr Architect`
  * `Lead Architect` / `Team Lead Architect`
  * `Principal Architect`
  * `Associate Architect`

---

## 6. Interior Designer
* **Canonical Title:** `Interior Designer`
* **Purpose:** Unifies general interior designers and interior architects.
* **Clubbed Titles & Synonyms:**
  * `Interior Designer` / `Interior Designers` / `Interior designer`
  * `Interior Architect`
  * `Interior Decorator`
  * `Architect / Interior Designer`
  * `Architecture & Interior Design`

---

## 7. Junior Interior Designer
* **Canonical Title:** `Junior Interior Designer`
* **Purpose:** Unifies junior and fresher interior designers.
* **Clubbed Titles & Synonyms:**
  * `Junior Interior Designer` / `Jr. Interior Designer` / `Jr Interior Designer`
  * `Junior Designer`
  * `Fresher Interior Designer`

---

## 8. Senior Interior Designer
* **Canonical Title:** `Senior Interior Designer`
* **Purpose:** Unifies senior and lead interior designers.
* **Clubbed Titles & Synonyms:**
  * `Senior Interior Designer`
  * `Sr. Interior Designer` / `Sr Interior Designer`
  * `Lead Interior Designer`

---

## 9. Architect (General & Design)
* **Canonical Title:** `Architect`
* **Purpose:** Unifies general design architects and plural titles.
* **Clubbed Titles & Synonyms:**
  * `Architect` / `Architects`
  * `Architect / Designer` / `Architect & Designer` / `Designer / Architect`
  * `Architectural Designer`
  * `Design Associate`
  * `Design Architect`

---

## 10. Site Engineer & Supervisor
* **Canonical Title:** `Site Engineer`
* **Purpose:** Unifies on-site engineering, coordination, and supervision roles.
* **Clubbed Titles & Synonyms:**
  * `Site Engineer`
  * `Site Supervisor` / `Site supervisor`
  * `Site Co-ordinator`
  * `Site Architect`

---

## 11. Project Architect & Project Manager
* **Canonical Title:** `Project Architect` & `Project Manager` (kept distinct as requested)
* **Clubbed Titles & Synonyms:**
  * `Project Architect` / `Project Architect / Coordinator`
  * `Project Manager` / `Site Manager` (distinct from supervisor)

---

## Code Implementation Reference
- Normalization Logic & Synonyms: [`utils/positionNormalize.ts`](file:///C:/Users/ASUS/new_website_work/utils/positionNormalize.ts)
- Search & Auto-Suggestions Component: [`components/SearchWithSuggestions.tsx`](file:///C:/Users/ASUS/new_website_work/components/SearchWithSuggestions.tsx)
- Jobs Filtering & Banner: [`app/jobs/page.tsx`](file:///C:/Users/ASUS/new_website_work/app/jobs/page.tsx)
- Internships Filtering: [`app/internships/page.tsx`](file:///C:/Users/ASUS/new_website_work/app/internships/page.tsx)
- Analytics Mapping Badges: [`app/admin/analytics/page.tsx`](file:///C:/Users/ASUS/new_website_work/app/admin/analytics/page.tsx)
