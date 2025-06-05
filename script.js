function scrollToSection(id) {
    const section = document.getElementById(id);
    if (!section) return;

    section.scrollIntoView({ behavior: 'smooth' });
}

function cycleVideos() {
    const videos = document.querySelectorAll('.bg-video');
    let currentIndex = 0;

    if (videos.length === 0) return;

    videos.forEach((video, i) => {
        video.classList.remove('active');
        video.currentTime = 0;
    });
    videos[0].classList.add('active');

    setInterval(() => {
        videos[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % videos.length;
        videos[currentIndex].classList.add('active');
        videos[currentIndex].currentTime = 0;
    }, 5000);
}

window.addEventListener('DOMContentLoaded', () => {
    renderCars();
    cycleVideos();
});

async function renderCars() {
    const carContainer = document.getElementById("carContainer");
    if (!carContainer) return;

    const res = await fetch("/api/cars");
    const cars = await res.json();

    if (cars.length === 0) {
        carContainer.innerHTML = "<p>Каталог порожній.</p>";
        return;
    }

    let index = parseInt(localStorage.getItem("selectedCarIndex")) || 0;

    const track = document.createElement("div");
    track.className = "car-showcase";
    track.id = "showcaseTrack";
    track.style.transform = `translateX(-${index * 100}%)`;

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
                localStorage.setItem("selectedCarIndex", i);
                setTimeout(() => {
                    window.location.href = `models/${car.page}`;
                }, 100);
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
            localStorage.setItem("selectedCarIndex", index);
            track.style.transform = `translateX(-${index * 100}%)`;
        };

        const next = document.createElement("div");
        next.id = "nextCar";
        next.className = "carousel-arrow";
        next.innerHTML = "&#9654;";
        next.onclick = () => {
            index = (index + 1) % cars.length;
            localStorage.setItem("selectedCarIndex", index);
            track.style.transform = `translateX(-${index * 100}%)`;
        };

        wrapper.appendChild(prev);
        wrapper.appendChild(next);
    }

    carContainer.innerHTML = "";
    carContainer.appendChild(wrapper);

    // ❗ Очистити лише якщо не повернулись із моделі
    // (можеш сам вирішити, чи хочеш це залишати або прибрати повністю)
    setTimeout(() => {
        if (!document.referrer.includes("models/")) {
            localStorage.removeItem("selectedCarIndex");
        }
    }, 5000);
}


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

    // Очистити після відновлення положення
    localStorage.removeItem("selectedCarIndex");
}

document.getElementById("secret-admin-access")?.addEventListener("click", () => {
    window.location.href = "admin/index.html";
});

renderCars();

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.classList.add("fade-out");
            setTimeout(() => loader.remove(), 700);
        }, 700);
    }
});
