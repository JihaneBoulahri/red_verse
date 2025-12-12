<template>
  <div class="favorites">
    <h1>❤️ Favorites</h1>

    <button @click="load" class="refresh-btn">🔄 Rafraîchir</button>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="favorites.length === 0" class="empty">
      Aucun favori pour le moment
    </div>

    <div v-else class="favorites-list">
      <div class="stats">
        <span class="stat">🎵 {{ favorites.length }} titres</span>
        <span class="stat">🎤 {{ uniqueArtists }} artistes</span>
        <span class="stat">💿 {{ uniqueAlbums }} albums</span>
      </div>

      <div v-for="(f, i) in favorites" :key="f.id || i" class="item">
        <div class="item-content">
          <div class="music-info">
            <h3>{{ f.music }}</h3>
            <div class="meta">
              <span v-if="f.artist && f.artist !== 'Unknown Artist'" class="artist">
                🎤 {{ f.artist }}
              </span>
              <span v-if="f.album" class="album">💿 {{ f.album }}</span>
              <span class="date" v-if="f.addedAt">
                📅 {{ formatDate(f.addedAt) }}
              </span>
            </div>
            <div class="extra" v-if="f.deezerId || f.preview">
              <span v-if="f.deezerId" class="deezer-id">🎵 Deezer ID: {{ f.deezerId }}</span>
              <button v-if="f.preview" @click.stop="playPreview(f)" class="preview-btn">
                ▶ Écouter
              </button>
            </div>
          </div>
        </div>

        <button class="del-btn" @click="remove(f)" title="Supprimer">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from "../ui/Toast.js";

export default {
  name: 'Favorites',
  data() {
    return { 
      favorites: [],
      loading: false 
    };
  },

  computed: {
    uniqueArtists() {
      const artists = this.favorites
        .map(f => f.artist)
        .filter(artist => artist && artist !== 'Unknown Artist');
      return [...new Set(artists)].length;
    },
    
    uniqueAlbums() {
      const albums = this.favorites
        .map(f => f.album)
        .filter(album => album && album !== 'Unknown Album');
      return [...new Set(albums)].length;
    }
  },

  async created() {
    await this.load();
  },

  methods: {
    async load() {
      this.loading = true;
      try {
        Toast.info("Chargement des favoris...");
        const res = await fetch("http://localhost:3000/api/favorites");
        
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("Données reçues:", data);
        
        // Selon ton format JSON, c'est un tableau d'objets avec id
        if (Array.isArray(data)) {
          this.favorites = data;
        } else if (data && data.favorites && Array.isArray(data.favorites)) {
          this.favorites = data.favorites;
        } else if (data && data.data && Array.isArray(data.data)) {
          this.favorites = data.data;
        } else {
          this.favorites = [];
        }
        
        if (this.favorites.length > 0) {
          Toast.success(`${this.favorites.length} favoris chargés`);
        } else {
          Toast.info("Aucun favori trouvé");
        }
        
      } catch (err) {
        Toast.error("Impossible de charger les favoris");
        console.error("Erreur détaillée:", err);
      } finally {
        this.loading = false;
      }
    },

    async remove(favorite) {
      try {
        // Créer une modal de confirmation custom
        const confirmed = await this.showConfirmDialog(
          "Supprimer des favoris",
          `Êtes-vous sûr de vouloir supprimer "${favorite.music}" des favoris ?`
        );
        
        if (!confirmed) {
          Toast.info("Suppression annulée");
          return;
        }
        
        Toast.info("Suppression en cours...");
        
        // IMPORTANT: Utiliser l'ID pour supprimer, pas le nom de la musique
        // Si ton backend attend l'ID
        const url = favorite.id 
          ? `http://localhost:3000/api/favorites/${favorite.id}`
          : `http://localhost:3000/api/favorites/${encodeURIComponent(favorite.music)}`;
        
        console.log("URL de suppression:", url);
        
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Réponse status:", response.status);
        
        if (response.ok) {
          // Supprimer localement immédiatement
          this.favorites = this.favorites.filter(f => 
            favorite.id ? f.id !== favorite.id : f.music !== favorite.music
          );
          
          Toast.success(`"${favorite.music}" supprimé avec succès !`);
          
          // Recharger après un court délai
          setTimeout(() => this.load(), 500);
          
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Erreur détaillée:", errorData);
          Toast.error(errorData.error || errorData.message || "Échec de la suppression");
        }
        
      } catch (err) {
        Toast.error(`Erreur: ${err.message || "Problème de connexion"}`);
        console.error("Erreur détaillée:", err);
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    playPreview(favorite) {
      if (favorite.preview) {
        const audio = new Audio(favorite.preview);
        audio.play().catch(err => {
          console.error("Erreur lecture audio:", err);
          Toast.error("Impossible de lire l'aperçu");
        });
        Toast.info(`Lecture de "${favorite.music}"`);
      } else {
        Toast.info("Aucun aperçu disponible");
      }
    },

    // Méthode pour créer une confirmation custom (remplace confirm())
    showConfirmDialog(title, message) {
      return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-confirm-modal';
        modal.innerHTML = `
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
              <button class="cancel-btn">Annuler</button>
              <button class="confirm-btn">Supprimer</button>
            </div>
          </div>
        `;
        
        // Styles pour la modal
        const style = document.createElement('style');
        style.textContent = `
          .custom-confirm-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
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
            position: relative;
            background: white;
            padding: 25px;
            border-radius: 12px;
            min-width: 350px;
            max-width: 90%;
            color: #333;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
          }
          .modal-content h3 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #dc3545;
            font-size: 18px;
          }
          .modal-content p {
            margin-bottom: 20px;
            color: #555;
            line-height: 1.5;
          }
          .modal-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }
          .cancel-btn, .confirm-btn {
            padding: 10px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          .cancel-btn {
            background: #6c757d;
            color: white;
          }
          .cancel-btn:hover {
            background: #5a6268;
            transform: translateY(-2px);
          }
          .confirm-btn {
            background: #dc3545;
            color: white;
          }
          .confirm-btn:hover {
            background: #c82333;
            transform: translateY(-2px);
          }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Gestion des clics
        const cancelBtn = modal.querySelector('.cancel-btn');
        const confirmBtn = modal.querySelector('.confirm-btn');
        
        const cleanup = () => {
          document.body.removeChild(modal);
          document.head.removeChild(style);
        };
        
        cancelBtn.onclick = () => {
          cleanup();
          resolve(false);
        };
        
        confirmBtn.onclick = () => {
          cleanup();
          resolve(true);
        };
        
        // Fermer en cliquant sur l'overlay
        modal.querySelector('.modal-overlay').onclick = () => {
          cleanup();
          resolve(false);
        };
      });
    }
  }
};
</script>

<style scoped>
.favorites {
  padding: 30px;
  color: white;
  background: #000;
  min-height: 100vh;
}

h1 {
  color: #ff6b6b;
  margin-bottom: 25px;
  text-align: center;
  font-size: 2.5rem;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

.refresh-btn {
  display: block;
  margin: 0 auto 25px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.refresh-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #667eea;
  font-size: 18px;
}

.empty {
  text-align: center;
  padding: 50px 20px;
  color: #888;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-top: 20px;
  border: 2px dashed #444;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  color: #bdc3c7;
}

.favorites-list {
  margin-top: 20px;
}

.item {
  background: #1a1a1a;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-left: 5px solid #ff6b6b;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.5s ease;
}

.item:hover {
  background: #222;
  transform: translateX(10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.item-content {
  flex: 1;
}

.music-info h3 {
  margin: 0 0 10px 0;
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.artist, .album, .date {
  font-size: 0.9rem;
  color: #bdc3c7;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 12px;
}

.artist {
  color: #64b5f6;
}

.album {
  color: #81c784;
}

.date {
  color: #ffb74d;
}

.extra {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
}

.deezer-id {
  font-size: 0.85rem;
  color: #ce93d8;
  background: rgba(206, 147, 216, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
}

.preview-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-btn:hover {
  background: #388e3c;
  transform: scale(1.05);
}

.del-btn {
  background: #c0392b;
  color: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.del-btn:hover {
  background: #e74c3c;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 0 20px rgba(231, 76, 60, 0.6);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .favorites {
    padding: 20px;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .stats {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .item {
    flex-direction: column;
    padding: 15px;
  }
  
  .meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .del-btn {
    margin-left: 0;
    margin-top: 15px;
    align-self: flex-end;
  }
}
</style>