# WorkHub — Intelligent Enterprise Intranet & Employee Experience Hub

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini_2.5_Flash-8E75B2?logo=google&logoColor=white)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

> A modern, role-aware employee intranet platform designed to unify enterprise communication, corporate knowledge discovery, employee directories, and automated offboarding workflows powered by Gemini AI and real-time Firestore persistence.

---

## 📌 Problem Statement

In modern distributed and hybrid organizations, employee information, corporate policies, and administrative workflows are often fragmented across disparate tools (chat apps, wiki pages, email threads, and spreadsheets). This causes:

1. **Information Silos**: Employees spend hours hunting for company policies, benefits guides, and documentation.
2. **Disconnected Teams**: Difficulty identifying teammates by expertise, department hierarchy, or project ownership.
3. **Inefficient Offboarding & Handovers**: Knowledge loss, missed task deadlines, and lack of accountability when team members transition or depart.
4. **Context Switching**: Disjointed meeting tools, fragmented announcement boards, and slow HR response times.

---

## 💡 The Solution: WorkHub

**WorkHub** solves these challenges by providing a centralized, responsive intranet featuring:
- **Intelligent Knowledge Discovery**: RAG-powered AI assistant that answers company queries with citations from verified documents.
- **Interactive Org Chart & People Directory**: Instant search across skills, subteams, departments, and manager reporting lines.
- **Automated Offboarding & Transition Management**: Action-oriented checklists with due-date proximity sorting and red overdue indicators.
- **Role-Based Workspaces**: Tailored dashboards and permissions for Employees, Managers, and HR/Admins.
- **Real-Time Data Layer**: Persistent storage with Firebase Firestore and live updates.

---

## ✨ Key Features

### 1. 🤖 AI Company Assistant (RAG with Gemini)
- Natural language corporate question answering grounded in internal company policies.
- Contextual suggestions (e.g. Leave Policies, Expense Reporting, Remote Work Guidelines).
- Markdown formatting with expandable reference citations.

### 2. 👥 Employee Directory & Org Chart
- Multi-parameter filtering by Department, Subteam, Technical Skills, and Current Projects.
- Interactive organization chart visualizing reporting structures from Executives to Individual Contributors.
- One-click profile modal for direct messaging and scheduling.

### 3. 📋 Smart Offboarding & Handover Tracker
- Structured transition phases: *Knowledge Transfer*, *Asset Return*, *Access Revocation*, and *Exit Formalities*.
- **Due Date Proximity Sorting**: Automatically bubbles overdue and imminent tasks to the top.
- **Visual Alert System**: Prominent red highlights, day counters, and alert banners for overdue deliverables.
- Interactive status updates (*Pending*, *In Progress*, *Completed*) with notes and handover logs.

### 4. 📚 Knowledge Base & Company Policies
- Categorized repository (HR Policies, Engineering Standards, Onboarding, IT Security).
- Search, filter by category, estimated read times, and article creation tools.

### 5. 📅 Events & Collaborative Meeting Rooms
- Scheduled all-hands, department standups, and knowledge-sharing sessions.
- Built-in interactive virtual meeting room modal with participant roster and notes.

### 6. 🎨 AI Asset & Creative Studio
- Generate custom corporate avatars and creative assets using Gemini image models.
- Crop, customize, and apply generated photos directly to employee profiles.

### 7. 👤 User Profile Management
- Custom profile photo upload (with automatic in-browser compression), corporate avatar presets, or custom URL.
- Edit bio, skills tags, current projects, phone, and office locations with local + cloud persistence.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: [React 19](https://react.dev/) (Functional components, custom hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type safety across models)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Build Tool**: [Vite](https://vite.dev/) with `@vitejs/plugin-react`

### Backend & APIs
- **Runtime**: [Node.js](https://nodejs.org/) (v20+)
- **Server Framework**: [Express.js](https://expressjs.com/)
- **Dev Runner**: `tsx` (TypeScript Execute)

### Database & Authentication
- **Database**: [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) (Multi-tenant document store with security rules)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Google OAuth & Email/Password with RBAC claims)

### Artificial Intelligence
- **AI SDK**: [`@google/genai`](https://www.npmjs.com/package/@google/genai)
- **Models**:
  - `gemini-2.5-flash` (Conversational RAG & Policy Retrieval)
  - `gemini-3.1-flash-image-preview` (AI Asset Studio generation)

---

## 🚀 Getting Started (Run Locally in VS Code)

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 20.x or higher)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

---

### Step-by-Step Setup


1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sarankumar74/WorkHub-Employee-Experience-Hub.git
   cd workhub
   ```

2. **Open in VS Code**:
   ```bash
   code .
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Set Up Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   # Google Gemini API Key (Get a free key at https://aistudio.google.com/)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Local server port
   PORT=3000
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. **Open in Browser**:
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🔒 Security & Environment Variables

- **Never commit `.env` to GitHub**: The included `.gitignore` protects your secret API keys and service account credentials.
- **Client/Server Separation**: Secret API keys (`GEMINI_API_KEY`) are accessed server-side via Express routes (`/api/*`), preventing client-side credential exposure.
- **Firestore Security**: All client reads and writes are validated via `firestore.rules`.

---

## ☁️ Deployment Guide

### Option 1: Vercel (Frontend SPA)
1. Push your repository to GitHub.
2. Import the repo on [Vercel](https://vercel.com).
3. **Framework Preset**: `Vite`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Add your `GEMINI_API_KEY` in **Project Settings > Environment Variables**.

### Option 2: Full-Stack Platforms (Render, Railway, Google Cloud Run)
WorkHub includes a unified Express + Vite server (`server.ts`):
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: Configure `PORT` environment variable (defaults to `3000`).

---

## 📂 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── ai/            # AI Assistant & RAG views
│   │   ├── auth/          # Login & OAuth components
│   │   ├── dashboard/     # Employee home dashboard & metric cards
│   │   ├── events/        # Meetings & company event calendar
│   │   ├── knowledge/     # Policy documentation & knowledge base
│   │   ├── layout/        # Sidebar, Navbar, and Bottom Navigation
│   │   ├── modals/        # Profile Editor, Meeting Room, Messaging, Search
│   │   ├── offboarding/   # Exit checklists & handover progress tracker
│   │   ├── people/        # Employee directory & Org Chart
│   │   ├── teams/         # Team & department hierarchy
│   │   └── tools/         # AI Image & Avatar Studio
│   ├── data/              # Initial mock data & corporate datasets
│   ├── lib/               # Firebase Client & Admin SDK initializers
│   ├── types/             # TypeScript schemas & interface definitions
│   ├── App.tsx            # Main application router & state controller
│   └── main.tsx           # React DOM root entry point
├── server.ts              # Express API server & Vite dev middleware
├── firestore.rules        # Production Firestore database security rules
├── vercel.json            # Vercel SPA routing rewrite rules
└── package.json           # Scripts and dependencies
```

---

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).
