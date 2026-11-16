# Pocketly 🌿💸

> Student Expense Tracker with AI Chatbot. Built with an editorial Gen-Z fintech aesthetic.

---

## 🏗️ Architecture & Monorepo Structure

```
pocketly/
├── client/              # React 18 + Vite (Tailwind CSS, TanStack Query, React Hook Form + Zod, Recharts, Lucide)
├── server/              # Node.js + Express (Prisma ORM, PostgreSQL, JWT, Gemini Chatbot)
├── docker-compose.yml   # PostgreSQL 16 container setup
├── package.json         # Monorepo workspaces config
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **Docker & Docker Compose** (for PostgreSQL)

### 2. Start PostgreSQL with Docker
```bash
docker compose up -d
```

### 3. Setup Server
```bash
cd server
npm install
# Copy environment variables (if not already set)
cp .env.example .env

# Generate Prisma client & run database migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed realistic demo data (Admin, Demo Users, 11 Categories, Wallets, ~150 Transactions, Budgets, Saving Goals)
npm run db:seed
# or: npx prisma db seed

# Start dev server (runs on http://localhost:5000)
npm run dev
```

Test health check:
```bash
curl http://localhost:5000/api/v1/health
```

### 👤 Demo Credentials after Seeding
- **Admin**: `admin@pocketly.com` / `Admin@123` (Role: ADMIN)
- **Demo User 1**: `user1@pocketly.com` / `User@123` (~150 realistic student transactions)
- **Demo User 2**: `user2@pocketly.com` / `User@123` (~150 realistic student transactions)

### 4. Setup Client
```bash
cd ../client
npm install
npm run dev
```
Client runs on: `http://localhost:5173`

---

## 🎨 UI & Design Palette
- **Primary Forest Green**: `#123D2F`
- **Accent Tangerine**: `#FF6A2B`
- **Accent Lime**: `#D4F05A`
- **Coral (Expense)**: `#FF8A7A`
- **Background**: `#F6F2EA`
- **Surface**: `#FFFFFF`
- **Border**: `#E8E2D6`
- **Ink**: `#16211C`
