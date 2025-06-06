const session = require("express-session");

fetch("/check-auth").then(res => {
    if (!res.ok) {
        window.location.href = "index.html";
    }
});

const carForm = document.getElementById("carForm");
const carList = document.getElementById("carList");
const editIndex = document.getElementById("editIndex");
let cars = [];

async function loadCars() {
    try {
        const res = await fetch("/api/cars");
        cars = await res.json();

        carList.innerHTML = "";

        if (cars.length === 0) {
            carList.innerHTML = "<p>Каталог порожній.</p>";
            return;
        }

        cars.forEach((car) => {
            const div = document.createElement("div");
            div.className = "car-list-item";
            div.innerHTML = `
        <strong>${car.name}</strong> — ${car.price} €<br>
        <img src="${car.image}" width="120"><br>
        <button onclick="editCar('${car.id}')">Редагувати</button>
        <button onclick="deleteCar('${car.id}')">Видалити</button>
      `;
            carList.appendChild(div);
        });
    } catch (err) {
        console.error("Помилка при завантаженні:", err);
    }
}

window.editCar = function (id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;

    const select = document.getElementById("carName");
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === car.page) {
            select.selectedIndex = i;
            break;
        }
    }

    document.getElementById("carImage").value = car.image;
    document.getElementById("carPrice").value = car.price;
    editIndex.value = car.id;
};

window.deleteCar = async function (id) {
    try {
        await fetch(`/api/cars/${id}`, { method: "DELETE" });
        loadCars();
    } catch (err) {
        console.error("Помилка при видаленні:", err);
    }
};

carForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameSelect = document.getElementById("carName");
    const car = {
        name: nameSelect.options[nameSelect.selectedIndex].text,
        page: nameSelect.value,
        image: document.getElementById("carImage").value.trim(),
        price: document.getElementById("carPrice").value.trim()
    };

    const id = editIndex.value;

    try {
        if (id) {
            await fetch(`/api/cars/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(car)
            });
            editIndex.value = "";
        } else {
            await fetch("/api/cars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(car)
            });
        }

        carForm.reset();
        loadCars();
    } catch (err) {
        console.error("Помилка при збереженні:", err);
    }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("/logout", { method: "POST" });
    window.location.href = "index.html";
});

loadCars();
