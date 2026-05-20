import { PrismaClient } from "@prisma/client";
import { io } from "../index.js";

const prisma = new PrismaClient();

// GET /api/tickets
// admin → all tickets | user → only their own
export async function getTickets(req, res) {
  const where =
    req.user.role === "admin" ? {} : { createdBy: req.user.email };

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  res.json(tickets);
}

// POST /api/tickets
export async function createTicket(req, res) {
  try {
    console.log("🚀 CREATE TICKET HIT");
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const { title, description, assignedEmail, status } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description required",
      });
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        assignedEmail: (assignedEmail || "").trim(),
        status: status || "open",
        createdBy: req.user.email,
        userId: req.user?.id || null,
      },
    });

    console.log("✅ TICKET CREATED:", ticket);

    // Real-time broadcast
    io.emit("ticket:new", ticket);

    res.status(201).json(ticket);

  } catch (error) {
    console.error("❌ CREATE TICKET ERROR:", error);

    res.status(500).json({
      error: "Failed to create ticket",
    });
  }
}

// PUT /api/tickets/:id
export async function updateTicket(req, res) {
  const { title, description, assignedEmail, status } = req.body;

  const existing = await prisma.ticket.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  // Users can only edit their own tickets
  if (req.user.role !== "admin" && existing.createdBy !== req.user.email) {
    return res.status(403).json({ error: "Not allowed" });
  }

  const updated = await prisma.ticket.update({
    where: { id: req.params.id },
    data: {
      title: title.trim(),
      description: description.trim(),
      assignedEmail: (assignedEmail || "").trim(),
      status,
    },
  });

  // Real-time broadcast
  io.emit("ticket:updated", updated);

  res.json(updated);
}

// DELETE /api/tickets/:id
export async function deleteTicket(req, res) {
  const existing = await prisma.ticket.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  if (req.user.role !== "admin" && existing.createdBy !== req.user.email) {
    return res.status(403).json({ error: "Not allowed" });
  }

  await prisma.ticket.delete({
    where: { id: req.params.id },
  });

  // Real-time broadcast
  io.emit("ticket:deleted", { id: req.params.id });

  res.json({
    ok: true,
    ticket: existing,
  });
}