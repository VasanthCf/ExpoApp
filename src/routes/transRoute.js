import { Router } from "express";

import {
  getUserTransaction,
  postTransaction,
  deleteTransaction,
  getSummary,
  getStats,
  getUserTransactionAll,
  deleteAllTransactions,
} from "./../controller/controller.js";

const router = Router();

router.get("/stats", getStats);
router.get("/allTransaction/:userId", getUserTransactionAll);
router.delete("deleteAll", deleteAllTransactions);
router.get("/:userId", getUserTransaction);
router.post("/", postTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary/:userId", getSummary);

export default router;
