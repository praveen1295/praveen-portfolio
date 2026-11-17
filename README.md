# Praveen Bankhede — TypeScript MERN & Tailwind CSS Portfolio (with Admin Panel)

A full-stack **TypeScript + MERN (MongoDB, Express.js, React, Node.js)** + **Tailwind CSS** interview portfolio featuring a password-protected **Admin Dashboard** to manage projects, edit all profile details, view visitor inquiries, and reply via email (Nodemailer).

## Setup & Run Locally

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
- Backend: `cd server && npm run build && npm start`
- Frontend: `cd client && npm run build`
