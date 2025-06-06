const pool = require('./db');
const fs = require('fs');

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS admins (
                                          id SERIAL PRIMARY KEY,
                                          username TEXT UNIQUE NOT NULL,
                                          password TEXT NOT NULL
    )
`;

async function init() {
    try {
        await pool.query(createTableQuery);
        console.log('✅ Таблиця cars створена або вже існує.');

        // Очистити таблицю перед додаванням нових записів (необов’язково, але корисно для тестування)
        await pool.query('DELETE FROM cars');

        const carsData = JSON.parse(fs.readFileSync('./cars.json', 'utf8'));

        const insertPromises = carsData.map(car => {
            const id = car.name.toLowerCase().replace(/\s+/g, '-'); // "Audi A5" → "audi-a5"
            const name = car.name;
            const page = car.page; // "a5.html"
            const price = car.price;
            const image = car.image;

            return pool.query(
                'INSERT INTO cars (id, name, page, price, image) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
                [id, name, page, price, image]
            );
        });

        await Promise.all(insertPromises);
        console.log('✅ Дані успішно додані до таблиці cars.');
    } catch (err) {
        console.error('❌ Помилка при роботі з БД:', err);
    }
}

init();

const { createAdmin } = require('./auth');

createAdmin('admin', '19076');
