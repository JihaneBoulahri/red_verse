import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Proxy route for Deezer API (using native fetch from Node 18+)
app.get('/api/deezer/tracks', async (req, res) => {
  try {
    const response = await fetch('https://api.deezer.com/chart/0/tracks');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Erreur Deezer proxy:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des pistes' });
  }
});

app.listen(PORT, () => console.log(`🎵 Proxy Deezer démarré sur http://localhost:${PORT}`));
