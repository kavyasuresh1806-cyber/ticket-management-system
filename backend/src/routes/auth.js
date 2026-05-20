import express from "express";
import { login, seed } from "../controllers/authController.js";
const router = express.Router();
router.post("/login", login);
router.post("/seed", seed);
export default router;
