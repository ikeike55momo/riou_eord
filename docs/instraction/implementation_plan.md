# Implementation plan

## Phase 1: Environment Setup

1. **Prevalidation**: Check if the current directory is already an existing project (verify the presence of key folders like `/frontend`, `/backend`, or configuration files).
   - *Reference: General Prevalidation Rule*

2. **Node.js Check**: Run `node -v` to confirm Node.js v20.2.1 is installed. If not, install Node.js v20.2.1.
   - *Reference: Tech Stack: Core Tools*

3. **Create Project Directories**: In the project root, create folders for `/frontend` and `/backend` if they do not exist.
   - *Reference: Project Setup Requirements*

4. **Cursor Metrics File**: Since we are using Cursor as the AI coding tool, create a file named `cursor_metrics.md` in the project root.
   - *Reference: Phase 1 – Environment Setup Instructions for Cursor*

5. **Create Cursor Config Directory**: In the project root, check for a `.cursor` directory; if not present, create the `.cursor` directory.
   - *Reference: Phase 1 – Environment Setup: Cursor Steps*

6. **Create MCP Config File for Cursor**: Within the `.cursor` directory, create a file named `mcp.json`.
   - *Reference: Phase 1 – Environment Setup: Cursor Configuration*

7. **Insert MCP Configuration (macOS)**: If you are on macOS, add the following JSON configuration into `.cursor/mcp.json`:
   ```json
   { "mcpServers": { "supabase": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-postgres", "<connection-string>"] } } }
   ```
   - *Reference: Environment Setup: Cursor Config Instructions*

8. **Insert MCP Configuration (Windows)**: If you are on Windows, add the following JSON configuration into `.cursor/mcp.json`:
   ```json
   { "mcpServers": { "supabase": { "command": "cmd", "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-postgres", "<connection-string>"] } } }
   ```
   - *Reference: Environment Setup: Cursor Config Instructions*

9. **Connection String Retrieval**: Display the following link in the setup instructions so you can obtain the Supabase connection string: [https://supabase.com/docs/guides/getting-started/mcp#connect-to-supabase-using-mcp](https://supabase.com/docs/guides/getting-started/mcp#connect-to-supabase-using-mcp). After acquiring the connection string, replace `<connection-string>` in your `mcp.json` with the actual string.
   - *Reference: Environment Setup: Cursor Config Instructions*

10. **Validate MCP Connection**: Navigate to the Settings/MCP section in Cursor to verify that the status is green (indicating a successful connection).
   - *Reference: Environment Setup: Cursor Config Instructions*

## Phase 2: Frontend Development

11. **Prevalidation**: Verify that the `/frontend` directory exists and is ready for new files.
   - *Reference: General Prevalidation Rule*

12. **Initialize Vite Project**: Inside the `/frontend` folder, initialize a new Vite.js project using TypeScript. For example, run:
   ```bash
   npm create vite@latest . --template react-ts
   ```
   - *Reference: Tech Stack: Frontend*

13. **Tailwind CSS Setup**: Follow the official Tailwind CSS integration instructions for Vite. Create and configure `tailwind.config.js` in `/frontend`.
   - *Reference: Tech Stack: Frontend*

14. **Integrate shadcn/ui Components**: Install and set up shadcn/ui in the project. Create a components folder: `/frontend/src/components`.
   - *Reference: Tech Stack: Frontend*

15. **Authentication UI - Login Page**: Create a login page component (e.g., `LoginPage.tsx` in `/frontend/src/pages/`) that utilizes NextAuth for secure authentication using OAuth or email link.
   - *Reference: Project Requirements: Secure Authentication*

16. **NextAuth Client Integration**: Add client-side calls to trigger sign-in using NextAuth (Auth.js). Include the `trustHost: true` setting in the NextAuth configuration (to be reflected in backend config as well).
   - *Reference: Project Requirements: Secure Authentication*

17. **Facility Information Form**: Create a form component (e.g., `FacilityForm.tsx` in `/frontend/src/components/`) with 25 input fields plus an additional field for "その他追記事項".
   - *Reference: Project Requirements: Facility Information Input*

18. **Form Validation**: Implement client-side validations for the facility form fields using appropriate regex and validation rules.
   - *Reference: Q&A: Form Handling*

19. **CSV Export UI**: Create a component (e.g., `CSVExport.tsx` in `/frontend/src/components/`) that lets users trigger CSV export. The CSV should include Facility ID, Facility Name, Generation Timestamp, and comma-separated keywords for each category (Menu & Services, Environment & Facilities, Recommended Usage Scenes).
   - *Reference: Project Requirements: CSV Export*

20. **Testing Frontend Components**: Run the Vite development server (`npm run dev` in `/frontend`) and validate UI rendering for the login page, facility form, and CSV export components.
   - *Reference: Validation Steps*

## Phase 3: Backend Development

21. **Prevalidation**: Confirm that the `/backend` directory exists and that configuration files (e.g., for environment variables) are present.
   - *Reference: General Prevalidation Rule*

22. **Supabase Database Setup**: In your Supabase project, create a PostgreSQL database. Obtain the connection string from Supabase as instructed earlier.
   - *Reference: Tech Stack: Backend & Environment Setup*

23. **Database Schema**: Design and implement the schema for facility information. Create a SQL file (e.g., `/backend/db/schema.sql`) with a table definition for facilities including 25 fields plus the "その他追記事項" field.
   - *Reference: Project Requirements: Facility Information Input*

24. **NextAuth API Configuration**: Setup API endpoints for authentication using NextAuth (Auth.js). Create these endpoints in `/backend/pages/api/auth/[...nextauth].ts`. Note the inclusion of `trustHost: true` in the NextAuth configuration.
   - *Reference: Project Requirements: Secure Authentication*

25. **Facility CRUD Endpoints**: Create RESTful API endpoints for facility data management:
   - `POST /api/facilities` to create a facility entry.
   - `GET /api/facilities/:id` to retrieve facility information.
   - `PUT /api/facilities/:id` to update facility details.
   - *Location: `/backend/routes/facilities.ts` or similar structure*
   - *Reference: Project Requirements: Facility Information Input*

26. **AI-Powered Keyword Generation Endpoint**: Develop an endpoint (e.g., `POST /api/generate-keywords` in `/backend/routes/ai.ts`) that triggers the AI agent. This endpoint should:
   - Use Firecrawl to retrieve data from both Google Business Profile and the official website for a given facility.
   - Invoke LangChain or Auto-GPT (integrating GPT-4) to generate keywords in three categories: Menu & Services, Environment & Facilities, Recommended Usage Scenes.
   - Overwrite any previous keywords once a new output is generated.
   - *Reference: Project Requirements: AI-Powered Keyword Generation*

27. **Integrate Firecrawl**: Create a service module (e.g., `/backend/services/firecrawl.js`) that encapsulates the crawling logic using Firecrawl.
   - *Reference: Project Requirements: AI-Powered Keyword Generation*

28. **Integrate LangChain/Auto-GPT**: Create a service module (e.g., `/backend/services/aiAgent.js`) to handle calls to GPT-4 via LangChain or Auto-GPT. Ensure error handling for crawling or generation failures.
   - *Reference: Project Requirements: AI-Powered Keyword Generation*

29. **CSV Generation Endpoint**: Implement an endpoint (e.g., `GET /api/export-csv` in `/backend/routes/export.ts`) that queries the facility record along with generated keywords and returns a CSV file.
   - *Reference: Project Requirements: CSV Export*

30. **Database & API Testing**: Validate by running SQL queries on Supabase to ensure data consistency. Test API endpoints using tools like Postman or curl to confirm correct responses (e.g., 200 OK for valid requests).
   - *Reference: Validation Steps*

## Phase 4: Integration

31. **Prevalidation**: Check connectivity between frontend and backend by verifying network configurations and environment variables.
   - *Reference: General Prevalidation Rule*

32. **Connect Frontend with Authentication**: In the login page component, integrate the NextAuth sign-in flow by calling the API endpoints from `/backend/pages/api/auth/[...nextauth].ts`.
   - *Reference: Project Requirements: Secure Authentication*

33. **Integrate Facility Form with Backend**: Set up API calls in the facility form component (`FacilityForm.tsx`) using a library like Axios or Fetch API to submit data to the `/api/facilities` endpoint.
   - *Reference: Project Requirements: Facility Information Input*

34. **Integrate Keyword Generation**: From the facility form page, add a button that triggers keyword generation by calling the `/api/generate-keywords` endpoint. Ensure that the UI reflects the AI agent’s progress and final results.
   - *Reference: Project Requirements: AI-Powered Keyword Generation*

35. **Integrate CSV Export**: In the CSV export component, add an Axios/Fetch call to retrieve the CSV file from `/api/export-csv` and prompt download in the browser.
   - *Reference: Project Requirements: CSV Export*

36. **CORS and Environment Configurations**: Update CORS settings on the backend (if needed) to allow requests from the Netlify-hosted frontend. Confirm that environment variables are configured correctly in both local and production environments.
   - *Reference: Q&A: Pre-Launch Checklist*

37. **Integration Testing**: Run end-to-end tests by logging in, submitting facility information, triggering AI keyword generation, and exporting CSV. Validate that each step functions as expected.
   - *Reference: Validation Steps*

## Phase 5: Deployment

38. **Prevalidation**: Ensure that all API endpoints and frontend routes are functional locally before deployment.
   - *Reference: General Prevalidation Rule*

39. **Netlify Deployment - Frontend**: Build the Vite application for production (`npm run build` in `/frontend`) and deploy the static files to Netlify. Use Netlify’s environment variable management for sensitive configurations.
   - *Reference: Project Requirements: Netlify Deployment*

40. **Netlify Deployment - Serverless Functions**: Deploy backend API endpoints as Netlify serverless functions. Ensure that the NextAuth API routes and other backend endpoints work correctly on Netlify.
   - *Reference: Project Requirements: Netlify Deployment*

41. **Post-Deployment Monitoring**: Verify deployment by accessing the production URL. Monitor performance using Netlify’s dashboard and Supabase logs for any errors or issues.
   - *Reference: Project Requirements: Monitoring*

42. **Final Validation**: Conduct a complete system test to ensure that secure authentication, facility form submission, AI keyword generation, CSV export, and other functionalities operate within the expected performance parameters (keyword generation within tens of seconds per facility).
   - *Reference: Project Requirements: Non-Functional Requirements*

This concludes the step-by-step implementation plan for developing the SEO/MEO-optimized keyword generation web application using the specified tech stack and AI integrations.