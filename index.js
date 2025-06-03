require("dotenv").config();

const express = require('express')
const { swaggerUi, swaggerSpec } = require("./swagger");
const bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./db')

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/url/shorten:
 *   post:
 *     summary: Create a short URL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalUrl:
 *                 type: string
 *               customCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Short URL created
 */


// Post create short url
app.post('/api/url/shorten', async (req, res) => {
    const { originalUrl, customCode } = req.body;
    const shortCode = customCode || Math.random().toString(36).substring(2, 8);

    //check if the shortcode already exists
    const existing = await db.query('SELECT * FROM urls WHERE short_code = $1', [shortCode]);
    if (existing.rowCount > 0) {
        return res.status(400).json({ error: 'short code already in use' });
    }

    await db.query(
        'INSERT INTO urls (short_code, original_url) VALUES ($1,$2)',
        [shortCode, originalUrl]
    )
    res.json({ shortUrl: `http://localhost:3000/${shortCode}` });

})


app.get('/:code', async (req, res) => {
    const { code }= req.params;

    const result = await db.query(
        'SELECT original_url FROM urls WHERE short_code = $1',[code]
    )

    if (result.rowCount === 0) {
        return res.status(404).send('Short URL not found');
    }
    res.redirect(result.rows[0].original_url)
})


const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
);