const twilio = require('twilio');
const pool = require('./db');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// 🔹 Відправити SMS-код
async function sendVerification(phone) {
    try {
        const result = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
            .verifications
            .create({ to: phone, channel: 'sms' });
        return result.status === 'pending';
    } catch (err) {
        console.error("❌ Помилка при надсиланні SMS:", err.message);
        return false;
    }
}

// 🔹 Перевірити SMS-код
async function checkCode(phone, code) {
    try {
        const result = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
            .verificationChecks
            .create({ to: phone, code });

        return result.status === 'approved';
    } catch (err) {
        console.error("❌ Помилка перевірки коду:", err.message);
        return false;
    }
}

// 🔹 Додати адміна до бази даних (пароль не потрібен, можна задати дефолтний)
async function addAdmin(username) {
    const defaultPassword = "1234"; // або згенерований / хешований
    await pool.query(
        'INSERT INTO admins (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
        [username, defaultPassword]
    );
    console.log(`✅ Адмін ${username} доданий.`);
}

module.exports = {
    sendVerification,
    checkCode,
    addAdmin
};
