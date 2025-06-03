require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { swaggerUi, swaggerSpec } = require("./swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// List all urls
app.get("/api/urls", async (req, res) => {
  const result = await db.query("SELECT * FROM urls ORDER BY created_at DESC");
  res.json(result.rows);
});

// Get individual URL by ID
app.get("/api/url/:id", async (req, res) => {
  const { id } = req.params;
  const result = await db.query("SELECT * FROM urls WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "URL not found" });
  }
  res.json(result.rows[0]);
});


//Edit the original URL
app.put("/api/url/:id/edit-original", async (req, res) => {
  const { id } = req.params;
  const { newOriginalUrl } = req.body;

  const result = await db.query(
    "UPDATE urls SET original_url = $1 WHERE id = $2 RETURNING *",
    [newOriginalUrl, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.json({ message: "Original URL updated", data: result.rows[0] });
});



// Edit the short code
app.put("/api/url/:id/edit-shortcode", async (req, res) => {
  const { id } = req.params;
  const { newShortCode } = req.body;

  const existing = await db.query("SELECT * FROM urls WHERE short_code = $1", [
    newShortCode,
  ]);
  if (existing.rowCount > 0) {
    return res.status(400).json({ error: "Short code already in use" });
  }

  const updated = await db.query(
    "UPDATE urls SET short_code = $1 WHERE id = $2 RETURNING *",
    [newShortCode, id]
  );

  if (updated.rowCount === 0) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.json({ message: "Short code updated", data: updated.rows[0] });
});



// Delete a short URL
app.delete('/api/url/:id', async (req, res) => {
    const { id } = req.params;
  
    const deleted = await db.query(
      'DELETE FROM urls WHERE id = $1 RETURNING *',
      [id]
    );
  
    if (deleted.rowCount === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }
  
    res.json({ message: 'URL deleted', data: deleted.rows[0] });
  });



// Post create short url
app.post("/api/url/shorten", async (req, res) => {
  const { originalUrl, customCode } = req.body;
  const shortCode = customCode || Math.random().toString(36).substring(2, 8);

  //check if the shortcode already exists
  const existing = await db.query("SELECT * FROM urls WHERE short_code = $1", [
    shortCode,
  ]);
  if (existing.rowCount > 0) {
    return res.status(400).json({ error: "short code already in use" });
  }

  await db.query("INSERT INTO urls (short_code, original_url) VALUES ($1,$2)", [
    shortCode,
    originalUrl,
  ]);
  res.json({ shortUrl: `http://localhost:3000/${shortCode}` });
});




app.get("/:code", async (req, res) => {
  const { code } = req.params;

  const result = await db.query(
    "SELECT original_url FROM urls WHERE short_code = $1",
    [code]
  );

  if (result.rowCount === 0) {
    return res.status(404).send("Short URL not found");
  }
  res.redirect(result.rows[0].original_url);
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
);
