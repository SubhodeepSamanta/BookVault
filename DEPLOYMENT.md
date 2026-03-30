# BookVault Deployment Guide 🚀

This guide provides step-by-step instructions for a high-performance **Hybrid Hosting** setup: **Vercel** for the frontend and **Render** for the backend.

---

## 🏗️ Architecture Overview
- **Frontend (React)**: Hosted on **Vercel** (Global CDN, fast UI loads).
- **Backend (Express)**: Hosted on **Render** (Steady API execution, background jobs).
- **Database (TiDB)**: Remote managed instance (Already configured).

---

## Step 1: Backend Deployment (Render)

1. **Sign up**: Go to [render.com](https://render.com) and connect your GitHub.
2. **Create Web Service**:
   - Select your `BookVault` repository.
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. **Environment Variables**: Add these in the "Environment" tab:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (Random secure string)
   - `DATABASE_URL`: (Your TiDB connection string)
   - `FRONTEND_URL`: (You will set this *after* Step 2)
   - `DB_SSL`: `true`
4. **Deploy**: Click "Create Web Service". Copy your service URL (e.g., `https://bookvault-api.onrender.com`).

---

## Step 2: Frontend Deployment (Vercel)

1. **Sign up**: Go to [vercel.com](https://vercel.com) and connect your GitHub.
2. **Create Project**:
   - Select your `BookVault` repository.
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: **(Use your Render URL from Step 1)** + `/api` (e.g., `https://bookvault-api.onrender.com/api`)
4. **Deploy**: Click "Deploy". Copy your Vercel URL (e.g., `https://bookvault.vercel.app`).

---

## Step 3: Final Handshake (CORS)

1. Go back to your **Render** dashboard.
2. Update the `FRONTEND_URL` environment variable with your **Vercel URL** from Step 2.
3. Render will redeploy. Once finished, your frontend can securely talk to your backend.

---

## 🔒 Security Note (TiDB Cloud)
Ensure your TiDB Cloud **IP Access List** allows connections from:
1. `0.0.0.0/0` (Easiest for testing/Render's dynamic IPs).
2. Or specific Render outbound IPs if you have a paid Render plan.

---

## 🧹 Maintenance (Fines)
The backend includes a `fineJob.js` that automatically calculates fines daily. On Render's free tier, the service might "sleep" after inactivity. To ensure the fine job runs perfectly:
1. Use an external "Uptime" service (like BetterStack or Cron-job.org) to ping your `/health` endpoint once an hour.
2. This prevents the service from sleeping for long periods.
