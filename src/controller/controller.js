import { sql } from "./../config/db.js";

export const getUserTransaction = async (req, res) => {
  try {
    const { userId } = req.params;
    const data =
      await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;
    res.status(200).json(data);
  } catch (err) {
    console.log("Error occured" + err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const postTransaction = async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;
    if (!title || !category || !user_id || amount === undefined)
      return res.status(400).json({ message: "All fields are required" });

    const transaction =
      await sql`INSERT INTO transactions (title,category,user_id,amount) VALUES (${title},${category},${user_id},${amount}) RETURNING *`;
    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (err) {
    console.log("Error occured" + err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "invalid transaction" });
    }
    const result =
      await sql` DELETE FROM transactions WHERE id=${id} RETURNING *`;
    if (result.length === 0) {
      return res.status(404).json({ message: "transaction not found" });
    } else {
      res.status(200).json({ message: "transaction delted successfully" });
    }
  } catch (err) {
    console.log("Error occured" + err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const balance =
      await sql` SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id=${userId}
    `;
    const expense = await sql`
    SELECT COALESCE(SUM(amount),0) as expense FROM transactions WHERE user_id = ${userId} AND amount < 0`;
    const income = await sql`
    SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0`;
    res.status(200).json({
      balance: balance[0].balance,
      income: income[0].income,
      expense: expense[0].expense,
    });
  } catch (err) {
    console.log("Error occured" + err);
    res.status(500).json({ message: "Internal server error" + err });
  }
};
