import nodemailer from "nodemailer";

// POST /api/send-mail  ← called by frontend sendSmtpMail.js
export async function sendMail(req, res) {
  const { to, subject, text } = req.body;
  if (!to || !subject)
    return res.status(400).json({ ok: false, message: "to and subject required" });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text: text || "",
    });

    console.log(`✉️  Mail sent → ${to} | ${subject}`);
    res.json({ ok: true, message: "Email sent to " + to });
  } catch (err) {
    console.error("SMTP error:", err.message);
    res.status(500).json({ ok: false, message: "Email failed: " + err.message });
  }
}
