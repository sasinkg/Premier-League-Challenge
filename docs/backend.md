# Backend Documentation — Premier League Challenge

## Overview

The backend for Premier League Challenge is a lightweight Node.js service responsible for securely fetching and normalizing live Premier League standings data.

Primary responsibilities:

- Act as a secure proxy to the Football-Data.org API
- Prevent exposure of third-party API keys
- Return a clean, frontend-friendly data model
- Remain stateless, fast, and easy to deploy

The backend intentionally avoids persistence, authentication, and complex business logic.

## Repository Structure

```
Premier-League-Challenge-1/
├── .github/
├── dist/
├── docs/
│ ├── backend.md
│ ├── backend.txt
│ └── ui.png
├── node_modules/
├── public/
│ └── vite.svg
├── scripts/
│ └── screenshot.mjs
├── server/
│ └── epl.ts
├── src/
│ ├── App.css
│ ├── App.tsx
│ ├── index.css
│ ├── main.tsx
│ ├── api/
│ │ └── premierLeague.ts
│ ├── assets/
│ │ └── logos/
│ ├── components/
│ │ ├── LeadersPanel.tsx
│ │ ├── LiveTablePanel.tsx
│ │ ├── PanelHeader.tsx
│ │ └── PredictionPanel.tsx
│ ├── styles/
│ │ └── appStyles.ts
│ └── utils/
│ └── scoring.ts
├── .env? (not committed / local)
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
```

All backend logic lives outside the frontend `src/` directory. This ensures:

- API keys are never bundled into client code
- Server-only dependencies do not affect frontend builds
- Clear separation of frontend and backend responsibilities

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- API Pattern: Serverless-style handler
- External API: Football-Data.org (v4)

## Environment Variables

The backend requires the following environment variable:

```
VITE_FOOTBALL_API_KEY=your_api_key_here
```

Notes:

- This key must NEVER be exposed to the frontend
- It is accessed only inside `server/epl.ts`
- Configure it locally via `.env` or `.env.local`
- Configure it in production via your hosting provider

## API Endpoints

### GET /api/epl

**Description**

Fetches the current Premier League standings.

This endpoint:

- Calls the Football-Data.org standings API
- Extracts only the fields required by the frontend
- Returns teams ordered by current league position
- Is read-only and requires no authentication

#### Request

```
GET /api/epl
```

No query parameters required.

#### Response

Example response:

```json
[
  {
    "position": 1,
    "name": "Manchester City",
    "logo": "https://crests.football-data.org/65.svg"
  },
  {
    "position": 2,
    "name": "Arsenal FC",
    "logo": "https://crests.football-data.org/57.svg"
  }
]
```

##### Response fields

- `position` (number) — Current league position
- `name` (string) — Club name
- `logo` (string) — URL to club crest image

## Type Definitions

The backend response conforms to the following TypeScript shape:

```ts
type LiveStanding = {
  position: number;
  name: string;
  logo: string;
};
```

Frontend UI types (such as draggable prediction lists) are derived from this base model.

## Data Flow

```
Frontend (React / Vite)
  ↓
GET /api/epl
  ↓
Backend (server/epl.ts)
  ↓
Football-Data.org API
  ↓
Normalized JSON response
  ↓
Frontend UI
```

## Error Handling

If the external API request fails, the backend responds with a server error:

```json
{
  "error": "Failed to fetch EPL standings"
}
```

- Errors are intentionally generic
- No internal or third-party details are leaked
- The frontend is responsible for displaying user-friendly messaging

## Security Considerations

- API keys are stored server-side only
- No user input is accepted
- No database or persistent storage is used
- The endpoint is safe to expose publicly as read-only data

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` or `.env.local` file:

```text
FOOTBALL_API_KEY=your_api_key_here
```

3. Start the dev server:

```bash
npm run dev
```

4. Access the endpoint (depending on dev proxy configuration):

```
http://localhost:5173/api/epl
```

## Deployment Notes

- Compatible with Vercel, Netlify, or custom Node servers
- Ensure `FOOTBALL_API_KEY` is configured in the hosting environment
- No database or migrations required
- Stateless and horizontally scalable

## Future Enhancements

Potential backend improvements include:

- Response caching to reduce third-party API usage
- Rate limiting for public traffic
- Historical standings snapshots
- Group leaderboard persistence
- Auth-protected endpoints for write operations

## Design Philosophy

The backend is intentionally minimal:

- Does one thing well
- Avoids unnecessary abstraction
- Keeps the frontend secure and simple
- Scales naturally with traffic
