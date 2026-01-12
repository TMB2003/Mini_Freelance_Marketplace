# Mini Freelance Marketplace

A full‑stack mini freelance marketplace where clients can post gigs, freelancers can bid, clients can hire, and both parties can chat in real time for assigned gigs.

## Features

- **Authentication**
  - Register / Login with JWT.
- **Gigs**
  - Clients can post gigs.
  - Public gig browsing.
- **Bidding & Hiring**
  - Freelancers can place bids.
  - Gig owner can review bids and hire a freelancer.
  - Hiring updates gig/bid status.
- **Real‑time Chat (Socket.IO)**
  - Chat is available only for **assigned** gigs.
  - Messages are **persistent** (stored in MongoDB).
  - Real‑time message delivery using Socket.IO rooms.

## Tech Stack

- **Frontend**: React + TypeScript + MUI + React Query + Axios + Socket.IO Client
- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT + Socket.IO

## Project Structure

```txt
Mini_Freelance_Marketplace/
  backend/
    src/
      controller/
      middleware/
      model/
      socket.ts
      index.ts
      route.ts
  frontend/
    src/
      pages/
      components/
      services/
```

## Prerequisites

- **Node.js** (recommended: Node 18+)
- **npm**
- **MongoDB** connection string (MongoDB Atlas or local MongoDB)

## Environment Variables

### Backend (`backend/.env`)

Create a file named `backend/.env` with the following:

```env
# Server
PORT=3000

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Socket.IO CORS (used by backend/src/socket.ts)
FRONTEND_URL=http://localhost:5173
```

Notes:

- **`MONGODB_URI`** is required for the app to connect to MongoDB.
- **`JWT_SECRET`** is required for both HTTP auth middleware and Socket.IO authentication.
- **`FRONTEND_URL`** is used for Socket.IO CORS configuration.

### Frontend env

This frontend currently uses hardcoded URLs:

- API: `http://localhost:3000/api` (`frontend/src/services/api.ts`)
- Socket: `http://localhost:3000` (`frontend/src/services/socket.ts`)

If you want to run against a different backend URL, update those two files.

## Installation

### 1) Install backend dependencies

```bash
npm install
```

Run it from the `backend/` folder.

### 2) Install frontend dependencies

```bash
npm install
```

Run it from the `frontend/` folder.

## Running the Project (Development)

### Start backend

From `backend/`:

```bash
npm run dev
```

Backend runs on:

- `http://localhost:3000`
- API base: `http://localhost:3000/api`

### Start frontend

From `frontend/`:

```bash
npm start
```

Frontend runs on:

- `http://localhost:5173`

## Core API Routes

All routes are prefixed with `/api`.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Gigs

- `GET /api/gigs`
- `POST /api/gigs` (auth)

### Bids

- `POST /api/bids` (auth)
- `GET /api/bids/:gigId` (auth)
- `PATCH /api/bids/:bidId/hire` (auth)

### Chat

- `GET /api/chat/gigs` (auth)
- `GET /api/chat/:gigId/messages` (auth)

## Socket.IO Events

Socket.IO server runs on the backend server (`http://localhost:3000`).

Client connects with JWT token (sent in `auth.token`).

- **`chat:join`** `{ gigId }`
  - Joins room: `gig:<gigId>`
  - Allowed only if the gig is `assigned` and user is the owner or hired freelancer.
- **`chat:send`** `{ gigId, text }`
  - Persists message to MongoDB.
  - Broadcasts to room via **`chat:message`**.
- **`chat:message`** (server → clients)
  - Message payload for live updates.

## Troubleshooting

- **MongoDB not connecting**
  - Check `MONGODB_URI` in `backend/.env`.
- **401 Not authenticated**
  - Ensure the frontend has a valid JWT token in `localStorage`.
- **Socket connection fails**
  - Ensure `JWT_SECRET` is set.
  - Ensure `FRONTEND_URL` matches the frontend origin (default `http://localhost:5173`).
  - Restart backend after changing `.env`.

## License

ISC