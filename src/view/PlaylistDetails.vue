<template>
  <div class="playlist-details-page">
    <!-- Header -->
    <div class="playlist-header">
      <button @click="goBack" class="back-btn">← Back</button>
      <div class="header-content">
        <img v-if="playlist.picture_medium" :src="playlist.picture_medium" alt="cover" class="playlist-cover-large" />
        <div class="playlist-info">
          <h1 class="playlist-title-large">{{ playlist.title }}</h1>
          <p class="playlist-desc">{{ playlist.nb_tracks }} tracks</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading tracks…</p>
    </div>

    <!-- Tracks List -->
    <div v-else class="tracks-container">
      <div v-if="tracks.length === 0" class="empty-state">
        <p>No tracks available</p>
      </div>

      <div v-else class="tracks-list">
        <div class="tracks-header">
          <span class="col-number">#</span>
          <span class="col-title">Title</span>
          <span class="col-artist">Artist</span>
          <span class="col-album">Album</span>
          <span class="col-duration">Duration</span>
          <span class="col-action">Action</span>
        </div>

        <div
          class="track-row"
          v-for="(track, index) in tracks"
          :key="track.id"
          @click="player.play(track)"
        >
          <span class="col-number">{{ index + 1 }}</span>
          <span class="col-title">{{ track.title }}</span>
          <span class="col-artist">
            {{ track.artist?.name || 'Artiste inconnu' }}
          </span>
          <span class="col-album">{{ track.album?.title || 'Album inconnu' }}</span>
          <span class="col-duration">{{ formatDuration(track.duration) }}</span>
          <span class="col-action">
            <AddPlaylistButton 
              :music="track.title"
              :album="track.album?.title || 'Unknown'"
              :artist="track.artist?.name || 'Unknown'"
              :preview="track.preview || ''"
              :id="track.id"
              @added="onMusicAddedToPlaylist"
              @playlist-created="onPlaylistCreated"
              
            />
            <AddFavoriteBtn 
              :music="track.title" 
              :album="track.album?.title || 'Unknown'"
              :artist="track.artist?.name || 'Unknown'"
              :id="track.id"
              @click.stop
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Toast } from '../ui/Toast.js';
import AddFavoriteBtn from '../components/AddFavoriteButton.vue';
import AddPlaylistButton from '../components/AddPlaylistButton.vue'
import player from '../services/player';

const router = useRouter();
const route = useRoute();

const playlist = ref({});
const tracks = ref([]);
const loading = ref(true);
const playlistId = ref(null);

// Méthodes pour gérer les événements
const onMusicAddedToPlaylist = (event) => {
  Toast.success(`🎵 ${event.music} added to playlist: ${event.playlist}`);
};

const onPlaylistCreated = (playlist) => {
  Toast.success(`✅ New playlist created: ${playlist.name}`);
};
// Format duration (seconds to MM:SS)
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Go back to playlists
const goBack = () => {
  router.back();
};

onMounted(async () => {
  // Scroll to top
  window.scrollTo(0, 0);
  
  playlistId.value = route.params.id;

  if (!playlistId.value) {
    Toast.error("Playlist not found");
    router.back();
    return;
  }

  try {
    loading.value = true;

    // Get playlist details directly from Deezer API via proxy
    const playlistRes = await fetch(`http://localhost:3000/api/deezer/playlist/${playlistId.value}`);
    if (playlistRes.ok) {
      playlist.value = await playlistRes.json();
    }

    // Get tracks directly from Deezer API via proxy
    const tracksRes = await fetch(`http://localhost:3000/api/deezer/playlist/${playlistId.value}/tracks`);
    if (tracksRes.ok) {
      const data = await tracksRes.json();
      tracks.value = data.data || [];
    }

    if (playlist.value.title) {
      Toast.success(`${playlist.value.title} loaded!`);
    }
  } catch (error) {
    console.error('Error:', error);
    // Fallback: try using Deezer public API directly
    try {
      const playlistRes = await fetch(`https://api.deezer.com/playlist/${playlistId.value}`);
      if (playlistRes.ok) {
        playlist.value = await playlistRes.json();
      }

      const tracksRes = await fetch(`https://api.deezer.com/playlist/${playlistId.value}/tracks`);
      if (tracksRes.ok) {
        const data = await tracksRes.json();
        tracks.value = data.data || [];
      }

      if (playlist.value.title) {
        Toast.success(`${playlist.value.title} loaded!`);
      }
    } catch (fallbackError) {
      console.error('fallbackError:', fallbackError);
      Toast.error("Error loading tracks");
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Container */
.playlist-details-page {
  padding: 20px 40px;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f0a1e 100%);
}

/* Header */
.playlist-header {
  margin-bottom: 30px;
}

.back-btn {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: #ff0000;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.back-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.5);
  transform: translateX(-5px);
}

.header-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.playlist-cover-large {
  width: 200px;
  height: 200px;
  border-radius: 15px;
  object-fit: cover;
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
  animation: slideInLeft 0.6s ease-out;
}

.playlist-info {
  flex: 1;
}

.playlist-title-large {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #ff0000, #ff6666);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.playlist-desc {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 15px;
}

.play-all-btn {
  background: linear-gradient(90deg, #ff0000, #bb0000);
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
}

.play-all-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(255, 0, 0, 0.6);
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
}

/* Tracks Container */
.tracks-container {
  animation: slideInUp 0.6s ease-out;
}

/* Tracks List */
.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.tracks-header {
  display: grid;
  grid-template-columns: 50px 1fr 200px 200px 100px 120px;
  gap: 15px;
  padding: 16px 20px;
  background: rgba(255, 0, 0, 0.15);
  font-weight: 600;
  font-size: 0.95rem;
  color: rgba(255, 0, 0, 0.9);
  border-bottom: 1px solid rgba(255, 0, 0, 0.2);
  position: sticky;
  top: 0;
}

.track-row {
  display: grid;
  grid-template-columns: 50px 1fr 200px 200px 100px 120px;
  gap: 15px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 0, 0, 0.05);
  align-items: center;
  transition: all 0.3s ease;
}

.track-row:hover {
  background: rgba(255, 0, 0, 0.1);
  padding-left: 25px;
}

/* Columns */
.col-number {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.col-title {
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-artist,
.col-album {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-duration {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.col-action {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Track Action Buttons */
.track-play-btn,
.track-like-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 8px;
}

.track-play-btn:hover {
  color: #ff0000;
  transform: scale(1.2);
}

.track-like-btn:hover {
  transform: scale(1.2);
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
  }

  .playlist-cover-large {
    width: 200px;
    height: 200px;
  }

  .playlist-title-large {
    font-size: 1.8rem;
  }

  .tracks-header,
  .track-row {
    grid-template-columns: 40px 1fr 150px 100px 80px;
  }

  .col-album {
    display: none;
  }
}

@media (max-width: 768px) {
  .playlist-details-page {
    padding: 20px;
  }

  .header-content {
    gap: 15px;
  }

  .playlist-cover-large {
    width: 150px;
    height: 150px;
  }

  .playlist-title-large {
    font-size: 1.4rem;
  }

  .tracks-header,
  .track-row {
    grid-template-columns: 30px 1fr 60px;
    gap: 8px;
  }

  .col-artist,
  .col-album,
  .col-action {
    display: none;
  }

  .col-duration {
    text-align: right;
  }
}
</style>