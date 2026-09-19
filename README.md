# CF tagwise_question Tracker

CF tagwise_question Tracker is a public, stateless Codeforces analytics website.

A visitor enters a public Codeforces profile URL and receives an interactive dashboard containing profile information, solved-problem statistics, topic analysis, submission activity, rating progression and solving progress.

No account is required.

## Features

- Public Codeforces profile analysis
- Total unique problems solved
- Total topics covered
- Topic-wise solved problems
- Topic percentages
- Rating filters
- Difficulty filters
- Submission activity heatmap
- Recent submissions
- Rating progression
- Problems-solved-over-time chart
- Responsive dashboard
- Four selectable themes:
  - Cipher Gold
  - blood red theme
  - deep ocean blue
  - Neon Synth
- Theme persistence with browser localStorage
- Codeforces API request throttling
- Temporary in-memory profile caching
- Public API request limiting

## Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Lucide React
- Recharts

### Backend

- Python
- FastAPI
- Requests

### External API

- Codeforces API

### Storage

There is no database.

The application does not store:
- users
- passwords
- accounts
- profile history
- personal records

Theme preference is stored only in the visitor's browser using localStorage.

## Architecture

```text
Browser
   |
   v
React + Vite
   |
   | HTTP
   v
FastAPI
   |
   +----> Codeforces user.info
   |
   +----> Codeforces user.status
   |
   +----> Codeforces user.rating
   |
   v
Python Analyzer
   |
   v
Clean JSON
   |
   v
React Dashboard
