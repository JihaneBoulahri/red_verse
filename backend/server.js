const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Chemin correct vers users.json
const USERS_FILE = path.join(__dirname, 'users.json');

// Lire les utilisateurs
const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      console.log("users.json non trouvé, création d'un nouveau fichier...");
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Erreur lecture users.json :", err);
    return [];
  }
};

// Écrire les utilisateurs
const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Erreur écriture users.json :", err);
  }
};

// Valider email
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Valider password
const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// SIGNUP
app.post('/signup', (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation des champs
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Tous les champs sont requis !" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Email invalide !" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ success: false, message: "Mot de passe ≥ 8 caractères, avec 1 majuscule et 1 chiffre !" });
    }

    const users = readUsers();
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, message: "Email déjà utilisé !" });
    }

    users.push({ username, email, password, createdAt: new Date().toISOString() });
    writeUsers(users);
    console.log("✅ Nouvel utilisateur inscrit :", email);
    res.json({ success: true, message: "Inscription réussie !" });
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

    const users = readUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      console.log("❌ Connexion échouée :", email);
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect !" });
    }

    console.log("✅ Connexion réussie :", email);
    res.json({ success: true, message: `Bienvenue ${user.username} !`, user: { username: user.username, email: user.email } });
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

    const users = readUsers();
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
/* 
import fetch from "node-fetch";

pp.get('/api/deezer/playlists', async (req, res) => {
  try {
    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/https://api.deezer.com/user/2529/playlists?output=json",
      {
        headers: {
          "Origin": "localhost", 
          "x-requested-with": "XMLHttpRequest"
        }
      }
    );
    
    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur Deezer Playlists" });
  }
}); */
import fetch from "node-fetch";

pp.get('/api/deezer/playlists', async (req, res) => {
  try {
    const url =
      "https://cors-anywhere.herokuapp.com/https://api.deezer.com/user/2529/playlists?output=json";

    const response = await fetch(url, {
      headers: {
        "Origin": "localhost",
        "x-requested-with": "XMLHttpRequest"
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Deezer Playlist Error:", error);
    res.status(500).json({ error: "Erreur Deezer Playlists" });
  }
});



app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));


