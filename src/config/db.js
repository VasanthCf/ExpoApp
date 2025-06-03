import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config();

export async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

    console.log("database initialized");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
export const sql = neon(process.env.DB_URL);
