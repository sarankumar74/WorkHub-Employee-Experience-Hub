# WorkHub - Employee Intranet & AI Workspace

A modern enterprise intranet featuring:
- **Employee Directory & Org Chart**
- **AI Company Assistant (RAG with Gemini)**
- **Knowledge Base & Policies**
- **Events & Team Meetings**
- **Employee Exit & Offboarding Checklist** with due-date proximity sorting and overdue highlights
- **Firebase Firestore Persistence & Authentication**

---

## 🚀 Running Locally in VS Code

### 1. Prerequisites
- **Node.js** (v20.x or later): [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/)
- **VS Code**: [Download VS Code](https://code.visualstudio.com/)

---

### 2. Quick Start Steps

1. **Clone or Open the Project Folder in VS Code**:
   ```bash
   cd workhub
   code .
   ```

2. **Install Project Dependencies**:
   Open the VS Code Terminal (`Ctrl + \`` or `Cmd + \``) and run:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root folder (or copy from `.env.example`):
   ```env
   # Required for Gemini AI Assistant & Creative Studio
   GEMINI_API_KEY=your_gemini_api_key_here

   # Port configuration
   PORT=3000
   ```
   > *Note: You can get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Your Browser**:
   Visit **`http://localhost:3000`** in Chrome, Edge, or Firefox.

---

## 📦 Pushing to GitHub

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - WorkHub enterprise intranet"
   ```

2. **Push to your GitHub repository**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```

---

## ☁️ Hosting & Cloud Deployment

### Option A: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Import your GitHub repository.
3. Keep default build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables in Vercel project settings:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
5. Click **Deploy**.

---

### Option B: Deploy as a Full-Stack Node.js App (Render / Railway / Cloud Run)
Because WorkHub includes an integrated Express backend (`server.ts`):
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: Set `PORT` environment variable or use default `3000`.
- All Express endpoints (`/api/employees`, `/api/ai/chat`, `/api/offboarding`, etc.) run in production alongside the compiled Vite assets.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express, Vite
- **Database & Auth**: Firebase Firestore & Firebase Authentication
- **AI Engine**: Google Gen AI SDK (`gemini-2.5-flash` & `gemini-3.1-flash-image-preview`)
