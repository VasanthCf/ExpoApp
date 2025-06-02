import express from "express";
import { config } from "dotenv";

import rateLimiter from "./middleware/rateLimiter.js";
import transactionRouter from "./routes/transRoute.js";
import { initDB } from "./config/db.js";
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
app.use("/api/transactions", transactionRouter);
initDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log("server running on port 3002");
  });
});
