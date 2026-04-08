# NexusCRM — Lead Intelligence Platform

A full-stack CRM system built with React, Node.js, Express, and MongoDB.

---

## 📁 Folder Structure

```
CRM/
├── backend/
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth middleware
│   ├── server.js       # Entry point
│   ├── .env.example    # Environment template
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── context/    # Auth context
│   │   ├── pages/      # Page components
│   │   └── utils/      # API helper
│   └── package.json
└── README.md
```

---

## 🍃 STEP 1 — Set Up MongoDB Atlas (Free)

1. Go to **https://www.mongodb.com/atlas** and create a free account
2. Click **"Build a Database"** → choose **Free (M0)** tier
3. Select a cloud provider (AWS recommended) and a region closest to you
4. Click **"Create"**
5. **Create a Database User:**
   - Username: e.g. `crmuser`
   - Password: something secure (copy it)
   - Click **"Create User"**
6. **Add IP Access:**
   - Click **"Add My Current IP Address"** (for local dev)
   - To allow from anywhere (Render deployment): enter `0.0.0.0/0`
   - Click **"Add Entry"**
7. Click **"Go to Databases"** → Click **"Connect"** on your cluster
8. Choose **"Drivers"** → Copy the connection string like:
   ```
   mongodb+srv://crmuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
9. Replace `<password>` with your actual password and add your DB name:
   ```
   mongodb+srv://crmuser:yourpassword@cluster0.xxxxx.mongodb.net/crm_db?retryWrites=true&w=majority
   ```
   > Save this — you'll need it in `.env`

---

## 💻 STEP 2 — Run Locally with VS Code

### Prerequisites
Install these first if you haven't:
- **Node.js** → https://nodejs.org (download LTS version)
- **VS Code** → https://code.visualstudio.com
- **Git** → https://git-scm.com

### Open the Project in VS Code
1. Extract the ZIP file you downloaded
2. Open VS Code → **File → Open Folder** → select the `CRM` folder
3. You should see `frontend/` and `backend/` in the Explorer panel

### Setup Backend
1. In VS Code, open the **Terminal** (`Ctrl+`` ` on Windows, `Cmd+`` ` on Mac)
2. Navigate to backend:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Or manually create a file called `.env` in the `backend/` folder with:
   ```
   MONGODB_URI=mongodb+srv://crmuser:yourpassword@cluster0.xxxxx.mongodb.net/crm_db?retryWrites=true&w=majority
   JWT_SECRET=mysupersecretkey2024changethis
   PORT=5000
   NODE_ENV=development
   ```
5. Start the backend:
   ```bash
   npm run dev
   ```
   You should see:
   ```
   ✅ MongoDB Connected Successfully
   🚀 Server running on port 5000
   ```

### Setup Frontend
1. Open a **new terminal** in VS Code (`Ctrl+Shift+`` ` )
2. Navigate to frontend:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the frontend:
   ```bash
   npm start
   ```
   Browser opens at **http://localhost:3000** ✅

### Create Admin Account
- Go to http://localhost:3000/login
- Click **Register**
- Fill in your name, email, password, and select **Admin** role
- You're in! 🎉

---

## 🐙 STEP 3 — Push to GitHub

### Create a GitHub Repository
1. Go to **https://github.com** and sign in (create account if needed)
2. Click the **"+"** icon → **"New repository"**
3. Name it: `FUTURE_FS_02` (as per internship requirements)
4. Set to **Public**
5. Do NOT check "Initialize with README" (we already have one)
6. Click **"Create repository"**

### Initialize Git and Push from VS Code
In VS Code terminal, make sure you're in the `CRM` root folder:

```bash
# Initialize git
git init

# Create a .gitignore file (IMPORTANT — don't push secrets!)
echo "node_modules/
.env
.DS_Store
build/
*.log" > .gitignore

# Stage all files
git add .

# First commit
git commit -m "feat: initial CRM application - NexusCRM"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/FUTURE_FS_02.git

# Push to GitHub
git branch -M main
git push -u origin main
```

You'll be asked for your GitHub credentials. Use your username and a **Personal Access Token** (not password):
- Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token
- Give it `repo` scope → copy the token → use it as password

### VS Code Git GUI (Alternative)
1. Click the **Source Control** icon in the left sidebar (branch icon)
2. Click **"Initialize Repository"**
3. Stage all files with the **"+"** button
4. Type a commit message and click **Commit**
5. Click **"Publish Branch"** and select GitHub

---

## 🌐 STEP 4 — Get a Live Link (Deploy to the Internet)

### Deploy Backend to Render (Free)

1. Go to **https://render.com** and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo `FUTURE_FS_02`
4. Configure:
   - **Name:** `nexus-crm-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **"Environment Variables"**, add:
   ```
   MONGODB_URI = (your full MongoDB Atlas connection string)
   JWT_SECRET  = (same secret as local .env)
   NODE_ENV    = production
   PORT        = 5000
   ```
6. Click **"Create Web Service"**
7. Wait ~2 minutes. You'll get a URL like: `https://nexus-crm-backend.onrender.com`
   > Copy this URL!

### Update Frontend for Production
In VS Code, create `frontend/.env.production`:
```
REACT_APP_API_URL=https://nexus-crm-backend.onrender.com/api
```

Also update `backend/server.js` CORS to add your frontend Vercel URL (you'll know it after deploying frontend).

### Deploy Frontend to Vercel (Free)

1. Go to **https://vercel.com** and sign up with GitHub
2. Click **"Add New Project"**
3. Import your `FUTURE_FS_02` repository
4. Configure:
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `frontend`
5. Under **"Environment Variables"**, add:
   ```
   REACT_APP_API_URL = https://nexus-crm-backend.onrender.com/api
   ```
6. Click **"Deploy"**
7. You'll get a URL like: `https://future-fs-02.vercel.app` ✅

### Update Backend CORS
Now that you have your Vercel URL, update `backend/server.js`:
```js
origin: ['https://future-fs-02.vercel.app']
```
Push the change to GitHub and Render will auto-redeploy.

---

## 🔄 Making Changes and Re-deploying

Every time you push to GitHub, Render and Vercel will automatically redeploy:
```bash
git add .
git commit -m "fix: updated something"
git push
```

---

## ✨ Features

- 🔐 Secure JWT authentication with role-based access (Admin / Manager / Agent)
- 📊 Live dashboard with charts (area, bar, pie), stats, and activity feed
- 📋 Lead management with table and grid views
- 🔍 Search and filter by status, source, priority
- 📝 Notes system per lead
- 📅 Follow-up scheduler with overdue detection
- 🎯 Visual pipeline status tracker
- 💰 Deal value tracking
- 📱 Fully responsive (mobile + desktop)
- 🌙 Dark theme throughout

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Hosting | Vercel (frontend) + Render (backend) |
| Styling | Custom CSS with CSS Variables |

---

## 🔑 Default Demo Credentials

After registering your first admin:
- Email: (whatever you register with)
- Password: (whatever you set)

The login page has a "Use Demo Credentials" button — set up those credentials first by registering with `admin@demo.com` / `demo123456`.
