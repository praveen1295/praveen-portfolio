# Praveen Bankhede — Full-Stack TypeScript MERN & Tailwind CSS Portfolio

A full-stack **TypeScript + MERN (MongoDB, Express.js, React, Node.js)** + **Tailwind CSS** interview portfolio featuring a password-protected **Admin Dashboard** to manage projects, edit all profile/resume details, view visitor inquiries, and reply directly via email (Nodemailer + Gmail SMTP).

## Live Demo

- **Live Portfolio (Vercel):** [https://praveen-portfolio-brown-five.vercel.app/](https://www.google.com/search?q=https://praveen-portfolio-brown-five.vercel.app/)
- **Backend API (Vercel):** [https://praveen-portfolio-api.vercel.app](https://www.google.com/search?q=https://praveen-portfolio-api.vercel.app)
- **GitHub Repository:** [https://github.com/praveen1295/praveen-portfolio](https://www.google.com/search?q=https://github.com/praveen1295/praveen-portfolio)

---

## Features

- **Dynamic Portfolio & Case Studies**: Loads profile details, technical skills, work experience, and projects from MongoDB Atlas, including live case studies for **TalkTalesConnect.com**, **PoshMom.com**, **Biotronix**, **Workerland**, and **[PulseTrack](https://activity-tracker-alpha-three.vercel.app/)**.
- **Interactive Filtering & Theme Toggle**: Filter skills and projects by domain (`Full-Stack (MERN)`, `Client Projects`, `Production Apps`), switch between dark and light themes, and inspect detailed case study modals.
- **Password-Protected Admin Panel**:
  - **Projects Manager**: Create, edit, and delete portfolio projects in MongoDB.
  - **Profile & Details Editor**: Update hero bio, availability badge, contact links, skills JSON, and work experience JSON.
  - **Messages & Email Reply**: View contact form submissions and send email replies directly via Nodemailer (with an `Open Mail App` fallback).

---

## Project Structure

```text
praveen-portfolio/
├── server/
│   ├── src/
│   │   ├── config/db.ts                  # MongoDB Atlas / local Mongoose connection
│   │   ├── controllers/portfolioController.ts
│   │   ├── middleware/auth.ts            # HMAC-SHA256 admin auth middleware
│   │   ├── models/
│   │   │   ├── Profile.ts                # Editable portfolio & resume schema
│   │   │   ├── Project.ts                # Featured projects schema
│   │   │   └── ContactMessage.ts         # Visitor inquiries & email reply status
│   │   ├── routes/portfolioRoutes.ts
│   │   ├── seed/seedData.ts              # Seeds Profile & Projects into MongoDB
│   │   ├── utils/mailer.ts               # Nodemailer Gmail SMTP helper
│   │   └── server.ts                     # Express entry point (Vercel + local)
│   ├── vercel.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/AdminPanel.tsx
│   │   ├── data/profileData.ts
│   │   ├── types/portfolio.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── vercel.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Setup & Running Locally

### 1. Start the Backend (TypeScript + Express + MongoDB)
```bash
cd server
cp .env.example .env
# Edit .env: set MONGO_URI, ADMIN_PASSWORD, ADMIN_TOKEN_SECRET, and Gmail SMTP_USER / SMTP_PASS
npm install
npm run seed    # Seeds Profile & Projects into MongoDB
npm run dev     # Runs TypeScript server via tsx watch on http://localhost:5000
```

### 2. Start the Frontend (React + TypeScript + Vite + Tailwind CSS)
```bash
cd client
npm install
npm run dev     # Runs Vite dev server on http://localhost:5173
```

### 3. Production Build
- **Backend:** `cd server && npm run build && npm start`
- **Frontend:** `cd client && npm run build`

---

## API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server health check |
| `GET` | `/api/portfolio` | Public | Fetch profile and projects |
| `GET` | `/api/projects` | Public | Fetch projects (optional `?category=` filter) |
| `POST` | `/api/contact` | Public | Submit a contact inquiry to MongoDB |
| `POST` | `/api/admin/login` | Public | Authenticate admin and issue token |
| `PUT` | `/api/admin/profile` | Admin | Update portfolio profile, skills, and experience |
| `POST` | `/api/admin/projects` | Admin | Create a new project |
| `PUT` | `/api/admin/projects/:id` | Admin | Update an existing project |
| `DELETE` | `/api/admin/projects/:id` | Admin | Delete a project |
| `GET` | `/api/admin/messages` | Admin | List all contact inquiries |
| `POST` | `/api/admin/messages/:id/reply` | Admin | Send email reply via Nodemailer and mark `REPLIED` |
| `DELETE` | `/api/admin/messages/:id` | Admin | Delete an inquiry |