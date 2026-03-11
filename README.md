# RENCI Website Change Requests

An internal tool for RENCI staff to submit website change requests for projects and people. Requests are tracked as tickets on a Monday.com board and reviewed by the web team before any changes go live.

## What it does

Staff can submit requests to:
- **Add** a new project or person to the RENCI website
- **Update** an existing project or person
- **Archive** a project or person

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React, Mantine, React Hook Form |
| Backend | Node.js + Express |
| Ticket tracking | Monday.com |
| Data | GraphQL intermediate API over WordPress |

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- Access to the RENCI VPN (required for GraphQL API and Monday.com)

### Local development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in the required values in .env

# Start both frontend and backend
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

### Running with Docker

See [DOCKER.md](./DOCKER.md) for instructions on building and running the app with Docker.

## Project structure

```
/
├── frontend/         # Vite + React app
│   └── src/
│       ├── components/
│       │   ├── form-elements/   # Pure UI input wrappers
│       │   └── form-blocks/     # RHF-aware shared components
│       ├── pages/               # Route-level page components
│       ├── hooks/               # Custom React hooks
│       └── context/             # React context providers
├── backend/          # Node + Express API
│   ├── routes/       # API route handlers
│   ├── services/     # GraphQL and Monday.com clients
│   └── schemas/      # Request validation schemas
├── .env.example      # Required environment variables
├── DOCKER.md         # Docker setup and usage
└── README.md
```

## Environment variables

Copy `.env.example` to `.env` and fill in the required values. See `.env.example` for descriptions of each variable.

## VPN requirement

The backend connects to the RENCI GraphQL API and Monday.com, both of which require VPN access. The app will return a `503` error with a VPN prompt if the connection cannot be established.