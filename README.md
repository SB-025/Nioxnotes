# Nioxnotes - Full-Stack Notes Application

A production-ready, highly secure full-stack web application built using React, Vite, Node.js, Express, and MongoDB Atlas. 

## Key Features
- **Secure Authentication**: JWTs stored entirely in `HttpOnly`, `Secure`, `SameSite=None` cookies.
- **Robust Authorization**: Total data isolation. Queries are rigidly scoped to `userId` protecting against IDOR.
- **Performance**: Debounced autosave with native race-condition prevention (`AbortSignal`).
- **Security Hardened**: Protected against ReDoS, NoSQL Injection, XSS, brute-forcing (Rate Limiting), and DoS (Payload constraints).

---

## Local Development Setup

### 1. Requirements
- Node.js v18+
- MongoDB Local Instance or Atlas cluster

### 2. Environment Setup

Create `.env` inside `/server`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/notes
JWT_SECRET=your_super_secret_key_change_me
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `.env` inside `/client` (optional for local, vite defaults to port 5173):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Running Locally
Terminal 1 (Backend):
```bash
cd server
npm install
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm install
npm run dev
```

---

## Production Deployment Architecture

The application is architected to run across decoupled services.

**Recommended Services:**
- **Frontend Hosting**: Vercel or Netlify (Fast global CDN, auto-builds Vite).
- **Backend Hosting**: Render, Railway, or Fly.io (Platform-as-a-Service, handles HTTPS).
- **Database**: MongoDB Atlas.

### Step 1: MongoDB Atlas Setup
1. Create a free cluster on MongoDB Atlas.
2. Go to **Database Access** and create a user with a strong password.
3. Go to **Network Access** and whitelist `0.0.0.0/0` (or strictly your backend host's static IPs if available).
4. Get your connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/notes-prod`).

### Step 2: Backend Deployment (e.g., Render)
1. Connect your GitHub repository to Render as a "Web Service".
2. Set the Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. **Environment Variables**:
   - `NODE_ENV`: `production` (CRITICAL for secure cookies)
   - `MONGODB_URI`: *Your Atlas Connection String*
   - `JWT_SECRET`: *A secure random 64-character string*
   - `CLIENT_URL`: *The URL of your deployed frontend (e.g., https://my-notes.vercel.app)*

### Step 3: Frontend Deployment (e.g., Vercel)
1. Connect your GitHub repository to Vercel.
2. Set the Root Directory to `client`.
3. Vercel automatically detects the Vite framework.
4. **Environment Variables**:
   - `VITE_API_URL`: *The URL of your deployed backend (e.g., https://my-notes-api.onrender.com/api)*

### Production Configuration Notes
- **Cookies**: When `NODE_ENV=production`, the backend strictly mandates HTTPS (`secure: true`) and allows cross-domain credential transmission (`sameSite: 'none'`). This enables the detached frontend and backend domains to communicate securely.
