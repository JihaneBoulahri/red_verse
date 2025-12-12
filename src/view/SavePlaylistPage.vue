<template>
  <div class="playlist-manager">
    <!-- Header -->
    <div class="header">
      <h1>Playlists</h1>
      <div class="header-actions">
        <button @click="refreshAll" class="refresh-all-btn" title="Tout rafraîchir">
          🔄 Actualiser
        </button>
      </div>
    </div>

    <!-- Onglets -->
    <div class="tabs">
      <button 
        @click="activeTab = 'playlists'" 
        :class="{ active: activeTab === 'playlists' }"
        class="tab-btn"
      >
        📁 Mes Playlists ({{ playlists.length }})
      </button>
  
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
              @click.stop="playPlaylist(playlist)"
              class="action-btn play-btn"
       
            >
              ▶
            </button>
            <button 
              @click.stop="editPlaylist(playlist)"
              class="action-btn edit-btn"
           
            >
              ✏️
            </button>
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

    <!-- Section Albums -->
    <div v-if="activeTab === 'albums'" class="albums-section">
   

      <!-- Liste des albums -->
      <div v-if="albums.length === 0" class="empty-state">
        <div class="empty-icon">💿</div>
        <h3>Aucun album sauvegardé</h3>
        <p>Sauvegardez une playlist pour créer un album</p>
      </div>

      <div v-else class="albums-grid">
        <div 
          v-for="album in albums" 
          :key="album.id"
          class="album-card"
        >
          <div class="album-cover">
            <div class="cover-placeholder">
              <span class="cover-icon">💿</span>
            </div>
          </div>

          <div class="album-info">
            <h3 class="album-title">{{ album.title || album.name || 'Album sans titre' }}</h3>
            <p class="album-artist">{{ album.artist || 'Artiste inconnu' }}</p>
            
            <div class="album-meta">
              <span class="meta-item">
                <span class="meta-icon">🎵</span>
                {{ album.musics?.length || 0 }} titres
              </span>
              <span class="meta-item">
                <span class="meta-icon">📅</span>
                {{ formatDate(album.addedAt || album.createdAt) }}
              </span>
              <span v-if="album.year" class="meta-item">
                <span class="meta-icon">📅</span>
                {{ album.year }}
              </span>
            </div>

            <!-- Liste des musiques de l'album -->
            <div v-if="album.musics && album.musics.length > 0" class="album-tracks">
              <div class="tracks-header">
                <h4>Title</h4>
                <button @click="toggleAlbumTracks(album)" class="toggle-tracks-btn">
                  {{ showAlbumTracks[album.id] ? '−' : '+' }}
                </button>
              </div>
              
              <div v-if="showAlbumTracks[album.id]" class="tracks-list">
                <div 
                  v-for="(music, index) in album.musics" 
                  :key="index"
                  class="track-item"
                  @click.stop="playMusic(music)"
                >
                  <span class="track-number">{{ index + 1 }}.</span>
                  <span class="track-title">
                    {{ getMusicTitle(music) }}
                  </span>
                  <span class="track-artist">
                    {{ getMusicArtist(music) }}
                  </span>
                  <button 
                    @click.stop="playMusic(music)"
                    class="track-play-btn"
    
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="album-actions">
            <button 
              @click.stop="playAlbum(album)"
              class="action-btn play-btn"
 
            >
              ▶
            </button>
            <button 
              @click.stop="saveAlbumAsPlaylist(album)"
              class="action-btn save-btn"
 
            >
              📁
            </button>
            <button 
              @click.stop="deleteAlbum(album)"
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
              <div 
                v-for="(music, index) in currentPlaylist.musics" 
                :key="index"
                class="music-item"
                @click="playMusic(music)"
              >
                <span class="music-number">{{ index + 1 }}.</span>
                <div class="music-info">
                  <span class="music-title">
                    {{ getMusicTitle(music) }}
                  </span>
                  <span class="music-details">
                    {{ getMusicArtist(music) }} • {{ getMusicAlbum(music) }}
                  </span>
                </div>
                <div class="music-actions">
                  <button 
                    @click.stop="playMusic(music)"
                    class="action-btn small play-btn"
            
                  >
                    ▶
                  </button>
                  <button 
                    @click.stop="removeFromPlaylist(music, index)"
                    class="action-btn small delete-btn"
           
                  >
                    ✕
                  </button>
                </div>
              </div>
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

    <!-- Modal de création d'album -->
    <div v-if="showAlbumModal" class="modal-overlay" @click.self="closeAlbumModal">
      <div class="modal-content album-modal">
        <div class="modal-header">
          <h2>Sauvegarder comme album</h2>
          <button @click="closeAlbumModal" class="close-modal-btn">×</button>
        </div>

        <div class="album-form">
          <div class="form-group">
            <label for="albumTitle">Titre de l'album</label>
            <input 
              id="albumTitle"
              v-model="newAlbum.title"
              placeholder="Ex: Mes meilleurs titres 2024"
              required
            />
          </div>

          <div class="form-group">
            <label for="albumArtist">Artist</label>
            <input 
              id="albumArtist"
              v-model="newAlbum.artist"
              placeholder="Nom de l'artiste"
            />
          </div>

          <div class="form-group">
            <label for="albumYear">Year</label>
            <input 
              id="albumYear"
              v-model="newAlbum.year"
              type="number"
              placeholder="2024"
              min="1900"
              :max="new Date().getFullYear()"
            />
          </div>

          <div class="form-group">
            <label for="albumCover">URL de la couverture</label>
            <input 
              id="albumCover"
              v-model="newAlbum.cover"
              placeholder="https://exemple.com/image.jpg"
            />
          </div>

          <div class="album-preview">
            <h4>Aperçu des musiques ({{ newAlbum.musics?.length || 0 }})</h4>
            <div v-if="newAlbum.musics && newAlbum.musics.length > 0" class="preview-tracks">
              <div 
                v-for="(music, index) in newAlbum.musics.slice(0, 5)" 
                :key="index"
                class="preview-track"
              >
                {{ index + 1 }}. {{ getMusicTitle(music) }}
              </div>
              <div v-if="newAlbum.musics.length > 5" class="more-tracks">
                ...et {{ newAlbum.musics.length - 5 }} autres titres
              </div>
            </div>
            <p v-else>Aucune musique à sauvegarder</p>
          </div>

          <div class="modal-actions">
            <button @click="saveAlbum" class="save-btn" :disabled="!newAlbum.title">
              💾 Sauvegarder l'album
            </button>
            <button @click="closeAlbumModal" class="cancel-btn">Annuler</button>
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
export default {
  name: 'PlaylistManager',
  
  data() {
    return {
      activeTab: 'playlists',
      playlists: [],
      albums: [],
      newPlaylistName: '',
      showPlaylistModal: false,
      showAlbumModal: false,
      currentPlaylist: null,
      newAlbum: {
        title: '',
        artist: '',
        year: new Date().getFullYear(),
        cover: '',
        musics: []
      },
      newMusicName: '',
      notification: {
        show: false,
        message: '',
        type: 'info'
      },
      showAlbumTracks: {}
    };
  },

  async created() {
    await this.loadPlaylists();
    await this.loadAlbums();
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
        const response = await fetch('http://localhost:3000/playlists');
        if (!response.ok) {
          // Essayer avec /api/playlists si /playlists échoue
          const response2 = await fetch('http://localhost:3000/api/playlists');
          if (!response2.ok) throw new Error('Erreur chargement playlists');
          this.playlists = await response2.json();
        } else {
          this.playlists = await response.json();
        }
        
        console.log('Playlists chargées:', this.playlists);
        this.showNotification('Playlists chargées', 'success');
      } catch (error) {
        console.error('Erreur chargement playlists:', error);
        this.showNotification('Erreur chargement playlists', 'error');
      }
    },

    async loadAlbums() {
      try {
        const response = await fetch('http://localhost:3000/albums');
        if (!response.ok) {
          // Essayer avec /api/albums si /albums échoue
          const response2 = await fetch('http://localhost:3000/api/albums');
          if (!response2.ok) {
            console.warn('Aucun album trouvé');
            this.albums = [];
            return;
          }
          this.albums = await response2.json();
        } else {
          this.albums = await response.json();
        }
        
        console.log('Albums chargés:', this.albums);
      } catch (error) {
        console.error('Erreur chargement albums:', error);
        this.albums = [];
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

    async createPlaylist() {
      const name = this.newPlaylistName.trim();
      if (!name) {
        this.showNotification('Veuillez entrer un nom', 'error');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/playlists', {
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
        this.showNotification(`Playlist "${name}" créée`, 'success');
      } catch (error) {
        console.error('Erreur création playlist:', error);
        this.showNotification('Erreur création playlist', 'error');
      }
    },

    async deletePlaylist(playlist) {
      if (!confirm(`Supprimer la playlist "${playlist.name}" ?`)) return;

      try {
        // Essayer avec /playlists/:id
        let response = await fetch(`http://localhost:3000/playlists/${playlist.id}`, {
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
        this.showNotification(`Playlist "${playlist.name}" supprimée`, 'success');
      } catch (error) {
        console.error('Erreur suppression playlist:', error);
        this.showNotification('Erreur suppression playlist', 'error');
      }
    },

    viewPlaylistDetail(playlist) {
      this.currentPlaylist = playlist;
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
        let response = await fetch(`http://localhost:3000/playlists/${this.currentPlaylist.id}/add-music`, {
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
        this.showNotification('Musique ajoutée', 'success');
      } catch (error) {
        console.error('Erreur ajout musique:', error);
        this.showNotification('Erreur ajout musique', 'error');
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
        const response = await fetch(`http://localhost:3000/playlists/${this.currentPlaylist.id}`, {
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
        this.showNotification('Musique ajoutée', 'success');
      } catch (error) {
        console.error('Erreur mise à jour playlist:', error);
        this.showNotification('Musique ajoutée localement', 'warning');
      }
    },

    async removeFromPlaylist(music, index) {
      if (!this.currentPlaylist) return;

      const musicTitle = this.getMusicTitle(music);
      if (!confirm(`Retirer "${musicTitle}" de la playlist ?`)) return;

      try {
        // Essayer avec DELETE spécifique
        let response;
        
        if (music.id) {
          // Si la musique a un ID
          response = await fetch(
            `http://localhost:3000/playlists/${this.currentPlaylist.id}/musics/${music.id}`, 
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
        const updateResponse = await fetch(`http://localhost:3000/playlists/${this.currentPlaylist.id}`, {
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
        
        this.showNotification('Musique retirée', 'success');
      } catch (error) {
        console.error('Erreur suppression musique:', error);
        this.showNotification('Musique retirée localement', 'warning');
      }
    },

    playPlaylist(playlist) {
      console.log('Lire playlist:', playlist.name);
      if (playlist.musics && playlist.musics.length > 0) {
        this.showNotification(`Lecture de "${playlist.name}"`, 'info');
        this.$emit('play-musics', playlist.musics);
      } else {
        this.showNotification('Playlist vide', 'warning');
      }
    },

    playAlbum(album) {
      console.log('Lire album:', album.title || album.name);
      if (album.musics && album.musics.length > 0) {
        this.showNotification(`Lecture de "${album.title || album.name}"`, 'info');
        this.$emit('play-musics', album.musics);
      } else {
        this.showNotification('Album vide', 'warning');
      }
    },

    playMusic(music) {
      console.log('Lire musique:', this.getMusicTitle(music));
      this.$emit('play-music', music);
      this.showNotification(`Lecture de "${this.getMusicTitle(music)}"`, 'info');
    },

    saveAlbumAsPlaylist(album) {
      // Ouvrir le modal d'album pré-rempli
      this.newAlbum = {
        title: album.title || album.name || 'Nouvel album',
        artist: album.artist || 'Artiste inconnu',
        year: album.year || new Date().getFullYear(),
        cover: album.cover || '',
        musics: album.musics || []
      };
      this.showAlbumModal = true;
    },

    editPlaylist(playlist) {
      const newName = prompt('Nouveau nom:', playlist.name);
      if (newName && newName.trim() !== playlist.name) {
        this.renamePlaylist(playlist, newName.trim());
      }
    },

    async renamePlaylist(playlist, newName) {
      try {
        const response = await fetch(`http://localhost:3000/playlists/${playlist.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: newName,
            updatedAt: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const response2 = await fetch(`http://localhost:3000/api/playlists/${playlist.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: newName,
              updatedAt: new Date().toISOString()
            })
          });
          
          if (!response2.ok) throw new Error('Erreur renommage');
        }
        
        playlist.name = newName;
        this.showNotification('Playlist renommée', 'success');
      } catch (error) {
        console.error('Erreur renommage playlist:', error);
        this.showNotification('Erreur renommage playlist', 'error');
      }
    },

    openAlbumModal(playlist) {
      this.newAlbum = {
        title: playlist.name,
        artist: 'Artiste inconnu',
        year: new Date().getFullYear(),
        cover: playlist.cover || '',
        musics: playlist.musics || []
      };
      this.showAlbumModal = true;
    },

    closeAlbumModal() {
      this.showAlbumModal = false;
      this.newAlbum = {
        title: '',
        artist: '',
        year: new Date().getFullYear(),
        cover: '',
        musics: []
      };
    },

    async saveAlbum() {
      if (!this.newAlbum.title.trim()) {
        this.showNotification('Titre requis', 'error');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/albums', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newAlbum)
        });

        if (!response.ok) {
          // Essayer avec /api/albums
          const response2 = await fetch('http://localhost:3000/api/albums', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.newAlbum)
          });
          
          if (!response2.ok) throw new Error('Erreur sauvegarde album');
          
          const savedAlbum = await response2.json();
          this.albums.push(savedAlbum);
        } else {
          const savedAlbum = await response.json();
          this.albums.push(savedAlbum);
        }
        
        this.closeAlbumModal();
        this.showNotification('Album sauvegardé', 'success');
      } catch (error) {
        console.error('Erreur sauvegarde album:', error);
        this.showNotification('Erreur sauvegarde album', 'error');
      }
    },

    async deleteAlbum(album) {
      const albumName = album.title || album.name;
      if (!confirm(`Supprimer l'album "${albumName}" ?`)) return;

      try {
        const response = await fetch(`http://localhost:3000/albums/${album.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const response2 = await fetch(`http://localhost:3000/api/albums/${album.id}`, {
            method: 'DELETE'
          });
          
          if (!response2.ok) throw new Error('Erreur suppression');
        }

        this.albums = this.albums.filter(a => a.id !== album.id);
        this.showNotification(`Album "${albumName}" supprimé`, 'success');
      } catch (error) {
        console.error('Erreur suppression album:', error);
        this.showNotification('Erreur suppression album', 'error');
      }
    },

    toggleAlbumTracks(album) {
      this.$set(this.showAlbumTracks, album.id, !this.showAlbumTracks[album.id]);
    },

    async refreshAll() {
      await this.loadPlaylists();
      await this.loadAlbums();
      this.showNotification('Tout rafraîchi', 'success');
    },

    refreshAlbums() {
      this.loadAlbums();
      this.showNotification('Albums rafraîchis', 'info');
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

    showNotification(message, type = 'info') {
      this.notification = { show: true, message, type };
      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    }
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