# How to Deploy Expense Tracker

Deploy the **backend** on Render and the **frontend** on Vercel. Do the backend first so you have the API URL for the frontend.

---

## Part 1: Deploy Backend on Render

1. **Sign in**  
   Go to [render.com](https://render.com) and sign in (GitHub login is easiest).

2. **New Web Service**  
   - Click **New** → **Web Service**.  
   - Connect your GitHub account if needed, then select the **Ayushy21/Expense-Tracker** repo.  
   - Click **Connect**.

3. **Configure the service**
   - **Name**: e.g. `expense-tracker-api`
   - **Region**: Choose one close to you
   - **Root Directory**: `backend`  
     (Render will run commands from this folder.)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment variables**  
   Click **Advanced** → **Add Environment Variable**, then add:

   | Key              | Value                          |
   |------------------|---------------------------------|
   | `NODE_ENV`       | `production`                    |
   | `FRONTEND_ORIGIN`| *(leave empty for now; add after frontend is deployed)* |

   Render sets `PORT` automatically. You can add `FRONTEND_ORIGIN` after you have your Vercel URL.

5. **Create Web Service**  
   Click **Create Web Service**. Render will build and deploy.

6. **Get your API URL**  
   When the deploy finishes, the service will have a URL like:
   ```text
   https://expense-tracker-api-xxxx.onrender.com
   ```
   Copy this URL; you need it for the frontend and for CORS.

7. **Optional: CORS**  
   In Render → your service → **Environment** → add:
   - **Key**: `FRONTEND_ORIGIN`  
   - **Value**: `https://your-app.vercel.app`  
   (Use your real Vercel URL after you deploy the frontend.)

---

## Part 2: Deploy Frontend on Vercel

1. **Sign in**  
   Go to [vercel.com](https://vercel.com) and sign in with GitHub.

2. **New project**  
   - Click **Add New** → **Project**.  
   - Import **Ayushy21/Expense-Tracker**.  
   - Click **Import**.

3. **Configure the project**
   - **Root Directory**: Click **Edit**, set to `frontend`, then **Continue**.
   - **Framework Preset**: Vite (should be auto-detected).
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default).

4. **Environment variable**  
   Under **Environment Variables**:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render API URL **with no trailing slash**, e.g.  
     `https://expense-tracker-api-xxxx.onrender.com`
   - **Environment**: Production (and Preview if you want).

5. **Deploy**  
   Click **Deploy**. Wait for the build to finish.

6. **Get your app URL**  
   You’ll get a URL like:
   ```text
   https://expense-tracker-xxxx.vercel.app
   ```
   Open it to use the app.

---

## Part 3: Connect Backend and Frontend (CORS)

So the browser can call your API from the Vercel URL:

1. In **Render** → your backend service → **Environment**.
2. Add or set:
   - **Key**: `FRONTEND_ORIGIN`
   - **Value**: Your full Vercel URL, e.g. `https://expense-tracker-xxxx.vercel.app`
3. Save. Render will redeploy with the new variable.

After redeploy, open your Vercel URL again; the app should load and list/add expenses without CORS errors.

---

## Quick reference

| Where   | What to set |
|--------|-------------|
| Render | Root Directory: `backend`, Build: `npm install`, Start: `npm start`, `NODE_ENV=production`, `FRONTEND_ORIGIN=https://your-app.vercel.app` |
| Vercel | Root Directory: `frontend`, `VITE_API_URL=https://your-api.onrender.com` (no trailing slash) |

---

## Notes

- **Render free tier**: The backend may sleep after inactivity; the first request can take 30–60 seconds. After that it’s fast until idle again.
- **SQLite on Render**: The DB file is on the server’s disk. On free tier, it can be reset on redeploys. For permanent data, use a Render persistent disk (paid) or switch to a hosted DB later.
- **Custom domains**: You can add your own domain in both Render and Vercel; then set `FRONTEND_ORIGIN` and `VITE_API_URL` to those URLs.
