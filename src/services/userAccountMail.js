import { sendSmtpMail } from "./sendSmtpMail.js";

export async function sendNewUserWelcomeEmail({ to, password, adminEmail }) {
  const subject = "[Account] Your login has been created";
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";
  const body = [
    "Hello,",
    "",
    "An administrator created an account for you.",
    "",
    origin ? `Sign-in page: ${origin}/login` : "Sign in using your app login page.",
    `Email: ${to}`,
    `Password: ${password}`,
    "",
    "For security, change your password after your first login.",
    "",
    `— Admin: ${adminEmail || "System"}`,
  ].join("\n");

  console.info("[Welcome email]\nTo:", to, "\nSubject:", subject, "\n\n", body);

  const result = await sendSmtpMail({ to, subject, text: body });

  return {
    ok: result.ok,
    summary: result.summary,
    to,
    subject,
  };
}

export async function sendUserAccountUpdatedEmail({
  to,
  phone,
  passwordChanged,
  newPassword,
  adminEmail,
}) {
  const subject = "[Account] Your account was updated";
  let body;
  if (passwordChanged) {
    body = [
      "Hello,",
      "",
      "Your account was updated by an administrator.",
      "",
      `Phone: ${phone}`,
      `Your new password is: ${newPassword}`,
      "",
      "Please sign in with the new password.",
      "",
      `— Admin: ${adminEmail || "System"}`,
    ].join("\n");
  } else {
    body = [
      "Hello,",
      "",
      "Your account was updated by an administrator.",
      "",
      `Phone: ${phone}`,
      "Your password was not changed.",
      "",
      `— Admin: ${adminEmail || "System"}`,
    ].join("\n");
  }

  console.info("[User update email]\nTo:", to, "\nSubject:", subject, "\n\n", body);

  const result = await sendSmtpMail({ to, subject, text: body });

  return {
    ok: result.ok,
    summary: result.summary,
    to,
    subject,
  };
}
