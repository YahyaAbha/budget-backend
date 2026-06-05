import express from "express";
import db from "../../Database/database.js";
import bcrypt from "bcrypt";

const router = express.Router();

// -------------------------------------------------------------
// 1. SIGN UP / REGISTER USER
// -------------------------------------------------------------
router.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, Email, and Password are required" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const sqlQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    const [result] = await db.execute(sqlQuery, [name, email, hashedPassword]);
    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 2. LOGIN USER
// -------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }
    const sqlQuery = "SELECT id, name, email, password FROM users WHERE email = ?";
    const [rows] = await db.execute(sqlQuery, [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 3. UPDATE INCOME
// -------------------------------------------------------------
// router.put("/users/:id/income", async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { income } = req.body;
//     if (income === undefined || income === null) {
//       return res.status(400).json({ message: "Income is required" });
//     }
//     const [result] = await db.execute(
//       "UPDATE users SET income = ? WHERE id = ?",
//       [income, userId]
//     );
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json({ message: "Income updated successfully", income });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// -------------------------------------------------------------
// 4. GET ALL USERS
// -------------------------------------------------------------
router.get("/users", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, name, email, created_at FROM users");
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 5. GET SINGLE USER BY ID
// -------------------------------------------------------------
router.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.execute(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 6. UPDATE USER PROFILE
// -------------------------------------------------------------
router.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }
    const [result] = await db.execute(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already taken by another user" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------------------------------
// 7. DELETE USER
// -------------------------------------------------------------
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;