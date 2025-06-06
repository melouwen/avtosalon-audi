const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Сесія
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // якщо HTTPS, то true
}));

// Статика
app.use(express.static(__dirname));

// Авторизаційна перевірка
function isAuthenticated(req, res, next) {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ error: "Неавторизовано" });
    }
}

// 🔐 Логін
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "curateddd" && password === "19076") {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "Невірний логін або пароль" });
    }
});

// 🔐 Вихід
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// 📦 Доступ до JSON-файлу
const carsFile = path.join(__dirname, "cars.json");

// API тільки для авторизованих
app.get("/api/cars", isAuthenticated, (req, res) => {
    if (!fs.existsSync(carsFile)) fs.writeFileSync(carsFile, "[]");
    const data = fs.readFileSync(carsFile, "utf8");
    res.json(JSON.parse(data));
});

app.post("/api/cars", isAuthenticated, (req, res) => {
    const car = req.body;
    const data = JSON.parse(fs.readFileSync(carsFile, "utf8"));
    data.push(car);
    fs.writeFileSync(carsFile, JSON.stringify(data, null, 2));
    res.json({ message: "Машину додано" });
});

app.put("/api/cars/:index", isAuthenticated, (req, res) => {
    const index = +req.params.index;
    const updatedCar = req.body;
    const data = JSON.parse(fs.readFileSync(carsFile, "utf8"));
    if (index < 0 || index >= data.length) return res.status(404).json({ error: "Не знайдено" });

    data[index] = updatedCar;
    fs.writeFileSync(carsFile, JSON.stringify(data, null, 2));
    res.json({ message: "Оновлено" });
});

app.delete("/api/cars/:index", isAuthenticated, (req, res) => {
    const index = +req.params.index;
    const data = JSON.parse(fs.readFileSync(carsFile, "utf8"));
    if (index < 0 || index >= data.length) return res.status(404).json({ error: "Не знайдено" });

    data.splice(index, 1);
    fs.writeFileSync(carsFile, JSON.stringify(data, null, 2));
    res.json({ message: "Видалено" });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер працює на http://localhost:${PORT}`);
});
