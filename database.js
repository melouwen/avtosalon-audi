const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./admin.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              username TEXT UNIQUE,
                                              password TEXT
        )
    `);

    const defaultUsername = 'admin';
    const defaultPassword = '1234';

    db.get("SELECT * FROM admins WHERE username = ?", [defaultUsername], (err, row) => {
        if (!row) {
            db.run("INSERT INTO admins (username, password) VALUES (?, ?)", [defaultUsername, defaultPassword]);
            console.log("✅ Адмін створений: admin / 1234");
        }
    });
});

module.exports = db;
