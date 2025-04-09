# Project Requirements Document

---

## 1. Project Overview

The project is called “キーワード自動提案Webアプリ開発” and its main goal is to help internal staff generate SEO/MEO-optimized keywords using an AI agent. The application gathers unique facility information—from direct user input, Google Business Profiles, and the facility’s official website—and automatically creates keyword suggestions in three categories: Menu & Services, Environment & Facilities, and Recommended Usage Scenes. These keywords will later be used to generate natural-sounding customer reviews through a separate review generation system.

This project is built to optimize the process of generating tailored reviews for facilities while reducing manual effort. The key objectives include securing internal staff access using NextAuth, automating data crawling and summarization with AI tools (using frameworks like LangChain or Auto-GPT), and ensuring that the generated keywords can be reviewed, edited, and exported as a CSV file. Success means a smooth, integrated workflow where internal operations staff can easily input facility data, trigger AI processing, review and refine keyword suggestions, and export them for further review automation.

---

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

- Secure internal authentication using NextAuth, supporting at least two user roles (USER and admin).
- Facility information input form that collects detailed data (25 fields plus an additional “その他追記事項” field) and stores it in a Supabase PostgreSQL database.
- AI agent integration that:
  - Crawls information from a facility’s Google Business Profile and official website using a tool like Firecrawl.
  - Processes and summarizes the gathered data.
  - Uses GPT-4 (or similar) to generate keywords in three categories (Menu & Services, Environment & Facilities, and Recommended Usage Scenes).
  - Allows editing, deletion, and re-generation of keywords by the user.
- CSV export functionality that outputs facility ID, facility name, generation timestamp, and category-wise keywords in comma-separated format.
- Integration planning with a separate review generation system where keywords are inserted into a pre-defined prompt.
- Deployment on Netlify with specific settings (trustHost set to true) to avoid authentication errors.

**Out-of-Scope:**

- Advanced version control or historical tracking for facility data updates (the new keyword output will simply overwrite previous entries).
- Extensive scaling beyond the initial 10 facilities (although future expansion is considered, initial support focuses on a limited number).
- Branding or design guidelines beyond a basic interface; no specific fonts or colors are enforced.
- Handling of API keys or environment variables beyond standard NextAuth and Netlify configurations.
- Comprehensive monitoring or analytics beyond basic server dashboards and Supabase logs.

---

## 3. User Flow

A typical user journey begins with accessing the application and securely logging in via NextAuth. Internal staff (either USER or admin) sign in using either an email link or an OAuth method. After successful login, the user lands on a facility listing page where they can choose to add a new facility or edit an existing one. From here, they are taken to a facility information input form where they fill in 25 defined fields along with an extra “その他追記事項” field to capture comprehensive facility details.

Once the facility information is saved to the database, the user initiates the AI-driven keyword generation process by clicking a dedicated button. The AI agent then starts by crawling the facility’s online profiles and official website, summarizes the data, and uses GPT-4 to generate keywords classified into three groups. The user is then directed to a review page where they can examine, edit, delete, or add keywords. When satisfied, the user confirms the selection, saving the final keywords in the database. Finally, the user can export the results as a CSV file, which is then used by the review generation system.

---

## 4. Core Features

- **Authentication and Authorization:**  
  • Secure internal login using NextAuth configured with trustHost: true on Netlify.  
  • Supports at least two roles: USER and admin.

- **Facility Data Input and Storage:**  
  • A detailed input form with 25 fields (plus an extra “その他追記事項”), including fields such as facility name, ratings, operating details, and more.  
  • Data is saved in a Supabase-managed PostgreSQL database.

- **AI-Driven Keyword Generation:**  
  • Integrated AI agent employing frameworks similar to LangChain or Auto-GPT.  
  • Automated crawling of Google Business Profiles and official websites (using Firecrawl or similar tools).  
  • Data summarization and GPT-4 driven generation of keywords in three categories: Menu & Services, Environment & Facilities, Recommended Usage Scenes.  
  • Functionality to review, edit, delete, and re-run the keyword generation process (new output overwrites previous data).

- **CSV Export Functionality:**  
  • Export facility data and generated keywords (facility ID, facility name, generation date/time, and comma-separated keywords) as a CSV file.  
  • Allows for re-download and integration with the review generation system.

- **System Monitoring and Error Handling:**  
  • Use of server dashboards and Supabase logs to monitor performance and error logs, especially for AI crawling and keyword generation functions.

---

## 5. Tech Stack & Tools

- **Frontend:**  
  • Vite.js for fast development and modern build features.  
  • Tailwind CSS for design ease and responsiveness.  
  • Typescript to ensure type safety and maintainable code.  
  • shadcn UI components for uniform interface elements.

- **Backend & Database:**  
  • Supabase as the backend solution using PostgreSQL, which handles facility data, user accounts, and keyword storage.
  
- **Authentication:**  
  • NextAuth (Auth.js) with trustHost configuration to protect internal data and resolve Netlify-specific host issues.
  
- **AI & Crawling:**  
  • LangChain or Auto-GPT frameworks to coordinate the AI agent's workflow.  
  • Firecrawl for automated crawling of facility online data.  
  • GPT-4 for natural language processing, keyword generation, and data summarization.
  
- **Hosting & Deployment:**  
  • Netlify for deployment with serverless functions and environment variable management to support auto-scaling.

- **IDE/Plugin Integrations:**  
  • Cursor and Windsurf for advanced, AI-powered coding support.  
  • Use of models like Claude 3.7 Sonnet and Deepseek R1 for enhanced reasoning where needed.

---

## 6. Non-Functional Requirements

- **Performance:**  
  • Each facility’s crawling and keyword generation process should execute within a few tens of seconds.  
  • The application must maintain acceptable responsiveness as the number of facilities grows from 10 to future scalability options.

- **Security:**  
  • Ensure that only authenticated internal users can access the system via NextAuth.  
  • Use trustHost or proper environment variable settings (NEXTAUTH_URL, NEXTAUTH_URL_INTERNAL) to prevent untrusted host errors and maintain secure server connections.

- **Reliability & Usability:**  
  • The interface and workflows should be simple and intuitive for non-technical internal users.  
  • Basic server dashboards and log monitoring should be set up to quickly diagnose and resolve performance or error issues.

- **Compliance:**  
  • Standard security practices in managing API keys and sensitive configurations via environment variables.

---

## 7. Constraints & Assumptions

- The primary user base consists of internal staff with limited user roles (USER and admin), so the system is not optimized for external public access.
- The AI agent’s functionality depends heavily on external services such as GPT-4 and Firecrawl; reliable connectivity and service availability are assumed.
- The initial deployment will be on Netlify using serverless functions and environment variables; there is an assumption that the provided configuration (trustHost) will sufficiently resolve any untrusted host issues.
- Data updates do not require version control; each new keyword generation simply overwrites previous output.
- The system is designed for a modest number of facilities (around 10 initially) with scope for future expansion.
- No detailed design or branding guidelines are provided, so standard UI components (shadcn UI) and plain design principles apply.

---

## 8. Known Issues & Potential Pitfalls

- **GPT-4 Output Precision:**  
  • There is a risk that generated keywords may not perfectly match the facility information or be mis-categorized.  
  • Mitigation: Always include a manual review step where internal staff can edit and confirm keywords.

- **Crawling Inconsistencies:**  
  • Changes in the format or structure of Google Business Profiles or official websites may hinder data crawling.  
  • Mitigation: Regularly update the crawling logic and adjust summarization parameters as needed.

- **Netlify and NextAuth Integration:**  
  • Untrusted host errors may arise if NextAuth is not properly configured with the correct domain settings (trustHost: true).  
  • Mitigation: Ensure that environment variables like NEXTAUTH_URL are correctly set for development, preview, and production environments.

- **AI Agent Maintenance:**  
  • Using frameworks like LangChain or Auto-GPT might entail frequent updates or adjustments as the underlying models evolve.  
  • Mitigation: Plan for periodic maintenance and updates based on version changes in the AI libraries.

- **Performance Bottlenecks:**  
  • A surge in facility numbers or extensive crawling data might slow down response times.  
  • Mitigation: Monitor performance via the server dashboard and optimize code paths or scale serverless functions as needed.

---

This PRD serves as the main reference guide to ensure that all following documents (Tech Stack, Frontend Guidelines, Backend Structure, etc.) have a clear understanding of the project’s requirements, functionalities, and constraints.