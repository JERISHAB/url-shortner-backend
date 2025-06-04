const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    const { usename, email, password } = req.body;

    try {
        // check if existing email
        const emailCheck = await db.query('SELECT * FROM users WHERE email= $1', [email])
        if (emailCheck)
            return res.status(400).json({ error: "User already exits" })
        next()
    } catch {
        
    }
}  