function scrollToSection(id) {
    const section = document.getElementById(id);
    if (!section) return;

    section.scrollIntoView({ behavior: 'smooth' });
}


// Рендер авто-каталогу
async function renderCars() {
    const carContainer = document.getElementById("carContainer");
    if (!carContainer) return;

    const res = await fetch("/api/cars");
    const cars = await res.json();

    if (cars.length === 0) {
        carContainer.innerHTML = "<p>Каталог порожній.</p>";
        return;
    }

    let index = 0;
    const track = document.createElement("div");
    track.className = "car-showcase";
    track.id = "showcaseTrack";

    cars.forEach((car, i) => {
        const card = document.createElement("div");
        card.className = "car-showcase-card";
        card.dataset.index = i;
        card.innerHTML = `
      <img src="${car.image}" alt="${car.name}">
      <div class="car-title-overlay car-flex-title">
        <span class="left">${car.name}</span>
        <span class="right">${car.price ? car.price + ' €' : ''}</span>
      </div>
    `;
        card.addEventListener("click", () => {
            if (car.page) {
                window.location.href = `models/${car.page}`;
            } else {
                alert("Немає сторінки для цього авто");
            }
        });
        track.appendChild(card);
    });

    const wrapper = document.createElement("div");
    wrapper.className = "car-showcase-wrapper";
    wrapper.style.position = "relative";
    wrapper.appendChild(track);

    if (cars.length > 1) {
        const prev = document.createElement("div");
        prev.id = "prevCar";
        prev.className = "carousel-arrow";
        prev.innerHTML = "&#9664;";
        prev.onclick = () => {
            index = (index - 1 + cars.length) % cars.length;
            track.style.transform = `translateX(-${index * 100}%)`;
        };

        const next = document.createElement("div");
        next.id = "nextCar";
        next.className = "carousel-arrow";
        next.innerHTML = "&#9654;";
        next.onclick = () => {
            index = (index + 1) % cars.length;
            track.style.transform = `translateX(-${index * 100}%)`;
        };

        wrapper.appendChild(prev);
        wrapper.appendChild(next);
    }

    carContainer.innerHTML = "";
    carContainer.appendChild(wrapper);
}

// Секретна зона для переходу в адмінку
document.getElementById("secret-admin-access")?.addEventListener("click", () => {
    window.location.href = "admin/index.html";
});

renderCars();
