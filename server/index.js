/**
 * Demo mail server for interview / learning only.
 * SMTP passwords must NEVER be committed to public repos — use your own values locally.
 */
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

// ----- CHANGE THESE FOR YOUR DEMO (Gmail needs an "App password") -----
const MAIL_FROM = "your-email@gmail.com";
const SMTP_USER = "your-email@gmail.com";
const SMTP_PASS = "your-16-char-app-password";
const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 587;
// --------------------------------------------------------------------

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/send-mail", async function (req, res) {
  try {
    const to = req.body.to;
    const subject = req.body.subject;
    const text = req.body.text;

    if (!to || !subject) {
      res.status(400).json({ ok: false, message: "Missing to or subject" });
      return;
    }

    if (SMTP_USER === "your-email@gmail.com" || SMTP_PASS === "your-16-char-app-password") {
      console.log("Please edit server/index.js and set MAIL_FROM, SMTP_USER, SMTP_PASS.");
      res.status(500).json({
        ok: false,
        message: "SMTP not configured in server/index.js",
      });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: MAIL_FROM,
      to: to,
      subject: subject,
      text: text || "",
    });

    console.log("Sent mail to:", to);
    res.json({ ok: true });
  } catch (err) {
    console.error("Send mail error:", err.message);
    res.status(500).json({ ok: false, message: err.message });
  }
});

app.listen(PORT, function () {
  console.log("Demo SMTP server running at http://localhost:" + PORT);
  console.log("POST /api/send-mail  { to, subject, text }");
});
