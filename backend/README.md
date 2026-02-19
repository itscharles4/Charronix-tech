# Charronix Backend API

Production-ready Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis backend for the Charronix School Management System.

## 🚀 Quick Start

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL + Redis)

### 1. Start the Database & Redis
```bash
cd backend
docker-compose up -d
```
This starts PostgreSQL 16 on port 5432 and Redis 7 on port 6379.

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` — the defaults match `docker-compose.yml` so it works out of the box.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Database Migrations
```bash
npm run prisma:migrate
```

### 5. Seed the Database
```bash
npm run prisma:seed
```
This creates:
- **Admin**: `admin@charronix.edu` / `Admin@1234`
- **Teacher**: `meera.iyer@charronix.edu` / `Teacher@1234`
- **Student**: `aarav.sharma@student.charronix.edu` / `Student@1234`

### 6. Start the Server
```bash
npm run dev
```
Server runs at `http://localhost:5000`

---

## 📡 API Reference

Base URL: `http://localhost:5000/api/v1`

| Module | Route | Auth Required |
|---|---|---|
| Auth | `/auth` | Partial |
| Students | `/students` | ✅ |
| Teachers | `/teachers` | ✅ |
| Attendance | `/attendance` | ✅ |
| Grades | `/grades` | ✅ |
| Notices | `/notices` | ✅ |
| Dashboard | `/dashboard` | ✅ |
| Analytics | `/analytics` | ✅ Teacher+ |
| Notifications | `/notifications` | ✅ |
| Audit Logs | `/audit` | ✅ Admin only |
| Settings | `/settings` | ✅ |
| AI Chat | `/ai` | ✅ |

### Authentication
```bash
# Login
POST /api/v1/auth/login
{ "email": "admin@charronix.edu", "password": "Admin@1234" }

# Use token in header
Authorization: Bearer <accessToken>

# Refresh token
POST /api/v1/auth/refresh
{ "refreshToken": "<refreshToken>" }
```

---

## 🛠️ Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:seed` | Seed database |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |
| `npm run prisma:reset` | Reset database (⚠️ deletes all data) |

---

## 🏗️ Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # 31-table database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── config/            # Database, env, CORS config
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Auth, role, validate, errors, rate limiting
│   ├── routes/            # Express routers (19 modules)
│   ├── services/          # Business logic + Redis cache
│   ├── utils/             # JWT, password, pagination, logger
│   ├── validators/        # Zod schemas
│   ├── __tests__/         # Integration tests
│   ├── app.ts             # Express app
│   └── server.ts          # HTTP server entry point
├── docker-compose.yml     # PostgreSQL + Redis
├── .env.example           # Environment template
└── README.md
```

---

## 🔒 Security Features

- **JWT** access tokens (15m) + refresh tokens (7d) with rotation
- **Account lockout** after 5 failed login attempts (30 min)
- **Session tracking** per device/IP
- **Audit logging** for all create/update/delete actions
- **Rate limiting**: 100 req/15min global, 10 req/15min for auth
- **Helmet** security headers
- **Zod** input validation on all endpoints

---

## 🐳 Docker

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis
```
