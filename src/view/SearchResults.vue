<template>
  <div class="search-results-page">
    <!-- Header -->
    <div class="search-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          ← Back
        </button>
        <h1 class="page-title">Search</h1>
      </div>
      
      <div class="search-box">
        <input 
          type="text" 
          v-model="currentQuery"
          placeholder="Rechercher musique ou playlist..."
          @keyup.enter="performSearch"
        />
        <button class="search-btn" @click="performSearch">
          🔍
        </button>
      </div>
    </div>

    <!-- Résumé de recherche -->
    <div class="search-summary" v-if="hasResults">
      <h2 class="results-title">
        Résultats pour : "<span class="query-text">{{ searchQuery }}</span>"
      </h2>
      <div class="results-count">
        <span class="count-badge tracks-count">
          🎵 {{ tracks.length }} music
        </span>
        <span class="count-badge playlists-count">
          📁 {{ playlists.length }} playlists
        </span>
        <span class="total-count">
          {{ totalResults }} final result 
        </span>
      </div>
    </div>

    <!-- Section Musiques -->
    <div class="results-section" v-if="tracks.length > 0">
      <h3 class="section-title">
        <span class="section-icon">🎵</span>
        Music
      </h3>
      
      <div class="results-grid">
        <div 
          v-for="track in tracks" 
          :key="track.id"
          class="result-card"
          @click="playTrack(track)"
        >
          <div class="card-image">
            <img 
              :src="track.album.cover_medium || track.album.cover_small" 
              :alt="track.title"
              loading="lazy"
            />
            <div class="play-overlay" @click.stop="playTrack(track)">
              <div class="play-icon">▶</div>
            </div>
          </div>
          
          <div class="card-content">
            <h4 class="track-title">{{ track.title }}</h4>
            <p class="artist-name">{{ track.artist.name }}</p>
            <div class="track-details">
              <span class="album-name">{{ track.album.title }}</span>
              <span class="duration">{{ formatDuration(track.duration) }}</span>
            </div>
          </div>
          
          <div class="card-actions">
            <button 
              class="action-btn"
              @click.stop="addToQueue(track)"
              title="Ajouter à la file d'attente"
            >
              +
            </button>
            <button 
              class="action-btn favorite"
              @click.stop="toggleFavorite(track)"
              :class="{ 'is-favorite': isFavorite(track.id) }"
              title="Ajouter aux favoris"
            >
              ♥
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Playlists -->
    <div class="results-section" v-if="playlists.length > 0">
      <h3 class="section-title">
        <span class="section-icon">📁</span>
        Playlists
      </h3>
      
      <div class="playlists-grid">
        <div 
          v-for="playlist in playlists" 
          :key="playlist.id"
          class="playlist-card"
          @click="viewPlaylist(playlist)"
        >
          <div class="playlist-image">
            <img 
              :src="playlist.picture_medium || playlist.picture_small" 
              :alt="playlist.title"
              loading="lazy"
            />
            <div class="playlist-overlay">
              <div class="tracks-count">
                {{ playlist.nb_tracks }} titres
              </div>
            </div>
          </div>
          
          <div class="playlist-content">
            <h4 class="playlist-title">{{ playlist.title }}</h4>
            <p class="playlist-creator">Par {{ playlist.user.name }}</p>
            
            <div class="playlist-stats">
              <span class="stat-item">
                <span class="stat-icon">👤</span>
                {{ playlist.fans ? playlist.fans.toLocaleString() : 0 }} fans
              </span>
            </div>
            
            <button 
              class="view-playlist-btn"
              @click.stop="viewPlaylist(playlist)"
            >
              View playlist
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Aucun résultat -->
    <div class="no-results" v-if="!hasResults && !isLoading">
      <div class="no-results-icon">🔍</div>
      <h3>No results found</h3>
      <p>ry different keywords or check the spelling.</p>
      <button class="back-to-home" @click="goHome">
        Back to home
      </button>
    </div>

    <!-- Chargement -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="spinner"></div>
      <p>Recherche en cours...</p>
    </div>

    <!-- Player Overlay (simplifié) -->
    <div class="player-overlay" v-if="currentTrack">
      <div class="player-content">
        <div class="player-info">
          <img :src="currentTrack.album.cover_small" :alt="currentTrack.title" />
          <div>
            <h4>{{ currentTrack.title }}</h4>
            <p>{{ currentTrack.artist.name }}</p>
          </div>
        </div>
        <button @click="closePlayer" class="close-player">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Réactifs
const tracks = ref([])
const playlists = ref([])
const searchQuery = ref('')
const currentQuery = ref('')
const isLoading = ref(false)
const currentTrack = ref(null)
const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))

// Computed
const hasResults = computed(() => {
  return tracks.value.length > 0 || playlists.value.length > 0
})

const totalResults = computed(() => {
  return tracks.value.length + playlists.value.length
})

// Méthodes
const loadSearchResults = () => {
  try {
    const storedResults = localStorage.getItem('search_results')
    const storedQuery = localStorage.getItem('search_query')
    
    if (storedResults) {
      const results = JSON.parse(storedResults)
      tracks.value = results.tracks || []
      playlists.value = results.playlists || []
    }
    
    if (storedQuery) {
      searchQuery.value = storedQuery
      currentQuery.value = storedQuery
    }
  } catch (error) {
    console.error('Erreur chargement résultats:', error)
  }
}

const performSearch = async () => {
  if (!currentQuery.value.trim()) {
    alert('Veuillez entrer un terme de recherche')
    return
  }
  
  isLoading.value = true
  
  try {
    // Recherche des musiques
    const tracksResponse = await fetch(
      `http://localhost:3000/api/deezer/search?q=${encodeURIComponent(currentQuery.value)}&type=track&limit=20`
    )
    
    // Recherche des playlists
    const playlistsResponse = await fetch(
      `http://localhost:3000/api/deezer/search?q=${encodeURIComponent(currentQuery.value)}&type=playlist&limit=20`
    )
    
    const [tracksData, playlistsData] = await Promise.all([
      tracksResponse.json(),
      playlistsResponse.json()
    ])
    
    // Mise à jour des résultats
    tracks.value = tracksData.data || []
    playlists.value = playlistsData.data || []
    searchQuery.value = currentQuery.value
    
    // Sauvegarde dans localStorage
    const searchResults = {
      tracks: tracks.value,
      playlists: playlists.value,
      query: currentQuery.value,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('search_results', JSON.stringify(searchResults))
    localStorage.setItem('search_query', currentQuery.value)
    
  } catch (error) {
    console.error('Erreur recherche:', error)
    alert('Erreur lors de la recherche')
  } finally {
    isLoading.value = false
  }
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const playTrack = (track) => {
  currentTrack.value = track
  // Ici vous pouvez intégrer votre système de lecture audio
  console.log('Lecture de:', track.title)
  
  // Pour l'exemple, un simple player visuel
  setTimeout(() => {
    alert(`Lecture de "${track.title}" par ${track.artist.name}`)
  }, 100)
}

const closePlayer = () => {
  currentTrack.value = null
}

const addToQueue = (track) => {
  // Ajouter à la file d'attente
  const queue = JSON.parse(localStorage.getItem('queue') || '[]')
  queue.push(track)
  localStorage.setItem('queue', JSON.stringify(queue))
  
  // Notification visuelle
  alert(`"${track.title}" ajouté à la file d'attente`)
}

const toggleFavorite = (track) => {
  const index = favorites.value.findIndex(fav => fav.id === track.id)
  
  if (index === -1) {
    favorites.value.push({ id: track.id, ...track })
    alert(`"${track.title}" ajouté aux favoris`)
  } else {
    favorites.value.splice(index, 1)
    alert(`"${track.title}" retiré des favoris`)
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites.value))
}

const isFavorite = (trackId) => {
  return favorites.value.some(fav => fav.id === trackId)
}

const viewPlaylist = (playlist) => {
  // Sauvegarder la playlist pour la page détail
  localStorage.setItem('current_playlist', JSON.stringify(playlist))
  router.push(`/playlist/${playlist.id}`)
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}

// Hooks
onMounted(() => {
  loadSearchResults()
})
</script>

<style scoped>
.search-results-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 20px;
}

/* Header */
.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.page-title {
  font-size: 24px;
  margin: 0;
}

.search-box {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 5px;
  width: 300px;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 20px;
  color: white;
  font-size: 14px;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-btn {
  background: #1DB954;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

/* Résumé */
.search-summary {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
}

.results-title {
  font-size: 20px;
  margin-bottom: 15px;
}

.query-text {
  color: #1DB954;
  font-weight: bold;
}

.results-count {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.count-badge {
  background: rgba(29, 185, 84, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.total-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* Sections */
.results-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 22px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 24px;
}

/* Grid des résultats */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.result-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s, background 0.3s;
  cursor: pointer;
}

.result-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.1);
}

.card-image {
  position: relative;
  padding-top: 100%; /* Aspect ratio 1:1 */
  overflow: hidden;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.result-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  background: #1DB954;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.card-content {
  padding: 15px;
}

.track-title {
  font-size: 16px;
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-name {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 10px 0;
}

.track-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.card-actions {
  display: flex;
  gap: 10px;
  padding: 0 15px 15px 15px;
}

.action-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.action-btn.favorite {
  background: rgba(255, 107, 107, 0.2);
}

.action-btn.favorite.is-favorite {
  background: #ff6b6b;
}

/* Playlists */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.playlist-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  transition: transform 0.3s;
  cursor: pointer;
}

.playlist-card:hover {
  transform: translateY(-5px);
}

.playlist-image {
  position: relative;
  padding-top: 56.25%; /* Aspect ratio 16:9 */
  overflow: hidden;
}

.playlist-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px;
}

.tracks-count {
  background: rgba(29, 185, 84, 0.8);
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
}

.playlist-content {
  padding: 20px;
}

.playlist-title {
  font-size: 18px;
  margin: 0 0 5px 0;
}

.playlist-creator {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 15px 0;
}

.playlist-stats {
  margin-bottom: 15px;
}

.stat-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.view-playlist-btn {
  width: 100%;
  background: #1DB954;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.view-playlist-btn:hover {
  background: #1ed760;
}

/* Aucun résultat */
.no-results {
  text-align: center;
  padding: 60px 20px;
}

.no-results-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.no-results h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.no-results p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
}

.back-to-home {
  background: #1DB954;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-to-home:hover {
  background: #1ed760;
}

/* Chargement */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1DB954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Player Overlay */
.player-overlay {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 10px;
  padding: 15px;
  width: 300px;
  z-index: 100;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.player-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.player-info img {
  width: 50px;
  height: 50px;
  border-radius: 5px;
}

.player-info h4 {
  margin: 0;
  font-size: 14px;
}

.player-info p {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.close-player {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
}

/* Responsive */
@media (max-width: 768px) {
  .search-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .search-box {
    width: 100%;
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .playlists-grid {
    grid-template-columns: 1fr;
  }
  
  .player-overlay {
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
  }
}
</style>