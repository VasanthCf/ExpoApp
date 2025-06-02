import express from "express";
import { config } from "dotenv";

import rateLimiter from "./middleware/rateLimiter.js";
import transactionRouter from "./routes/transRoute.js";
import { initDB } from "./config/db.js";
import cors from "cors";
config();
const app = express();
app.use(express.json());
app.use(rateLimiter);
app.use(cors());
app.use("/api/transactions", transactionRouter);
initDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log("server running on port 3002");
  });
});
