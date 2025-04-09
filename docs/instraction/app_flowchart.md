flowchart TD
    A[Login Page]
    B{Authentication Valid?}
    A --> B
    B -- Yes --> C[Facility List Page]
    B -- No --> D[Display Error and Retry]

    C --> E[Select New Registration or Edit Facility]
    E -- New Registration --> F[Facility Information Form with 25 Fields + Additional Text]
    F --> G[Submit Form and Save to Supabase]

    G --> H[Initiate AI Keyword Generation]
    H --> I[Retrieve Facility Info]
    I --> J[Firecrawl Crawl for Google Business Profile and Website Data]
    J --> K{Crawl Successful?}
    K -- No --> T[Log Crawl Error and Retry]
    K -- Yes --> L[Summarize Facility and Crawled Data]

    L --> M[Generate Keywords using GPT-4]
    M --> N[Categorize Keywords into Menu & Services, Environment & Facilities, Recommended Usage Scenes]
    N --> O[Display Keyword Result Page with Review/Edit/Delete Options]

    O --> P{User Confirm Keywords?}
    P -- Yes --> Q[Update Confirmed Keywords in Supabase]
    Q --> R[Enable CSV Export]
    R --> S[Download CSV with Facility ID, Facility Name, Generation Timestamp, Category Keywords]
    P -- No --> U[Allow Editing and Re-Confirmation]

    style T fill:#fdd,stroke:#f66,stroke-width:2px
    style D fill:#fdd,stroke:#f66,stroke-width:2px