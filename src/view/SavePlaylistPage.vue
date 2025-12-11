<template>
  <div class="container">
    <h2>Mes Playlists</h2>

    <!-- Liste des playlists -->
    <div v-for="(pl, index) in playlists" :key="index" class="playlist-item">
      <div class="playlist-header">
        <h3 @click="selectPlaylist(pl)">
          🎵 {{ pl.name }}
        </h3>
        <div class="playlist-actions">
          <button @click.stop="savePlaylistToAlbums(pl)" class="save-btn" title="Sauvegarder comme album">
            💾
          </button>
          <button @click.stop="deletePlaylist(pl)" class="delete-btn" title="Supprimer playlist">
            🗑️
          </button>
        </div>
      </div>

      <!-- Affichage des musiques si playlist sélectionnée -->
      <div v-if="selectedPlaylist === pl" class="musics">
        <div v-if="pl.musics && pl.musics.length > 0">
          <div v-for="(music, i) in pl.musics" :key="i" class="music-item">
            <span>{{ music }}</span>
            <button @click="removeMusic(pl, i)" class="remove-music-btn" title="Supprimer">
              ❌
            </button>
          </div>
        </div>
        <div v-else class="no-musics">
          Aucune musique dans cette playlist
        </div>

        <div class="add-music">
          <input v-model="newMusic" placeholder="Ajouter musique..." @keyup.enter="addMusic(pl)" />
          <button @click="addMusic(pl)">Ajouter</button>
        </div>
      </div>
    </div>

    <!-- Bouton pour afficher/masquer le formulaire de création -->
    <button @click="showNewPlaylistForm = !showNewPlaylistForm" class="toggle-form-btn">
      {{ showNewPlaylistForm ? 'Annuler' : 'Ajouter playlist' }}
    </button>

    <!-- Formulaire pour créer une nouvelle playlist (affiché conditionnellement) -->
    <div v-if="showNewPlaylistForm" class="new-playlist">
      <input v-model="newPlaylistName" placeholder="Nom de la nouvelle playlist" @keyup.enter="createNewPlaylist" />
      <button @click="createNewPlaylist">Créer playlist</button>
    </div>

    <!-- Section Albums -->
    <div class="albums-section">
      <h3>📚 Albums</h3>
      <button @click="loadAlbums" class="load-albums-btn">
        🔄 Charger/Rafraîchir les albums
      </button>
      
      <div v-if="albums.length > 0">
        <div v-for="(album, index) in albums" :key="index" class="album-item">
          <h4>{{ album.name }}</h4>
          <div class="album-info">
            <small>Musiques: {{ album.musics ? album.musics.length : 0 }} | Type: {{ album.type }}</small>
          </div>
          <div v-if="album.musics && album.musics.length > 0" class="album-musics">
            <div v-for="(music, i) in album.musics.slice(0, 3)" :key="i" class="album-music">
              {{ music }}
            </div>
            <div v-if="album.musics.length > 3" class="more-musics">
              ... et {{ album.musics.length - 3 }} plus
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-albums">
        Aucun album sauvegardé. Cliquez sur "💾 Album" pour sauvegarder une playlist.
      </div>
    </div>
  </div>
</template>

<script>
// Import ou définition de Toast (vous devrez peut-être installer une librairie)
// Si vous n'avez pas de librairie Toast, voici une implémentation simple
const Toast = {
  success: (message) => {
    showNotification(message, 'success');
  },
  error: (message) => {
    showNotification(message, 'error');
  },
  info: (message) => {
    showNotification(message, 'info');
  }
};

function showNotification(message, type) {
  // Créer un élément de notification
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Couleurs selon le type
  if (type === 'success') {
    toast.style.background = '#28a745';
  } else if (type === 'error') {
    toast.style.background = '#dc3545';
  } else if (type === 'info') {
    toast.style.background = '#17a2b8';
  }
  
  // Ajouter l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Ajouter au DOM
  document.body.appendChild(toast);
  
  // Supprimer après 3 secondes
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

export default {
  name: 'PlaylistManager',
  data() {
    return {
      playlists: [],
      selectedPlaylist: null,
      newMusic: "",
      newPlaylistName: "",
      showNewPlaylistForm: false,
      albums: []
    };
  },

  async created() {
    await this.loadPlaylists();
    await this.loadAlbums();
  },

  methods: {
    async loadPlaylists() {
      try {
        const res = await fetch("http://localhost:3000/api/playlists");
        this.playlists = await res.json();
      } catch (err) {
        console.error("Erreur chargement playlists:", err);
        this.playlists = [];
      }
    },

    async loadAlbums() {
      try {
        const res = await fetch("http://localhost:3000/api/albums");
        this.albums = await res.json();
        console.log("Albums chargés:", this.albums);
      } catch (err) {
        console.error("Erreur chargement albums:", err);
        this.albums = [];
      }
    },

    async createNewPlaylist() {
      const name = this.newPlaylistName.trim();
      if (!name) {
        Toast.error("Veuillez entrer un nom pour la playlist");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/playlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, musics: [] })
        });

        const newPl = await res.json();
        this.playlists.push(newPl);
        this.newPlaylistName = "";
        this.showNewPlaylistForm = false;
        Toast.success(`Playlist "${name}" créée avec succès!`);
      } catch (err) {
        console.error("Erreur création playlist:", err);
        Toast.error("Erreur lors de la création de la playlist");
      }
    },

    selectPlaylist(pl) {
      this.selectedPlaylist = this.selectedPlaylist === pl ? null : pl;
    },

    async addMusic(pl) {
      const music = this.newMusic.trim();
      if (!music) {
        Toast.error("Veuillez entrer un nom de musique");
        return;
      }

      try {
        await fetch(`http://localhost:3000/api/playlists/${pl.id}/add-music`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ music })
        });

        if (!pl.musics) {
          pl.musics = [];
        }
        pl.musics.push(music);
        this.newMusic = "";
        Toast.success(`"${music}" ajoutée à "${pl.name}"`);
      } catch (err) {
        console.error("Erreur ajout musique:", err);
        Toast.error("Erreur lors de l'ajout de la musique");
      }
    },

    async removeMusic(pl, index) {
      const musicName = pl.musics[index];
      
      // Créer une modal de confirmation custom
      if (!await this.confirmAction(
        `Supprimer "${musicName}"`, 
        `Êtes-vous sûr de vouloir supprimer "${musicName}" de la playlist "${pl.name}" ?`
      )) {
        return;
      }

      try {
        await fetch(`http://localhost:3000/api/playlists/${pl.id}/remove-music`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index })
        });

        pl.musics.splice(index, 1);
        Toast.success(`"${musicName}" supprimée de "${pl.name}"`);
      } catch (err) {
        console.error("Erreur suppression musique:", err);
        pl.musics.splice(index, 1); // Suppression locale en cas d'erreur
        Toast.success(`"${musicName}" supprimée`);
      }
    },

    /* async deletePlaylist(pl) {
      // Confirmation custom
      if (!await this.confirmAction(
        `Supprimer la playlist`, 
        `Êtes-vous sûr de vouloir supprimer définitivement la playlist "${pl.name}" ?`
      )) {
        return;
      }

      try {
        await fetch(`http://localhost:3000/playlists/${pl.id}`, {
          method: "DELETE"
        });

        this.playlists = this.playlists.filter(p => p.id !== pl.id);
        Toast.success(`Playlist "${pl.name}" supprimée`);
      } catch (err) {
        console.error("Erreur suppression playlist:", err);
        // Suppression locale en cas d'erreur
        this.playlists = this.playlists.filter(p => p.id !== pl.id);
        Toast.success(`Playlist "${pl.name}" supprimée`);
      }
    }, */
    async deletePlaylist(pl) {
  // Confirmation custom
  if (!await this.confirmAction(
    `Supprimer la playlist`, 
    `Êtes-vous sûr de vouloir supprimer définitivement la playlist "${pl.name}" ?`
  )) {
    return;
  }

  try {
    // Envoyer la requête DELETE au backend
    const response = await fetch(`http://localhost:3000/api/playlists/${pl.id}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Supprimer localement seulement après confirmation du serveur
    this.playlists = this.playlists.filter(p => p.id !== pl.id);
    Toast.success(`Playlist "${pl.name}" supprimée`);
    
  } catch (err) {
    console.error("Erreur suppression playlist:", err);
    
    // Option: donner le choix à l'utilisateur
    if (await this.confirmAction(
      'Erreur de connexion',
      'Impossible de contacter le serveur. Voulez-vous supprimer localement?'
    )) {
      this.playlists = this.playlists.filter(p => p.id !== pl.id);
      Toast.success(`Playlist "${pl.name}" supprimée localement`);
    }
  }
},

    async savePlaylistToAlbums(pl) {
      if (!pl.musics || pl.musics.length === 0) {
        Toast.error("Impossible de sauvegarder: la playlist est vide");
        return;
      }

      try {
        // Créer un input custom pour le nom de l'album
        const albumName = await this.promptInput(
          "Nom de l'album",
          `Album: ${pl.name}`,
          "Entrez le nom pour votre nouvel album"
        );
        
        if (!albumName) return;

        const res = await fetch("http://localhost:3000/api/albums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: albumName,
            musics: [...pl.musics],
            type: "playlist"
          })
        });

        const result = await res.json();
        
        if (result.success) {
          Toast.success(`Album "${albumName}" créé avec ${pl.musics.length} musiques`);
          await this.loadAlbums(); // Recharger la liste des albums
        } else {
          Toast.error("Erreur lors de la création de l'album");
        }
      } catch (err) {
        console.error("Erreur sauvegarde album:", err);
        Toast.error("Erreur lors de la sauvegarde");
      }
    },

    // Méthode pour créer une confirmation custom
    confirmAction(title, message) {
      return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
              <button class="modal-cancel">Annuler</button>
              <button class="modal-confirm">Confirmer</button>
            </div>
          </div>
        `;
        
        // Styles
        const style = document.createElement('style');
        style.textContent = `
          .custom-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
          }
          .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
          }
          .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #222;
            padding: 20px;
            border-radius: 10px;
            min-width: 300px;
            border: 2px solid #3a8dff;
          }
          .modal-content h3 {
            color: #ff6b6b;
            margin-top: 0;
          }
          .modal-content p {
            margin: 15px 0;
            color: #ddd;
          }
          .modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          .modal-cancel {
            padding: 8px 16px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .modal-confirm {
            padding: 8px 16px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .modal-cancel:hover {
            background: #5a6268;
          }
          .modal-confirm:hover {
            background: #c82333;
          }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Gestion des clics
        modal.querySelector('.modal-cancel').onclick = () => {
          document.body.removeChild(modal);
          document.head.removeChild(style);
          resolve(false);
        };
        
        modal.querySelector('.modal-confirm').onclick = () => {
          document.body.removeChild(modal);
          document.head.removeChild(style);
          resolve(true);
        };
      });
    },

    // Méthode pour créer un prompt custom
    promptInput(title, defaultValue, placeholder) {
      return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-prompt';
        modal.innerHTML = `
          <div class="prompt-overlay"></div>
          <div class="prompt-content">
            <h3>${title}</h3>
            <input type="text" value="${defaultValue}" placeholder="${placeholder}" />
            <div class="prompt-buttons">
              <button class="prompt-cancel">Annuler</button>
              <button class="prompt-ok">OK</button>
            </div>
          </div>
        `;
        
        // Styles
        const style = document.createElement('style');
        style.textContent = `
          .custom-prompt {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
          }
          .prompt-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
          }
          .prompt-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #222;
            padding: 20px;
            border-radius: 10px;
            min-width: 300px;
            border: 2px solid #28a745;
          }
          .prompt-content h3 {
            color: #28a745;
            margin-top: 0;
          }
          .prompt-content input {
            width: 100%;
            padding: 10px;
            margin: 15px 0;
            border: 2px solid #333;
            border-radius: 6px;
            background: #111;
            color: white;
            font-size: 14px;
          }
          .prompt-content input:focus {
            outline: none;
            border-color: #28a745;
          }
          .prompt-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          .prompt-cancel {
            padding: 8px 16px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .prompt-ok {
            padding: 8px 16px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .prompt-cancel:hover {
            background: #5a6268;
          }
          .prompt-ok:hover {
            background: #218838;
          }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        const input = modal.querySelector('input');
        input.focus();
        input.select();
        
        // Gestion des clics
        modal.querySelector('.prompt-cancel').onclick = () => {
          document.body.removeChild(modal);
          document.head.removeChild(style);
          resolve(null);
        };
        
        modal.querySelector('.prompt-ok').onclick = () => {
          const value = input.value.trim();
          document.body.removeChild(modal);
          document.head.removeChild(style);
          resolve(value);
        };
        
        // Entrée pour valider
        input.onkeyup = (e) => {
          if (e.key === 'Enter') {
            const value = input.value.trim();
            document.body.removeChild(modal);
            document.head.removeChild(style);
            resolve(value);
          }
        };
      });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
  background: #000;
  color: white;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.playlist-item {
  background: #111;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 10px;
  border-left: 4px solid #3a8dff;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 10px;
}

.playlist-header h3 {
  margin: 0;
  flex: 1;
  color: #3a8dff;
  font-size: 18px;
}

.playlist-header h3:hover {
  color: #6bb0ff;
}

.playlist-actions {
  display: flex;
  gap: 10px;
}

.save-btn, .delete-btn, .remove-music-btn {
  background: transparent;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background: #28a745;
  border-color: #28a745;
}

.delete-btn:hover {
  background: #dc3545;
  border-color: #dc3545;
}

.musics {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #333;
}

.music-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #222;
  margin-bottom: 8px;
  border-radius: 6px;
  border-left: 3px solid #28a745;
}

.remove-music-btn:hover {
  background: #dc3545;
  border-color: #dc3545;
}

.no-musics {
  padding: 10px;
  color: #888;
  font-style: italic;
  text-align: center;
  background: #222;
  border-radius: 6px;
  margin-bottom: 10px;
}

.add-music {
  display: flex;
  margin-top: 15px;
  gap: 10px;
}

.add-music input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 2px solid #333;
  background: #222;
  color: white;
  font-size: 14px;
}

.add-music input:focus {
  outline: none;
  border-color: #3a8dff;
}

.add-music button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #3a8dff;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.add-music button:hover {
  background: #6bb0ff;
}

.toggle-form-btn {
  display: block;
  width: 100%;
  margin: 20px 0;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: #3a8dff;
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.toggle-form-btn:hover {
  background: #6bb0ff;
}

.new-playlist {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  padding: 20px;
  background: #111;
  border-radius: 10px;
}

.new-playlist input {
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  border: 2px solid #333;
  background: #222;
  color: white;
  font-size: 16px;
}

.new-playlist button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background: #28a745;
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.new-playlist button:hover {
  background: #34ce57;
}

.albums-section {
  margin-top: 30px;
  padding: 20px;
  background: #111;
  border-radius: 10px;
  border-top: 3px solid #ffc107;
}

.albums-section h3 {
  color: #ffc107;
  margin-bottom: 15px;
  font-size: 20px;
}

.load-albums-btn {
  display: block;
  width: 100%;
  margin: 15px 0;
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #17a2b8;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.load-albums-btn:hover {
  background: #138496;
}

.album-item {
  background: #222;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.album-item h4 {
  margin: 0 0 5px 0;
  color: #ffd54f;
}

.album-info {
  color: #aaa;
  font-size: 12px;
  margin-bottom: 10px;
}

.album-musics {
  margin-top: 10px;
}

.album-music {
  padding: 6px 10px;
  background: #333;
  margin-bottom: 5px;
  border-radius: 4px;
  font-size: 13px;
}

.more-musics {
  color: #888;
  font-style: italic;
  font-size: 12px;
  text-align: center;
  padding: 5px;
}

.no-albums {
  padding: 20px;
  color: #888;
  font-style: italic;
  text-align: center;
  background: #222;
  border-radius: 6px;
}
</style>

<style>
/* Styles globaux pour les notifications Toast */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.toast-success {
  background: #28a745;
  border-left: 4px solid #1e7e34;
}

.toast-error {
  background: #dc3545;
  border-left: 4px solid #bd2130;
}

.toast-info {
  background: #17a2b8;
  border-left: 4px solid #117a8b;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Styles pour les modales (doivent être globaux) */
.custom-modal,
.custom-prompt {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.modal-overlay,
.prompt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
}

.modal-content,
.prompt-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #222;
  padding: 20px;
  border-radius: 10px;
  min-width: 300px;
}

.modal-content {
  border: 2px solid #3a8dff;
}

.prompt-content {
  border: 2px solid #28a745;
}

.modal-content h3 {
  color: #ff6b6b;
  margin-top: 0;
}

.prompt-content h3 {
  color: #28a745;
  margin-top: 0;
}

.modal-content p {
  margin: 15px 0;
  color: #ddd;
}

.prompt-content input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border: 2px solid #333;
  border-radius: 6px;
  background: #111;
  color: white;
  font-size: 14px;
}

.prompt-content input:focus {
  outline: none;
  border-color: #28a745;
}

.modal-buttons,
.prompt-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-cancel,
.prompt-cancel {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.modal-confirm {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.prompt-ok {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.modal-cancel:hover,
.prompt-cancel:hover {
  background: #5a6268;
}

.modal-confirm:hover {
  background: #c82333;
}

.prompt-ok:hover {
  background: #218838;
}
</style>