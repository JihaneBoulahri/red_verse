<template>
  <div class="container">
    <h2>Mes Playlists</h2>

    <!-- LISTE DES PLAYLISTS -->
    <div 
      v-for="pl in playlists" 
      :key="pl.id" 
      class="playlist-item"
    >
      <div class="playlist-header">
        <h3 @click="togglePlaylist(pl)">🎵 {{ pl.name }}</h3>

        <div class="playlist-actions">
          <button @click.stop="deletePlaylist(pl)" class="delete-btn">
            🗑️
          </button>
        </div>
      </div>

      <!-- MUSIQUES -->
      <div v-if="selectedPlaylist === pl" class="musics">
        <div v-if="pl.musics?.length">
          <div 
            v-for="(music, i) in pl.musics" 
            :key="i" 
            class="music-item"
          >
            <span>{{ music }}</span>
            <button 
              @click="removeMusic(pl, i)" 
              class="remove-music-btn"
            >
              ❌
            </button>
          </div>
        </div>

        <div v-else class="no-musics">Aucune musique</div>

        <!-- AJOUT MUSIQUE -->
        <div class="add-music">
          <input 
            v-model="newMusic"
            placeholder="Ajouter musique..."
            @keyup.enter="addMusic(pl)"
          />
          <button @click="addMusic(pl)">Ajouter</button>
        </div>
      </div>
    </div>

    <!-- CREATION PLAYLIST -->
    <button 
      @click="showNewPlaylistForm = !showNewPlaylistForm" 
      class="toggle-form-btn"
    >
      {{ showNewPlaylistForm ? "Annuler" : "Ajouter playlist" }}
    </button>

    <div v-if="showNewPlaylistForm" class="new-playlist">
      <input
        v-model="newPlaylistName"
        placeholder="Nom playlist"
        @keyup.enter="createNewPlaylist"
      />
      <button @click="createNewPlaylist">Créer</button>
    </div>
  </div>
</template>

<script>
import { Toast } from "../ui/Toast.js";

export default {
  name: "PlaylistManager",

  data() {
    return {
      playlists: [],
      selectedPlaylist: null,
      newMusic: "",
      newPlaylistName: "",
      showNewPlaylistForm: false,
    };
  },

  async created() {
    await this.loadPlaylists();
  },

  methods: {
    async loadPlaylists() {
      try {
        const res = await fetch("http://localhost:3000/api/playlists");
        this.playlists = await res.json();
      } catch (e) {
        Toast.error("Erreur chargement playlists");
      }
    },

    togglePlaylist(pl) {
      this.selectedPlaylist = this.selectedPlaylist === pl ? null : pl;
    },

    async createNewPlaylist() {
      const name = this.newPlaylistName.trim();
      if (!name) return Toast.error("Nom invalide");

      try {
        const res = await fetch("http://localhost:3000/api/playlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, musics: [] }),
        });

        const newPl = await res.json();
        this.playlists.push(newPl);

        this.newPlaylistName = "";
        this.showNewPlaylistForm = false;
        Toast.success(`Playlist "${name}" créée`);
      } catch (e) {
        Toast.error("Erreur création playlist");
      }
    },

    async addMusic(pl) {
      const music = this.newMusic.trim();
      if (!music) return Toast.error("Musique vide");

      try {
        await fetch(
          `http://localhost:3000/api/playlists/${pl.id}/add-music`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ music }),
          }
        );

        pl.musics ??= [];
        pl.musics.push(music);

        this.newMusic = "";
        Toast.success(`"${music}" ajoutée`);
      } catch (e) {
        Toast.error("Erreur ajout musique");
      }
    },

    async removeMusic(pl, index) {
      const musicName = pl.musics[index];

      try {
        await fetch(
          `http://localhost:3000/api/playlists/${pl.id}/remove-music`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index }),
          }
        );

        pl.musics.splice(index, 1);
        Toast.success(`"${musicName}" supprimée`);
      } catch (e) {
        pl.musics.splice(index, 1); // fallback
        Toast.success(`"${musicName}" supprimée (local)`);
      }
    },

    async deletePlaylist(pl) {
      if (!confirm(`Supprimer "${pl.name}" ?`)) return;

      try {
        await fetch(`http://localhost:3000/api/playlists/${pl.id}`, {
          method: "DELETE",
        });

        this.playlists = this.playlists.filter((p) => p.id !== pl.id);
        Toast.success(`Playlist supprimée`);
      } catch (e) {
        Toast.error("Erreur suppression playlist");
      }
    },
  },
};
</script>
<style scoped>
/* 🎵 Thème Global */
.container {
  padding: 25px;
  background: #0b0b0f; /* Noir profond */
  color: #e6e6e6;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

h2 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #fff;
}

/* 🎧 Carte Playlist */
.playlist-item {
  background: linear-gradient(145deg, #13131a, #0d0d12);
  padding: 18px;
  margin-bottom: 18px;
  border-radius: 14px;
  border: 1px solid #1e1e28;
  transition: 0.25s ease;
}

.playlist-item:hover {
  transform: translateY(-3px);
  border-color: #3a8dff;
  box-shadow: 0px 4px 12px rgba(58, 141, 255, 0.2);
}

/* 🎼 Header Playlist */
.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.playlist-header h3 {
  margin: 0;
  color: #3a8dff;
  cursor: pointer;
  font-size: 20px;
  transition: 0.2s;
}

.playlist-header h3:hover {
  color: #63a6ff;
  letter-spacing: 0.5px;
}

.playlist-actions {
  display: flex;
  gap: 12px;
}

/* 🗑 Bouton Suppression */
.delete-btn {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #5a1d1d;
  color: #ff5c5c;
  border-radius: 8px;
  padding: 6px 12px;
  transition: 0.25s;
}

.delete-btn:hover {
  background: #ff3b3b;
  color: white;
}

/* 🎵 Musiques */
.music-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #1b1b24;
  border-radius: 10px;
  margin-bottom: 8px;
  border: 1px solid #262631;
  transition: 0.25s;
}

.music-item:hover {
  background: #22222e;
  border-color: #3a8dff;
  box-shadow: 0px 2px 5px rgba(58, 141, 255, 0.15);
}

/* ❌ Remove Button */
.remove-music-btn {
  background: #292933;
  border: 1px solid #444455;
  color: #ccc;
  border-radius: 8px;
  padding: 5px 10px;
  transition: 0.25s;
}

.remove-music-btn:hover {
  background: #ff4d4d;
  border-color: #ff4d4d;
  color: white;
}

/* ➕ Add Music */
.add-music {
  display: flex;
  margin-top: 12px;
  gap: 12px;
}

.add-music input {
  flex: 1;
  padding: 12px;
  background: #16161d;
  border-radius: 10px;
  border: 2px solid #24242e;
  color: white;
  transition: 0.25s;
}

.add-music input:focus {
  border-color: #3a8dff;
  box-shadow: 0 0 8px rgba(58, 141, 255, 0.4);
}

.add-music button {
  background: #3a8dff;
  border: none;
  padding: 12px 25px;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  transition: 0.25s;
}

.add-music button:hover {
  background: #609eff;
}

/* ➕ Toggle Form */
.toggle-form-btn {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  border-radius: 12px;
  background: #3a8dff;
  color: white;
  font-weight: bold;
  transition: 0.25s;
}

.toggle-form-btn:hover {
  background: #609eff;
}

/* 🆕 Création Playlist */
.new-playlist {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.new-playlist input {
  flex: 1;
  padding: 14px;
  background: #16161d;
  border: 2px solid #24242e;
  border-radius: 10px;
  color: white;
  transition: 0.25s;
}

.new-playlist input:focus {
  border-color: #3a8dff;
}

.new-playlist button {
  background: #28a745;
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: bold;
  color: white;
  transition: 0.25s;
}

.new-playlist button:hover {
  background: #32c85a;
}
</style>

