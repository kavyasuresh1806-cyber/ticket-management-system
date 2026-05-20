# Ticket System - Backend Setup

## 📁 Folder Structure
```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── tickets.js
│   │   └── mail.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── ticketController.js
│   │   └── mailController.js
│   └── index.js
├── .env
└── package.json
```

## 🚀 Setup Steps

### 1. Create backend folder & copy files
```bash
mkdir backend
cd backend
# Copy all files here
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup .env
```bash
cp .env.example .env
# Edit .env with your DB and SMTP details
```

### 4. Create PostgreSQL database
```bash
# In psql or pgAdmin:
CREATE DATABASE ticketdb;
```

### 5. Run Prisma migration
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start the server
```bash
npm run dev
```

### 7. Seed default admin
```bash
# In browser or Postman:
POST http://localhost:3001/api/auth/seed
# Creates: admin@example.com / admin123
```

---

## 🔌 Frontend Changes

### Replace AppContext.jsx
- Copy `AppContext.jsx` (provided) → `src/context/AppContext.jsx`
- This replaces localStorage with real API calls

### Install socket.io-client in frontend
```bash
cd ../  # go to frontend folder
npm install socket.io-client
```

### vite.config.js (already correct - no changes needed)
```js
"/api": {
  target: "http://localhost:3001",
  changeOrigin: true,
}
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | ❌ | Login |
| POST | /api/auth/seed | ❌ | Create default admin |
| GET | /api/users | Admin | Get all users |
| POST | /api/users | Admin | Create user |
| PUT | /api/users/:email | Admin | Update user |
| GET | /api/tickets | ✅ | Get tickets |
| POST | /api/tickets | ✅ | Create ticket |
| PUT | /api/tickets/:id | ✅ | Update ticket |
| DELETE | /api/tickets/:id | ✅ | Delete ticket |
| POST | /api/send-mail | ❌ | Send SMTP email |

---

## 📧 Gmail SMTP Setup
1. Google Account → Security → 2-Step Verification ON
2. App Passwords → Generate password
3. Use that password in SMTP_PASS

---

## 🔴 Real-time Events (Socket.io)
- `ticket:new` → New ticket created
- `ticket:updated` → Ticket status/details changed  
- `ticket:deleted` → Ticket removed
