import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import { getUsers, addUser, updateUser } from "../controllers/userController.js";
const router = express.Router();
router.use(protect, requireAdmin);
router.get("/", getUsers);
router.post("/", addUser);
router.put("/:email", updateUser);
export default router;
