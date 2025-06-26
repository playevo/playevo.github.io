document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (!gameId) {
        document.getElementById('game-detail').innerHTML = '<p class="text-red-400 text-center">Oyun ID’si bulunamadı!</p>';
        return;
    }

    try {
        const response = await fetch('/api/games');
        if (!response.ok) {
            throw new Error(`Oyunlar yüklenemedi: ${response.status} ${response.statusText}`);
        }
        const games = await response.json();
        const game = games.find(g => g.id == gameId);

        if (!game) {
            document.getElementById('game-detail').innerHTML = '<p class="text-red-400 text-center">Oyun bulunamadı!</p>';
            return;
        }

        const finalPrice = game.discount > 0 ? (game.price * (1 - game.discount / 100)).toFixed(2) : game.price.toFixed(2);

        document.getElementById('game-title').textContent = game.title;
        document.getElementById('game-image').src = game.image;
        document.getElementById('game-description').textContent = game.description || 'Açıklama mevcut değil.';
        document.getElementById('game-price').innerHTML = game.discount > 0 
            ? `<span class="line-through text-gray-500">${game.price} TL</span> <span class="text-green-400">${finalPrice} TL</span> (%${game.discount} indirim)`
            : `${game.price} TL`;
        document.getElementById('game-category').textContent = `Kategori: ${game.category || 'Belirtilmemiş'}`;
        document.getElementById('game-purchase').href = game.purchaseLink || '#';
    } catch (err) {
        console.error('Oyun yüklenemedi:', err);
        document.getElementById('game-detail').innerHTML = '<p class="text-red-400 text-center">Oyun yüklenemedi! Hata: ' + err.message + '</p>';
    }
});