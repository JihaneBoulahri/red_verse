<template>
  <button @click="openModal" class="playlist-btn" :title="isInPlaylist ? 'Déjà dans playlist' : 'Ajouter à playlist'">
    {{ isInPlaylist ? '✓' : '🎵' }}
  </button>

  <!-- Modal pour ajouter à playlist -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <h3>Ajouter à une playlist</h3>
      
      <div class="playlist-list">
        <div v-if="loading">Chargement...</div>
        
        <div v-else-if="playlists.length === 0">
          <p>Aucune playlist. Créez-en une !</p>
        </div>
        
        <div v-else>
          <div 
            v-for="playlist in playlists" 
            :key="playlist.id"
            class="playlist-item"
            @click="addToPlaylist(playlist)"
          >
            <span>{{ playlist.name }}</span>
            <span v-if="isMusicInPlaylist(playlist)">✓</span>
          </div>
        </div>
      </div>

      <!-- Créer nouvelle playlist -->
      <div class="create-section">
        <input 
          v-model="newPlaylistName" 
          placeholder="Nouvelle playlist"
          @keyup.enter="createPlaylist"
        />
        <button @click="createPlaylist">Créer</button>
      </div>

      <button @click="closeModal" class="close-btn">Fermer</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddPlaylistButton',
  props: {
    music: { type: String, required: true },
    album: { type: String, default: 'Unknown' }
  },
  
  data() {
    return {
      showModal: false,
      playlists: [],
      loading: false,
      newPlaylistName: '',
      isInPlaylist: false
    };
  },

  async created() {
    await this.checkIfInPlaylist();
  },

  methods: {
    async checkIfInPlaylist() {
      try {
        const res = await fetch('http://localhost:3000/api/playlists');
        const playlists = await res.json();
        
        // Vérifier si la musique est dans n'importe quelle playlist
        this.isInPlaylist = playlists.some(p => 
          p.musics && p.musics.includes(this.music)
        );
      } catch (err) {
        console.error('Erreur vérification playlist:', err);
      }
    },

    async openModal() {
      this.showModal = true;
      await this.loadPlaylists();
    },

    closeModal() {
      this.showModal = false;
      this.newPlaylistName = '';
    },

    async loadPlaylists() {
      this.loading = true;
      try {
        const res = await fetch('http://localhost:3000/api/playlists');
        this.playlists = await res.json();
      } catch (err) {
        console.error('Erreur chargement playlists:', err);
        this.playlists = [];
      } finally {
        this.loading = false;
      }
    },

    isMusicInPlaylist(playlist) {
      return playlist.musics && playlist.musics.includes(this.music);
    },

    async addToPlaylist(playlist) {
      if (this.isMusicInPlaylist(playlist)) {
        alert('Déjà dans cette playlist !');
        return;
      }

      try {
        await fetch(`http://localhost:3000/api/playlists/${playlist.id}/add-music`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ music: this.music })
        });

        this.isInPlaylist = true;
        alert(`Ajouté à "${playlist.name}" !`);
        this.closeModal();
        
        // Émettre un événement
        this.$emit('added', { music: this.music, playlist: playlist.name });
      } catch (err) {
        console.error('Erreur ajout playlist:', err);
        alert('Erreur lors de l\'ajout');
      }
    },

    async createPlaylist() {
      const name = this.newPlaylistName.trim();
      if (!name) return;

      try {
        const res = await fetch('http://localhost:3000/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: name,
            musics: [this.music]
          })
        });

        const newPlaylist = await res.json();
        
        this.isInPlaylist = true;
        alert(`Playlist "${name}" créée avec "${this.music}" !`);
        this.closeModal();
        
        // Émettre un événement
        this.$emit('playlist-created', newPlaylist);
        this.$emit('added', { music: this.music, playlist: name });
      } catch (err) {
        console.error('Erreur création playlist:', err);
        alert('Erreur lors de la création');
      }
    }
  }
};
</script>

<style scoped>
.playlist-btn {
  font-size: 22px;
  background: none;
  border: none;
  cursor: pointer;
  color: #1DB954; /* Vert Spotify */
  padding: 0 8px;
  transition: transform 0.2s;
}

.playlist-btn:hover {
  transform: scale(1.2);
  color: #1ed760;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #282828;
  padding: 25px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  color: white;
}

.modal-content h3 {
  margin-top: 0;
  color: white;
  text-align: center;
}

.playlist-list {
  margin: 20px 0;
  max-height: 300px;
  overflow-y: auto;
}

.playlist-item {
  padding: 12px;
  background: #404040;
  margin-bottom: 8px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.playlist-item:hover {
  background: #505050;
}

.create-section {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.create-section input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #555;
  background: #333;
  color: white;
}

.create-section button {
  padding: 10px 15px;
  background: #1DB954;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.create-section button:hover {
  background: #1ed760;
}

.close-btn {
  width: 100%;
  padding: 12px;
  background: #555;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.close-btn:hover {
  background: #666;
}
</style>