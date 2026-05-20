import { sendSmtpMail } from "./sendSmtpMail.js";

function buildLines(action, ticket, actorEmail) {
  const lines = [
    `Ticket ID: ${ticket.id}`,
    `Title: ${ticket.title}`,
    `Status: ${ticket.status}`,
    `Created by: ${ticket.createdBy || "—"}`,
    `Last change by: ${actorEmail || "—"}`,
    "",
    "Description:",
    ticket.description || "—",
  ];
  if (action === "delete") {
    lines.unshift("This ticket was deleted.");
  } else if (action === "create") {
    lines.unshift("A new ticket was assigned to you.");
  } else {
    lines.unshift("Your assigned ticket was updated.");
  }
  return lines.join("\n");
}

function buildSubject(action, ticket) {
  if (action === "create") return `[Ticket] New: ${ticket.title}`;
  if (action === "update") return `[Ticket] Updated: ${ticket.title}`;
  return `[Ticket] Removed: ${ticket.title}`;
}

export async function sendMailToAssignee({ action, ticket, actorEmail }) {
  const to = (ticket.assignedEmail || "").trim();
  if (!to) {
    return { ok: false, summary: "No assignee email — notification skipped." };
  }

  const subject = buildSubject(action, ticket);
  const body = buildLines(action, ticket, actorEmail);

  console.info("[Ticket email]\nTo:", to, "\nSubject:", subject, "\n\n", body);

  const result = await sendSmtpMail({ to, subject, text: body });

  return {
    ok: result.ok,
    summary: result.summary,
    to,
    subject,
  };
}
