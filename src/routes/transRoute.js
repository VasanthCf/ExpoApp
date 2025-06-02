import { Router } from "express";

import {
  getUserTransaction,
  postTransaction,
  deleteTransaction,
  getSummary,
} from "./../controller/controller.js";

const router = Router();
router.get("/:userId", getUserTransaction);
router.post("/", postTransaction);

router.delete("/:id", deleteTransaction);
router.get("/summary/:userId", getSummary);
export default router;
