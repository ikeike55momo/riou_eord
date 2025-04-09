---

# .windsurfrules

## Project Overview
- **Type:** Web Application Development
- **Description:** A web application designed to generate SEO/MEO-optimized keywords using an AI agent. It processes facility information through crawling (Google Business Profile and official website), data summarization, and GPT-4 powered keyword generation, with a focus on natural-sounding customer reviews.
- **Primary Goal:** Enable internal staff to efficiently create and manage AI-driven keyword suggestions, ensuring new keyword output overwrites previous data following strict PRD guidelines.

## Project Structure
### Framework-Specific Routing
- **Directory Rules:**
  - Vite.js + React Router 6: Use `src/routes/` with `createBrowserRouter` for client-side navigation and modular route management.
  - Example: "React Router 6" → `src/routes/` directory structure utilizing nested routes as needed.

### Core Directories
- **Versioned Structure:**
  - src/api: Contains serverless functions hosted on Netlify handling authentication (NextAuth), the AI agent orchestration via LangChain/Auto-GPT, CSV export mechanisms, and keyword generation endpoints.
  - src/views: Hosts React components for facility information input forms, keyword review interfaces, dashboards, and other UI elements leveraging Tailwind CSS and shadcn UI.

### Key Files
- **Stack-Versioned Patterns:**
  - src/routes/auth/Login.tsx: Implements the authentication flow using NextAuth with `trustHost: true` configuration for secure Netlify deployment.
  - src/api/keywordGeneration.ts: Manages the integration of the AI agent (using LangChain/Auto-GPT) with Firecrawl and GPT-4, ensuring keyword generation and overwrite of previous data.

## Tech Stack Rules
- **Version Enforcement:**
  - Vite@latest: Utilize the latest Vite configuration to optimize build performance with React and TypeScript.
  - React Router@6: Ensure all routing logic strictly follows React Router 6 conventions.
  - NextAuth@latest: Implement internal authentication with NextAuth, enforcing proper environment variable management for Netlify and secure role-based access (USER and admin roles).

## PRD Compliance
- **Non-Negotiable:**
  - "New keyword output overwrites previous data" must be enforced in all AI-driven keyword generation processes.
  - "trustHost: true setting for Netlify deployment" is mandatory in the NextAuth configuration to prevent UntrustedHost errors.

## App Flow Integration
- **Stack-Aligned Flow:**
  - Vite.js with React Router 6 Auth Flow → `src/routes/auth/Login.tsx` manages secure login, redirecting authenticated users to the facility input and keyword review sections.
  - Facility information and keyword generation flow → `src/views/FacilityInput.tsx` and `src/api/keywordGeneration.ts` orchestrate data collection, AI interaction, and CSV export for downstream review generation use.

---