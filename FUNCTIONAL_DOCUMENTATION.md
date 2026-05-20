# Functional documentation — Learn (demo app)

This document explains what the app does, who can do what, and how pieces connect. It is written for an interview walkthrough.

---

## 1. Purpose

A small **ticket management** demo with:

- **Admin** — creates and edits users; views all tickets (read only).
- **Normal user** — creates, edits, and deletes tickets; assignee gets **email** on ticket create / update / delete.

Data is stored in the **browser** (`localStorage`) so there is no database. A separate **Node server** sends real **SMTP** mail.

---

## 2. Roles

| Role   | Login        | Capabilities |
|--------|--------------|--------------|
| Admin  | Seeded admin | Create/edit users; welcome & update emails to users; view ticket list + view ticket details (no edit/delete). |
| User   | Created by admin | Home; create ticket; ticket list with edit/delete; receives no admin-only screens. |

Default admin (see `src/context/AppContext.jsx`):

- Email: `admin@example.com`
- Password: `admin123`

---

## 3. Main user flows

### 3.1 Admin creates a user

1. Admin signs in → **Admin** page.
2. Fills **email**, **phone**, **password** → **Create user**.
3. User row appears in **User list**; **Edit** opens a modal to change email / phone / password (password optional = keep old).
4. On create, the app sends a **welcome email** to the new user’s address (body includes login URL and **password**).  
   On user **edit**, an **update email** is sent (includes new password only if admin typed a new password).

Mail is sent by: **React** → `POST /api/send-mail` → **Vite proxy** → **`server/index.js`** → **SMTP**.

### 3.2 User works on tickets

1. User signs in → **Home**.
2. **Create ticket** — title, description, **assignee email**, status (Open / In progress / Resolved).
3. After save, **assignee** receives an email (same SMTP path).
4. **Ticket list** — edit (pencil) or delete (trash); status badges; changes stay in sync because all screens read the same **React context** + `localStorage`.

### 3.3 Admin views tickets

1. From Admin header, **View tickets**.
2. List is **view only**; **eye** icon opens a read-only detail modal.

---

## 4. Routes (React Router)

| Path                 | Who        | Screen |
|----------------------|------------|--------|
| `/login`             | Everyone   | Login |
| `/admin`             | Admin      | Admin dashboard |
| `/home`              | User       | User home |
| `/tickets`           | Admin + user | Ticket list (actions differ by role) |
| `/tickets/new`       | User       | Create ticket |
| `/tickets/:id/edit`  | User       | Edit ticket |

`/`` redirects by role to `/admin` or `/home`.

---

## 5. Data storage (localStorage)

| Key                 | Content |
|---------------------|---------|
| `learn_app_users`   | Array of `{ email, phone, password, role }` |
| `learn_app_tickets` | Array of `{ id, title, description, assignedEmail, status, createdBy }` |

Clearing these keys resets data (admin seed comes from code on first load if storage is empty).

---

## 6. Email system (technical)

### Why a server file?

Browsers cannot open a raw SMTP connection with your Gmail password safely **from React**. So:

- **`src/services/sendSmtpMail.js`** — `fetch("/api/send-mail", { to, subject, text })`.
- **`vite.config.js`** — proxies `/api` to `http://localhost:3001` during `npm run dev`.
- **`server/index.js`** — reads **hardcoded** SMTP settings, uses **Nodemailer** to send.

### API shape

`POST /api/send-mail`

```json
{
  "to": "someone@example.com",
  "subject": "Subject line",
  "text": "Plain text body"
}
```

Success: `{ "ok": true }`  
Failure: `{ "ok": false, "message": "..." }` with HTTP 4xx/5xx.

### When emails fire

| Event | Recipient |
|-------|-----------|
| New user created | New user’s email (with password) |
| User updated by admin | User’s email (password line only if changed) |
| Ticket created / updated / deleted | Ticket `assignedEmail` |

---

## 7. UI feedback

- **Toast** (bottom-right) — short result after mail attempt (success or error text).
- **Browser console** — same email content is logged for debugging.

---

## 8. Production vs demo

This project is **not** production-ready:

- Passwords in email and in `localStorage` are for **demo only**.
- SMTP credentials should move to **environment variables** and a proper backend.
- Use **HTTPS**, auth tokens, and a real database for real products.

---

## 9. File map (helpful for interviews)

| Area | Files |
|------|--------|
| App shell + routes | `src/App.jsx` |
| Global state | `src/context/AppContext.jsx` |
| SMTP from browser | `src/services/sendSmtpMail.js` |
| Ticket emails | `src/services/assigneeMail.js` |
| User emails | `src/services/userAccountMail.js` |
| Mail server | `server/index.js` |
| Vite proxy | `vite.config.js` |
