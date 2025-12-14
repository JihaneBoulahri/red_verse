<template>
  <div class="playlist-manager">
    <!-- Header -->
    <div class="header">
      <h1>Playlists</h1>
    </div>

    <!-- Section Playlists -->
    <div v-if="activeTab === 'playlists'" class="playlists-section">
      <!-- Formulaire création playlist -->
      <div class="create-section">
        <input 
          v-model="newPlaylistName" 
          placeholder="Nom de la nouvelle playlist..."
          @keyup.enter="createPlaylist"
        />
        <button @click="createPlaylist" :disabled="!newPlaylistName.trim()" class="create-btn">
          + Créer Playlist
        </button>
      </div>

      <!-- Liste des playlists -->
      <div v-if="playlists.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <h3>Aucune playlist</h3>
        <p>Créez votre première playlist pour organiser vos musiques</p>
      </div>

      <div v-else class="playlists-grid">
        <div 
          v-for="playlist in playlists" 
          :key="playlist.id"
          class="playlist-card"
          @click="viewPlaylistDetail(playlist)"
        >
          <div class="playlist-cover">
            <div class="cover-placeholder">
              <span class="cover-icon">🎵</span>
              <div class="music-count">{{ playlist.musics?.length || 0 }}</div>
            </div>
          </div>

          <div class="playlist-info">
            <h3 class="playlist-name">{{ playlist.name }}</h3>
            <p class="playlist-description">{{ playlist.description || 'Aucune description' }}</p>
            
            <div class="playlist-meta">
              <span class="meta-item">
                <span class="meta-icon">🎵</span>
                {{ playlist.musics?.length || 0 }} titres
              </span>
              <span class="meta-item">
                <span class="meta-icon">📅</span>
                {{ formatDate(playlist.createdAt) }}
              </span>
            </div>
          </div>

          <div class="playlist-actions">
       
            <button 
              @click.stop="deletePlaylist(playlist)"
              class="action-btn delete-btn"
             
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de playlist -->
    <div v-if="showPlaylistModal" class="modal-overlay" @click.self="closePlaylistModal">
      <div class="modal-content playlist-modal">
        <div class="modal-header">
          <h2>{{ currentPlaylist?.name }}</h2>
          <button @click="closePlaylistModal" class="close-modal-btn">×</button>
        </div>

        <div class="playlist-details">
          <div class="playlist-stats">
            <span class="stat">
              <span class="stat-icon">🎵</span>
              {{ currentPlaylist?.musics?.length || 0 }} musiques
            </span>
            <span class="stat">
              <span class="stat-icon">📅</span>
              Créée le {{ formatDate(currentPlaylist?.createdAt) }}
            </span>
          </div>

          <!-- Musiques de la playlist -->
          <div v-if="currentPlaylist?.musics && currentPlaylist.musics.length > 0" class="playlist-musics">
            <h3>Liste des titres</h3>
            <div class="musics-list">
              <TrackCard
                v-for="(music, index) in currentPlaylist.musics"
                :key="music.id || index"
                :track="{
                  id: music.id || index,
                  title: getMusicTitle(music),
                  artist: { name: getMusicArtist(music) },
                  album: { title: getMusicAlbum(music), cover_small: music.cover_small || music.cover || (music.album && music.album.cover_small) || '' },
                  preview: music.preview || null
                }"
                @play="playTrack"
              />
            </div>
          </div>
          <div v-else class="empty-playlist">
            <p>Cette playlist est vide</p>
          </div>

          <!-- Ajouter une musique -->
          <div class="add-music-section">
            <input 
              v-model="newMusicName"
              placeholder="Rechercher ou ajouter une musique..."
              @keyup.enter="addMusicToPlaylist"
            />
            <button @click="addMusicToPlaylist" class="add-btn">+ Add</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { Toast } from '../ui/Toast';
import player from '../services/player';
import TrackCard from '../components/TrackCard.vue';

export default {
  name: 'PlaylistManager',
  components: { TrackCard },

  data() {
    return {
      activeTab: 'playlists',
      playlists: [],
      newPlaylistName: '',
      showPlaylistModal: false,
      newMusicName: '',
      notification: {
        show: false,
        message: '',
        type: 'info'
      },
    };
  },

  async created() {
    await this.loadPlaylists();
  },

  methods: {
    // Méthodes utilitaires pour extraire les infos des musiques
    getMusicTitle(music) {
      if (typeof music === 'string') return music;
      if (typeof music === 'object') {
        return music.title || music.music || music.name || 'Titre inconnu';
      }
      return 'Titre inconnu';
    },

    getMusicArtist(music) {
      if (typeof music === 'object') {
        return music.artist || 'Artiste inconnu';
      }
      return 'Artiste inconnu';
    },

    getMusicAlbum(music) {
      if (typeof music === 'object') {
        return music.album || 'Album inconnu';
      }
      return 'Album inconnu';
    },

    async loadPlaylists() {
      try {
        const response = await fetch('http://localhost:3000/api/playlists');
        if (!response.ok) {
          // Essayer avec /api/playlists si /playlists échoue
          const response2 = await fetch('http://localhost:3000/api/playlists');
          if (!response2.ok) throw new Error('Erreur chargement playlists');
          this.playlists = await response2.json();
        } else {
          this.playlists = await response.json();
        }
        
        console.log('Playlists chargées:', this.playlists);
        Toast.success('Playlists chargées', 'success');
      } catch (error) {
        console.error('Erreur chargement playlists:', error);
        Toast.error('Erreur chargement playlists', 'error');
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'Date inconnue';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return dateString;
      }
    },

    playTrack(track) {
      console.log("Playing track:", track);
      if (!track.preview) {
        Toast.info("Preview non disponible pour cette piste !");
        return;
      }
      player.play(track);
    },
    async createPlaylist() {
      const name = this.newPlaylistName.trim();
      if (!name) {
        Toast.error('Veuillez entrer un nom', 'error');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            description: '',
            musics: [] 
          })
        });

        if (!response.ok) {
          // Essayer avec /api/playlists
          const response2 = await fetch('http://localhost:3000/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name, 
              description: '',
              musics: [] 
            })
          });
          
          if (!response2.ok) throw new Error('Erreur création playlist');
          
          const newPlaylist = await response2.json();
          this.playlists.push(newPlaylist);
        } else {
          const newPlaylist = await response.json();
          this.playlists.push(newPlaylist);
        }
        
        this.newPlaylistName = '';
        Toast.success(`Playlist "${name}" créée`, 'success');
      } catch (error) {
        console.error('Erreur création playlist:', error);
        Toast.error('Erreur création playlist', 'error');
      }
    },


    async deletePlaylist(playlist) {
       if (!this.confirmDelete) {
    this.confirmDelete = true;
    return;
  }

      try {
        // Essayer avec /playlists/:id
        let response = await fetch(`http://localhost:3000/api/playlists/${playlist.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          // Essayer avec /api/playlists/:id
          response = await fetch(`http://localhost:3000/api/playlists/${playlist.id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Erreur suppression');
        }

        this.playlists = this.playlists.filter(p => p.id !== playlist.id);
        Toast.success(`Playlist "${playlist.name}" supprimée`, 'success');
      } catch (error) {
        console.error('Erreur suppression playlist:', error);
        Toast.error('Erreur suppression playlist', 'error');
      }
    },

    async viewPlaylistDetail(playlist) {
      try {
        const res = await fetch(`http://localhost:3000/api/playlists/${playlist.id}`);
        if (res.ok) {
          const data = await res.json();
          this.currentPlaylist = data;
        } else {
          this.currentPlaylist = playlist;
        }
      } catch (err) {
        console.error('Erreur chargement playlist détail:', err);
        this.currentPlaylist = playlist;
      }
      this.showPlaylistModal = true;
    },

    closePlaylistModal() {
      this.showPlaylistModal = false;
      this.currentPlaylist = null;
      this.newMusicName = '';
    },

    async addMusicToPlaylist() {
      if (!this.currentPlaylist || !this.newMusicName.trim()) return;

      const musicTitle = this.newMusicName.trim();
      
      try {
        // Préparer les données de la musique
        const musicData = {
          music: musicTitle,
          artist: 'Artiste inconnu',
          album: 'Album inconnu'
        };

        // Essayer avec /playlists/:id/add-music
        let response = await fetch(`http://localhost:3000/api/playlists/${this.currentPlaylist.id}/add-music`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(musicData)
        });

        if (!response.ok) {
          // Essayer avec /api/playlists/:id/add-music
          response = await fetch(`http://localhost:3000/api/playlists/${this.currentPlaylist.id}/add-music`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(musicData)
          });
          
          if (!response.ok) {
            // Si aucune route spécifique, mettre à jour directement
            await this.updatePlaylistWithMusic(musicData);
            return;
          }
        }

        const updated = await response.json();
        
        // Mettre à jour la playlist locale
        if (updated.playlist && updated.playlist.musics) {
          this.currentPlaylist.musics = updated.playlist.musics;
        } else if (updated.musics) {
          this.currentPlaylist.musics = updated.musics;
        } else if (updated) {
          // Mettre à jour toute la playlist
          this.currentPlaylist = updated;
        }
        
        this.newMusicName = '';
        Toast.success('Musique ajoutée', 'success');
      } catch (error) {
        console.error('Erreur ajout musique:', error);
        Toast.error('Erreur ajout musique', 'error');
      }
    },

    async updatePlaylistWithMusic(musicData) {
      // Mettre à jour localement d'abord
      if (!this.currentPlaylist.musics) {
        this.currentPlaylist.musics = [];
      }
      
      const newMusic = {
        id: Date.now(),
        title: musicData.music,
        artist: musicData.artist,
        album: musicData.album,
        addedAt: new Date().toISOString()
      };
      
      this.currentPlaylist.musics.push(newMusic);
      
      // Mettre à jour sur le serveur avec PATCH
      try {
        const response = await fetch(`http://localhost:3000/api/playlists/${this.currentPlaylist.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            musics: this.currentPlaylist.musics,
            updatedAt: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const response2 = await fetch(`http://localhost:3000/api/playlists/${this.currentPlaylist.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              musics: this.currentPlaylist.musics,
              updatedAt: new Date().toISOString()
            })
          });
          
          if (!response2.ok) throw new Error('Erreur mise à jour playlist');
        }
        
        this.newMusicName = '';
        Toast.error('Musique ajoutée', 'success');
      } catch (error) {
        console.error('Erreur mise à jour playlist:', error);
        Toast.error('Musique ajoutée localement', 'warning');
      }
    },

    async removeFromPlaylist(music, index) {
      if (!this.currentPlaylist) return;

      const musicTitle = this.getMusicTitle(music);
       if (!this.confirmDelete) {
    this.confirmDelete = true;
    return;
  }

      try {
        // Essayer avec DELETE spécifique
        let response;
        
        if (music.id) {
          // Si la musique a un ID
          response = await fetch(
            `http://localhost:3000/api/playlists/${this.currentPlaylist.id}/musics/${music.id}`, 
            { method: 'DELETE' }
          );
          
          if (!response.ok) {
            response = await fetch(
              `http://localhost:3000/api/playlists/${this.currentPlaylist.id}/musics/${music.id}`, 
              { method: 'DELETE' }
            );
          }
        }
        
        // Mettre à jour localement dans tous les cas
        this.currentPlaylist.musics.splice(index, 1);
        
        // Mettre à jour sur le serveur avec PATCH
        const updateResponse = await fetch(`http://localhost:3000/api/playlists/${this.currentPlaylist.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            musics: this.currentPlaylist.musics,
            updatedAt: new Date().toISOString()
          })
        });

        if (!updateResponse.ok) {
          await fetch(`http://localhost:3000/api/playlists/${this.currentPlaylist.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              musics: this.currentPlaylist.musics,
              updatedAt: new Date().toISOString()
            })
          });
        }

        Toast.success('Musique retirée', 'success');
      } catch (error) {
        console.error('Erreur suppression musique:', error);
        Toast.error('Musique retirée localement', 'warning');
      }
    },


    editPlaylist(playlist) {
      const newName = prompt('Nouveau nom:', playlist.name);
      if (newName && newName.trim() !== playlist.name) {
        this.renamePlaylist(playlist, newName.trim());
      }
    },

    async refreshAll() {
      await this.loadPlaylists();
      Toast.success('Tout rafraîchi', 'success');
    },

    handleImageError(event) {
      event.target.style.display = 'none';
      const parent = event.target.parentElement;
      if (parent) {
        const icon = document.createElement('div');
        icon.className = 'cover-icon';
        icon.textContent = '🎵';
        parent.appendChild(icon);
      }
    },
  }
};
</script>


<style scoped>
  .playlist-manager {
  padding: 20px;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  min-height: 100vh;
  color: white;
}
.playlist-manager {
  padding: 20px;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  min-height: 100vh;
  color: white;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h1 {
  font-size: 28px;
  margin: 0;
  background: linear-gradient(45deg, #1DB954, #1ed760);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.refresh-all-btn {
  background: rgba(29, 185, 84, 0.2);
  color: white;
  border: 1px solid #1DB954;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.refresh-all-btn:hover {
  background: rgba(29, 185, 84, 0.4);
  transform: translateY(-2px);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 5px;
}

.tab-btn {
  flex: 1;
  padding: 15px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.tab-btn.active {
  background: rgba(29, 185, 84, 0.2);
  color: white;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.2);
}

/* Create Section */
.create-section {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
}

.create-section input {
  flex: 1;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 16px;
}

.create-section input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.create-btn {
  padding: 15px 30px;
  background: #1DB954;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 150px;
}

.create-btn:hover:not(:disabled) {
  background: #1ed760;
  transform: translateY(-2px);
}

.create-btn:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Grids */
.playlists-grid,
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* Cards */
.playlist-card,
.album-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.playlist-card:hover,
.album-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(29, 185, 84, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Covers */
.playlist-cover,
.album-cover {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.playlist-card:hover .cover-image img,
.album-card:hover .cover-image img {
  transform: scale(1.05);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.cover-icon {
  font-size: 60px;
  margin-bottom: 10px;
}

.music-count {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

/* Info Sections */
.playlist-info,
.album-info {
  padding: 20px;
  flex: 1;
}

.playlist-name,
.album-title {
  font-size: 20px;
  margin: 0 0 10px 0;
  color: white;
}

.playlist-description,
.album-artist {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

/* Meta */
.playlist-meta,
.album-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.meta-icon {
  font-size: 14px;
}

/* Album Tracks */
.album-tracks {
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
}

.tracks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tracks-header h4 {
  margin: 0;
  font-size: 16px;
  color: white;
}

.toggle-tracks-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tracks-list {
  max-height: 200px;
  overflow-y: auto;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 5px;
  border-radius: 6px;
  transition: background 0.2s;
  cursor: pointer;
}

.track-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.track-number {
  width: 30px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: bold;
}

.track-title {
  flex: 1;
  color: white;
  font-size: 14px;
}

.track-artist {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-left: 10px;
}

.track-play-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 12px;
  padding: 5px;
  opacity: 0;
  transition: all 0.2s;
}

.track-item:hover .track-play-btn {
  opacity: 1;
  color: #1DB954;
}

/* Actions */
.playlist-actions,
.album-actions {
  display: flex;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.2);
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  color: white;
}

.action-btn.small {
  padding: 6px;
  font-size: 14px;
}

.play-btn {
  background: rgba(29, 185, 84, 0.2);
}

.play-btn:hover {
  background: rgba(29, 185, 84, 0.4);
}

.edit-btn {
  background: rgba(52, 152, 219, 0.2);
}

.edit-btn:hover {
  background: rgba(52, 152, 219, 0.4);
}

.save-btn {
  background: rgba(241, 196, 15, 0.2);
}

.save-btn:hover {
  background: rgba(241, 196, 15, 0.4);
}

.delete-btn {
  background: rgba(231, 76, 60, 0.2);
}

.delete-btn:hover {
  background: rgba(231, 76, 60, 0.4);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  margin: 20px 0;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: white;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

/* Section Info */
.section-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

/* Modals */
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
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: white;
  font-size: 24px;
}

.close-modal-btn {
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-modal-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.playlist-details {
  padding: 30px;
}

.playlist-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.stat-icon {
  font-size: 20px;
  color: #1DB954;
}

.playlist-musics h3 {
  color: white;
  margin-bottom: 20px;
  font-size: 20px;
}

.musics-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 25px;
}

.music-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 10px;
  border-radius: 10px;
  transition: background 0.2s;
  cursor: pointer;
}

.music-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.music-number {
  width: 40px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.7);
}

.music-info {
  flex: 1;
}

.music-title {
  display: block;
  color: white;
  font-size: 16px;
  margin-bottom: 5px;
}

.music-details {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.music-actions {
  display: flex;
  gap: 10px;
}

.empty-playlist {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
}

.add-music-section {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.add-music-section input {
  flex: 1;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 16px;
}

.add-btn {
  padding: 15px 30px;
  background: #1DB954;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.add-btn:hover {
  background: #1ed760;
  transform: translateY(-2px);
}

/* Album Form */
.album-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: white;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 16px;
}

.form-group input:focus {
  outline: none;
  border-color: #1DB954;
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2);
}

.album-preview {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 10px;
  margin: 25px 0;
}

.album-preview h4 {
  color: white;
  margin-bottom: 15px;
}

.preview-tracks {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
}

.preview-track {
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-track:last-child {
  border-bottom: none;
}

.more-tracks {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  padding: 10px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.modal-actions button {
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-actions .save-btn {
  background: #1DB954;
  color: white;
  min-width: 200px;
}

.modal-actions .save-btn:hover:not(:disabled) {
  background: #1ed760;
  transform: translateY(-2px);
}

.modal-actions .save-btn:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-actions .cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-actions .cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Notification */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  animation: slideInRight 0.3s ease-out;
  max-width: 300px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.notification.success {
  background: #1DB954;
  border-left: 4px solid #179c47;
}

.notification.error {
  background: #ff4757;
  border-left: 4px solid #ff2e43;
}

.notification.info {
  background: #3498db;
  border-left: 4px solid #2980b9;
}

.notification.warning {
  background: #f39c12;
  border-left: 4px solid #e67e22;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .playlists-grid,
  .albums-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions button {
    width: 100%;
  }
  
  .create-section,
  .add-music-section {
    flex-direction: column;
  }
}
</style>