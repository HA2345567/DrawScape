# Drawscape

Drawscape is a browser-based whiteboard for sketching software architecture and sharing diagram elements in real time. It combines an interactive HTML Canvas editor with a Next.js frontend, an Express API, a JWT-authenticated WebSocket service, and PostgreSQL through Prisma.

> **Project status:** This README describes the capabilities present in this repository. The canvas currently loads chat records from the API and broadcasts shape messages over WebSockets; the WebSocket service does not write those messages to PostgreSQL. See [Known limitations](#known-limitations) before treating this as production-ready.

## Features

- Draw rectangles, diamonds, ellipses, arrows, lines, freehand strokes, text, and images.
- Select, move, resize, and erase canvas elements; use undo and redo, zoom, and pan.
- Add images from a local file using the image tool or drag and drop.
- Join a room and broadcast shape messages to connected room members over WebSockets.
- Register and sign in with email and password, or use Google OAuth when configured.
- Create rooms and load the latest 50 chat records for a room through the HTTP API.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, HTML Canvas, Tailwind CSS 4 |
| HTTP API | Express 5, TypeScript, Zod validation, JWT, Google OAuth |
| Realtime | Node.js WebSocket server (`ws`), JWT verification |
| Data | PostgreSQL, Prisma 7, `pg` connection pool |
| Monorepo | Bun workspaces, Turborepo |

## Architecture

```mermaid
flowchart TB
  subgraph Client[Browser]
    UI[Next.js and React UI]
    Canvas[HTML Canvas editor\nLocal element state and history]
    UI --> Canvas
  end

  subgraph Services[Application services]
    API[Express HTTP API\n:3001]
    Realtime[WebSocket relay\n:8080]
    Auth[JWT verification]
    Rooms[In-memory connection and room membership]
    Realtime --> Auth
    Realtime --> Rooms
  end

  subgraph Data[Persistence]
    Prisma[Prisma client]
    PostgreSQL[(PostgreSQL)]
    Prisma --> PostgreSQL
  end

  UI -->|REST: signup, signin, room, history| API
  API -->|Prisma queries| Prisma
  Canvas -->|Connect with JWT query parameter| Realtime
  Canvas -->|join_room, leave_room, chat| Realtime
  Realtime -->|Broadcast to connected room members| Canvas
  Canvas -->|GET chat history| API

  Realtime -. "No persistence in current implementation" .-> PostgreSQL
```

### Request and data flows

1. **Authentication:** The browser sends sign-up/sign-in requests to the Express API. The API validates input with shared Zod schemas, queries PostgreSQL through Prisma, and returns a JWT. Google OAuth is handled by the API when configured.
2. **Room setup:** The browser can create a room through the authenticated `POST /api/v1/room` endpoint. The API stores room metadata and its owner in PostgreSQL.
3. **Canvas editing:** The React canvas keeps elements and undo/redo history in client-side state and draws them with the Canvas 2D API.
4. **Live collaboration:** A room client opens a WebSocket connection using its JWT, sends `join_room`, then broadcasts element messages with `chat`. The WebSocket service verifies the token, keeps connection-to-room membership in process memory, and relays each message to currently connected members of that room.
5. **History reads:** The canvas requests `GET /api/v1/chats/:roomId`; the API reads up to 50 chat rows from PostgreSQL through Prisma.

**Current persistence boundary:** The WebSocket relay does not store the messages it broadcasts. Therefore, live canvas changes are not guaranteed to appear in the database-backed history after reconnecting. The dashed arrow in the diagram marks this missing write path. The current in-memory room registry also applies only to one WebSocket server process.

## Getting started

### Prerequisites

- Bun 1.2.19 (the version declared by this repository)
- Node.js 24 or later
- PostgreSQL

### Install and configure

```bash
bun install
```

Create a root `.env` file with:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/drawscape?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
```

For Google sign-in, also configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and optionally `GOOGLE_REDIRECT_URI` and `FRONTEND_URL`. The default callback URL is `http://localhost:3001/api/v1/auth/google/callback`.

Apply the Prisma migrations and generate the client from the database package, which contains the Prisma 7 configuration:

```bash
cd packages/db
bunx prisma migrate deploy --config prisma7.config.ts
bun run generate
```

### Run locally

Start the three applications in separate terminals:

```bash
bun run --filter frontend dev
bun run --filter http-backend dev
bun run --filter ws-backend dev
```

The frontend is available at [http://localhost:3000](http://localhost:3000). The API listens on port `3001` and the WebSocket server on port `8080`. The frontend currently points to these local URLs in `apps/frontend/config.ts`; change that configuration when deploying to another environment.

## API overview

The HTTP API is mounted under `/api/v1`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/signup` | Validate input, create an account, and return a JWT |
| `POST` | `/signin` | Validate credentials and return a JWT |
| `POST` | `/room` | Create a room (requires `Authorization` token) |
| `GET` | `/chats/:roomId` | Read up to 50 chat records for a numeric room ID or room slug |
| `GET` | `/room/:slug` | Look up a room by slug |
| `GET` | `/auth/google` | Start Google OAuth |
| `GET` | `/auth/google/callback` | Handle the Google OAuth callback |

The WebSocket service accepts a JWT in the `token` query parameter. Clients can send `join_room`, `leave_room`, and `chat` messages. A chat message is relayed to currently connected clients joined to the same room.

## Measuring performance

The following are **local development measurements**, not production capacity claims. They were collected on 2026-10-26 on the Windows development machine using Bun 1.4.2 for the WebSocket server and Node.js 24.5.0 for the client. The WebSocket clients connected over localhost without TLS; results do not represent internet latency.

| Measurement | Result | Method and limits |
| --- | --- | --- |
| WebSocket relay latency | 50 connected clients (49 peers), 200 sequential messages: p50 **3.59 ms**, p95 **4.68 ms**, p99 **7.34 ms** | Client send until the last peer received each message; localhost only |
| WebSocket fan-out run | **200 concurrent clients**, 100 broadcasts, **20,000/20,000** deliveries received, 0 delivery errors; batch **838.6 ms** (~**23,850 client deliveries/s**) | Clients joined one room; a single sender sent messages back-to-back. This verifies a 200-client test point, not the maximum capacity |
| API history latency | **Not measured** | `GET /api/v1/chats/1` did not return within a 5-second request timeout. No API percentile is reported; the endpoint depends on the configured PostgreSQL connection |
| Canvas frame time | **Not measured** | No browser frame-time benchmark is present in the project, so no rendering figure is claimed |

Do not present local WebSocket figures as production SLAs or general internet latency. Before making a capacity claim, repeat the test on the deployment with realistic network conditions, add concurrent publishers, track disconnects and errors, and increase client count until a defined latency or error threshold is crossed. Measure API latency after confirming the database is reachable. Use browser performance APIs to measure frame time while rendering a documented number of elements on a named browser/device.

Useful measurements to add:

| Metric | Suggested measurement |
| --- | --- |
| API latency | p50/p95/p99 response time for sign-in, room creation, and history reads under a fixed request rate |
| Realtime latency | Client send-to-receive time between two clients, reported as p50/p95 with region and network conditions |
| Realtime capacity | Concurrent WebSocket connections and messages/second before error rate or latency exceeds a stated threshold |
| Canvas responsiveness | Frame time while dragging or rendering a documented number of elements on a named test device/browser |
| Reliability | Request success rate, WebSocket disconnect rate, and reconnect behavior during a defined test window |

Record the commit, deployment region, instance/database sizes, test duration, request rate, and number of samples alongside results. Use a load-testing tool and browser performance APIs; keep benchmark scripts and methodology in the repository so results can be reproduced.

## Resume bullets

Choose bullets that match the work you personally did, and keep the workload context attached to benchmark figures.

**Full-stack / frontend version**

> Built Drawscape, a collaborative architecture whiteboard using Next.js, React, TypeScript, and HTML Canvas, with drawing, selection, resize, erase, undo/redo, zoom, pan, and image import tools.

**Backend / realtime version**

> Implemented an Express and JWT-authenticated WebSocket backend with room membership and PostgreSQL/Prisma APIs for accounts, rooms, and chat-history reads.

**Measured WebSocket version (local test conditions)**

> Load-tested the WebSocket room relay with 200 concurrent localhost clients: delivered all 20,000 fan-out events with 0 delivery errors (~23,850 client deliveries/s); measured 4.68 ms p95 send-to-last-peer latency separately with 49 peers on localhost.

The WebSocket numbers are local development results, not production figures. Keep the workload and local test context in the bullet unless you rerun the benchmark on a deployed environment. API latency and canvas frame time are still unmeasured. Include a live demo and source link on your resume if they are available and working.

## Known limitations

- WebSocket messages are broadcast to connected room members but are not persisted by the WebSocket server. The HTTP history endpoint reads PostgreSQL chat records, so realtime messages sent through the current WebSocket flow are not guaranteed to appear after reconnecting.
- The client sends the JWT in the WebSocket URL query string. Production deployments should use secure transport and avoid exposing credentials in logs.
- Email/password handling currently compares and stores the submitted password directly. Add a password hashing scheme and review authentication/session handling before using real accounts.
- Room membership and broadcast routing are held in process memory; there is no shared presence store for multiple WebSocket server instances.
- The frontend API and WebSocket addresses are hard-coded to localhost in `apps/frontend/config.ts`.
- API latency and canvas frame time remain unmeasured. The WebSocket figures above are a single local test run, not a production capacity claim.

## Repository layout

```text
apps/
  frontend/       Next.js application and canvas editor
  http-backend/   Express REST API and Google OAuth routes
  ws-backend/     WebSocket room membership and message relay
packages/
  common/         Shared request validation schemas
  backend-common/ Backend environment configuration
  db/             Prisma schema, migrations, and database client
  ui/             Shared UI components
```
