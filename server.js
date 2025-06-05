const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const carsFile = path.join(__dirname, "cars.json");

app.get("/api/cars", (req, res) => {
    if (!fs.existsSync(carsFile)) fs.writeFileSync(carsFile, "[]");
    const data = fs.readFileSync(carsFile, "utf8");
    res.json(JSON.parse(data));
});

app.post("/api/cars", (req, res) => {
    const car = req.body;
    const data = JSON.parse(fs.readFileSync(carsFile, "utf8"));
    data.push(car);
    fs.writeFileSync(carsFile, JSON.stringify(data, null, 2));
    res.json({ message: "Машину додано" });
});

app.put("/api/cars/:index", (req, res) => {
    const index = +req.params.index;
    const updatedCar = req.body;
    const data = JSON.parse(fs.readFileSync(carsFile, "utf8"));
    if (index < 0 || index >= data.length) return res.status(404).json({ error: "Не знайдено" });

    data[index] = updatedCar;
    fs.writeFileSync(carsFile, JSON.stringify(data, null, 2));
    res.json({ message: "Оновлено" });
});

app.delete("/api/cars/:index", (req, res) => {
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
