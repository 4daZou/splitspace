# SplitSpace: Roommate Expense Tracker

A full-stack MEAN (MongoDB, Express, Angular, Node.js) web application that lets roommates track shared expenses, split bills, and monitor who owes what.

**Team:** Dami (Frontend Lead), Scott (Backend & API Lead), Ken (Database & Deployment Lead)

---

## Project Summary

SplitSpace eliminates the confusion and conflict of managing shared living expenses. Roommates can log bills (rent, groceries, utilities, internet, subscriptions), automatically split costs between selected roommates, and track payment status — all in one place.

---

## Technology Breakdown

| Layer       | Technology                       |
|-------------|----------------------------------|
| Frontend    | Angular 17, TypeScript, RxJS     |
| Backend     | Node.js, Express 4               |
| Database    | MongoDB, Mongoose 8              |
| HTTP Client | Angular HttpClient, Observables  |
| Dev Tools   | Nodemon, Angular CLI             |

---

## Features

- **Expense CRUD** — Create, view, edit, and delete shared expenses with categories
- **Auto-Split** — Expenses automatically divided evenly among selected roommates
- **Roommate Management** — Add, edit, and remove roommate profiles
- **Payment Tracking** — Log payments and see paid/unpaid balances
- **Dashboard** — Overview of totals, roommate balances, and recent activity
- **Full-stack Integration** — Angular → Express REST API → MongoDB via Mongoose

---

## Project Structure

```
splitspace/
├── server/                   # Express backend
│   ├── server.js             # HTTP server with port normalization
│   ├── app.js                # Express app + middleware + DB connection
│   ├── router.js             # Central router importing all route modules
│   ├── models.js             # All Mongoose schemas (Roommate, Expense, Payment)
│   ├── seed.js               # Database seed script
│   ├── routes/
│   │   ├── roommate.routes.js
│   │   ├── expense.routes.js
│   │   └── payment.routes.js
│   └── controllers/
│       ├── roommate.controller.js
│       ├── expense.controller.js
│       └── payment.controller.js
│
└── client/                   # Angular frontend
    └── src/app/
        ├── app.module.ts
        ├── app-routing.module.ts
        ├── interfaces/
        │   └── models.ts              # TypeScript interfaces
        ├── services/
        │   ├── roommate.service.ts
        │   ├── expense.service.ts
        │   └── payment.service.ts
        └── components/
            ├── navbar/
            ├── dashboard/
            ├── expenses/
            ├── add-expense/
            ├── edit-expense/
            ├── roommates/
            └── payments/
```

---

## REST API Endpoints

### Roommates
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/roommates        | Get all roommates   |
| GET    | /api/roommates/:id    | Get one roommate    |
| POST   | /api/roommates        | Create roommate     |
| PUT    | /api/roommates/:id    | Update roommate     |
| DELETE | /api/roommates/:id    | Delete roommate     |

### Expenses
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/expenses         | Get all expenses    |
| GET    | /api/expenses/:id     | Get one expense     |
| POST   | /api/expenses         | Create expense      |
| PUT    | /api/expenses/:id     | Update expense      |
| DELETE | /api/expenses/:id     | Delete expense      |

### Payments
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/payments         | Get all payments    |
| GET    | /api/payments/:id     | Get one payment     |
| POST   | /api/payments         | Log a payment       |
| PUT    | /api/payments/:id     | Update payment      |
| DELETE | /api/payments/:id     | Delete payment      |

---

## Team Roles

- **Dami** – Frontend Lead: Angular components, routing, services, UI design
- **Scott** – Backend Lead: Express server, REST API routes, controllers, Postman testing
- **Ken** – Database & Deployment: Mongoose schemas, seed data, deployment setup

---

## Setup Instructions

### Backend
```bash
cd server
cp .env.example .env       # Set your MONGO_URI
npm install
npm run seed               # Seed sample data
npm start                  # Runs on port 3000
```

### Frontend
```bash
cd client
npm install
ng serve                   # Runs on port 4200
```

---

## Angular Routes

| Path                  | Component             |
|-----------------------|-----------------------|
| /dashboard            | DashboardComponent    |
| /expenses             | ExpensesComponent     |
| /expenses/new         | AddExpenseComponent   |
| /expenses/edit/:id    | EditExpenseComponent  |
| /roommates            | RoommatesComponent    |
| /payments             | PaymentsComponent     |

---

## Deployment

- **Backend:** [Render](https://render.com) — set `MONGO_URI` environment variable  
- **Frontend:** [Vercel](https://vercel.com) or Netlify — update `environment.prod.ts` with your Render URL  
- **App URL:** *(add after deployment)*  
- **YouTube Presentation:** *(add link after recording)*
