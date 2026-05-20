import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    ok: true,
    token,
    user: { email: user.email, role: user.role, phone: user.phone },
  });
}

// POST /api/auth/seed  ← creates default admin on first run
export async function seed(req, res) {
  const exists = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });
  if (exists) return res.json({ ok: true, message: "Admin already exists" });

  const hashed = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      phone: "0000000000",
      password: hashed,
      role: "admin",
    },
  });
  res.json({ ok: true, message: "Default admin created: admin@example.com / admin123" });
}
