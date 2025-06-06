require('dotenv').config();
const express = require("express");
const path = require("path");
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ======= 🧩 ВАЖЛИВО: СТАТИЧНІ ПАПКИ =======
app.use(express.static(__dirname)); // щоб працював index.html
app.use('/models', express.static(path.join(__dirname, 'models'))); // сторінки моделей
app.use('/media', express.static(path.join(__dirname, 'media'))); // картинки, відео, стилі, тощо

// ======= API для машин =======

// Вивести всі машини
app.get("/api/cars", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cars ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Не вдалося отримати машини:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Додати нову або оновити
app.post("/api/cars", async (req, res) => {
    const { name, page, image, price } = req.body;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const model = page.replace('.html', '');

    try {
        await pool.query(`
      INSERT INTO cars (id, name, model, price, image, page)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET name=$2, model=$3, price=$4, image=$5, page=$6
    `, [id, name, model, price, image, page]);
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
        await pool.query(`
      UPDATE cars SET name=$1, model=$2, price=$3, image=$4, page=$5 WHERE id=$6
    `, [name, model, price, image, page, id]);
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

// ======= Перевірка підключення до БД =======
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('❌ Помилка зʼєднання з БД:', err);
    } else {
        console.log('✅ Підключено до БД:', result.rows[0]);
    }
});

// ======= Запуск сервера =======
app.listen(PORT, () => {
    console.log(`🚀 Сервер працює на http://localhost:${PORT}`);
});
