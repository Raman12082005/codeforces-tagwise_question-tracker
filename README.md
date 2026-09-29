# CF tagwise_question Tracker

A full-stack web application that analyzes a Codeforces profile
and provides detailed statistics about competitive programming progress.

A visitor enters a public Codeforces profile URL and receives an interactive dashboard containing profile information, solved-problem statistics, topic analysis, submission activity, rating progression and solving progress.

No account is required.

## Live Demo
https://codeforces-tracker-nu.vercel.app/

## Features

- Codeforces profile analysis
- Rating and rank information
- Maximum rating
- Total unique problems solved
- Topic-wise analysis
- Difficulty distribution
- Rating progression
- Solved problems over time
- Recent submissions
- Heatmap
- Rating/difficulty filters
- Multiple UI themes

## Tech Stack

Frontend:
- React
- Vite
- Tailwind CSS
- Lucide React
- Recharts

Backend:
- Python
- FastAPI
- Requests

Deployment:
- Vercel

API:
- Codeforces API

### Storage

There is no database.

## Architecture

User -> React Frontend -> FastAPI Backend -> Codeforces API -> Analyzer -> JSON Response -> Dashboard


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
