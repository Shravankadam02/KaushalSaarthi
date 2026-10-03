# KaushalSaarthi

KaushalSaarthi is an AI-enabled career counselling and family decision-support platform for vocational education, built for Smart India Hackathon problem statement 26241 from the Ministry of Skill Development and Entrepreneurship.

The platform helps learners and parents make vocational career decisions together using simple multilingual guidance, district-aware outcome data, career progression explanations, and human counsellor escalation.

## Why It Exists

Vocational choices are often shaped by family concerns about:

- Income and earning potential
- Job security and placement
- Social status compared with degree routes
- Safety and training quality
- Further education and career progression

KaushalSaarthi treats the family as the counselling user rather than supporting only the learner.

## Core Features

- Family onboarding with English, Marathi, and Hindi language selection
- Parent/Learner speaker toggle in the shared counselling chat
- Gemini-powered multilingual counselling
- Qdrant retrieval over vocational trade and outcome evidence
- Anti-hallucination guidance for salary and placement figures
- Trade explorer and trade detail pages
- Skill-level and career progression explainer
- District and language-aware counsellor discovery
- Human call, WhatsApp, or visit request flow
- Counsellor escalation queue with case outcomes
- Admin resistance dashboard
- District resistance, objection mix, sentiment shift, and CSV export
- Voice input and text-to-speech support where the browser allows it
- Clearly labelled sample outcome data and synthetic demo engagement data

## Architecture

```text
React/Vite client :5173
        |
        v
Express server :5000  --->  MongoDB Atlas
        |
        v
AI service :8001  --->  Gemini chat and embeddings
        |
        v
Qdrant Cloud: vocational_kb
```

### Client

Location: `client/`

The React client contains:

- Public landing and login screens
- Family onboarding and family home
- Joint family chat
- Trade explorer and trade detail
- Skill-level explainer
- Counsellor request page
- Counsellor queue
- Administrator resistance dashboard

### Main server

Location: `server/`

The Express/Mongoose server provides:

- JWT authentication and role checks
- Family registration and profiles
- Trade, provider, and outcome APIs
- Outcome CSV upload
- Chat proxy with server-built family context
- Counsellor requests and notifications
- Escalation management
- Administrator insight APIs and CSV export

### AI service

Location: `ai-service/`

The AI service provides:

- Gemini chat generation
- Gemini 768-dimensional embeddings
- Qdrant retrieval
- Multilingual language normalization
- Objection and sentiment logging
- Distress and human-help escalation
- Grounded fallback responses when Gemini is temporarily unavailable

## RAG Flow

1. A family submits a question from `/chat`.
2. The server verifies the JWT and loads the authenticated family profile.
3. The server builds family context containing district, education, income bracket, interests, language, and speaker.
4. The AI service normalizes the language and classifies the objection.
5. The message is embedded using `gemini-embedding-001`.
6. Qdrant searches the `vocational_kb` collection using a language payload filter.
7. Marathi or Hindi retrieval falls back to English when localized chunks are unavailable.
8. Retrieved evidence is added to the counselling prompt.
9. Gemini writes a short, respectful response.
10. Only retrieved evidence may be used for salary, placement, or other numeric claims.
11. The user message, AI message, sentiment, objection, and session state are stored.
12. The client renders the response and evidence cards.
13. If Gemini is unavailable, the AI service returns a response constructed from retrieved evidence instead of inventing facts.

The ingestion command recreates the Qdrant collection, creates the language keyword index, generates embeddings, and uploads the current sample trade/outcome chunks:

```powershell
cd ai-service
npm run ingest
```

## Data Model Summary

Main collections include:

- `User`: authentication, roles, counsellor coverage, family link
- `Family`: learner, parent, district, income, education, interests, language, consent
- `Trade`: sector, skill level, duration, eligibility, roles, progression
- `Provider`: training centre, district, offered trades, fees, verification state
- `OutcomeStat`: placement, salary, batch, district, year, source, verification state
- `ChatSession`: language, district, sentiment start/latest, feeling, escalation state
- `ChatMessage`: speaker, language, objection, sentiment, evidence references
- `ObjectionLog`: family resistance categories and resolution state
- `Escalation`: human handoff, contact preference, status, outcome, counsellor notes

## Setup

### Requirements

- Node.js 18 or later
- MongoDB Atlas or a local MongoDB instance
- Gemini API key
- Qdrant Cloud cluster and API key

Install all dependencies from the repository root:

```powershell
npm run install:all
```

### Server environment

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
AI_SERVICE_URL=http://localhost:8001
CLIENT_URL=http://localhost:5173
```

### AI service environment

Create `ai-service/.env`:

```env
PORT=8001
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_CHAT_MODEL=gemini-3.8-flash
GEMINI_EMBED_MODEL=gemini-embedding-001
EMBEDDING_DIM=768
QDRANT_URL=your_qdrant_cluster_url
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION=vocational_kb
```

Never commit `.env` files or paste credentials into chat or documentation.

### Start the application

From the repository root:

```powershell
npm start
```

The services run on:

- Client: `http://localhost:5173`
- Main server: `http://localhost:5000`
- AI service: `http://localhost:8001`

Vite may use another port when 5173 is already occupied.

## Database Seeding

The clean KaushalSaarthi seed creates core sample data:

```powershell
cd server
npm run seed:kaushal
```

It creates:

- 10 trades
- 12 providers
- 180 outcome-stat rows
- 3 real demo family profiles
- Admin and counsellor demo accounts

The seed also clears legacy dropout, old counselling, chat, escalation, notification, and objection collections so the project starts cleanly.

To populate administrator charts and counsellor queues with clearly labelled synthetic engagement:

```powershell
npm run seed:synthetic
```

This creates:

- 60 synthetic families
- 450 synthetic sessions
- 900 messages
- 450 objection logs
- 41 escalations

All generated engagement records contain `isSynthetic: true` and the administrator dashboard displays a synthetic-data label.

## Demo Accounts

All demo accounts use password:

```text
demo1234
```

Accounts available in the login selector:

```text
Family Marathi:  fam-001@demo.local
Family English:  fam-002@demo.local
Counsellor:      counsellor1@msde.demo
Counsellor:      counsellor2@msde.demo
Administrator:   admin@msde.demo
```

## Demo Flow

1. Open the login page.
2. Select the Marathi family demo account.
3. Open family counselling.
4. Switch between Parent and Learner.
5. Ask a Marathi question about income, status, safety, or further education.
6. Show the retrieved outcome evidence.
7. Explore a trade and its career ladder.
8. Request a counsellor call.
9. Sign in as a counsellor and show the case queue.
10. Sign in as an administrator and show district resistance, objections, sentiment, and export.

## Sample Data Honesty

The current outcome rows are sample data for demonstration and are not official MSDE statistics. The interface labels them as sample data. The outcome CSV upload pipeline is designed to accept an official dataset later, with source, dataset version, verification state, and rejected-row reporting.

Synthetic engagement is also labelled and should not be presented as real program impact.

## Validation

Useful local checks:

```powershell
cd client
npm run build
npm run lint

cd ../server
node --check server.js
node --check scripts/seed_kaushal.js
node --check scripts/generate_sessions.js

cd ../ai-service
node --check server.js
node --check routes/chat.js
node --check services/gemini.js
node --check services/qdrant.js
```

## Known Limitations

- Official MSDE/NSDC/DGT outcome data still needs to replace the sample dataset.
- Current Qdrant sample chunks are English; Marathi and Hindi knowledge chunks can be added for stronger native retrieval.
- Voice recognition and Marathi text-to-speech depend on the device browser.
- Production deployment still needs rate limiting, message caps, monitoring, HTTPS, and stronger audit logging.
- Synthetic data is for demo realism and must remain clearly separated from real engagement data.

## Documentation

For the complete architecture, execution flow, RAG explanation, data model details, API surface, privacy notes, and judge-presentation guidance, see:

[KAUSHALSAARTHI_PLATFORM_GUIDE.md](KAUSHALSAARTHI_PLATFORM_GUIDE.md)

## Built For

Smart India Hackathon 2026

Problem Statement 26241

Ministry of Skill Development and Entrepreneurship
