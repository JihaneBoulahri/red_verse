<template>
  <div class="search-results-page">
    <!-- Header -->
    <div class="search-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">← Back</button>
        <h1 class="page-title">Search</h1>
      </div>
    </div>

    <!-- Tracks -->
    <section class="results-section" v-if="tracks.length">
      <h3 class="section-title">🎵 Music</h3>
      <div class="list">
        <TrackCard
          v-for="track in tracks"
          :key="track.id"
          :track="track"
          @play="playTrack"
        />
      </div>
    </section>

    <!-- Playlists -->
    <section class="results-section" v-if="playlists.length">
      <h3 class="section-title">📁 Playlists</h3>
      <div class="grid">
        <PlaylistCard
          v-for="playlist in playlists"
          :key="playlist.id"
          :playlist="playlist"
          @open="viewPlaylist"
        />
      </div>
    </section>

    <!-- No results -->
    <div class="no-results" v-if="!hasResults && !isLoading">
      <div class="no-results-icon">🔍</div>
      <h3>No results found</h3>
      <p>Try different keywords or check the spelling.</p>
      <button class="back-to-home" @click="goHome">Back to home</button>
    </div>

    <!-- Loading -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="spinner"></div>
      <p>Recherche en cours...</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TrackCard from '../components/TrackCard.vue'
import PlaylistCard from '../components/PlaylistCard.vue'
import player from '../services/player'

const router = useRouter()

const tracks = ref([])
const playlists = ref([])
const isLoading = ref(false)
const currentTrack = ref(null)

const hasResults = computed(() => tracks.value.length || playlists.value.length)

const loadSearchResults = () => {
  const saved = JSON.parse(localStorage.getItem('search_results') || '{}')
  tracks.value = saved.tracks || []
  playlists.value = saved.playlists || []
}

const playTrack = (track) =>{
  if (!track.preview) {
    Toast.info("Preview non disponible pour cette piste !");
    return;
  }
  player.play(track)
};

const viewPlaylist = (playlist) => {
  localStorage.setItem('current_playlist', JSON.stringify(playlist))
  router.push(`/playlist/${playlist.id}`)
}

const goBack = () => router.back()
const goHome = () => router.push('/')

onMounted(loadSearchResults)
</script>

<style scoped>
.search-results-page{
  min-height:100vh;
  background:linear-gradient(135deg,#1a1a2e,#16213e);
  color:#fff;
  padding:20px;
}
.search-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:30px
}
.back-btn{
  background:rgba(255,255,255,.1);
  border:none;
  color:#fff;
  padding:8px 16px;
  border-radius:20px;
  cursor:pointer
}
.page-title{
  font-size:24px;
  margin:0
}
.results-section{
  margin-bottom:40px
}
.section-title{
  font-size:22px;
  margin-bottom:16px
}
.list{
  display:flex;
  flex-direction:column;
  gap:10px;
}
.grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
  gap:20px
}
.no-results{
  text-align:center;
  padding:60px 20px
}
.back-to-home{
  background:#1DB954;
  border:none;
  color:#fff;
  padding:12px 30px;
  border-radius:25px;
  cursor:pointer
}
.loading-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.8);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  z-index:1000
}
.spinner{
  width:50px;
  height:50px;
  border:3px solid rgba(255,255,255,.1);
  border-top-color:#1DB954;
  border-radius:50%;
  animation:spin 1s linear infinite
}
@keyframes spin{
  to{transform:rotate(360deg)}
}
.player-overlay{
  position:fixed;
  bottom:20px;
  right:20px;
  background:rgba(0,0,0,.9);
  border-radius:10px;
  padding:15px;
  width:300px
}

.player-info{
  display:flex;
  gap:10px;
  align-items:center
}
.player-info img{
  width:50px;
  height:50px;
  border-radius:6px
}
.close-player{
  background:none;
  border:none;
  color:#fff;
  font-size:22px;
  cursor:pointer
}
</style>