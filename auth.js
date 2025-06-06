const pool = require('./db');
const bcrypt = require('bcrypt');

async function createAdmin(username, plainPassword) {
    const hashed = await bcrypt.hash(plainPassword, 10);
    await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING', [username, hashed]);
    console.log(`Адмін ${username} створений.`);
}

async function checkAdmin(username, plainPassword) {
    const result = await pool.query('SELECT password FROM admins WHERE username = $1', [username]);
    if (result.rows.length === 0) return false;

    const match = await bcrypt.compare(plainPassword, result.rows[0].password);
    return match;
}

module.exports = { createAdmin, checkAdmin };
