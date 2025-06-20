function scrollToSection(id) {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth' });
}

function cycleVideos() {
    const videos = document.querySelectorAll('.bg-video');
    let currentIndex = 0;

    if (videos.length === 0) return;

    videos.forEach((video) => {
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function renderCars() {
    const carContainer = document.getElementById("carContainer");
    if (!carContainer) return;

    const res = await fetch("/api/cars");
    const allCars = await res.json();
    shuffleArray(allCars);

    const selectedFilters = Array.from(document.querySelectorAll(".car-filter:checked"))
        .map(input => input.value);

    const minPrice = parseInt(document.getElementById("priceMin")?.value) || 0;
    const maxPrice = parseInt(document.getElementById("priceMax")?.value) || Infinity;

    let filteredCars = allCars;

    if (selectedFilters.length > 0 || minPrice > 0 || minPrice < Infinity) {
        filteredCars = allCars.filter(car => {
            const name = car.name.toUpperCase();
            const modelName = name.replace(/^AUDI\s+/i, "").trim();

            const matchClass = selectedFilters.length === 0 || selectedFilters.some(filter => {
                if (filter === "RS") return modelName.startsWith("RS") || modelName.startsWith("R");
                if (filter === "Q") return modelName.startsWith("Q") || modelName.startsWith("SQ");
                return modelName.startsWith(filter);
            });

            const carPrice = parseInt(car.price?.replace(/[^\d]/g, "") || "0");
            const matchPrice = carPrice >= minPrice && carPrice <= maxPrice;

            return matchClass && matchPrice;
        });
    }

    if (filteredCars.length === 0) {
        carContainer.innerHTML = "<p>Немає машин для вибраних фільтрів.</p>";
        return;
    }

    let index = parseInt(localStorage.getItem("selectedCarIndex")) || 0;

    const track = document.createElement("div");
    track.className = "car-showcase";
    track.id = "showcaseTrack";
    track.style.transform = `translateX(-${index * 100}%)`;

    filteredCars.forEach((car, i) => {
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

    if (filteredCars.length > 1) {
        const prev = document.createElement("div");
        prev.id = "prevCar";
        prev.className = "carousel-arrow";
        prev.innerHTML = `<img src="media/arrow-left.png" alt="Попередній" class="carousel-icon">`;
        prev.onclick = () => {
            index = (index - 1 + filteredCars.length) % filteredCars.length;
            track.style.transform = `translateX(-${index * 100}%)`;
        };

        const next = document.createElement("div");
        next.id = "nextCar";
        next.className = "carousel-arrow";
        next.innerHTML = `<img src="media/arrow-right.png" alt="Наступний" class="carousel-icon">`;
        next.onclick = () => {
            index = (index + 1) % filteredCars.length;
            track.style.transform = `translateX(-${index * 100}%)`;
        };

        wrapper.appendChild(prev);
        wrapper.appendChild(next);
    }

    carContainer.innerHTML = "";
    carContainer.appendChild(wrapper);
    localStorage.removeItem("selectedCarIndex");
}

function addToCompare(e, id) {
    e.stopPropagation();
    let compareList = JSON.parse(localStorage.getItem("compareCars")) || [];
    if (!compareList.includes(id)) {
        compareList.push(id);
        localStorage.setItem("compareCars", JSON.stringify(compareList));
        alert("Додано до порівняння!");
    } else {
        alert("Ця модель вже у списку порівняння.");
    }
}

function acceptIpNotice() {
    fetch('/api/log-ip', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                console.error("Помилка при збереженні IP");
            }
        })
        .catch(error => console.error("Помилка при відправці IP:", error));
    sessionStorage.setItem('ipNoticeChoice', 'accepted');
    document.getElementById('ipNotice').style.display = 'none';
}

function declineIpNotice() {
    sessionStorage.setItem('ipNoticeChoice', 'declined');
    window.location.href = 'https://www.google.com';
}

document.getElementById("secret-admin-access")?.addEventListener("click", () => {
    window.location.href = "admin/index.html";
});

document.addEventListener("click", function (e) {
    const filterArea = document.querySelector(".filters-container");
    const filterOptions = document.getElementById("filterOptions");
    if (filterArea && filterOptions && !filterArea.contains(e.target)) {
        filterOptions.classList.remove("show");
    }
});

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.getElementById('scrollProgressBar').style.width = scrollPercent + '%';
});

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.classList.add("fade-out");
            setTimeout(() => loader.remove(), 700);
        }, 700);
    }
});

window.addEventListener("DOMContentLoaded", () => {
    renderCars();
    cycleVideos();

    const notice = document.getElementById('ipNotice');
    if (notice && !sessionStorage.getItem('ipNoticeChoice')) {
        notice.style.display = 'flex';
    }

    const filterToggle = document.getElementById("filterToggle");
    const filterOptions = document.getElementById("filterOptions");
    if (filterToggle && filterOptions) {
        filterToggle.addEventListener("click", () => {
            filterOptions.classList.toggle("show");
        });
    }

    document.querySelectorAll(".car-filter, #priceMin, #priceMax").forEach(input => {
        input.addEventListener("change", renderCars);
    });

    document.getElementById("clearFilters")?.addEventListener("click", () => {
        document.querySelectorAll(".car-filter").forEach(cb => cb.checked = false);
        document.getElementById("priceMin").value = "";
        document.getElementById("priceMax").value = "";
        renderCars();
    });
});