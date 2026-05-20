# Learn — Ticket & user admin (React demo)

Interview-style demo: React (Vite) front end + tiny **Node SMTP server** so emails can actually send. Real SMTP cannot run inside the browser, so mail is sent from `server/index.js` using **Nodemailer**.

## Quick start

1. **Install**

   ```bash
   npm install
   ```

2. **Configure SMTP** (required for real sends)

   Open `server/index.js` and replace the placeholder values:

   - `MAIL_FROM` — the “From” address (often same as Gmail user)
   - `SMTP_USER` — your Gmail address
   - `SMTP_PASS` — Gmail **App password** (not your normal login password)

   [Google: App passwords](https://support.google.com/accounts/answer/185833)

3. **Run two terminals**

   **Terminal A — mail server**

   ```bash
   npm run server
   ```

   You should see: `Demo SMTP server running at http://localhost:3001`

   **Terminal B — React app**

   ```bash
   npm run dev
   ```

   Open the URL Vite prints (usually `http://localhost:5173`).  
   The app calls `/api/send-mail`; Vite **proxies** that to the mail server (see `vite.config.js`).

4. **Login**

   - Admin: `admin@example.com` / `admin123`
   - Other users: create them in Admin (password is emailed to them if SMTP works).

## Scripts

| Command        | Purpose                          |
|----------------|----------------------------------|
| `npm run dev`  | Start React dev server (Vite)   |
| `npm run server` | Start SMTP API on port 3001   |
| `npm run build`  | Production build (static files) |
| `npm run preview` | Preview build — **no** `/api` proxy; use `dev` for mail demo |

## Project layout (short)

- `src/` — React UI, context, pages, `src/services/sendSmtpMail.js` (calls `/api/send-mail`)
- `server/index.js` — Express + Nodemailer, **hardcoded demo SMTP** (change locally)
- `FUNCTIONAL_DOCUMENTATION.md` — roles, flows, data storage

## Security warning (read before interview)

- **Never** put real production passwords in Git or in front-end code.
- This repo uses a **small server file** for SMTP on purpose; treat it like a local-only demo.
- For a real job, SMTP credentials live in **environment variables** on the server, not in source.

## Troubleshooting

- **“Could not reach mail server”** — run `npm run server` in another terminal.
- **“SMTP not configured”** — you still have placeholder text in `server/index.js`.
- **Gmail blocks login** — enable 2FA and use an **App password**, not your normal password.
- **Empty `learn_app_users` in localStorage** — clear site data or remove keys if login breaks after tests.

## More detail

See **FUNCTIONAL_DOCUMENTATION.md** for user stories, routes, and how data is stored.

For **interview practice**, see **INTERVIEW_QUESTIONS_AND_ANSWERS.md** (common questions and fresher-style answers).
