# Codeforces Progress Tracker — Project Context

## 1. Project Overview

**Project Name:** Codeforces Progress Tracker  
**Project Type:** Open/public web application  
**Primary Goal:** Allow any student/user to enter a public Codeforces profile URL or handle and instantly see a useful analysis of their competitive-programming progress.

The application does **not** have a login system, user accounts, subscriptions, or a database in the current planned architecture.

A visitor simply:

1. Opens the website.
2. Enters a Codeforces profile URL.
3. Clicks **Analyze**.
4. The frontend extracts the Codeforces handle.
5. The React frontend sends the handle to the FastAPI backend.
6. FastAPI requests public data from the official Codeforces API.
7. The backend analyzes the submissions.
8. The backend returns clean JSON.
9. React renders the profile and statistics dashboard.
10. The visitor can switch between four visual themes from the navbar.

---

# 2. Core Product Idea

The product is similar in spirit to a personal Codeforces analytics dashboard.

For the MVP, the important analysis is:

- Codeforces username/handle
- Current rank
- Current rating
- Maximum rating
- Maximum rank
- Total unique problems solved
- Topic-wise unique problems solved

Additional analytics are planned for later phases.

The website should remain usable without authentication or persistent user storage.

---

# 3. Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Lucide React
- Recharts (for charts/visual analytics)

## Backend

- Python
- FastAPI
- Uvicorn
- Requests

## External Data Source

- Official Codeforces API

## Database

**No database is required for the current public version.**

PostgreSQL may be considered later only if a future feature requires persistent storage such as:

- saved profiles
- historical snapshots
- user accounts
- personal dashboards
- stored analytics

Do not introduce a database merely for the current MVP.

---

# 4. High-Level Architecture

```text
                 USER
                  |
                  | Codeforces profile URL
                  v
          React Frontend
          localhost:5173
                  |
                  | HTTP request
                  v
           FastAPI Backend
          localhost:8000
                  |
                  | Codeforces API request
                  v
          Official Codeforces API
                  |
                  | Raw JSON
                  v
          Python Analyzer
                  |
                  | Clean JSON
                  v
          FastAPI Response
                  |
                  v
          React Dashboard
```

The frontend is responsible for:

- UI
- input
- URL/handle extraction
- loading states
- displaying errors
- displaying returned analytics
- charts
- theme switching

The backend is responsible for:

- Codeforces API communication
- request throttling
- data validation
- problem deduplication
- statistical analysis
- API response formatting

---

# 5. Current Project Directory

The intended project structure is:

```text
codeforces-tracker/
│
├── backend/
│   ├── venv/
│   ├── main.py
│   ├── codeforces_api.py
│   ├── analyzer.py
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchForm.jsx
│   │   │   ├── ProfileCard.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TopicList.jsx
│   │   │   └── Loading.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
└── PROJECT_CONTEXT.md
```

The exact frontend files may grow as later phases add charts, themes, heatmaps, recent submissions, and other analytics.

---

# 6. Backend Responsibilities

## `backend/codeforces_api.py`

This file contains communication with Codeforces.

Current important functions:

```python
get_user_info(handle)
get_user_submissions(handle)
```

The backend uses:

```text
https://codeforces.com/api
```

The implementation should keep Codeforces API communication separate from analysis logic.

A request helper handles:

- API URL construction
- request throttling
- HTTP errors
- JSON parsing
- Codeforces API errors

A minimum delay between Codeforces requests is currently implemented to respect the API request limit.

Current development design:

```python
MIN_REQUEST_INTERVAL = 2.0
```

This is an outbound Codeforces API throttle.

Important distinction:

- Codeforces-side throttling protects our application from sending requests too quickly.
- Application-level rate limiting protects our own FastAPI endpoint from abuse.
- The second one is still a production-hardening task and should be implemented before public deployment if necessary.

---

# 7. Backend Analyzer

## `backend/analyzer.py`

This file contains pure Python data-analysis logic.

It should not contain frontend/UI code.

### Unique solved problem calculation

Only submissions with:

```text
verdict == "OK"
```

are considered solved.

Each problem is uniquely identified using:

```text
contestId-index
```

Example:

```text
1234-A
```

This prevents multiple accepted submissions for the same problem from being counted multiple times.

Conceptually:

```text
Submissions
    |
    | keep only verdict = OK
    v
Accepted submissions
    |
    | build contestId-index
    v
Unique solved problems
    |
    v
Total solved count
```

---

# 8. Topic Statistics

For each unique solved problem:

```text
problem.tags
```

is read from the Codeforces submission data.

Each tag gets a count of unique solved problems containing that tag.

Example:

```json
{
    "math": 49,
    "greedy": 41,
    "implementation": 22
}
```

A problem with multiple tags contributes once to every tag attached to that problem.

Example:

```text
Problem:
tags = ["math", "greedy", "implementation"]
```

It contributes:

```text
Math +1
Greedy +1
Implementation +1
```

It does not increase the total solved count more than once.

---

# 9. FastAPI Endpoint

## `backend/main.py`

The main analysis endpoint is:

```text
GET /api/analyze/{handle}
```

Example:

```text
http://127.0.0.1:8000/api/analyze/__raman
```

The endpoint:

1. Receives a Codeforces handle.
2. Calls `get_user_info(handle)`.
3. Calls `get_user_submissions(handle)`.
4. Calculates total unique solved problems.
5. Calculates topic statistics.
6. Returns a clean JSON response.

Current response shape:

```json
{
    "username": "__Raman",
    "rating": 1054,
    "rank": "newbie",
    "maxRating": 1054,
    "maxRank": "newbie",
    "totalSolved": 90,
    "topics": {
        "math": 49,
        "greedy": 41,
        "implementation": 22
    }
}
```

The exact numbers depend on the analyzed Codeforces profile and may change as Codeforces activity changes.

---

# 10. Root Backend Endpoint

The backend also has:

```text
GET /
```

It returns a simple status message indicating that the Codeforces Progress Tracker API is running.

This is useful for quickly checking whether FastAPI is alive.

---

# 11. Frontend Responsibilities

The React application is the presentation layer.

It should not directly call Codeforces for the main analytics.

Instead:

```text
React
  ↓
FastAPI
  ↓
Codeforces API
```

This keeps the Codeforces integration and analysis logic on the backend.

---

# 12. Profile Input

The user should be able to enter either:

### Full Codeforces profile URL

Example:

```text
https://codeforces.com/profile/__Raman
```

or a handle if the UI supports it.

The frontend should extract:

```text
__Raman
```

before calling the backend.

The frontend should validate the input before making the request.

Invalid input should produce a clear user-facing error instead of an unexplained API failure.

---

# 13. Frontend API Service

## `src/services/api.js`

All frontend-to-backend API calls should preferably be kept in one service file.

Example responsibility:

```text
analyzeProfile(handle)
```

The service calls:

```text
http://127.0.0.1:8000/api/analyze/{handle}
```

and returns the parsed JSON to React.

Keeping API calls separate from UI components makes the application easier to maintain.

---

# 14. CORS

During local development:

```text
Frontend:
http://localhost:5173

Backend:
http://127.0.0.1:8000
```

These are different origins because the ports differ.

The browser therefore applies CORS rules.

The intended request flow is:

```text
User clicks Analyze
        |
        v
React sends HTTP request
        |
        v
Browser sends request to FastAPI
        |
        v
FastAPI processes request
        |
        v
FastAPI sends response
        |
        v
Browser checks CORS permission
        |
        v
React receives response
        |
        v
Dashboard updates
```

FastAPI must explicitly allow the frontend origin during development.

CORS is a browser security mechanism. It does not mean that different ports are physically unable to communicate.

For production, allowed origins should be changed from localhost to the deployed frontend domain.

---

# 15. Frontend UI Goal

The final dashboard should visually resemble a polished competitive-programming analytics product.

The design should include:

- dark cinematic background
- premium cards
- glowing statistics
- responsive layout
- profile section
- overall statistics
- topic statistics
- activity visualization
- recent submissions
- charts
- filters
- theme switching

The UI should be marketable and polished rather than looking like a basic CRUD application.

---

# 16. Theme System

There are exactly four named themes.

The names must remain exactly:

1. **Cipher Gold**
2. **Blood Red**
3. **Deep Ocean Blue**
4. **Neon Synth**

The theme selector should be accessible from the navbar.

### Required behavior

Navbar contains a theme button.

When the user clicks it:

```text
Theme button
     |
     v
Theme options appear
     |
     +---- Cipher Gold
     +---- Blood Red
     +---- Deep Ocean Blue
     +---- Neon Synth
```

When a theme is selected:

```text
User selects theme
        |
        v
Theme state changes
        |
        v
Entire UI updates automatically
```

No page reload should be required.

The selected theme should affect the visual design globally.

The theme system should be centralized rather than hardcoding different colors independently inside every component.

---

# 17. Theme Visual Direction

## Theme 1 — Cipher Gold

Visual direction:

- dark graphite/black background
- gold/amber accents
- polished metallic-gold feeling
- premium competitive-programming dashboard
- subtle glow
- readable white text

The theme should feel sophisticated rather than overly bright.

---

## Theme 2 — Blood Red

Visual direction:

- very dark red/black background
- crimson/red accents
- subtle red glow
- strong high-contrast appearance
- white/light text

The design should remain readable and professional.

---

## Theme 3 — Deep Ocean Blue

Visual direction:

- very dark navy/blue background
- deep ocean blue surfaces
- cyan/turquoise accents
- subtle blue glow
- white/light text

The theme should feel calm, technical, and modern.

---

## Theme 4 — Neon Synth

This is the most colorful theme.

Primary design direction:

### Dashboard background

Use a smooth matte:

```text
very dark purple → deep blue
```

gradient.

### Stat counts and percentages

Examples:

```text
90
22
49%
```

should use:

```text
Neon Mint Green
```

with an appropriate glow.

### Horizontal progress bars

Use:

```text
Pastel Pink → Pastel Turquoise
```

gradient.

### Topic icons

Topic icons should use a:

```text
Turquoise → Pink
```

visual treatment.

### Headers and profile name

Examples:

```text
__Raman
Topic-wise Problems Solved
Overall Statistics
```

should be crisp white.

### Navigation and contact button

Use:

```text
Cyber-Pastel Pink
```

as the primary solid button treatment where appropriate.

### Graph line

The comparative graph line should glow:

```text
Turquoise
```

### Heatmap

Use a progression approximately:

```text
Dark Deep Blue
       ↓
Intermediate blue/purple tones
       ↓
Glowing Pink
```

where low activity is dark and high activity is bright.

---

# 18. Required Dashboard Sections

The dashboard should eventually contain the following sections.

## A. Navbar

Contains:

- CF Tracker branding/logo
- Home
- Profile
- Skills
- Analysis
- Analyze New Profile button
- Theme selector

The theme selector is an important functional requirement.

---

## B. Analyze Profile Section

Contains:

```text
Analyze Profile

[ Codeforces profile URL                         ] [Analyze]
```

The input should support a Codeforces profile URL.

---

# 19. Profile Card

Display:

- Codeforces avatar if available
- username
- rank
- rating
- max rating
- max rank

Example:

```text
__Raman
Codeforces Profile

Rank       Newbie
Rating     1054
Max Rating 1054
Max Rank   Newbie
```

---

# 20. Overall Statistics

The dashboard should show:

- total problems solved
- total topics covered

The total problems solved can be shown as a large number and/or donut/ring chart.

Example:

```text
90
Total Problems Solved
```

and:

```text
22
Total Topics Covered
```

The values must come from backend data.

Do not hardcode statistics.

---

# 21. Submission Activity Heatmap

A GitHub-style/Codeforces-style activity heatmap is planned.

It should visualize submission activity over time.

It should eventually support a time selector such as:

```text
Year / Month
```

The heatmap should use the active theme's palette.

Important:

The heatmap must represent actual backend data when this feature is implemented. Do not create fake/random activity values for the final product.

---

# 22. Topic-wise Problems Solved

This is one of the MVP's core analytics.

Each topic can be represented as a card.

Example:

```text
Math                         49%
██████████████████

49 Problems Solved
```

Other topics:

- Greedy
- Implementation
- Brute force
- Sortings
- Number theory
- Two pointers
- Strings
- Data structures
- Combinatorics
- etc.

The list must be dynamically generated from the backend response.

Do not hardcode topic names/counts as the final data source.

---

# 23. Topic Percentages

The UI may show a percentage next to each topic.

The percentage should be calculated consistently.

Recommended interpretation:

```text
topic solved count
------------------ × 100
total unique solved problems
```

Example:

```text
49 / 90 × 100 ≈ 54.4%
```

If the design instead uses another denominator in a later analytics phase, document that explicitly.

Do not create mathematically inconsistent percentages.

---

# 24. Advanced Filters

The design includes controls such as:

```text
Advanced Filter

Rating Range: 800-1200
Difficulty Level: Difficulty Level
```

These are part of the desired final analytics UI.

They should eventually affect displayed analytics.

They must not be fake controls that visually change nothing.

The filtering logic should be added once the backend has enough problem metadata to support it.

---

# 25. Recent Submissions

A recent-submissions section is planned.

It should show information such as:

- problem name
- submission result
- difficulty/rating
- topic information where appropriate
- submission time

Example design:

```text
Recent Submissions

[Problem]
Commendation...
Solved
Difficulty ...

[Problem]
Combination of...
Solved
Difficulty ...
```

The data should come from Codeforces submissions.

Do not use fake hardcoded submissions in the final implementation.

---

# 26. Charts

Recharts is intended for data visualization.

Potential charts include:

- activity trend
- rating progression
- topic distribution
- difficulty distribution

Charts should use real backend data.

Chart colors should come from the active theme.

---

# 27. Future Analytics

These are planned but should not be implemented prematurely if the required data/logic is not ready.

## Problems solved over time

Show how the user's solved count progressed over time.

---

## Difficulty-wise analysis

Group solved problems by Codeforces rating/difficulty.

Potential groups:

```text
800
900
1000
1100
...
```

or broader categories.

---

## Rating progression

Use Codeforces rating history.

Likely backend API:

```text
user.rating
```

---

## Recent submissions

Use:

```text
user.status
```

and transform the data into a dashboard-friendly structure.

---

## Weak / under-practiced topics

Determine topics with relatively low activity.

This should be based on actual user data and a clearly defined rule.

Avoid pretending that a topic is "weak" merely because it has a low raw count without considering the user's overall activity.

---

## Recommended topics

Recommendations can initially be rule-based.

Example conceptual flow:

```text
User topic history
        |
        v
Analyze coverage
        |
        v
Identify under-practiced areas
        |
        v
Suggest topics
```

AI recommendations are optional future work, not a prerequisite for the core tracker.

---

# 28. Phase Plan

## Phase 1 — Environment + Codeforces API Connection

Completed.

Work:

- create project
- create Python virtual environment
- install backend packages
- connect to Codeforces API
- retrieve user information
- verify with a real handle

---

## Phase 2 — Submission Retrieval + Analysis

Completed.

Work:

- retrieve `user.status`
- filter accepted submissions
- deduplicate solved problems
- calculate total solved
- calculate topic statistics

---

## Phase 3 — FastAPI Backend

Core completed.

Work:

- create FastAPI application
- create root endpoint
- create `/api/analyze/{handle}`
- connect API module and analyzer
- return clean JSON
- run using Uvicorn
- test API through browser/Swagger

Current backend development command:

```powershell
uvicorn main:app --reload
```

Run it from:

```text
codeforces-tracker/backend
```

---

## Phase 4 — React Frontend

Currently in progress.

Main work:

1. Create React/Vite frontend.
2. Install frontend dependencies.
3. Configure Tailwind CSS.
4. Build base application.
5. Build navbar.
6. Build profile input.
7. Build search/analyze form.
8. Build API service.
9. Connect React to FastAPI.
10. Configure CORS.
11. Add loading state.
12. Add error state.
13. Display profile information.
14. Display total solved.
15. Display topic statistics.
16. Build reusable components.
17. Build theme system.
18. Add four themes.
19. Add responsive dashboard styling.
20. Add charts/visual sections required by the current design.

Important development rule:

The frontend should receive real backend data. Avoid permanently hardcoding values from screenshots.

---

## Phase 5 — Advanced Analytics UI

Planned:

- topic distribution visualization
- difficulty analysis
- recent submissions
- better filtering
- richer profile dashboard

---

## Phase 6 — Time-Based Analytics

Planned:

- problems solved over time
- submission activity heatmap
- rating progression
- historical charts

---

## Phase 7 — Weak Topics + Recommendations

Planned:

- topic coverage analysis
- under-practiced topic detection
- rule-based recommendations
- suggested practice areas

---

## Phase 8 — Backend Hardening

Planned:

- robust input validation
- better error handling
- application-level rate limiting
- caching where useful
- Codeforces API failure handling
- production-safe configuration

Redis may be considered here if it materially helps caching/rate limiting.

Do not add Redis just because it is available.

---

## Phase 9 — Testing + UI Polish

Planned:

- frontend testing
- backend testing
- edge cases
- invalid handles
- empty/partial API data
- API failures
- responsive testing
- accessibility
- loading/error UX
- visual consistency
- theme testing

---

## Phase 10 — Deployment

Planned:

- production frontend build
- production backend configuration
- environment variables
- CORS production origin
- deployment
- final API URL
- frontend deployment
- testing the complete public website

The application should be deployable without exposing secrets.

---

# 29. Running the Project Locally

The frontend and backend run separately.

## Terminal 1 — Backend

```powershell
cd codeforces-tracker\backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

## Terminal 2 — Frontend

```powershell
cd codeforces-tracker\frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Both terminals must remain running during development.

---

# 30. Important Development Rules

## Rule 1 — No authentication

Do not add:

- login
- signup
- password
- sessions
- user accounts
- admin panel
- subscriptions

unless the project requirements explicitly change later.

---

## Rule 2 — No database for the current product

The application is intentionally stateless for the current public tracker.

A profile is analyzed when requested.

No personal user data needs to be permanently stored.

---

## Rule 3 — Use official Codeforces data

Prefer the official Codeforces API.

Do not make web scraping the primary architecture.

---

## Rule 4 — Do not hardcode analytics

Values such as:

```text
90
22
49
41
22
```

are examples from a particular profile/design reference.

They must not become permanent hardcoded application values.

---

## Rule 5 — Separate responsibilities

Backend:

```text
fetch → validate → analyze → return JSON
```

Frontend:

```text
input → request → state → render
```

Do not mix Python analysis logic into React.

Do not put Codeforces API logic directly into UI components.

---

## Rule 6 — Centralize theme configuration

Do not scatter theme colors across dozens of components.

Use a centralized theme system so:

```text
Cipher Gold
Blood Red
Deep Ocean Blue
Neon Synth
```

can switch globally.

---

## Rule 7 — Preserve the exact theme names

These names are fixed:

```text
Cipher Gold
Blood Red
Deep Ocean Blue
Neon Synth
```

Do not rename them without explicit instruction.

---

## Rule 8 — Keep UI data-driven

Components should consume props/state.

For example:

```jsx
<ProfileCard profile={profile} />
```

rather than embedding a specific user's data inside the component.

---

# 31. Error Handling Requirements

The application should handle at least:

### Empty input

Show:

```text
Please enter a Codeforces profile URL.
```

### Invalid Codeforces URL

Show a clear validation message.

### Invalid/nonexistent handle

Show a friendly error.

### Codeforces API failure

Show something like:

```text
Unable to fetch Codeforces data right now. Please try again.
```

Do not expose unnecessary Python stack traces to normal users.

### Loading

When analysis is running:

```text
Analyzing profile...
```

Disable duplicate submissions if appropriate.

---

# 32. Important Data Assumptions

The Codeforces API returns public user/submission data.

The application should account for:

- missing rating fields
- missing max rating fields
- submissions with missing contest IDs
- submissions with missing indexes
- submissions without tags
- duplicate accepted submissions
- users with little/no submission history

Never assume every API object is complete.

---

# 33. Current Example User

A development test profile has been:

```text
__Raman
```

Observed development data included:

```text
Rating: 1054
Rank: newbie
Max Rating: 1054
Max Rank: newbie
```

These values are only for testing and must not be hardcoded into the product.

---

# 34. Current UI Reference

The desired dashboard reference includes:

```text
---------------------------------------------------------
| CF Tracker | Home Profile Skills Analysis | Theme     |
---------------------------------------------------------

| Analyze Profile                                      |
| [ Codeforces profile URL                 ] [Analyze] |

| Profile                                             |
| Avatar | Username                                  |
|        | Rank | Rating | Max Rating | Max Rank      |

| Overall Statistics     | Submission Activity       |
|                       | Heatmap                   |
| Total Solved           |                           |
| Total Topics           |                           |

| Topic-wise Problems Solved                         |
|                                                    |
| Math | Greedy | Implementation | Brute force      |
| ...                                                |

| Recent Submissions                                 |
|                                                    |
---------------------------------------------------------
```

The final UI should be inspired by the supplied visual references while using real application data.

---

# 35. Theme Selector UX

Navbar example:

```text
CF Tracker

Home   Profile   Skills   Analysis

[ Theme ]
```

Clicking the theme button opens a compact menu/popover:

```text
Select Theme

○ Cipher Gold
○ Blood Red
○ Deep Ocean Blue
○ Neon Synth
```

Selecting an item immediately changes the dashboard.

The active theme should be visually identifiable.

---

# 36. State Management

For the current application, React's built-in state is sufficient.

Likely state:

```text
profileData
loading
error
inputValue
selectedTheme
```

No Redux is required unless the application becomes significantly more complex.

---

# 37. Component Philosophy

Use reusable components.

Examples:

```text
Navbar
SearchForm
ProfileCard
StatCard
TopicCard
TopicList
ActivityHeatmap
ChartCard
RecentSubmissions
ThemeSelector
Loading
ErrorMessage
```

Each component should have one clear responsibility.

---

# 38. Security Considerations

The application does not need Codeforces API credentials for public data in the current architecture.

Do not create or expose unnecessary API keys.

Never commit secrets to Git.

Use:

```text
.env
```

for environment-specific secrets if a future service requires them.

Use:

```text
.env.example
```

to document required variables without real secret values.

---

# 39. Production Considerations

Before public deployment:

- restrict CORS to the real frontend domain
- add inbound API rate limiting
- consider caching repeated profile requests
- handle Codeforces API outages
- avoid excessive Codeforces requests
- validate handles
- configure production environment variables
- use HTTPS
- use a production ASGI server configuration
- monitor errors

A simple in-process rate limiter is acceptable for early development, but a multi-worker/multi-instance deployment may require shared state such as Redis.

---

# 40. What a Coding Agent Must NOT Do

Unless explicitly instructed, an agent must not:

1. Add authentication.
2. Add PostgreSQL.
3. Add Redis.
4. Add payments.
5. Add an admin panel.
6. Replace Codeforces API with scraping.
7. Hardcode the example statistics.
8. Remove the four theme names.
9. Rename the themes.
10. Rewrite the project architecture unnecessarily.
11. Introduce a state-management library without need.
12. Change backend API contracts without checking frontend dependencies.
13. Put secrets in source code.
14. Remove existing working backend analysis logic without a reason.

---

# 41. What a Coding Agent Should Do Before Changing Code

Before modifying the project:

1. Read this file completely.
2. Inspect the existing directory.
3. Inspect the existing files.
4. Determine which phase the project is currently in.
5. Preserve working functionality.
6. Make only the changes required for the requested feature.
7. If changing an API response, update the frontend accordingly.
8. Test the changed functionality.
9. Explain which files changed and why.

---

# 42. Code Style Expectations

Prefer:

- clear variable names
- small functions
- reusable React components
- simple state management
- separation of concerns
- defensive API handling
- readable Tailwind classes
- comments only where they add useful context

Avoid:

- unnecessarily complex abstractions
- duplicated logic
- magic numbers where configuration is appropriate
- hardcoded user data
- giant React components when they can be split logically

---

# 43. Final Product Goal

The finished Codeforces Progress Tracker should feel like a polished public analytics platform.

A visitor should be able to:

```text
Open website
    ↓
Paste Codeforces profile URL
    ↓
Click Analyze
    ↓
See profile information
    ↓
See total solved problems
    ↓
See topic coverage
    ↓
See activity analytics
    ↓
See rating/difficulty trends
    ↓
See recent submissions
    ↓
Explore weak/under-practiced topics
    ↓
Receive useful practice recommendations
    ↓
Switch between four visual themes at any time
```

The core product remains:

```text
Public website
+
Codeforces profile URL
+
Official Codeforces API
+
FastAPI analysis
+
React dashboard
+
Four switchable themes
```

No login or database is part of the current product definition.

---

# 44. Current Development Status

At the time this document was created:

- Phase 1: COMPLETE
- Phase 2: COMPLETE
- Phase 3: CORE COMPLETE
- Phase 4: IN PROGRESS

The frontend has been created with Vite and is being developed at:

```text
http://localhost:5173
```

The backend runs at:

```text
http://127.0.0.1:8000
```

The project is currently focused on completing the React dashboard and connecting it cleanly to the existing FastAPI backend.

---

# 45. Source of Truth

This document is the project-context/source-of-truth file for coding agents.

When future requirements conflict with this document, the newest explicit user instruction takes priority.

When implementing a new feature, update this document if the feature changes:

- architecture
- directory structure
- API contract
- data flow
- functionality
- theme system
- phase status
- installation requirements
- deployment requirements
