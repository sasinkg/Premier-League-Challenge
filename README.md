# Premier League Guessing Game

A React + TypeScript web app where users predict the final Premier League table by dragging teams into order, compete in groups, and track their accuracy against the live standings.

## UI

![Main UI](docs/ui.png)

---

## How the Game Works

- The **Live Table** shows the current real Premier League standings, colour-coded by qualification zone
- The **Your Prediction** panel lets you drag teams into your predicted final order
- **One drag allowed per week** — after the season starts (Aug 15) you get one change per week, which resets every Monday
- You can **revert** your drag before submitting if you change your mind
- **Scoring**: for each team, `|predicted position − actual position|`. Lower is better
- Each team row shows a **diff badge** comparing your prediction to the live table (✓ / ▲N / ▼N)

### Groups

- Create or join a group with a shareable code
- Submit your weekly prediction to your group
- See all members' predictions ranked by score with per-team diff highlights

### Live Table Highlights

| Positions | Zone |
|---|---|
| 1–4 | Champions League (blue) |
| 5 | Europa League (orange) |
| 6 | Conference League (green) |
| 18–20 | Relegation (red) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Drag & Drop | @hello-pangea/dnd |
| Auth | Firebase Authentication (Google) |
| Database | Firebase Firestore |
| Standings data | football-data.org API, fetched nightly via GitHub Actions |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |

---

## Local Setup

**Requirements:** Node.js 20+, npm 10+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Create a `.env` file in the project root:

```
VITE_FOOTBALL_API_KEY=your_football_data_api_key
VITE_API_BASE_URL=https://api.football-data.org/v4

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

The standings data (`public/standings.json`) is fetched automatically by the nightly GitHub Actions workflow. To get it locally run:

```bash
curl -H "X-Auth-Token: YOUR_KEY" \
  https://api.football-data.org/v4/competitions/PL/standings \
  -o public/standings.json
```

---

## CI/CD Pipelines

| Workflow | Trigger | What it does |
|---|---|---|
| `ci-checks.yml` | Pull request → main | Lint, security audit, build, CodeQL analysis |
| `firebase-hosting-pull-request.yml` | Pull request | Deploys a preview channel to Firebase |
| `deploy.yml` | Push to main / nightly | Fetches standings, builds, deploys to Firebase live |
| `screenshot.yml` | After deploy succeeds | Screenshots the live site, commits to `docs/ui.png` |

---

## Firestore Data Structure

```
groups/{groupId}
  members/{userId}          — role, displayName, email, joinedAt
  predictions/{weekKey}
    users/{userId}          — uid, displayName, email, teams[], submittedAt
```

`weekKey` is the Monday date of the current week (`YYYY-MM-DD`).

---

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run preview    # Preview production build locally
npm run screenshot # Take a screenshot of the running app
```
