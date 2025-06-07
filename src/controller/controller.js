import { sql } from "./../config/db.js";
import {
  startOfWeek,
  endOfWeek,
  format,
  addDays,
  isAfter,
  addYears,
  parseISO,
  addMonths,
} from "date-fns";
export const getUserTransactionAll = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "30d", limit = 100, cursor } = req.query;

    const parsedLimit = parseInt(limit) || 100;
    // Time period filter
    let dateCondition = sql``;
    switch (period) {
      case "30d":
        dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '30 days'`;
        break;
      case "3m":
        dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '3 months'`;
        break;
      case "6m":
        dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '6 months'`;
        break;
      case "1y":
        dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '1 year'`;
        break;
    }

    // Cursor filter for pagination
    const cursorCondition = cursor ? sql`AND created_at < ${cursor}` : sql``;

    // Fetch paginated data
    const data = await sql`
      SELECT * FROM transactions
      WHERE user_id = ${userId}
      ${dateCondition}
      ${cursorCondition}
      ORDER BY created_at DESC
      LIMIT ${parsedLimit}
    `;

    // Total count for hasMore logic
    const total = await sql`
      SELECT COUNT(*) FROM transactions
      WHERE user_id = ${userId}
      ${dateCondition}
    `;

    res.status(200).json({
      data,
      totalCount: Number(total[0].count),
    });
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const getUserTransactionAll = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { period = "30d", limit = 100 } = req.query;

//     const parsedLimit = limit ? parseInt(limit) : 100;

//     // Use tagged template literals to safely build date condition
//     let dateCondition = sql``;

//     switch (period) {
//       case "30d":
//         dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '30 days'`;
//         break;
//       case "3m":
//         dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '3 months'`;
//         break;
//       case "6m":
//         dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '6 months'`;
//         break;
//       case "1y":
//         dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '1 year'`;
//         break;
//       default:
//         // No filter
//         dateCondition = sql``;
//     }

//     // Safe, composable query
//     const data = await sql`
//       SELECT * FROM transactions
//       WHERE user_id = ${userId}
//       ${dateCondition}
//       ORDER BY created_at DESC
//       LIMIT ${parsedLimit}
//     `;

//     res.status(200).json(data);
//   } catch (err) {
//     console.error("Error occurred:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const getUserTransaction = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await sql`
      SELECT * FROM transactions
      WHERE user_id = ${userId}
        AND created_at::date = CURRENT_DATE
      ORDER BY created_at DESC
    `;
    res.status(200).json(data);
  } catch (err) {
    console.log("Error occurred: " + err);
    res.status(500).json({ message: "Internal server error" });
  }
};

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

// export const getSummary = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const balance =
//       await sql` SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id=${userId}
//     `;
//     const expense = await sql`
//     SELECT COALESCE(SUM(amount),0) as expense FROM transactions WHERE user_id = ${userId} AND amount < 0`;
//     const income = await sql`
//     SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0`;
//     res.status(200).json({
//       balance: balance[0].balance,
//       income: income[0].income,
//       expense: expense[0].expense,
//     });
//   } catch (err) {
//     console.log("Error occured" + err);
//     res.status(500).json({ message: "Internal server error" + err });
//   }
// };

export const getSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period } = req.query; // e.g. "30d", "3m", "6m", "1y"

    let dateCondition = sql``;

    // Build the date condition based on period
    switch (period) {
      case "30d":
        // last 30 days from today (including today)
        dateCondition = sql`
          AND created_at >= date_trunc('month', CURRENT_DATE)
          AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        `;
        break;
      case "3m":
        // last 3 months from today
        dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '3 months'`;
        break;
      case "6m":
        // last 6 months from today
        dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '6 months'`;
        break;
      case "1y":
        // last 1 year from today
        dateCondition = sql`AND created_at >= CURRENT_DATE - INTERVAL '1 year'`;
        break;
      default:
        // If no valid period passed, get all time data (no date filter)
        dateCondition = sql``;
    }

    const balance = await sql`
      SELECT COALESCE(SUM(amount), 0) AS balance
      FROM transactions
      WHERE user_id = ${userId}
      ${dateCondition}
    `;

    const expense = await sql`
      SELECT COALESCE(SUM(amount), 0) AS expense
      FROM transactions
      WHERE user_id = ${userId}
        AND amount < 0
      ${dateCondition}
    `;

    const income = await sql`
      SELECT COALESCE(SUM(amount), 0) AS income
      FROM transactions
      WHERE user_id = ${userId}
        AND amount > 0
      ${dateCondition}
    `;

    res.status(200).json({
      balance: balance[0].balance,
      income: income[0].income,
      expense: expense[0].expense,
    });
  } catch (err) {
    console.log("Error occurred: " + err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStats = async (req, res) => {
  try {
    const { user_id, view = "week", startDate, endDate } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "Missing user_id" });
    }

    let fromDate, toDate, groupFormat, labelFormatter;

    if (view === "week") {
      fromDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      toDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      groupFormat = "YYYY-MM-DD";
      labelFormatter = (date) => format(date, "EEE"); // "Mon", "Tue"
    } else if (view === "month") {
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ message: "Missing startDate or endDate" });
      }
      fromDate = parseISO(startDate);
      toDate = parseISO(endDate);
      groupFormat = "YYYY-MM";
      labelFormatter = (date) => format(date, "MMM");
    } else if (view === "year") {
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ message: "Missing startDate or endDate" });
      }
      fromDate = parseISO(startDate);
      toDate = parseISO(endDate);
      groupFormat = "YYYY";
      labelFormatter = (date) => format(date, "yyyy");
    } else {
      return res.status(400).json({ message: "Invalid view type" });
    }

    const results = await sql`
      SELECT
        TO_CHAR(created_at, ${groupFormat}) as label,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ${user_id}
        AND created_at BETWEEN ${format(fromDate, "yyyy-MM-dd")} AND ${format(
      toDate,
      "yyyy-MM-dd"
    )}
      GROUP BY label
      ORDER BY label;
    `;
    const statsMap = {};
    results.forEach((r) => {
      statsMap[r.label] = {
        income: parseFloat(r.income),
        expense: parseFloat(r.expense),
      };
    });

    const chartData = [];
    let current = new Date(fromDate);

    while (!isAfter(current, toDate)) {
      let key, label;
      if (view === "week") key = format(current, "yyyy-MM-dd");
      else if (view === "month") key = format(current, "yyyy-MM");
      else key = format(current, "yyyy");

      label = labelFormatter(current);

      const data = statsMap[key] || { income: 0, expense: 0 };

      chartData.push({
        label,
        value: data.income,
        spacing: 4,
        labelWidth: 35,
        frontColor: "#001055",
      });
      chartData.push({
        value: Math.abs(data.expense),
        frontColor: "#ee1919",
      });

      if (view === "week") current = addDays(current, 1);
      else if (view === "month") current = addMonths(current, 1);
      else current = addYears(current, 1);
    }

    res.status(200).json(chartData);
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAllTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete all transactions for the given user
    await sql`
      DELETE FROM transactions
      WHERE user_id = ${userId}
    `;

    res.status(200).json({ message: "All transactions deleted successfully" });
  } catch (err) {
    console.error("Error occurred while deleting transactions: " + err);
    res.status(500).json({ message: "Internal server error" });
  }
};
