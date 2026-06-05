import express from "express";
import db from "../../Database/database.js";

const router = express.Router();

// -------------------------------------------------------------
// 1. ADD NEW TRANSACTION (Create)
// -------------------------------------------------------------
router.post("/transactions", async (req, res) => {
  try {
    const { user_id, title, amount, type,  date } = req.body;

    if (!user_id || !title || !amount || !type || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }
console.log(req.body,'ddd');

    const sqlQuery = `
      INSERT INTO transactions (user_id, title, amount, type, date) 
      VALUES (?, ?, ?, ?, ?)
    `;

const [result] = await db.execute(sqlQuery, [user_id, title, amount, type, date]);

res.status(201).json({
  message: "Transaction added successfully",
  transaction: {
    id: result.insertId,
    user_id,
    title,
    amount,
    type,
    date
  }
});
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 2. GET ALL TRANSACTIONS (Puri Website ka Data - Testing ke liye)
// -------------------------------------------------------------
router.get("/transactions", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM transactions ORDER BY date DESC",
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 3. GET USER SPECIFIC TRANSACTIONS (Dashboard ke liye 🌟)
// -------------------------------------------------------------
// Jab user login hoga, to sirf us ka apna budget data dikhane ke liye yeh API chalegi
router.get("/transactions/user/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;

    // ORDER BY date DESC lagane se naye kharche upar nazar aayenge
    const [rows] = await db.execute(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
      [userId],
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 4. GET SINGLE TRANSACTION BY ID (Kisi ek kharche ki detail)
// -------------------------------------------------------------
router.get("/transactions/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const [rows] = await db.execute("SELECT * FROM transactions WHERE id = ?", [
      transactionId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 5. UPDATE TRANSACTION (Edit karne ke liye)
// -------------------------------------------------------------
router.put("/transactions/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { title, amount, type,  date } = req.body;

    if (!title || !amount || !type || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sqlQuery = `
      UPDATE transactions 
      SET title = ?, amount = ?, type = ?, date = ? 
      WHERE id = ?
    `;
    const [result] = await db.execute(sqlQuery, [
      title,
      amount,
      type,
      date,
      transactionId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 6. DELETE TRANSACTION (Kharcha delete karne ke liye)
// -------------------------------------------------------------
router.delete("/transactions/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;

    const [result] = await db.execute("DELETE FROM transactions WHERE id = ?", [
      transactionId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
