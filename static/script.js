// Функция для применения темы
function applyTheme(isDark) {
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    const logo = document.querySelector('.navbar img');

    if (isDark) {
        body.classList.add('dark-theme');
        navbar.classList.add('navbar-dark');
        if (logo) logo.src = "/static/logo.png";
    } else {
        body.classList.remove('dark-theme');
        navbar.classList.remove('navbar-dark');
        if (logo) logo.src = "/static/favicon.ico";
    }
}

// Проверяем сохраненную тему в localStorage
const savedTheme = localStorage.getItem('theme');
const themeSwitch = document.getElementById('themeSwitch');
if (savedTheme === 'dark') {
    themeSwitch.checked = true;
    applyTheme(true);
} else {
    themeSwitch.checked = false;
    applyTheme(false);
}

// Обработчик для переключателя темы
themeSwitch.addEventListener('change', function () {
    if (this.checked) {
        localStorage.setItem('theme', 'dark');
        applyTheme(true);
    } else {
        localStorage.setItem('theme', 'light');
        applyTheme(false);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 12; // Сколько карточек показывать на одной странице
    let currentPage = 2;

    const artistContainer = document.getElementById("artistContainer");
    const paginationLinks = document.querySelectorAll(".pagination .page-link");

    const artists = Array.from(artistContainer.children); // Получаем все карточки

    function showPage(page) {
        let start = (page - 1) * itemsPerPage;
        let end = start + itemsPerPage;

        artists.forEach((item, index) => {
            item.style.display = index >= start && index < end ? "block" : "none";
        });

        currentPage = page;
    }

    paginationLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            if (this.id === "prevPage" && currentPage > 1) {
                showPage(currentPage - 1);
            } else if (this.id === "nextPage" && currentPage < Math.ceil(artists.length / itemsPerPage)) {
                showPage(currentPage + 1);
            } else if (this.dataset.page) {
                showPage(Number(this.dataset.page));
            }
        });
    });

    showPage(1);
});

document.addEventListener("DOMContentLoaded", function () {
    // Форматирование локаций
    document.querySelectorAll(".location-name").forEach(function (el) {
        let text = el.textContent.trim();
        // Заменяем все подчёркивания на пробелы
        text = text.replace(/_/g, " ");

        // Если в строке присутствует дефис, используем его как разделитель
        if (text.indexOf("-") > -1) {
            let parts = text.split("-");
            if (parts.length === 2) {
                let city = parts[0].trim();
                let country = parts[1].trim();
                // Форматируем город: каждое слово с заглавной буквы
                city = city.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
                // Страна выводится полностью заглавными буквами
                country = country.toUpperCase();
                el.textContent = `${city} ${country}`;
            } else {
                el.textContent = text;
            }
        } else {
            // Если дефиса нет, предполагаем, что последний(е) слово(а) — это страна (полностью в верхнем регистре)
            let words = text.split(" ");
            let countryWords = [];
            for (let i = words.length - 1; i >= 0; i--) {
                if (words[i] === words[i].toUpperCase()) {
                    countryWords.unshift(words[i]);
                } else {
                    break;
                }
            }
            let country = countryWords.join(" ");
            let cityWords = words.slice(0, words.length - countryWords.length);
            let city = cityWords.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
            el.textContent = country ? `${city} ${country}` : city;
        }
    });


    // Форматирование дат dd.MM.yyyy
    // document.querySelectorAll(".list-group .collapse li").forEach(function (li) {
    //     let date = new Date(li.textContent.trim());
    //     if (!isNaN(date)) {
    //         li.textContent = date.toLocaleDateString("ru-RU", {
    //             day: "2-digit",
    //             month: "2-digit",
    //             year: "numeric",
    //         });
    //     }
    // });

    // Инициализация карты Leaflet
    window.map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Groupie Tracker'
    }).addTo(window.map);

    // Функция обновления карты
    function updateMap(lat, lon, locationName) {
        map.setView([lat, lon], 10);
        if (marker) {
            marker.setLatLng([lat, lon]).bindPopup(locationName).openPopup();
        } else {
            marker = L.marker([lat, lon]).addTo(map).bindPopup(locationName).openPopup();
        }
    }
});

function toggleDates(element) {
    let nextUl = element.nextElementSibling;
    if (nextUl && nextUl.classList.contains("collapse")) {
        nextUl.style.display = nextUl.style.display === "none" ? "block" : "none";
    }
}

// Функция для геокодирования и отображения локации
function showLocationOnMap(location) {
    const query = encodeURIComponent(location);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                updateMap(lat, lon, location);
            } else {
                alert('Location not found');
            }
        })
        .catch(error => {
            console.error("Error fetching geolocation:", error);
            alert("Error fetching geolocation");
        });
}

// Функция для переключения показа списка дат и отображения локации на карте
function handleLocationClick(element) {
    toggleDates(element);
    const locationText = element.querySelector('.location-name').textContent.trim();
    showLocationOnMap(locationText);
}

var marker; // Глобальная переменная для маркера

// Обновление карты: установка вида и добавление/обновление маркера
function updateMap(lat, lon, locationName) {
    window.map.setView([lat, lon], 10);
    if (marker) {
        marker.setLatLng([lat, lon]).bindPopup(locationName).openPopup();
    } else {
        marker = L.marker([lat, lon]).addTo(window.map).bindPopup(locationName).openPopup();
    }
}

// Функция для геокодирования и отображения локации на карте
function showLocationOnMap(location) {
    // Вставляем запятую между городом и остальными словами (например, "Bogota COLOMBIA" → "Bogota, COLOMBIA")
    const parts = location.split(" ");
    if (parts.length >= 2) {
        location = parts[0] + ", " + parts.slice(1).join(" ");
    }
    const query = encodeURIComponent(location);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                updateMap(lat, lon, location);
            } else {
                alert('Location not found');
            }
        })
        .catch(error => {
            console.error("Error fetching geolocation:", error);
            alert("Error fetching geolocation");
        });
}

// Функция для показа/скрытия списка дат
function toggleDates(element) {
    let nextUl = element.nextElementSibling;
    if (nextUl && nextUl.classList.contains("collapse")) {
        nextUl.style.display = (nextUl.style.display === "none" || nextUl.style.display === "") ? "block" : "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const artistContainer = document.getElementById("artistContainer");
    const artists = Array.from(artistContainer.querySelectorAll(".col-6"));
    const filterForm = document.getElementById("filterForm");
    const creationDateInput = document.getElementById("creationDate1");
    const firstAlbumInput = document.getElementById("firstAlbum");
    const locationInput = document.getElementById("locations");
    const membersSelect = document.getElementById("members");

    function filterArtists() {
        const creationDateValue = creationDateInput.value.trim();
        const firstAlbumValue = firstAlbumInput.value.trim();
        const locationValue = locationInput.value.trim().toLowerCase();
        const membersFilterValue = membersSelect.value;

        artists.forEach(artist => {
            // Переменные для извлечения информации
            let creationDateText = "";
            let firstAlbumText = "";
            let placesArray = [];
            let membersText = "";

            // Извлечение даты создания
            // Если в карточке нет отдельного блока для Creation Date, можно передавать его через data-атрибут
            //creationDateText = artist.querySelector(".creationDate").textContent.trim();
            // if (artist.querySelector(".creationDate")) {
            // } else if (artist.dataset.creationDate) {
            //     creationDateText = artist.dataset.creationDate;
            // }

            // Извлечение даты первого альбома (ищем блок с текстом "Release of the first album:")
            const firstAlbumElem = Array.from(artist.querySelectorAll(".card-text")).find(el =>
                el.textContent.includes("Release of the first album:")
            );
            if (firstAlbumElem) {
                // Убираем префикс и приводим к нижнему регистру для поиска года
                firstAlbumText = firstAlbumElem.textContent.replace("Release of the first album:", "").trim().toLowerCase();
            }

            // Извлечение локаций (ищем блок с текстом "Locations:")
            const locationsElem = Array.from(artist.querySelectorAll(".card-text")).find(el =>
                el.textContent.includes("Locations:")
            );
            if (locationsElem) {
                let locText = locationsElem.textContent
                    .replace("Locations:", "")
                    .replace("[", "")
                    .replace("]", "")
                    .trim()
                    .toLowerCase();
                // Предполагаем, что локации разделены пробелами
                placesArray = locText.split(/\s+/);
            }

            // Извлечение участников (ищем блок с текстом "Members:")
            const membersElem = Array.from(artist.querySelectorAll(".card-text")).find(el =>
                el.textContent.includes("Members:")
            );
            if (membersElem) {
                membersText = membersElem.textContent
                    .replace("Members:", "")
                    .replace("[", "")
                    .replace("]", "")
                    .trim()
                    .toLowerCase();
            }
            // Если участников нет, можно попробовать получить их через data-атрибут или другой селектор

            // Подсчёт количества участников.
            // В данном примере участники записаны через пробел, однако имена состоят из нескольких слов.
            // Если у вас на бэкенде участники – массив, то можно при отрисовке добавить data-атрибут с числом участников.
            // Здесь для примера попытаемся посчитать по количеству "слов" и предположим, что у каждого участника минимум 2 слова.
            let words = membersText.split(/\s+/).filter(word => word);
            // Приблизительное число участников:
            const membersCount = Math.round(words.length / 2);

            let matches = true;

            // Фильтр по Creation Date (если поле заполнено, должно быть точное совпадение)
            if (creationDateValue && creationDateText !== creationDateValue) {
                matches = false;
            }

            // Фильтр по First Album Year – проверяем, что в строке с датой есть введённый год
            if (firstAlbumValue && !firstAlbumText.includes(firstAlbumValue)) {
                matches = false;
            }

            // Фильтр по Location – ищем введённую подстроку хотя бы в одном элементе массива мест
            if (locationValue && !placesArray.some(place => place.includes(locationValue))) {
                matches = false;
            }

            // Фильтр по количеству участников
            if (membersFilterValue) {
                if (membersFilterValue === "5+") {
                    if (membersCount < 5) matches = false;
                } else if (membersCount !== parseInt(membersFilterValue)) {
                    matches = false;
                }
            }

            artist.style.display = matches ? "block" : "none";
        });
    }

    filterForm.addEventListener("input", filterArtists);
    filterForm.addEventListener("change", filterArtists);
});


document.getElementById("filterToggle").addEventListener("click", function () {
    let filterContainer = document.getElementById("filterContainer");
    filterContainer.classList.toggle("d-none");
});

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const searchForm = document.querySelector("form[role='search']");
    const artistContainer = document.getElementById("artistContainer");
    const artists = Array.from(artistContainer.querySelectorAll(".col-6"));

    // Функция для фильтрации артистов
    function filterArtists(searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();

        artists.forEach(artist => {
            const name = artist.querySelector(".card-title")?.textContent.toLowerCase() || "";
            const members = artist.querySelector(".card-text:nth-child(2)")?.textContent.toLowerCase() || "";
            const firstAlbum = artist.querySelector(".card-text:nth-child(3)")?.textContent.toLowerCase() || "";

            // Проверяем, содержится ли поисковый запрос в имени, участниках или дате первого альбома
            const matches = name.includes(lowerSearchTerm) ||
                members.includes(lowerSearchTerm) ||
                firstAlbum.includes(lowerSearchTerm);

            artist.style.display = matches ? "block" : "none";
        });
    }

    // Опционально: поиск в реальном времени при вводе текста
    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.trim();
        filterArtists(searchTerm);
    });
});