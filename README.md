# Code Interview Platform

Real-time collaborative coding platform for technical interviews.

## Features
- Real-time collaborative code editing
- Code execution (40+ languages via Piston API)
- WebSocket-based chat and presence
- Session recording and playback
- Interviewer scorecards

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Socket.io
- **Database:** PostgreSQL
- **Real-time:** Yjs + y-websocket
- **Deployment:** Docker + Render (Free Tier)

## Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start with Docker Compose
docker-compose up

# Access application
http://localhost
```

### Environment Variables
See `.env.example` for required variables.

## Project Structure
```
├── backend/          # Node.js Express API
├── frontend/         # React Vite application
├── docker-compose.yml
└── Dockerfile        # Production all-in-one container
```

## Documentation
- [Technical Specification](docs/technical_specification.md)
- [API Documentation](docs/openapi.yaml)
