# 💳 NEXUS GLOBAL BANK

> A production-ready full-stack banking & currency exchange web application.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-0066FF?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, logout with bcrypt password hashing
- 💱 **Currency Exchange** — 25+ currencies, real-time rates (with mock fallback)
- 📊 **Transaction History** — Paginated table of all your conversions
- 📄 **GST Invoice PDFs** — Auto-generated PDF with 18% GST breakdown
- 📧 **Email Confirmations** — Nodemailer sends invoice PDF after each transaction
- 🎨 **Modern UI** — Dark glassmorphism fintech design with Framer Motion animations
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcryptjs |
| PDF | PDFKit |
| Email | Nodemailer (Gmail SMTP) |
| Currency | ExchangeRate-API (mock fallback) |

---

## 📁 Project Structure

```
nexus-bank/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── config/db.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Transaction.js     # Transaction schema
│   ├── routes/
│   │   ├── authRoutes.js      # POST /register, /login, GET /me
│   │   └── transactionRoutes.js # POST /convert, GET /, GET /:id/invoice
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT protect middleware
│   └── utils/
│       ├── currencyService.js # Exchange rate logic + mock fallback
│       ├── invoiceGenerator.js# PDFKit invoice generation
│       └── emailSender.js     # Nodemailer email sender
│
└── frontend/
    └── src/
        ├── api/axiosConfig.js # Axios instance with JWT interceptors
        ├── context/AuthContext.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── DashboardPage.jsx
        └── components/
            ├── Navbar.jsx
            ├── CurrencyConverter.jsx
            ├── TransactionHistory.jsx
            └── StatsCard.jsx
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone & Install

```bash
# Install backend dependencies
cd nexus-bank/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexus-bank
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRE=7d

# Email (optional but recommended)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password  # Use Gmail App Password, not your real password

# Currency API (optional - falls back to mock data)
EXCHANGE_RATE_API_KEY=your_key  # Free at https://www.exchangerate-api.com/
```

### 3. Get MongoDB Atlas URI
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Click **Connect** → **Connect your application**
4. Copy the connection string and replace `<username>`, `<password>`
5. Make sure to whitelist your IP: **Network Access** → **Allow from anywhere (0.0.0.0/0)**

### 4. Get Gmail App Password (for email)
1. Enable 2FA on your Google account
2. Go to **Google Account** → **Security** → **App passwords**
3. Generate a new app password for "Mail"
4. Use that 16-character password in `EMAIL_PASS`

### 5. Start the Application

**Terminal 1 — Backend:**
```bash
cd nexus-bank/backend
npm run dev     # or: npm start
# ✅ Server runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd nexus-bank/frontend
npm run dev
# ✅ App runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create new account |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/transactions/convert` | ✅ | Convert currency |
| GET | `/api/transactions` | ✅ | Get transaction history |
| GET | `/api/transactions/:id/invoice` | ✅ | Download PDF invoice |
| GET | `/api/transactions/currencies` | ✅ | List supported currencies |
| GET | `/api/health` | ❌ | Health check |

---

## 💡 Notes

- **No email configured?** Transactions still work, email is silently skipped
- **No currency API key?** App uses realistic mock rates with slight random variation
- **Token expiry** — JWT expires in 7 days; app auto-redirects to login on expiry
- **GST** — 18% GST is calculated on the converted amount as per Indian tax regulations

---

## 📦 Build for Production

```bash
# Build frontend
cd frontend
npm run build

# The dist/ folder can be served by nginx or any static host

# Backend can be deployed to:
# - Railway, Render, Fly.io (free tiers available)
# - Or any VPS with Node.js
```

---

## 🎨 UI Preview

- **Dark glassmorphism** theme with electric blue accents
- **Syne** display font + **DM Sans** body + **JetBrains Mono** for numbers
- Framer Motion animations on page load, form interactions, and results
- Responsive grid layout — converter on left, transaction table on right

---

*Built with ❤️ — Nexus Global Bank © 2024*
