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

// export const postTransaction = async (req, res) => {
//   try {
//     const { title, amount, category, user_id } = req.body;
//     if (!title || !category || !user_id || amount === undefined)
//       return res.status(400).json({ message: "All fields are required" });

//     const transaction =
//       await sql`INSERT INTO transactions (title,category,user_id,amount) VALUES (${title},${category},${user_id},${amount}) RETURNING *`;
//     console.log(transaction);
//     res.status(201).json(transaction[0]);
//   } catch (err) {
//     console.log("Error occured" + err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
export const postTransaction = async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !category || !user_id || amount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }
    // Determine type from amount
    const type = numericAmount >= 0 ? "income" : "expense";

    const transaction = await sql`
      INSERT INTO transactions (title, category, user_id, amount, type)
      VALUES (${title}, ${category}, ${user_id}, ${numericAmount}, ${type})
      RETURNING *;
    `;

    res.status(201).json(transaction[0]);
  } catch (err) {
    console.error("Error occurred:", err);
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

export const getStats = async (req, res) => {
  try {
    const { user_id, startDate, endDate } = req.query;
    if (!user_id || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required query params" });
    }

    const results = await sql`
      SELECT
  DATE(created_at) AS date,
  SUM(amount) FILTER (WHERE type = 'income') AS income,
  SUM(ABS(amount)) FILTER (WHERE type = 'expense') AS expense
FROM transactions
WHERE user_id = ${user_id}
  AND created_at BETWEEN ${startDate} AND ${endDate}
GROUP BY date
ORDER BY date ASC;
    `;

    res.status(200).json(results);
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
