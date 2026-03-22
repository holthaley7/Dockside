# Dockside — San Diego Sport Fishing Intelligence

A full-stack fishing intelligence platform for San Diego sport fishing, featuring 10 curated local species with regulations, tactics, and community data.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or Docker)

### Install & Run

```bash
# Install dependencies
npm install

# Create database
createdb dockside

# Copy env and configure
cp .env.example .env
# Edit DATABASE_URL if needed

# Run migrations
cd packages/server && npx prisma migrate dev

# Seed data
npx tsx prisma/seed.ts

# Start dev (from project root)
cd ../..
npm run dev
```

The API runs on `http://localhost:3001` and the frontend on `http://localhost:5173`.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/species` | List species (query: `zone`, `search`) |
| GET | `/api/species/:slug` | Get species detail |
| GET | `/api/general-info` | Get rules, vocab, links (query: `category`) |

## Project Structure

```
packages/
  client/     # React frontend (Vite)
  server/     # Express API + Prisma
```
