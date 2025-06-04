import express from "express";
import { config } from "dotenv";

import rateLimiter from "./middleware/rateLimiter.js";
import transactionRouter from "./routes/transRoute.js";
import { initDB, sql } from "./config/db.js";
import job from "./config/cron.js";

config();
const app = express();
if (process.env.NODE_ENV === "production") {
  job.start();
}
app.use(express.json());
app.use(rateLimiter);
app.get("/api/status", (req, res) => {
  res.status(200).json({ status: "ok" });
});
// app.post(
//   "/upload-static",

//   async (req, res) => {
//     try {
//       const { user_id } = req.query;
//       if (!user_id)
//         return res.status(400).json({ message: "user_id is required" });

//       for (const tx of staticTransactions) {
//         await sql`
//         INSERT INTO transactions (title, amount, type, category, created_at, user_id)
//         VALUES (${tx.title}, ${tx.amount}, ${tx.type}, ${tx.category}, ${tx.created_at}, ${user_id});
//       `;
//       }

//       res.status(201).json({
//         message: `${staticTransactions.length} static transactions uploaded.`,
//       });
//     } catch (err) {
//       console.error("Static upload error:", err);
//       res.status(500).json({ message: "Failed to upload static transactions" });
//     }
//   }
// );
app.use("/api/transactions", transactionRouter);
initDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log("server running on port 3002");
  });
});
