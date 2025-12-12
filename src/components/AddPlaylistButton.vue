<template>
  <button @click="openModal" class="playlist-btn" :title="isInPlaylist ? 'Déjà dans playlist' : 'Ajouter à playlist'">
    {{ isInPlaylist ? '✓' : '🎵' }}
  </button>

  <!-- Modal pour ajouter à playlist -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Ajouter "{{ music }}" à une playlist</h3>
      
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
            :class="{ 'selected': isMusicInPlaylist(playlist) }"
            @click="addToPlaylist(playlist)"
          >
            <span>{{ playlist.name }}</span>
            <span v-if="isMusicInPlaylist(playlist)" class="checkmark">✓</span>
            <span v-else class="add-icon">+</span>
          </div>
        </div>
      </div>

      <!-- Créer nouvelle playlist -->
      <div class="create-section">
        <input 
          v-model="newPlaylistName" 
          placeholder="Nom de la nouvelle playlist"
          @keyup.enter="createPlaylist"
        />
        <button @click="createPlaylist" :disabled="!newPlaylistName.trim()">Créer</button>
      </div>

      <div class="modal-actions">
        <button @click="closeModal" class="close-btn">Fermer</button>
        <button @click="refreshPlaylists" class="refresh-btn" title="Actualiser">🔄</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddPlaylistButton',
  props: {
    music: { 
      type: String, 
      required: true 
    },
    album: { 
      type: String, 
      default: 'Unknown' 
    },
    artist: {
      type: String,
      default: ''
    }
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

  watch: {
    music() {
      this.checkIfInPlaylist();
    }
  },

  async created() {
    await this.checkIfInPlaylist();
  },

  methods: {
    async checkIfInPlaylist() {
      try {
        const res = await fetch('http://localhost:3000/playlists');
        if (!res.ok) throw new Error('Erreur serveur');
        
        const playlists = await res.json();
        
        this.isInPlaylist = playlists.some(p => 
          p.musics && Array.isArray(p.musics) && p.musics.some(m => 
            typeof m === 'string' ? m === this.music : m.title === this.music
          )
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
        const res = await fetch('http://localhost:3000/playlists');
        if (!res.ok) throw new Error('Erreur serveur');
        
        this.playlists = await res.json();
        
        // Trier par date de modification (les plus récentes d'abord)
        this.playlists.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        });
      } catch (err) {
        console.error('Erreur chargement playlists:', err);
        this.playlists = [];
        alert('Impossible de charger les playlists. Vérifiez que le serveur json-server est en cours d\'exécution (port 3000).');
      } finally {
        this.loading = false;
      }
    },

    async refreshPlaylists() {
      await this.loadPlaylists();
      await this.checkIfInPlaylist();
    },

    isMusicInPlaylist(playlist) {
      if (!playlist.musics || !Array.isArray(playlist.musics)) return false;
      
      return playlist.musics.some(m => 
        typeof m === 'string' ? m === this.music : m.title === this.music
      );
    },

    async addToPlaylist(playlist) {
      if (this.isMusicInPlaylist(playlist)) {
        alert(`"${this.music}" est déjà dans "${playlist.name}" !`);
        return;
      }

      try {
        // Créer l'objet musique complet
        const musicObject = {
          id: Date.now(),
          title: this.music,
          artist: this.artist || 'Artiste inconnu',
          album: this.album || 'Album inconnu',
          addedAt: new Date().toISOString()
        };

        // Préparer les musiques mises à jour
        const currentMusics = Array.isArray(playlist.musics) ? playlist.musics : [];
        const updatedMusics = [...currentMusics, musicObject];

        // Mettre à jour la playlist
        const response = await fetch(`http://localhost:3000/playlists/${playlist.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ 
            musics: updatedMusics,
            updatedAt: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        const updatedPlaylist = await response.json();
        
        // Mettre à jour l'état local
        playlist.musics = updatedPlaylist.musics;
        this.isInPlaylist = true;
        
        // Notification
        this.$notify({
          title: 'Succès',
          text: `"${this.music}" ajouté à "${playlist.name}"`,
          type: 'success'
        });
        
        // Émettre un événement
        this.$emit('added', { 
          music: this.music, 
          playlist: playlist.name,
          playlistId: playlist.id 
        });
        
        // Fermer le modal après un délai
        setTimeout(() => {
          this.closeModal();
        }, 1000);
        
      } catch (err) {
        console.error('Erreur ajout playlist:', err);
        alert(`Erreur lors de l'ajout à la playlist: ${err.message}`);
      }
    },

    async createPlaylist() {
      const name = this.newPlaylistName.trim();
      if (!name) {
        alert('Veuillez entrer un nom pour la playlist');
        return;
      }

      try {
        // Créer l'objet musique complet
        const musicObject = {
          id: Date.now(),
          title: this.music,
          artist: this.artist || 'Artiste inconnu',
          album: this.album || 'Album inconnu',
          addedAt: new Date().toISOString()
        };

        const newPlaylist = {
          id: Date.now(), // ID unique
          name: name,
          description: `Playlist créée le ${new Date().toLocaleDateString()}`,
          musics: [musicObject],
          cover: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const response = await fetch('http://localhost:3000/playlists', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(newPlaylist)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        const createdPlaylist = await response.json();
        
        this.isInPlaylist = true;
        
        // Notification
        this.$notify({
          title: 'Playlist créée',
          text: `"${name}" créée avec "${this.music}"`,
          type: 'success'
        });
        
        // Émettre les événements
        this.$emit('playlist-created', createdPlaylist);
        this.$emit('added', { 
          music: this.music, 
          playlist: name,
          playlistId: createdPlaylist.id 
        });
        
        // Fermer le modal et recharger
        this.closeModal();
        await this.loadPlaylists();
        
      } catch (err) {
        console.error('Erreur création playlist:', err);
        alert(`Erreur lors de la création de la playlist: ${err.message}`);
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
  color: #1DB954;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.playlist-btn:hover {
  transform: scale(1.1);
  background: rgba(29, 185, 84, 0.1);
  color: #1ed760;
}

.playlist-btn:active {
  transform: scale(0.95);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(145deg, #282828, #1e1e1e);
  padding: 30px;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  color: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid #444;
}

.modal-content h3 {
  margin-top: 0;
  color: white;
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.4rem;
  font-weight: 600;
}

.playlist-list {
  margin: 25px 0;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 10px;
  border: 1px solid #444;
  background: rgba(255, 255, 255, 0.05);
}

.playlist-item {
  padding: 15px 20px;
  background: transparent;
  margin: 0;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.playlist-item:last-child {
  border-bottom: none;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.playlist-item.selected {
  background: rgba(29, 185, 84, 0.15);
  border-left: 4px solid #1DB954;
}

.playlist-item .checkmark {
  color: #1DB954;
  font-weight: bold;
  font-size: 1.2rem;
}

.playlist-item .add-icon {
  color: #888;
  font-size: 1.2rem;
}

.create-section {
  display: flex;
  gap: 12px;
  margin: 25px 0;
  align-items: center;
}

.create-section input {
  flex: 1;
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid #555;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
}

.create-section input:focus {
  outline: none;
  border-color: #1DB954;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2);
}

.create-section input::placeholder {
  color: #888;
}

.create-section button {
  padding: 12px 24px;
  background: #1DB954;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  min-width: 80px;
}

.create-section button:hover:not(:disabled) {
  background: #1ed760;
  transform: translateY(-1px);
}

.create-section button:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.6;
}

.create-section button:active:not(:disabled) {
  transform: translateY(0);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
}

.close-btn {
  flex: 1;
  padding: 14px;
  background: #555;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #666;
}

.refresh-btn {
  padding: 14px;
  background: #444;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
  width: 50px;
}

.refresh-btn:hover {
  background: #555;
  transform: rotate(90deg);
}

/* Scrollbar personnalisée */
.playlist-list::-webkit-scrollbar {
  width: 8px;
}

.playlist-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.playlist-list::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.playlist-list::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Animation d'entrée */
.modal-content {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    padding: 20px;
  }
  
  .create-section {
    flex-direction: column;
  }
  
  .create-section input,
  .create-section button {
    width: 100%;
  }
}
</style>