const bcrypt = require('bcrypt');
const pool = require('./db');

async function createAdmin(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
        'INSERT INTO admins (username, password) VALUES ($1, $2)',
        [username, hashedPassword]
    );
    console.log(`Адмін "${username}" доданий!`);
    process.exit();
}


createAdmin("yarikpidor", "228");