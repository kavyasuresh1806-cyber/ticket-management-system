/**
 * Calls the small Node server (server/index.js) which sends real SMTP mail.
 * In dev, Vite proxies /api -> that server (see vite.config.js).
 */
export async function sendSmtpMail({ to, subject, text }) {
  try {
    const res = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: to,
        subject: subject,
        text: text || "",
      }),
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      return {
        ok: false,
        summary: data.message || "Email failed (check server terminal).",
      };
    }

    return {
      ok: true,
      summary: "Email sent to " + to,
    };
  } catch (e) {
    console.error("sendSmtpMail:", e);
    return {
      ok: false,
      summary:
        "Could not reach mail server. Open a second terminal and run: npm run server",
    };
  }
}
