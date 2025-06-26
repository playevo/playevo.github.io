document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');
    const adminPanel = document.getElementById('admin-panel');
    const gameForm = document.getElementById('game-form');
    const addedGamesList = document.getElementById('added-games');
    let isEditing = false;
    let editingGameId = null;

    // Giriş kontrolü
    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        console.log('Giriş denemesi:', { username, password });
        if (!username || !password) {
            loginError.innerText = 'Kullanıcı adı ve şifre gerekli';
            loginError.classList.remove('hidden');
            return;
        }
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            console.log('Sunucu yanıtı:', result);
            if (result.success) {
                loginScreen.style.display = 'none';
                adminPanel.classList.remove('hidden');
                loadGames();
            } else {
                loginError.innerText = result.message;
                loginError.classList.remove('hidden');
            }
        } catch (err) {
            console.error('Giriş hatası:', err);
            loginError.innerText = 'Sunucuya bağlanılamadı! Lütfen sunucunun çalıştığından emin olun.';
            loginError.classList.remove('hidden');
        }
    });

    // Mevcut oyunları yükle
    const loadGames = async () => {
        try {
            const response = await fetch('/api/games');
            if (!response.ok) throw new Error('Oyunlar yüklenemedi');
            const games = await response.json();
            addedGamesList.innerHTML = '';
            games.forEach(game => {
                const li = document.createElement('li');
                li.className = 'bg-gray-800 p-4 rounded flex justify-between items-start';
                li.innerHTML = `
                    <div>
                        <strong>${game.title}</strong> - ${game.price} TL
                        ${game.discount > 0 ? `<br><span class="text-green-400 text-sm">İndirim: %${game.discount}</span>` : ''}
                        <br><span class="text-gray-400 text-sm">Kategori: ${game.category || 'Belirtilmemiş'}</span>
                        <br><img src="${game.image}" alt="${game.title}" class="w-32 h-16 object-cover my-2">
                        ${game.video ? `<br><span class="text-gray-400 text-sm">Video: <a href="${game.video}" target="_blank" class="text-blue-400">Video Linki</a></span>` : ''}
                        <p>${game.description}</p>
                        <a href="${game.purchaseLink}" target="_blank" class="text-blue-400">Satın Alma Linki</a>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editGame(${game.id})" class="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">Düzenle</button>
                        <button onclick="deleteGame(${game.id})" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Sil</button>
                    </div>
                `;
                addedGamesList.appendChild(li);
            });
        } catch (err) {
            console.error('Oyunlar yüklenemedi:', err);
            addedGamesList.innerHTML = '<p class="text-red-400">Oyunlar yüklenemedi!</p>';
        }
    };

    // Oyun ekleme ve düzenleme
    gameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const gameData = {
            title: document.getElementById('title').value,
            price: parseFloat(document.getElementById('price').value),
            image: document.getElementById('image').value,
            video: document.getElementById('video').value || '',
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            purchaseLink: document.getElementById('purchaseLink').value,
            discount: parseFloat(document.getElementById('discount').value) || 0
        };
        console.log('Gönderilen veri:', gameData);
        try {
            let response;
            if (isEditing) {
                response = await fetch(`/api/games/${editingGameId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gameData)
                });
            } else {
                response = await fetch('/api/games', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gameData)
                });
            }
            if (!response.ok) throw new Error(isEditing ? 'Oyun güncellenemedi' : 'Oyun eklenemedi');
            gameForm.reset();
            isEditing = false;
            editingGameId = null;
            gameForm.querySelector('button[type="submit"]').textContent = 'Oyun Ekle';
            loadGames();
        } catch (err) {
            console.error(isEditing ? 'Oyun güncellenemedi:' : 'Oyun eklenemedi:', err);
            alert(isEditing ? 'Oyun güncellenirken bir hata oluştu!' : 'Oyun eklenirken bir hata oluştu!');
        }
    });

    // Oyun düzenleme
    window.editGame = async (id) => {
        try {
            const response = await fetch('/api/games');
            if (!response.ok) throw new Error('Oyunlar yüklenemedi');
            const games = await response.json();
            const game = games.find(g => g.id === id);
            if (game) {
                document.getElementById('title').value = game.title;
                document.getElementById('price').value = game.price;
                document.getElementById('image').value = game.image;
                document.getElementById('video').value = game.video || '';
                document.getElementById('category').value = game.category || 'Aksiyon';
                document.getElementById('description').value = game.description;
                document.getElementById('purchaseLink').value = game.purchaseLink;
                document.getElementById('discount').value = game.discount || 0;
                isEditing = true;
                editingGameId = id;
                gameForm.querySelector('button[type="submit"]').textContent = 'Oyunu Güncelle';
            }
        } catch (err) {
            console.error('Oyun yüklenemedi:', err);
            alert('Oyun yüklenirken bir hata oluştu!');
        }
    };

    // Oyun silme
    window.deleteGame = async (id) => {
        if (confirm('Bu oyunu silmek istediğinizden emin misiniz?')) {
            try {
                const response = await fetch(`/api/games/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Oyun silinemedi');
                loadGames();
            } catch (err) {
                console.error('Oyun silinemedi:', err);
                alert('Oyun silinirken bir hata oluştu!');
            }
        }
    };
});