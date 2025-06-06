require('dotenv').config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const { createAdmin } = require("./auth-sms");
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const app = express();

// === CONFIG ===
const ALLOWED_PHONE = "+380968267887"; // ❗ Лише цей номер має доступ

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "sms-secret", // бажано винести в .env
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 15 * 60 * 1000 } // 15 хвилин
}));

// === 1. Надіслати код на телефон ===
app.post("/send-code", async (req, res) => {
    const { phone } = req.body;

    try {
        await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
            .verifications
            .create({ to: phone, channel: "sms" });

        req.session.phone = phone;
        res.json({ success: true });
    } catch (err) {
        console.error("❌ Помилка надсилання SMS:", err?.message || err);
        res.status(500).json({ error: "Помилка надсилання SMS" });
    }
});

// === 2. Перевірити код ===
app.post("/verify-code", async (req, res) => {
    const { code } = req.body;
    const phone = req.session.phone;

    if (!phone) return res.status(400).json({ error: "Немає номера телефону в сесії" });

    if (phone !== ALLOWED_PHONE) {
        console.warn("⛔ Заборонений номер:", phone);
        return res.status(403).json({ error: "Доступ заборонено" });
    }

    try {
        const check = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
            .verificationChecks
            .create({ to: phone, code });

        if (check.status === "approved") {
            req.session.verified = true;
            res.json({ success: true });
        } else {
            res.status(401).json({ error: "Невірний код" });
        }
    } catch (err) {
        console.error("❌ Помилка перевірки коду:", err);
        res.status(500).json({ error: "Помилка перевірки" });
    }
});

// === 3. Додати адміна ===
app.post("/add-admin", async (req, res) => {
    if (!req.session.verified) {
        return res.status(401).json({ error: "Не авторизовано" });
    }

    const { username, password } = req.body;

    try {
        await createAdmin(username, password);
        res.json({ success: true });
    } catch (err) {
        console.error("❌ Помилка створення адміна:", err);
        res.status(500).json({ error: "Помилка збереження" });
    }
});

// === Запуск сервера ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 SMS-Admin сервер запущено на http://localhost:${PORT}`);
});
