// index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const authRoutes = require("./auth");
const authenticateToken = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api", authenticateToken); // Protect all /api routes below

// Create Short URL
app.post("/api/url/shorten", async (req, res) => {
  const { originalUrl, customCode } = req.body;
  const userId = req.user.userId;
  const shortCode = customCode || Math.random().toString(36).substring(2, 8);

  try {
    const result = await db.query(
      "INSERT INTO urls (original_url, short_code, user_id) VALUES ($1, $2, $3) RETURNING *",
      [originalUrl, shortCode, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "Short code already exists or bad input" });
  }
});

// List all URLs for the logged-in user
app.get("/api/urls", async (req, res) => {
  const userId = req.user.userId;
  const result = await db.query(
    "SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  res.json(result.rows);
});

// Get single URL by ID
app.get("/api/url/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const result = await db.query(
    "SELECT * FROM urls WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  if (result.rowCount === 0)
    return res.status(403).json({ error: "Not authorized or not found" });
  res.json(result.rows[0]);
});

// Edit original URL
app.put("/api/url/:id/edit-original", async (req, res) => {
  const { id } = req.params;
  const { newOriginalUrl } = req.body;
  const userId = req.user.userId;

  const result = await db.query(
    "UPDATE urls SET original_url = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
    [newOriginalUrl, id, userId]
  );
  if (result.rowCount === 0)
    return res.status(403).json({ error: "Unauthorized to edit this URL" });
  res.json({ message: "Original URL updated", data: result.rows[0] });
});

// Edit short code
app.put("/api/url/:id/edit-shortcode", async (req, res) => {
  const { id } = req.params;
  const { newShortCode } = req.body;
  const userId = req.user.userId;

  const exists = await db.query("SELECT * FROM urls WHERE short_code = $1", [
    newShortCode,
  ]);
  if (exists.rowCount > 0)
    return res.status(400).json({ error: "Short code already taken" });

  const result = await db.query(
    "UPDATE urls SET short_code = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
    [newShortCode, id, userId]
  );
  if (result.rowCount === 0)
    return res.status(403).json({ error: "Unauthorized to edit this URL" });
  res.json({ message: "Short code updated", data: result.rows[0] });
});

// Delete a URL
app.delete("/api/url/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const result = await db.query(
    "DELETE FROM urls WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );
  if (result.rowCount === 0)
    return res.status(403).json({ error: "Unauthorized to delete this URL" });
  res.json({ message: "URL deleted", data: result.rows[0] });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
