const pool = require('./db');
const fs = require('fs');

// Створення таблиці з полем page замість model
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS cars (
                                        id TEXT PRIMARY KEY,
                                        name TEXT NOT NULL,
                                        page TEXT NOT NULL,
                                        price TEXT NOT NULL,
                                        image TEXT NOT NULL
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
