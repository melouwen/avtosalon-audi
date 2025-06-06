const express = require("express");
const session = require("express-session");
const cors = require("cors");
const Database = require('better-sqlite3');
const db = new Database('admin.db');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database("admin.db");

app.use(cors());
app.use(express.json());
app.use(session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false
}));

// Авторизація
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM admins WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ error: "DB error" });
        }

        if (!row) {
            return res.status(401).json({ error: "Неправильний логін або пароль" });
        }

        req.session.isAdmin = true;
        res.json({ success: true });
    });
});

// Захист адмінки
app.use("/admin/dashboard.html", (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect("/admin/index.html");
    }
});

// Статичні файли
app.use(express.static("public"));
app.use("/admin", express.static(path.join(__dirname, "admin")));

// API машин
let cars = [];

app.get("/api/cars", (req, res) => {
    if (!req.session.isAdmin) return res.status(403).json({ error: "Unauthorized" });
    res.json(cars);
});

app.post("/api/cars", (req, res) => {
    if (!req.session.isAdmin) return res.status(403).json({ error: "Unauthorized" });
    cars.push(req.body);
    res.json({ success: true });
});

app.put("/api/cars/:index", (req, res) => {
    if (!req.session.isAdmin) return res.status(403).json({ error: "Unauthorized" });
    const index = parseInt(req.params.index);
    if (index >= 0 && index < cars.length) {
        cars[index] = req.body;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Car not found" });
    }
});

app.delete("/api/cars/:index", (req, res) => {
    if (!req.session.isAdmin) return res.status(403).json({ error: "Unauthorized" });
    const index = parseInt(req.params.index);
    if (index >= 0 && index < cars.length) {
        cars.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Car not found" });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});
