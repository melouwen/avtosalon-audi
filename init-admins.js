// init-admins.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("admin.db");

db.serialize(() => {
    // Створити таблицю адміністраторів, якщо ще не існує
    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              username TEXT UNIQUE NOT NULL,
                                              password TEXT NOT NULL
        )
    `);

    // Додати трьох адміністраторів
    const admins = [
        { username: "admin1", password: "pass1" },
        { username: "admin2", password: "pass2" },
        { username: "admin3", password: "pass3" }
    ];

    const stmt = db.prepare("INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)");
    admins.forEach(admin => {
        stmt.run(admin.username, admin.password);
    });

    stmt.finalize(() => {
        console.log("Адміністратори додані.");
        db.close();
    });
});
