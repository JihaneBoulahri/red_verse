const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// ====================== CHEMINS DES FICHIERS ======================
const USERS_FILE = path.join(__dirname, 'users.json');
const FAVORITES_FILE = path.join(__dirname, 'favorites.json');
const DB_FILE = path.join(__dirname, 'db.json');

// ====================== FONCTIONS UTILITAIRES ======================
const readJSONFile = (filePath, defaultValue = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Erreur lecture ${path.basename(filePath)} :`, err);
    return defaultValue;
  }
};

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Erreur écriture ${path.basename(filePath)} :`, err);
  }
};

// ====================== INITIALISATION FICHIERS ======================
const initFiles = () => {
  if (!fs.existsSync(DB_FILE)) {
    writeJSONFile(DB_FILE, { playlists: [] });
  }
  
  if (!fs.existsSync(ALBUMS_FILE)) {
    writeJSONFile(ALBUMS_FILE, []);
  }
  
  if (!fs.existsSync(FAVORITES_FILE)) {
    writeJSONFile(FAVORITES_FILE, []);
  }
  
  if (!fs.existsSync(USERS_FILE)) {
    writeJSONFile(USERS_FILE, []);
  }
};

initFiles();

// ====================== VALIDATIONS ======================
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// ====================== ROUTES USERS ======================
// SIGNUP
app.post('/signup', (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Tous les champs sont requis !" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Email invalide !" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ success: false, message: "Mot de passe ≥ 8 caractères, avec 1 majuscule et 1 chiffre !" });
    }

    const users = readJSONFile(USERS_FILE);
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, message: "Email déjà utilisé !" });
    }

    users.push({ 
      id: users.length + 1,
      username, 
      email, 
      password, 
      createdAt: new Date().toISOString() 
    });
    
    writeJSONFile(USERS_FILE, users);
    console.log("✅ Nouvel utilisateur inscrit :", email);
    
    return res.json({ 
      success: true, 
      message: "Inscription réussie !",
      user: { username, email }
    });
  } catch (err) {
    console.error("❌ Erreur signup :", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors de l'inscription" });
  }
});

// SIGNIN
app.post('/signin', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email et mot de passe requis !" });
    }

    const users = readJSONFile(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      console.log("❌ Connexion échouée :", email);
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect !" });
    }

    console.log("✅ Connexion réussie :", email);
    return res.json({ 
      success: true, 
      message: `Bienvenue ${user.username} !`, 
      user: { 
        id: user.id,
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (err) {
    console.error("❌ Erreur signin :", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la connexion" });
  }
});

// FORGOT PASSWORD
app.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email requis !" });
    }

    const users = readJSONFile(USERS_FILE);
    const user = users.find(u => u.email === email);

    if (!user) {
      console.log("❌ Email introuvable :", email);
      return res.status(404).json({ success: false, message: "Email introuvable !" });
    }

    console.log("✅ Mot de passe récupéré pour :", email);
    res.json({ success: true, message: "Un lien de réinitialisation a été envoyé à votre email" });
  } catch (err) {
    console.error("❌ Erreur forgot-password :", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération du mot de passe" });
  }
});

// GET tous les utilisateurs
app.get('/api/users', (req, res) => {
  try {
    const users = readJSONFile(USERS_FILE);
    // Ne pas renvoyer les mots de passe
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }));
    res.json(safeUsers);
  } catch (err) {
    console.error('❌ Erreur récupération utilisateurs :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// ====================== ROUTES DEEZER ======================
app.get('/api/deezer/playlists', async (req, res) => {
  try {
    const url = "https://api.deezer.com/search/playlist?q=top&limit=20";
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur Deezer: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Deezer Playlist Error:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des playlists Deezer" });
  }
});

app.get('/api/deezer/tracks', async (req, res) => {
  try {
    const response = await fetch('https://api.deezer.com/chart/0/tracks?limit=50');
    
    if (!response.ok) {
      throw new Error(`Erreur Deezer: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Erreur Deezer proxy:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des pistes' });
  }
});

// Get playlist details
app.get('/api/deezer/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.deezer.com/playlist/${id}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Playlist non trouvée' });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Erreur Deezer playlist:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la playlist' });
  }
});

// Get playlist tracks
app.get('/api/deezer/playlist/:id/tracks', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.deezer.com/playlist/${id}/tracks`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Tracks non trouvés' });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Erreur Deezer tracks:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des tracks' });
  }
});

// Search Deezer
app.get('/api/deezer/search', async (req, res) => {
  try {
    const { q, type = 'track' } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Paramètre de recherche requis' });
    }
    
    const response = await fetch(`https://api.deezer.com/search/${type}?q=${encodeURIComponent(q)}&limit=20`);
    
    if (!response.ok) {
      throw new Error(`Erreur Deezer: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Erreur Deezer search:', err);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// ====================== ROUTES FAVORIS ======================
// Tous les favoris
app.get("/api/favorites", (req, res) => {
  try {
    const favs = readJSONFile(FAVORITES_FILE);
    res.json(favs);
  } catch (err) {
    console.error('❌ Erreur GET /api/favorites:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
  }
});

// Ajouter un favori
app.post("/api/favorites", (req, res) => {
  try {
    const { music, album, artist, deezerId, preview } = req.body;

    if (!music) {
      return res.status(400).json({ error: "Nom de la musique obligatoire" });
    }

    let favs = readJSONFile(FAVORITES_FILE);

    // Vérifier si déjà dans les favoris (par nom ou ID Deezer)
    const existing = favs.find(f => 
      f.music === music || (deezerId && f.deezerId === deezerId)
    );
    
    if (existing) {
      return res.status(400).json({ error: "Déjà dans les favoris" });
    }

    const newFavorite = {
      id: favs.length > 0 ? Math.max(...favs.map(f => f.id)) + 1 : 1,
      music,
      album: album || 'Unknown Album',
      artist: artist || 'Unknown Artist',
      deezerId: deezerId || null,
      preview: preview || null,
      addedAt: new Date().toISOString()
    };

    favs.push(newFavorite);
    writeJSONFile(FAVORITES_FILE, favs);

    console.log("✅ Favori ajouté:", music);
    res.status(201).json({ 
      message: "Ajouté aux favoris", 
      favorite: newFavorite,
      favorites: favs 
    });
  } catch (err) {
    console.error('❌ Erreur POST /api/favorites:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout aux favoris' });
  }
});

// Supprimer un favori
app.delete("/api/favorites/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let favs = readJSONFile(FAVORITES_FILE);
    
    const initialLength = favs.length;
    favs = favs.filter(f => f.id !== id);
    
    if (favs.length === initialLength) {
      return res.status(404).json({ error: "Favori non trouvé" });
    }
    
    writeJSONFile(FAVORITES_FILE, favs);
    
    console.log(`✅ Favori ${id} supprimé`);
    res.json({ 
      message: "Supprimé des favoris", 
      id,
      favorites: favs 
    });
  } catch (err) {
    console.error('❌ Erreur DELETE /api/favorites/:id:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du favori' });
  }
});

// ====================== ROUTES PLAYLISTS ======================
// GET toutes les playlists
app.get('/api/playlists', (req, res) => {
  try {
    const db = readJSONFile(DB_FILE, { playlists: [] });
    res.json(db.playlists || []);
  } catch (err) {
    console.error('❌ Erreur GET /api/playlists:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des playlists' });
  }
});

// Créer une nouvelle playlist
app.post('/api/playlists', (req, res) => {
  try {
    const db = readJSONFile(DB_FILE, { playlists: [] });
    const { name, description } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Le nom de la playlist est requis' });
    }
    
    // Générer un ID unique
    const newId = db.playlists.length > 0 
      ? Math.max(...db.playlists.map(p => p.id)) + 1 
      : 1;
    
    const newPlaylist = {
      id: newId,
      name: name.trim(),
      description: description || '',
      musics: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.playlists.push(newPlaylist);
    writeJSONFile(DB_FILE, db);
    
    console.log('✅ Playlist créée:', newPlaylist.name);
    res.status(201).json(newPlaylist);
  } catch (err) {
    console.error('❌ Erreur POST /api/playlists:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la playlist' });
  }
});

// GET une playlist spécifique
app.get('/api/playlists/:id', (req, res) => {
  try {
    const db = readJSONFile(DB_FILE, { playlists: [] });
    const playlistId = parseInt(req.params.id);
    
    const playlist = db.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }
    
    res.json(playlist);
  } catch (err) {
    console.error('❌ Erreur GET /api/playlists/:id:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la playlist' });
  }
});

// Ajouter une musique à une playlist
app.post('/api/playlists/:id/musics', (req, res) => {
  try {
    const db = readJSONFile(DB_FILE, { playlists: [] });
    const playlistId = parseInt(req.params.id);
    const { music, artist, album, deezerId, preview } = req.body;
    
    if (!music || music.trim() === '') {
      return res.status(400).json({ error: 'Le nom de la musique est requis' });
    }
    
    const playlist = db.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }
    
    if (!playlist.musics) {
      playlist.musics = [];
    }
    
    // Vérifier les doublons
    const existingMusic = playlist.musics.find(m => 
      m.music === music.trim() || (deezerId && m.deezerId === deezerId)
    );
    
    if (existingMusic) {
      return res.status(400).json({ error: 'Cette musique est déjà dans la playlist' });
    }
    
    const newMusic = {
      id: playlist.musics.length > 0 ? Math.max(...playlist.musics.map(m => m.id)) + 1 : 1,
      music: music.trim(),
      artist: artist || 'Unknown Artist',
      album: album || 'Unknown Album',
      deezerId: deezerId || null,
      preview: preview || null,
      addedAt: new Date().toISOString()
    };
    
    playlist.musics.push(newMusic);
    playlist.updatedAt = new Date().toISOString();
    
    writeJSONFile(DB_FILE, db);
    
    console.log(`✅ Musique ajoutée à "${playlist.name}":`, music);
    res.status(201).json(newMusic);
  } catch (err) {
    console.error('❌ Erreur POST /api/playlists/:id/musics:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la musique' });
  }
});

// Supprimer une musique d'une playlist
app.delete('/api/playlists/:playlistId/musics/:musicId', (req, res) => {
  try {
    const db = readJSONFile(DB_FILE, { playlists: [] });
    const playlistId = parseInt(req.params.playlistId);
    const musicId = parseInt(req.params.musicId);
    
    const playlist = db.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }
    
    if (!playlist.musics) {
      playlist.musics = [];
    }
    
    const initialLength = playlist.musics.length;
    playlist.musics = playlist.musics.filter(m => m.id !== musicId);
    
    if (playlist.musics.length === initialLength) {
      return res.status(404).json({ error: 'Musique non trouvée dans la playlist' });
    }
    
    playlist.updatedAt = new Date().toISOString();
    writeJSONFile(DB_FILE, db);
    
    console.log(`✅ Musique ${musicId} supprimée de "${playlist.name}"`);
    res.json({ 
      success: true, 
      message: 'Musique supprimée de la playlist',
      playlistId,
      musicId
    });
  } catch (err) {
    console.error('❌ Erreur DELETE /api/playlists/:playlistId/musics/:musicId:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la musique' });
  }
});

// Supprimer une playlist
app.delete('/api/playlists/:id', (req, res) => {
  try {
    const db = readJSONFile(DB_FILE, { playlists: [] });
    const playlistId = parseInt(req.params.id);
    
    const initialLength = db.playlists.length;
    db.playlists = db.playlists.filter(p => p.id !== playlistId);
    
    if (db.playlists.length === initialLength) {
      return res.status(404).json({ 
        error: 'Playlist non trouvée',
        id: playlistId 
      });
    }
    
    writeJSONFile(DB_FILE, db);
    
    console.log(`✅ Playlist ${playlistId} supprimée`);
    res.json({ 
      success: true, 
      message: 'Playlist supprimée avec succès',
      id: playlistId
    });
  } catch (error) {
    console.error('❌ Erreur DELETE /api/playlists/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================== ROUTE HEALTH CHECK ======================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    files: {
      db: fs.existsSync(DB_FILE),
      users: fs.existsSync(USERS_FILE),
      favorites: fs.existsSync(FAVORITES_FILE),
      albums: fs.existsSync(ALBUMS_FILE)
    }
  });
});

// ====================== GESTION DES ERREURS 404 ======================
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ====================== GESTION DES ERREURS GLOBALES ======================
app.use((err, req, res, next) => {
  console.error('❌ Erreur non gérée:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// ====================== DÉMARRAGE DU SERVEUR ======================
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📁 Fichiers JSON initialisés dans: ${__dirname}`);
});