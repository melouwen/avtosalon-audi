const pool = require('./db');
const fs = require('fs');

// Создание таблицы
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS cars (
                                        id TEXT PRIMARY KEY,
                                        name TEXT NOT NULL,
                                        model TEXT NOT NULL,
                                        price TEXT NOT NULL,
                                        image TEXT NOT NULL
    )
`;

async function init() {
    try {
        await pool.query(createTableQuery);
        console.log('✅ Таблица cars создана или уже существует.');

        const carsData = JSON.parse(fs.readFileSync('./cars.json', 'utf8'));

        const insertPromises = carsData.map(car => {
            const id = car.name.toLowerCase().replace(/\s+/g, '-'); // например, "Audi A5" → "audi-a5"
            const name = car.name;
            const model = car.page.replace('.html', ''); // "a5.html" → "a5"
            const price = car.price;
            const image = car.image;

            return pool.query(
                'INSERT INTO cars (id, name, model, price, image) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
                [id, name, model, price, image]
            );
        });

        await Promise.all(insertPromises);
        console.log('✅ Данные успешно добавлены в таблицу cars.');
    } catch (err) {
        console.error('❌ Ошибка при работе с БД:', err);
    }
}

init();
