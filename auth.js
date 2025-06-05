const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const router = express.Router();

const validate = require("./middleware/validation.middleware");

const { loginValidation } = require("./validators/auth.validator");
const { registerValidation } = require("./validators/auth.validator");

// register
router.post("/register", registerValidation, validate, async (req, res) => {
  const { username, email, password } = req.body;
  const hashed_pass = await bcrypt.hash(password, 10);

  try {
    const result = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashed_pass]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(409).json({ error: "User already exists" });
  }
});

//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];

  if (!user) return res.status(404).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Incorrect password" });

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

module.exports = router;
