const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const db = require("./database.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Сесія
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
}));

// Статичні файли
app.use(express.static("public")); // сайт
app.use("/admin", express.static("admin")); // адмінка

// Завантаження машин
const carsFile = path.join(__dirname, "cars.json");

function loadCars() {
    try {
        return JSON.parse(fs.readFileSync(carsFile, "utf-8"));
    } catch {
        return [];
    }
}

function saveCars(cars) {
    fs.writeFileSync(carsFile, JSON.stringify(cars, null, 2));
}

// Перевірка чи залогінений
function checkAuth(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
}

// 🔐 API: логін
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM admins WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (row) {
            req.session.loggedIn = true;
            res.json({ success: true });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    });
});

// 🔒 Захищена сторінка dashboard
app.get("/admin/dashboard.html", (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect("/admin/index.html");
    }
});

// 🔐 API: список машин
app.get("/api/cars", checkAuth, (req, res) => {
    const cars = loadCars();
    res.json(cars);
});

// 🔐 API: додати машину
app.post("/api/cars", checkAuth, (req, res) => {
    const car = req.body;
    const cars = loadCars();
    cars.push(car);
    saveCars(cars);
    res.json({ success: true });
});

// 🔐 API: редагувати
app.put("/api/cars/:index", checkAuth, (req, res) => {
    const index = parseInt(req.params.index);
    const cars = loadCars();

    if (index < 0 || index >= cars.length) {
        return res.status(404).json({ error: "Car not found" });
    }

    cars[index] = req.body;
    saveCars(cars);
    res.json({ success: true });
});

// 🔐 API: видалити
app.delete("/api/cars/:index", checkAuth, (req, res) => {
    const index = parseInt(req.params.index);
    const cars = loadCars();

    if (index < 0 || index >= cars.length) {
        return res.status(404).json({ error: "Car not found" });
    }

    cars.splice(index, 1);
    saveCars(cars);
    res.json({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Сервер працює: http://localhost:${PORT}`);
});
