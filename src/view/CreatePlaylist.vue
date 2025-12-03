<template>
  <div class="create-playlist">
    <h1>Create Your Playlist</h1>
    <p class="subtitle">
      Build your own vibe. Add name, description and create your playlist.
    </p>

    <!-- Formulaire de création -->
    <div class="form-card">
      <form @submit.prevent="createPlaylist">
        <div class="input-group">
          <label>Playlist name</label>
          <input v-model="playlist.name" type="text" placeholder="My favorite songs..." required />
        </div>

        <div class="input-group">
          <label>Description</label>
          <textarea v-model="playlist.description" placeholder="Chill, party, motivation..."></textarea>
        </div>

        <div class="input-group">
          <label>Genre</label>
          <select v-model="playlist.genre">
            <option value="">Choose a genre</option>
            <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
          </select>
        </div>

       

        <button type="submit" class="create-btn">+ Create Playlist</button>
      </form>
    </div>

    <!-- Liste de toutes les playlists -->
    <div v-if="showAllPlaylists && allPlaylists.length" class="all-playlists">
      <h2>All Playlists Created by Users</h2>
      <div v-for="(p, index) in allPlaylists" :key="index" class="preview-card">
        <img :src="p.cover || defaultCover" alt="cover" />
        <div>
          <h3>{{ p.name }}</h3>
          <p>{{ p.description || 'No description' }}</p>
          <span class="badge">{{ p.genre }}</span>
        </div>
      </div>
    </div>

    <!-- Bouton flottant pour voir/masquer toutes les playlists -->
    <button class="bottom-btn" @click="toggleAllPlaylists">
      {{ showAllPlaylists ? 'Hide All Playlists' : 'See All Playlists' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue"

const defaultCover = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4"
const genres = ["Pop","Rock","Hip-Hop","Raï","Gaming-Music","Classical","House","Country"]

// Formulaire
const playlist = ref({ name: "", description: "", genre: ""})

// Toutes les playlists récupérées depuis l'API
const allPlaylists = ref([])

// Toggle pour afficher/masquer les playlists
const showAllPlaylists = ref(false)

// Créer une nouvelle playlist
const createPlaylist = async () => {
  if (!playlist.value.name || !playlist.value.genre) {
    alert("Please fill in name and genre")
    return
  }

  try {
    // Envoyer la playlist au backend (POST)
    await fetch("http://localhost:3000/api/deezer/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playlist.value)
    })

    alert("Playlist created successfully!")

    // Réinitialiser le formulaire
    playlist.value = { name: "", description: "", genre: ""}

    // Rafraîchir automatiquement la liste de toutes les playlists
    fetchAllPlaylists()
    showAllPlaylists.value = true

  } catch (err) {
    console.error(err)
    alert("Failed to create playlist")
  }
}

// Récupérer toutes les playlists depuis le backend
const fetchAllPlaylists = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/deezer/playlists")
    const data = await res.json()
    allPlaylists.value = data
  } catch (err) {
    console.error(err)
    alert("Failed to load playlists")
  }
}

// Toggle affichage
const toggleAllPlaylists = () => {
  showAllPlaylists.value = !showAllPlaylists.value
  if (showAllPlaylists.value && allPlaylists.value.length === 0) {
    fetchAllPlaylists()
  }
}
</script>

<style scoped>
.create-playlist {
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  background: radial-gradient(circle at top, #111 0%, #000 70%);
  color: white;
  margin-left: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
h1 { font-size: 2.2rem; color: #ff1a1a; text-align: center; margin-top: 35px; }
.subtitle { text-align: center; max-width: 600px; color: #aaa; margin-bottom: 30px; }

.form-card { width: 100%; max-width: 550px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,26,26,0.3); border-radius: 16px; padding: 25px; margin-top: 20px; }
.input-group { display: flex; flex-direction: column; margin-bottom: 18px; }
label { margin-bottom: 6px; color: #ffcccc; font-weight: 600; }
input, textarea, select { padding: 12px; border-radius: 8px; border: 1px solid #333; background: #111; color: white; outline: none; }
textarea { min-height: 80px; }
.create-btn { width: 100%; padding: 14px; background: #ff1a1a; border: none; color: white; border-radius: 10px; font-weight: 600; font-size: 1rem; cursor: pointer; margin-top: 10px; }
.create-btn:hover { background: #ff3333; }

.all-playlists { margin-top: 40px; width: 100%; max-width: 600px; }
.preview-card { display: flex; gap: 12px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; margin-bottom: 12px; }
.preview-card img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
.preview-card .badge { background: #ff1a1a; padding: 2px 6px; border-radius: 6px; color: white; font-size: 0.75rem; margin-top: 4px; display: inline-block; }

.bottom-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 22px;
  background-color: #ff1a1a;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transition: background 0.3s;
}
.bottom-btn:hover { background-color: #ff3333; }
</style>
