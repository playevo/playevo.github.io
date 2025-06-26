document.addEventListener('DOMContentLoaded', () => {
    let allGames = [];
    let currentSlide = 0;
    let slideInterval;

    // Oyunları yükle
    const loadGames = async () => {
        try {
            const response = await fetch('/api/games');
            if (!response.ok) {
                throw new Error(`Oyunlar yüklenemedi: ${response.status} ${response.statusText}`);
            }
            allGames = await response.json();
            if (!Array.isArray(allGames)) {
                throw new Error('Oyun verisi dizi formatında değil');
            }
            if (allGames.length === 0) {
                document.getElementById('game-list').innerHTML = '<p class="text-gray-400 text-center">Henüz oyun eklenmemiş!</p>';
                document.getElementById('hero-banner').innerHTML = '<p class="text-gray-400 text-center">Öne çıkan oyun yok!</p>';
                return;
            }
            setupSlider(allGames.slice(0, 3)); // İlk 3 oyunu slider'da göster
            displayGames(allGames);
        } catch (err) {
            console.error('Oyunlar yüklenemedi:', err);
            document.getElementById('game-list').innerHTML = '<p class="text-red-400 text-center">Oyunlar yüklenemedi! Hata: ' + err.message + '</p>';
        }
    };

    // Slider'ı kur
    const setupSlider = (games) => {
        const sliderContainer = document.getElementById('slider-container');
        const dotsContainer = document.querySelector('#hero-banner .absolute.bottom-4');
        sliderContainer.innerHTML = '';
        dotsContainer.innerHTML = '';

        games.forEach((game, index) => {
            const slide = document.createElement('div');
            slide.className = 'min-w-full flex justify-center items-center';
            const finalPrice = game.discount > 0 ? (game.price * (1 - game.discount / 100)).toFixed(2) : game.price.toFixed(2);
            slide.innerHTML = `
                <div class="container mx-auto flex flex-col md:flex-row items-center">
                    <div class="md:w-1/2 text-center md:text-left">
                        <h2 class="text-4xl font-bold text-blue-400 mb-4">${game.title}</h2>
                        <p class="text-2xl text-gray-300 mb-4">
                            ${game.discount > 0 ? `<span class="line-through text-gray-500">${game.price} TL</span> <span class="text-green-400">${finalPrice} TL</span> (%${game.discount} indirim)` : `${game.price} TL`}
                        </p>
                        <a href="game.html?id=${game.id}" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Detaylar</a>
                    </div>
                    <div class="md:w-1/2">
                        <img src="${game.image}" alt="${game.title}" class="w-full h-64 object-cover rounded-lg">
                    </div>
                </div>
            `;
            sliderContainer.appendChild(slide);

            const dot = document.createElement('button');
            dot.className = `w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-400' : 'bg-gray-400'} hover:bg-blue-600`;
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        startSlider();
    };

    // Slider'ı başlat
    const startSlider = () => {
        slideInterval = setInterval(nextSlide, 5000); // 5 saniyede bir geçiş
    };

    // Bir sonraki slayta geç
    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % document.querySelectorAll('#slider-container > div').length;
        updateSlider();
    };

    // Belirli bir slayta git
    const goToSlide = (index) => {
        currentSlide = index;
        updateSlider();
        clearInterval(slideInterval);
        startSlider();
    };

    // Slider'ı güncelle
    const updateSlider = () => {
        const sliderContainer = document.getElementById('slider-container');
        sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        const dots = document.querySelectorAll('#hero-banner .absolute.bottom-4 button');
        dots.forEach((dot, index) => {
            dot.className = `w-3 h-3 rounded-full ${index === currentSlide ? 'bg-blue-400' : 'bg-gray-400'} hover:bg-blue-600`;
        });
    };

    // Oyun kartlarını göster
    const displayGames = (games) => {
        const gameList = document.getElementById('game-list');
        gameList.innerHTML = '';
        if (games.length === 0) {
            gameList.innerHTML = '<p class="text-gray-400 text-center">Bu kategoride veya aramada oyun bulunamadı!</p>';
            return;
        }
        games.forEach(game => {
            const finalPrice = game.discount > 0 ? (game.price * (1 - game.discount / 100)).toFixed(2) : game.price.toFixed(2);
            const gameCard = document.createElement('div');
            gameCard.className = 'bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1';
            gameCard.innerHTML = `
                <div class="relative">
                    <img src="${game.image}" alt="${game.title}" class="w-full h-48 object-cover">
                    <span class="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">${game.category || 'Belirtilmemiş'}</span>
                    ${game.discount > 0 ? `<span class="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">-${game.discount}%</span>` : ''}
                </div>
                <div class="p-4">
                    <h3 class="text-xl font-semibold text-blue-400">${game.title}</h3>
                    <p class="text-gray-400">
                        ${game.discount > 0 ? `<span class="line-through text-gray-500">${game.price} TL</span> <span class="text-green-400">${finalPrice} TL</span>` : `${game.price} TL`}
                    </p>
                    <a href="game.html?id=${game.id}" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Detaylar</a>
                </div>
            `;
            gameList.appendChild(gameCard);
        });
    };

    // Kategoriye göre filtrele
    window.filterGames = (category) => {
        if (category === 'Tümü') {
            displayGames(allGames);
        } else {
            const filteredGames = allGames.filter(game => game.category === category);
            displayGames(filteredGames);
        }
        document.getElementById('search-input').value = '';
    };

    // Arama fonksiyonu
    const searchGames = (query) => {
        const lowercaseQuery = query.toLowerCase().trim();
        if (!lowercaseQuery) {
            displayGames(allGames);
            return;
        }
        const filteredGames = allGames.filter(game => 
            game.title.toLowerCase().includes(lowercaseQuery) || 
            (game.category && game.category.toLowerCase().includes(lowercaseQuery))
        );
        displayGames(filteredGames);
    };

    // Arama çubuğuna olay dinleyici ekle
    document.getElementById('search-input').addEventListener('input', (e) => {
        searchGames(e.target.value);
    });

    // İlk yüklemede oyunları getir
    loadGames();
});