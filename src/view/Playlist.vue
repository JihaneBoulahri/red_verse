<template>
  <div class="playlist-page">
    <h1 class="page-title">🎵 Playlists</h1>

    <div v-if="loading" class="loading">Chargement…</div>

    <div class="playlist-grid">
      <div
        class="playlist-card"
        v-for="p in playlists"
        :key="p.id"
      >
        <div class="cover-wrapper">
          <img :src="p.picture_medium" alt="cover" class="playlist-cover" />
          <div class="overlay">
            <button class="play-btn">▶</button>
          </div>
        </div>
        <h3 class="playlist-title">{{ p.title }}</h3>
        <p class="track-count">{{ p.nb_tracks }} tracks</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPlaylists } from '../services/deezer';

const playlists = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await getPlaylists()
    playlists.value = res || []
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
});
</script>

<style scoped>
/* --- Page --- */
.playlist-page {
  padding: 40px 60px;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #fff;
}

/* --- Title --- */
.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 50px;
  text-align: center;
  color: #1db954; /* neon green accent */
}

/* --- Loading --- */
.loading {
  text-align: center;
  margin-bottom: 40px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
}

/* --- Grid --- */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
}

/* --- Card --- */
.playlist-card {
  background-color: #1e1e2f;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 2px 7px 23px -4px rgba(59,59,59,0.75);
  transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
}

.playlist-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.7);
  background-color: #27293d;
}

/* --- Cover + Overlay --- */
.cover-wrapper {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.playlist-cover {
  width: 100%;
  display: block;
  transition: transform 0.3s;
  border-radius: 12px 12px 0 0;
}

.playlist-card:hover .playlist-cover {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .overlay {
  opacity: 1;
}

.play-btn {
  background: #1db954;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
  transition: transform 0.2s;
}

.play-btn:hover {
  transform: scale(1.2);
}

/* --- Text --- */
.playlist-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 15px 0 5px;
  text-align: center;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-count {
  font-size: 0.85rem;
  opacity: 0.6;
  text-align: center;
  color: #bbb;
}
</style>
