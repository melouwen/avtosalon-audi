require('dotenv').config();
const express = require("express");
const path = require("path");
const pool = require('./db');
const session = require("express-session");
const { checkAdmin } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

app.use(session({
    secret: process.env.SESSION_SECRET || "084c998312d4d2ed225f2dd9359dea2e6b9b236e6972b78039bdfb80a69cfbd7",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true на продакшені з HTTPS
        httpOnly: true,
        sameSite: 'lax'
    }
}));


app.get("/api/check-auth", (req, res) => {
    if (req.session && req.session.isAdmin) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

// 🔐 Логін
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const isValid = await checkAdmin(username, password);

        if (isValid) {
            req.session.isAdmin = true;
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ error: "Невірний логін або пароль" });
        }
    } catch (err) {
        console.error("❌ Помилка при логіні:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// 🚪 Вихід
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.sendStatus(200);
    });
});

// ================== API: МАШИНИ ==================

// Отримати всі машини
app.get("/api/cars", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cars ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Помилка при отриманні машин:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Додати нову машину
app.post("/api/cars", async (req, res) => {
    const { name, page, image, price } = req.body;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const model = page.replace('.html', '');

    try {
        await pool.query(
            `INSERT INTO cars (id, name, model, price, image)
             VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO UPDATE SET name=$2, model=$3, price=$4, image=$5`,
            [id, name, model, price, image]
        );
        res.json({ message: "✅ Машина збережена" });
    } catch (err) {
        console.error("❌ Помилка при додаванні:", err);
        res.status(500).json({ error: "Помилка при збереженні" });
    }
});

// Оновити машину
app.put("/api/cars/:id", async (req, res) => {
    const id = req.params.id;
    const { name, page, image, price } = req.body;
    const model = page.replace('.html', '');

    try {
        await pool.query(
            'UPDATE cars SET name=$1, model=$2, price=$3, image=$4 WHERE id=$5',
            [name, model, price, image, id]
        );
        res.json({ message: "✅ Машина оновлена" });
    } catch (err) {
        console.error("❌ Помилка при оновленні:", err);
        res.status(500).json({ error: "Помилка оновлення" });
    }
});

// Видалити машину
app.delete("/api/cars/:id", async (req, res) => {
    const id = req.params.id;

    try {
        await pool.query('DELETE FROM cars WHERE id=$1', [id]);
        res.json({ message: "🗑️ Машина видалена" });
    } catch (err) {
        console.error("❌ Помилка при видаленні:", err);
        res.status(500).json({ error: "Помилка видалення" });
    }
});

// Перевірка з'єднання з БД
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('❌ Не вдалося підключитись до БД:', err);
    } else {
        console.log('✅ Підключено до БД:', result.rows[0]);
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер працює на http://localhost:${PORT}`);
});
