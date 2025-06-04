import { Router } from "express";

import {
  getUserTransaction,
  postTransaction,
  deleteTransaction,
  getSummary,
  getStats,
} from "./../controller/controller.js";

const router = Router();
router.get("/stats", getStats);
router.get("/:userId", getUserTransaction);
router.post("/", postTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary/:userId", getSummary);

export default router;
