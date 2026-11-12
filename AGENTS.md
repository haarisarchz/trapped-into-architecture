<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Trapped Into Architecture (TI2A) - Persistent Project Memory

## 1. Canonical Job Position Clubbings
Detailed reference file: [`JOB_POSITION_CLUBBINGS.md`](./JOB_POSITION_CLUBBINGS.md)
Implementation source of truth: [`utils/positionNormalize.ts`](./utils/positionNormalize.ts)

Whenever handling jobs, filters, search queries, or analytics, ALWAYS remember these canonical clubbings:
- **Architectural Drafts Person**: Unifies Draftsperson, Draftsmen, Draftsman, Draftswoman, Draftswomen, Draughtsman, Draughtsmen, 2D Draftsman, 3D Draftsman, CAD Draftsman, Senior Draftsman, Draftperson, Draftman.
- **Junior Architect**: Unifies Junior Architect, Jr. Architect, Fresher Architect, Fresh Architect, Assistant Architect, Graduate Architect, Architecture Assistant.
- **3D Visualizer**: Unifies 3D Visualizer, 3D Visualiser, 3D Modeller, 3D Artist, Architectural Visualizer, Render Artist.
- **Architectural Intern**: Unifies Architectural Intern, Intern Architect, Architecture Intern, Intern, Interns, Design Intern, Architecture Trainee.
- **Senior Architect**: Unifies Senior Architect, Sr. Architect, Lead Architect, Principal Architect, Team Lead Architect.
- **Interior Designer**: Unifies Interior Designer, Interior Architect, Interior Decorator, Architect / Interior Designer.
- **Junior Interior Designer**: Unifies Junior Interior Designer, Jr. Interior Designer, Junior Designer, Fresher Interior Designer.
- **Senior Interior Designer**: Unifies Senior Interior Designer, Sr. Interior Designer, Lead Interior Designer.
- **Architect**: Unifies Architect, Architects, Architect / Designer, Architectural Designer, Design Associate.
- **Site Engineer**: Unifies Site Engineer, Site Supervisor, Site Co-ordinator, Site Architect.
- **Project Architect** & **Project Manager**: Kept distinct as requested.

## 2. Admin Roles & Analytics Rules
- Admin roles include: `CEO`, `Super_Admin` (or `Super Admin`), `Job_Admin` (or `Job Admin`), `Admin`.
- Role checking MUST normalize roles by lowercasing and stripping underscores/spaces (`role.toLowerCase().replace(/[\s_-]+/g, "")`).
- **Admins sharing jobs must NEVER increment share counts or be recorded as organic user shares.**
- Unregistered visitors who share are labeled as **Unregistered User**.
- Registered candidates are labeled as **Candidate (Username)**.
