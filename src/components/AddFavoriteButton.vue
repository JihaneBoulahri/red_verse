<template>
  <button 
    @click="toggleFavorite" 
    class="fav-btn"
    :class="{ 'active': isFavorite }"
  >
    {{ isFavorite ? "★" : "☆" }}
  </button>
</template>

<script>
import { Toast } from "../ui/Toast.js";
export default {
  name: 'AddFavoritesButton',
  props: {
    music: { 
      type: String, 
      required: true,
      validator: (value) => value && value.trim().length > 0
    },
    album: { 
      type: String, 
      default: "Unknown" 
    }
  },

  data() {
    return { 
      isFavorite: false,
      loading: false,
      favoriteId: null 
    };
  },

  async created() {
    await this.checkFavoriteStatus();
  },

  watch: {
    music: {
      immediate: true,
      handler() {
        this.checkFavoriteStatus();
      }
    }
  },

  methods: {
    async checkFavoriteStatus() {
      try {
        const res = await fetch("http://localhost:3000/api/favorites");
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const favs = await res.json();

        // Chercher le favori correspondant
        const fav = favs.find(f => f.music === this.music.trim());
        this.isFavorite = !!fav;
        this.favoriteId = fav ? fav.id : null;
      } catch (error) {
        Toast.error("Favorite check error:", error);
      }
    },

    async toggleFavorite() {
      if (this.loading) return;
      this.loading = true;
      const previousState = this.isFavorite;

      try {
        // Mettre à jour
        this.isFavorite = !this.isFavorite;

        if (!this.isFavorite) {
          // Supprimer le favori
          if (!this.favoriteId) throw new Error("Unable to delete: Missing ID");

          const response = await fetch(`http://localhost:3000/api/favorites/${this.favoriteId}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
          }

          console.log(`Favori supprimé: "${this.music}"`);
          this.favoriteId = null; // reset ID après suppression
        } else {
          // Ajouter aux favoris
          const response = await fetch("http://localhost:3000/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ music: this.music.trim(), album: this.album })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
          }

          const data = await response.json();
          Toast.success(`Favorite added: "${this.music}"`);
          this.favoriteId = data.favorite.id; 
        }

        // Émettre un événement vers le parent
        this.$emit('favorite-toggled', { music: this.music, isFavorite: this.isFavorite });

      } catch (error) {
        this.isFavorite = previousState;
        console.error("Error toggle favorite:", error);
        Toast.error(`Error: ${error.message}`);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.fav-btn {
  font-size: 22px;
  background: none;
  border: none;
  cursor: pointer;
  color: #95a5a6;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.fav-btn:hover {
  background: rgba(255, 215, 0, 0.1);
  color: #f1c40f;
  transform: scale(1.05);
}

.fav-btn.active {
  color: gold;
  animation: pulse 0.5s ease;
}

.fav-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.fav-text {
  font-size: 14px;
  color: inherit;
  font-weight: 500;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.fav-btn:active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to { transform: translate(-50%, -50%) scale(20); opacity: 0; }
}
</style>
