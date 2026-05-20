import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/users  ← admin only
export async function getUsers(req, res) {
  const users = await prisma.user.findMany({
    where: { role: "user" },
    select: { email: true, phone: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  res.json(users);
}

// POST /api/users  ← addUser (admin creates user)
export async function addUser(req, res) {
  const { email, phone, password } = req.body;
  if (!email || !phone || !password)
    return res.status(400).json({ ok: false, message: "All fields required" });

  const e = email.trim().toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email: e } });
  if (exists)
    return res.status(400).json({ ok: false, message: "This email is already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: email.trim(), phone: phone.trim(), password: hashed, role: "user" },
  });

  res.json({ ok: true, user: { email: user.email, phone: user.phone, role: user.role } });
}

// PUT /api/users/:email  ← updateUser (admin updates user)
export async function updateUser(req, res) {
  const originalEmail = decodeURIComponent(req.params.email).trim().toLowerCase();
  const { email, phone, password } = req.body;

  const existing = await prisma.user.findFirst({
    where: { email: originalEmail, role: "user" },
  });
  if (!existing)
    return res.status(404).json({ ok: false, message: "User not found" });

  const nextEmail = email.trim();
  const nextKey = nextEmail.toLowerCase();

  // Check duplicate email (excluding current user)
  if (nextKey !== originalEmail) {
    const dup = await prisma.user.findUnique({ where: { email: nextKey } });
    if (dup)
      return res.status(400).json({ ok: false, message: "This email is already used by another user" });
  }

  const passwordChanged = password && password.trim() !== "";
  const nextPassword = passwordChanged
    ? await bcrypt.hash(password, 10)
    : existing.password;

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: { email: nextEmail, phone: phone.trim(), password: nextPassword },
  });

  res.json({
    ok: true,
    passwordChanged,
    newPassword: passwordChanged ? password : undefined,
    user: { email: updated.email, phone: updated.phone },
  });
}
