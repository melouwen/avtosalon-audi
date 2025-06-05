document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "1234";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem("isAdmin", "true");
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("error").textContent = "Невірний логін або пароль";
    }
});

if (window.location.pathname.includes("dashboard.html")) {
    const carForm = document.getElementById("carForm");
    const carList = document.getElementById("carList");

    const loadCars = () => {
        const cars = JSON.parse(localStorage.getItem("cars") || "[]");
        carList.innerHTML = "";
        cars.forEach((car, index) => {
            const item = document.createElement("div");
            item.className = "car-list-item";
            item.innerHTML = `<strong>${car.name}</strong><br><small>${car.description}</small><br><a href="${car.image}" target="_blank">Зображення</a>`;
            carList.appendChild(item);
        });
    };

    carForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("carName").value.trim();
        const image = document.getElementById("carImage").value.trim();
        const description = document.getElementById("carDescription").value.trim();

        const cars = JSON.parse(localStorage.getItem("cars") || "[]");
        cars.push({ name, image, description });
        localStorage.setItem("cars", JSON.stringify(cars));

        carForm.reset();
        loadCars();
    });

    loadCars();
}

<script>
    if (localStorage.getItem("isAdmin") !== "true") {
    window.location.href = "index.html";
}

    const carForm = document.getElementById("carForm");
    const carList = document.getElementById("carList");

    function loadCars() {
    const cars = JSON.parse(localStorage.getItem("cars") || "[]");
    carList.innerHTML = "";

    if (cars.length === 0) {
    carList.innerHTML = "<p>Каталог порожній.</p>";
    return;
}

    cars.forEach((car, index) => {
    const div = document.createElement("div");
    div.className = "car-list-item";
    div.innerHTML = `
        <strong>${car.name}</strong><br>
        <img src="${car.image}" width="100"><br>
        <small>${car.description}</small><br>
        <strong>${car.price}</strong><br>
        <button onclick="deleteCar(${index})">❌ Видалити</button>
      `;
    carList.appendChild(div);
});
}

    function deleteCar(index) {
    const cars = JSON.parse(localStorage.getItem("cars") || "[]");
    cars.splice(index, 1);
    localStorage.setItem("cars", JSON.stringify(cars));
    loadCars();
}

    carForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const nameSelect = document.getElementById("carName");
    const selectedText = nameSelect.options[nameSelect.selectedIndex].text;
    const selectedPage = nameSelect.value;

    const car = {
    name: selectedText,
    page: selectedPage,
    image: document.getElementById("carImage").value.trim(),
    price: document.getElementById("carPrice").value.trim(),
};


    const cars = JSON.parse(localStorage.getItem("cars") || "[]");
    cars.push(car);
    localStorage.setItem("cars", JSON.stringify(cars));

    carForm.reset();
    loadCars();
});

    loadCars();
</script>

document.getElementById('carForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const model = document.getElementById('model').value;
    const image = document.getElementById('image').value;
    const price = document.getElementById('price').value;

    const html = `
    <div class="car-card" onclick="showOrderInfo()">
      <img src="${image}" alt="${model}">
      <h3>${model}</h3>
      <p>${desc}</p>
      <ul>
        <li><strong>Ціна:</strong> ${price} €</li>
      </ul>
    </div>
  `;

    document.getElementById('carCatalog').insertAdjacentHTML('beforeend', html);
    this.reset();
});

function showOrderInfo() {
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function logout() {
    window.location.href = '../index.html';
}

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    setTimeout(() => {
        loader.classList.add("fade-out");
        setTimeout(() => loader.remove(), 800);
    }, 900);
});
