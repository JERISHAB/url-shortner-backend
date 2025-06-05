require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const authRoutes = require("./auth");
const authenticateToken = require("./middleware/auth");
const { createShortUrlValidation } = require("./validators/url.validator");
const validate = require("./middleware/validation.middleware");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// for http logs
const morgan = require("morgan");
app.use(morgan("dev"));

// route to redirect shorturls
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;
  try {
    const result = await db.query(
      "SELECT original_url FROM urls WHERE short_code = $1",
      [shortCode]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Short URL not found");
    }

    const originalUrl = result.rows[0].original_url;
    return res.redirect(originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});


// Used for login and register
app.use("/api/auth", authRoutes);

// for the token validation
app.use("/api", authenticateToken);



// create Short URL
app.post(
  "/api/url/shorten",
  createShortUrlValidation,
  validate,
  async (req, res) => {
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
      res.status(400).json({ error: "Short code already exists" });
    }
  }
);

// list all urls
app.get("/api/urls", async (req, res) => {
  const userId = req.user.userId;
  const result = await db.query(
    "SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  res.json(result.rows);
});

// edit original urls
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

// edit shortcode
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

// delete a url
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
