# DegreePlanner Lite

A full-stack web app for UW-Madison CS students to plan their semesters and track progress toward a Computer Sciences BS degree.

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL

### Backend

```bash
cd backend
npm install
cp .env.example .env  # edit with your DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
cd backend
npm test
```
