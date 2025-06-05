 document.addEventListener("DOMContentLoaded", () => {
    // Вихід, якщо не адмін
    if (localStorage.getItem("isAdmin") !== "true") {
    window.location.href = "index.html";
    return;
}

    // Завантаження лоадера
    const loader = document.getElementById("loader");
    window.addEventListener("load", () => {
    setTimeout(() => {
    loader?.classList.add("fade-out");
    setTimeout(() => loader?.remove(), 800);
}, 800);
});

    // Основна логіка після DOM
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
          <strong>${car.price || ""}</strong><br>
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

    window.deleteCar = deleteCar;

    carForm?.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("carName")?.value.trim();
    const image = document.getElementById("carImage")?.value.trim();
    const description = document.getElementById("carDescription")?.value.trim();
    const price = document.getElementById("carPrice")?.value.trim();

    const car = { name, image, description, price };
    const cars = JSON.parse(localStorage.getItem("cars") || "[]");
    cars.push(car);
    localStorage.setItem("cars", JSON.stringify(cars));
    carForm.reset();
    loadCars();
});

    loadCars();
});
</script>
