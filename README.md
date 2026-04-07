# Mini CRM – Client Lead Management System
### Future Interns – Full Stack Web Development Task 2 (2026)

A full-stack Mini CRM built with the **MERN stack** (MongoDB, Express, React, Node.js).

---

## Features

- **Admin Login** with JWT authentication
- **Lead Dashboard** with analytics (status breakdown, source breakdown, 7-day trend)
- **Lead Management** – Add, Edit, Delete, View leads
- **Status Tracking** – new → contacted → converted / lost
- **Follow-up Notes** per lead
- **Search & Filter** by name, email, company, status, source
- Responsive dark UI

---

## Project Structure

```
mini-crm/
├── backend/
│   ├── models/        # Lead.js, User.js
│   ├── routes/        # auth.js, leads.js
│   ├── middleware/    # auth.js (JWT)
│   ├── server.js
│   ├── seed.js        # Creates admin + sample data
│   └── .env
└── frontend/
    ├── public/
    └── src/
        ├── context/   # AuthContext.js
        ├── pages/     # Login, Dashboard, Leads
        └── components/ # Layout
```

---

## Setup & Run

### Prerequisites
- Node.js (v16+)
- MongoDB running locally (`mongod`) OR a MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` if needed (defaults work for local MongoDB):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-crm
JWT_SECRET=your_super_secret_jwt_key
ADMIN_EMAIL=admin@crm.com
ADMIN_PASSWORD=admin123
```

Create admin user + sample leads:
```bash
node seed.js
```

Start the backend:
```bash
npm run dev    # with nodemon (auto-restart)
# or
npm start      # production
```

Backend runs at: **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**  
(Proxies API requests to port 5000 automatically)

---

### 3. Login

Open **http://localhost:3000** and log in with:
- **Email:** admin@crm.com
- **Password:** admin123

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| POST | /api/auth/register | Create admin |
| GET | /api/leads | List all leads (with filters) |
| GET | /api/leads/stats | Analytics stats |
| GET | /api/leads/:id | Single lead |
| POST | /api/leads | Create lead |
| PUT | /api/leads/:id | Update lead |
| POST | /api/leads/:id/notes | Add follow-up note |
| DELETE | /api/leads/:id | Delete lead |

All `/api/leads` routes require `Authorization: Bearer <token>` header.

---

## Tech Stack

- **Frontend:** React 18, React Router v6, Axios, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs
