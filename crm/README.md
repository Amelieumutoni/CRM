# B2B Sales CRM

Full-stack CRM for B2B software sales teams. Daniella and amelie
Manage companies, contacts, deals, activities, and follow-ups in one place.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + React Router v6   |
| HTTP       | Axios                               |
| Backend    | Node.js + Express 4                 |
| Database   | MongoDB + Mongoose                  |
| Styling    | Plain CSS (no Tailwind/Bootstrap)   |

> ✅ 100% pure JavaScript — no C++ compilation, works on Windows/Mac/Linux

---

## Prerequisites

Install these once on your machine:

1. **Node.js 18+** → https://nodejs.org  (click LTS)
2. **MongoDB** — choose one:
   - **Cloud (easiest):** Free cluster at https://www.mongodb.com/cloud/atlas
   - **Local (Windows):** https://www.mongodb.com/try/download/community
   - **Local (Mac):** `brew tap mongodb/brew && brew install mongodb-community`
   - **Local (Linux):** https://www.mongodb.com/docs/manual/administration/install-on-linux/

---

## Quick Start (step by step)

### 1 — Get the project

```bash
# If you have a zip:
unzip b2b-crm.zip
cd b2b-crm

# If you have a git repo:
git clone <url>
cd b2b-crm
```

Open the folder in VS Code:
```bash
code .
```

### 2 — Configure the backend

```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env        # Mac / Linux
```

Open `backend/.env` and set your MongoDB connection string:

```
# MongoDB Atlas (cloud) — paste your connection string:
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/b2b_crm?retryWrites=true&w=majority

# MongoDB local:
MONGO_URI=mongodb://localhost:27017/b2b_crm

PORT=5000
NODE_ENV=development
```

### 3 — Start the backend

Open a terminal in VS Code (`Ctrl+backtick`):

```bash
cd backend
npm install
npm run dev
```

You should see:
```
MongoDB connected ✅
Backend running → http://localhost:5000
Sample data seeded ✅
```

### 4 — Start the frontend

Open a **second terminal** (click the + icon):

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. The CRM is running.

---

## Project Structure

```
b2b-crm/
├── backend/
│   ├── src/
│   │   ├── models/          Mongoose schemas (Company, Contact, Deal, Activity)
│   │   ├── routes/          Express route handlers
│   │   ├── controllers/     Business logic per resource
│   │   ├── middleware/       Error handler, async wrapper
│   │   └── seed.js          Sample data loader
│   ├── server.js            Entry point
│   ├── .env.example         Copy to .env and fill in MONGO_URI
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             Axios calls (one file per resource)
    │   ├── components/      Reusable UI (Sidebar, Modal, Badge, Avatar...)
    │   ├── pages/           Full page views (Dashboard, Deals, Pipeline...)
    │   ├── hooks/           useApi data-fetching hook
    │   ├── context/         Global toast notifications
    │   └── utils/           Helpers: formatCurrency, formatDate, constants
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## API Endpoints

### Companies
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/companies | List all |
| GET | /api/companies/:id | Get one (with contacts + deals + activities) |
| POST | /api/companies | Create |
| PUT | /api/companies/:id | Update |
| DELETE | /api/companies/:id | Delete |

### Contacts
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/contacts | List all |
| POST | /api/contacts | Create |
| PUT | /api/contacts/:id | Update |
| DELETE | /api/contacts/:id | Delete |

### Deals
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/deals | List all (filter: ?stage=&q=) |
| GET | /api/deals/:id | Get one (with activities) |
| POST | /api/deals | Create |
| PUT | /api/deals/:id | Update / move stage |
| DELETE | /api/deals/:id | Delete |

### Activities
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/activities | List all |
| POST | /api/activities | Log new |
| PUT | /api/activities/:id | Update |
| PATCH | /api/activities/:id/toggle | Toggle complete |
| DELETE | /api/activities/:id | Delete |

### Dashboard
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/dashboard/stats | Pipeline value, forecast, won revenue |
| GET | /api/dashboard/upcoming | Next 20 pending tasks |

---

## Resetting Sample Data

```bash
# In backend terminal:
# Stop the server (Ctrl+C), then:
node src/seed.js --reset
npm run dev
```
