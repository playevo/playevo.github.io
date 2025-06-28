const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const adminUser = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
};

app.post('/api/login', (req, res) => {
    console.log('Giriş isteği alındı:', req.body);
    const { username, password } = req.body;
    if (!username || !password) {
        console.error('Eksik kullanıcı adı veya şifre');
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
    }
    if (username === adminUser.username && password === adminUser.password) {
        console.log('Giriş başarılı:', username);
        res.json({ success: true, message: 'Giriş başarılı' });
    } else {
        console.error('Geçersiz kimlik bilgileri:', username);
        res.status(401).json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre' });
    }
});

app.get('/api/games', async (req, res) => {
    try {
        const data = await fs.readFile('games.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Oyunlar yüklenemedi:', err);
        res.status(500).json({ error: 'Oyunlar yüklenemedi' });
    }
});

app.post('/api/games', async (req, res) => {
    try {
        const data = await fs.readFile('games.json', 'utf8');
        const games = JSON.parse(data);
        const newGame = {
            id: games.length + 1,
            title: req.body.title,
            price: parseFloat(req.body.price),
            image: req.body.image,
            video: req.body.video || '',
            category: req.body.category,
            description: req.body.description,
            purchaseLink: req.body.purchaseLink,
            discount: parseFloat(req.body.discount) || 0,
            inStock: req.body.inStock !== false
        };
        console.log('Yeni oyun:', newGame);
        games.push(newGame);
        await fs.writeFile('games.json', JSON.stringify(games, null, 2));
        res.json(newGame);
    } catch (err) {
        console.error('Oyun eklenemedi:', err);
        res.status(500).json({ error: 'Oyun eklenemedi' });
    }
});

app.put('/api/games/:id', async (req, res) => {
    try {
        const data = await fs.readFile('games.json', 'utf8');
        let games = JSON.parse(data);
        const gameId = parseInt(req.params.id);
        const gameIndex = games.findIndex(g => g.id === gameId);
        if (gameIndex === -1) {
            return res.status(404).json({ error: 'Oyun bulunamadı' });
        }
        const updatedGame = {
            id: gameId,
            title: req.body.title,
            price: parseFloat(req.body.price),
            image: req.body.image,
            video: req.body.video || '',
            category: req.body.category,
            description: req.body.description,
            purchaseLink: req.body.purchaseLink,
            discount: parseFloat(req.body.discount) || 0,
            inStock: req.body.inStock !== false
        };
        console.log('Güncellenen oyun:', updatedGame);
        games[gameIndex] = updatedGame;
        await fs.writeFile('games.json', JSON.stringify(games, null, 2));
        res.json(games[gameIndex]);
    } catch (err) {
        console.error('Oyun güncellenemedi:', err);
        res.status(500).json({ error: 'Oyun güncellenemedi' });
    }
});

app.delete('/api/games/:id', async (req, res) => {
    try {
        const data = await fs.readFile('games.json', 'utf8');
        let games = JSON.parse(data);
        const gameId = parseInt(req.params.id);
        const gameIndex = games.findIndex(g => g.id === gameId);
        if (gameIndex === -1) {
            return res.status(404).json({ error: 'Oyun bulunamadı' });
        }
        games.splice(gameIndex, 1);
        games = games.map((game, index) => ({ ...game, id: index + 1 }));
        await fs.writeFile('games.json', JSON.stringify(games, null, 2));
        res.json({ message: 'Oyun silindi' });
    } catch (err) {
        console.error('Oyun silinemedi:', err);
        res.status(500).json({ error: 'Oyun silinemedi' });
    }
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});