# Backend Structure Document

This document explains, in straightforward language, how the backend is built for the Keyword Auto-Suggestion Web App. It covers everything from the overall structure to security and maintenance. The goal is for anyone—even non-technical readers—to understand how the backend is set up.

## 1. Backend Architecture

The backend is designed with simplicity and flexibility in mind, using an architecture that supports future growth. Key points include:

- **Design Patterns & Frameworks**
  - Uses a serverless approach with Netlify Functions, making deployment and scaling easier.
  - Leveraging NextAuth for authentication and role-based access control gives structure to user management.
  - The architecture supports modular development, where each component (facility data, AI keyword generation, etc.) is separated into its own function or service.

- **Scalability, Maintainability, and Performance**
  - **Scalability:** By using Netlify (serverless functions) and Supabase (scalable PostgreSQL database), the backend can accommodate more users and more data without significant changes.
  - **Maintainability:** The modular design simplifies updates and debugging. Clear separation of authentication, data management, and AI integrations ensures each feature can be maintained independently.
  - **Performance:** Carefully structured API endpoints and the use of caching mechanisms help ensure fast responses, even when processing several fields and AI calls for each facility.

## 2. Database Management

The project uses Supabase, which is built on PostgreSQL. This ensures robust data storage and easy management. Here is how data is managed:

- **Database Technology:**
  - PostgreSQL (via Supabase)

- **Data Structure Overview:**
  - **Facility Information:** Contains all details captured from the facility input form (25 fields plus an extra notes field).
  - **Keywords:** Separate storage for AI-generated keywords, categorized into Menu/Services, Environment/Facilities, and Recommended Usage Scenes.
  - **User Accounts:** Data for internal staff authenticated through NextAuth, including roles (USER and admin).

- **Practices:**
  - Regular backups and logs are maintained. Data integrity is enforced by the database structure.
  - New facility data and keyword outputs overwrite old entries to ensure consistency.

## 3. Database Schema

Below is an overview of the database schema in a human-readable format, along with an example SQL schema for those using PostgreSQL.

### Human Readable Format

- **Table: Users**
  - Fields: id, email, hashed_password, role (USER or admin), created_at, updated_at

- **Table: Facilities**
  - Fields: facility_id, facility_name, input_field_1, input_field_2, ... , input_field_25, additional_notes, created_at, updated_at

- **Table: Keywords**
  - Fields: keyword_id, facility_id, category (Menu/Services, Environment/Facilities, Recommended Usage Scenes), keywords (comma separated), generation_timestamp, created_at, updated_at

### Example PostgreSQL Schema

/* Users Table */
CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Facilities Table */
CREATE TABLE Facilities (
  facility_id SERIAL PRIMARY KEY,
  facility_name VARCHAR(255) NOT NULL,
  input_field_1 TEXT,
  input_field_2 TEXT,
  -- ... additional 23 fields ...
  input_field_25 TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Keywords Table */
CREATE TABLE Keywords (
  keyword_id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES Facilities(facility_id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  keywords TEXT NOT NULL,
  generation_timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

## 4. API Design and Endpoints

The APIs are designed to be simple and RESTful, ensuring that different parts of the application can communicate effectively. Key endpoints include:

- **User Authentication**
  - Uses NextAuth (Auth.js) to handle secure user login and role-based access.
  - Endpoints: `/api/auth/signin`, `/api/auth/signout`, etc.

- **Facility Information CRUD**
  - Create, Read, Update endpoints to manage facility details
  - Endpoints: `/api/facilities` (GET, POST), `/api/facilities/{id}` (PUT, DELETE)

- **Keyword Generation**
  - Endpoint that triggers the AI agent to process facility data and generate keywords.
  - Endpoints: `/api/keywords/generate` (POST)

- **CSV Export**
  - Endpoint to generate and download a CSV file containing required facility and keyword data.
  - Endpoint: `/api/export/csv` (GET)

## 5. Hosting Solutions

The backend is hosted on Netlify, making use of serverless functions. The benefits include:

- **Reliability:** Netlify provides a robust platform with high availability and easy deployment.
- **Scalability:** As a serverless platform, Netlify automatically handles increased traffic without manual intervention.
- **Cost-Effectiveness:** Pay-as-you-go pricing ensures that costs remain low during development and scale naturally as usage increases.

## 6. Infrastructure Components

Several infrastructure components work together to ensure smooth operations:

- **Load Balancers:** Managed by Netlify at the platform level to distribute traffic effectively.
- **Caching Mechanisms:** Cache static content to improve load times; Netlify handles this out-of-the-box for static assets.
- **Content Delivery Network (CDN):** Netlify’s global CDN ensures that assets and functions are quickly delivered to users no matter where they are located.

## 7. Security Measures

Security is built into every layer of the backend:

- **Authentication & Authorization:**
  - NextAuth (Auth.js) manages secure login using OAuth or email links.
  - Role-based access control (USER and admin) ensures that only authorized personnel can access sensitive features.

- **Data Encryption:**
  - All sensitive data, both in transit and at rest, is encrypted.
  - Supabase and Netlify both offer secure connections (HTTPS) to protect user data.

- **NextAuth Configuration:**
  - `trustHost: true` is set to deal with Netlify's domain configuration, preventing untrusted host errors.

## 8. Monitoring and Maintenance

Monitoring and regular upkeep are critical for the app’s long-term success:

- **Monitoring Tools:**
  - Netlify Functions and Supabase logs provide insight into backend performance and error tracking.

- **Maintenance Practices:**
  - Routine reviews of logs and error reports are performed to quickly address issues.
  - Regular updates to dependencies and security patches keep the system up-to-date.

## 9. Conclusion and Overall Backend Summary

The backend for the Keyword Auto-Suggestion Web App is designed for clarity, efficiency, and future growth. Key aspects include:

- A modular, serverless architecture that promotes scalability.
- A reliable PostgreSQL database managed via Supabase with a clear schema for storing facility information, keywords, and user data.
- Clean and accessible RESTful APIs that tie together frontend forms, AI keyword generation, and CSV exports.
- Robust hosting on Netlify, ensuring performance and ease of deployment.
- Comprehensive security measures through NextAuth and HTTPS, mitigating risks associated with data breaches and unauthorized access.
- Ongoing monitoring and maintenance practices that assure long-term stability.

Overall, the backend structure aligns with the project's goals by providing a secure, scalable, and effective platform for generating AI-powered keyword suggestions, which in turn support the review generation process. This setup is unique in its integration of modern serverless hosting with AI-driven operations, making it both forward-thinking and practical for internal use.