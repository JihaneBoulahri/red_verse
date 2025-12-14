<template>
  <div class="favorites">
    <h1>❤️ Favorites</h1>

    <button @click="load" class="refresh-btn">🔄 Refresh</button>

    <div v-if="loading" class="loading">Loading..</div>

    <div v-else-if="favorites.length === 0" class="empty">
      No favorite at the moment
    </div>

    <div v-else>
      <!-- Stats -->
      <div class="stats">
        <span class="stat">🎵 {{ favorites.length }} titles</span>
        <span class="stat">🎤 {{ uniqueArtists }} artists</span>
        <span class="stat">💿 {{ uniqueAlbums }} albums</span>
      </div>

      <!-- Track cards -->
      <div class="favorites-list">
        <TrackCard
          v-for="track in mappedTracks"
          :key="track.id"
          :track="track"
          @play="playTrack"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TrackCard from "../components/TrackCard.vue";
import { Toast } from "../ui/Toast.js";
import player from '../services/player'

export default {
  name: "Favorites",
  components: { TrackCard },

  data() {
    return {
      favorites: [],
      loading: false
    };
  },

  computed: {
    /* 🔁 Transform favorites → Deezer-like track */
    mappedTracks() {
      return this.favorites.map(f => ({
        id: f.deezerId || f.id,

        title: f.music || "Unknown title",
        preview: f.preview || null,

        artist: {
          name: f.artist || "Unknown artist"
        },

        album: {
          title: f.album || "Unknown album",
          cover_small: f.cover_small || null,
          cover_medium: f.cover_medium || null
        }
      }));
    },

    uniqueArtists() {
      return [
        ...new Set(
          this.favorites
            .map(f => f.artist)
            .filter(a => a && a !== "Unknown artist")
        )
      ].length;
    },

    uniqueAlbums() {
      return [
        ...new Set(
          this.favorites
            .map(f => f.album)
            .filter(a => a && a !== "Unknown album")
        )
      ].length;
    }
  },

  async created() {
    await this.load();
  },

  methods: {
    async load() {
      this.loading = true;
      try {
        const res = await fetch("http://localhost:3000/api/favorites");
        const data = await res.json();

        if (Array.isArray(data)) this.favorites = data;
        else if (data?.favorites) this.favorites = data.favorites;
        else if (data?.data) this.favorites = data.data;
        else this.favorites = [];
      } catch (err) {
        Toast.error("Unable to load favorites");
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    /* ▶️ Play preview via global player */
    playTrack(track) {
      if (!track.preview) {
        Toast.info("No preview available");
        return;
      }
      player.play(track)
    }
  }
};
</script>

<style scoped>
.favorites {
  padding: 30px;
  min-height: 100vh;
  background: #000;
  color: white;
}

h1 {
  text-align: center;
  margin-bottom: 25px;
  color: #ff6b6b;
}

.refresh-btn {
  display: block;
  margin: 0 auto 25px;
  padding: 10px 22px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.loading,
.empty {
  text-align: center;
  margin-top: 40px;
  color: #aaa;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.stat {
  background: rgba(255, 255, 255, 0.08);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
