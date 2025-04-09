# Tech Stack Document

This document explains the main technology decisions for our project in approachable terms. Our web app is designed to automatically generate optimised keywords based on facility information and online data. These keywords help craft natural-sounding reviews that are both SEO-friendly and user-relevant.

## Frontend Technologies

The frontend is focused on providing a smooth and interactive user experience. Here are the key technologies used:

- **Vite js**: A fast and modern build tool that helps us serve and update our code quickly during development.
- **Tailwind CSS**: A utility-first CSS framework that allows us to style the application easily and consistently with minimal effort.
- **Typescript**: A programming language that adds strong typing to JavaScript, reducing errors and making the code easier to maintain.
- **Shadcn UI**: A library of pre-made UI components that speeds up the design process and ensures a consistent look and feel throughout the app.

These choices ensure that the interface is both visually appealing and highly responsive, making it simple for internal staff to log in, input facility information, and work with the AI-generated keywords.

## Backend Technologies

The backend is where data is stored, processed, and safely served to the frontend. Our key backend technologies include:

- **Supabase (PostgreSQL)**: Acts as our primary database to store facility information, generated keywords, and user data. It provides a reliable and scalable platform to manage our data.
- **NextAuth (with Auth.js)**: Handles user authentication, ensuring that only authorized internal staff can access the app. The trustHost setting in NextAuth is particularly important to prevent deployment errors on Netlify.
- **LangChain & Firecrawl**: These tools empower our AI agent. LangChain helps organize the process of using AI (like GPT-4) for summarizing and processing data, while Firecrawl handles crawling information from Google Business Profiles and official facility websites. Together, they automate keyword generation by processing collected facility data and online content.

This combination of technologies forms the backbone that securely and efficiently processes data and orchestrates AI functionality, ensuring that accurate and optimised keywords are generated.

## Infrastructure and Deployment

Robust infrastructure ensures our system is reliable, scalable, and easy to update. Our deployment and infrastructure choices include:

- **Netlify**: A cloud hosting service optimized for web applications. It provides serverless functions and environment variable management, making it easier to handle dynamic processes like AI crawling and keyword generation.
- **CI/CD Pipelines**: Integrated with Netlify, these pipelines allow for continuous integration and deployment. This means that any code updates are automatically tested and deployed, ensuring that the application remains stable and up-to-date.
- **Version Control (Git)**: The project is managed using Git. This allows the team to track changes, collaborate efficiently, and maintain a clear history of code modifications.

These infrastructure choices make deployment straightforward and keep the system reliable and prepared for future scaling, particularly as the number of facilities grows.

## Third-Party Integrations

To extend functionality without reinventing the wheel, our project integrates several third-party services:

- **NextAuth**: While it handles authentication, it also seamlessly integrates with OAuth and email-link based logins for our internal users, ensuring security and easy access control.
- **LangChain & Firecrawl**: As mentioned earlier, these frameworks integrate AI and web crawling capabilities. They automatically gather and process data from external sources (like Google Business Profiles and facility websites) to generate relevant keywords.
- **External Review Automation System**: The system generates a CSV output containing facility details and category-wise keywords. This CSV is then fed into another review generation system that uses the keywords to automatically create natural-sounding reviews.

By integrating these third-party services, we are able to enhance the overall functionality of the project without compromising on quality or security.

## Security and Performance Considerations

Security and performance are priorities to ensure both data safety and a smooth user experience:

- **Authentication and Data Protection**:
  - We use **NextAuth** to restrict the app to internal users only, ensuring that confidential facility details and generated keywords remain secure.
  - The **trustHost** configuration makes sure that the app trusts only verified domains, preventing untrusted access or errors during deployment.

- **Performance Optimizations**:
  - Although the AI-driven processes (like crawling and keyword generation) may take a few seconds per facility, we have optimized them to keep these delays within acceptable limits.
  - **Server dashboards** are used to monitor performance and log errors, so any issues during the crawling and AI processing steps can be quickly identified and resolved.

Together, these practices ensure that the application remains both secure and efficient, even when scaling up to handle larger datasets or more facility information.

## Conclusion and Overall Tech Stack Summary

To sum up, our project's tech stack is carefully chosen to align with our goals:

- **Frontend**: Vite js, Tailwind CSS, Typescript, and Shadcn UI work together to create a fast, visually consistent, and responsive user interface.
- **Backend**: Supabase, NextAuth, LangChain, and Firecrawl manage, secure, and process data, ensuring that facility information and AI-generated keywords are handled efficiently.
- **Infrastructure**: Netlify provides an excellent hosting platform with CI/CD pipelines and serverless functions to support our dynamic needs.
- **Third-Party Integrations**: Integrations with authentication services, AI frameworks, and review generation systems enhance both the functionality and ease of use.
- **Security and Performance**: Robust security measures and performance monitoring ensure that the entire system can operate safely and responsively even under heavier loads.

Overall, this tech stack supports our vision of a keyword generation web app that is powerful yet user-friendly. It enables the internal staff to securely input data, leverage AI for critical processing, and seamlessly integrate the final output with a review automation system, all while maintaining a high standard of performance and security.

Any future enhancements, such as adding more user roles like admin, will build upon this solid foundation.