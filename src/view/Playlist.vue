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
        <img :src="p.picture_medium" alt="cover" class="playlist-cover" />

        <h3>{{ p.title }}</h3>

        <p class="track-count">{{ p.nb_tracks }} tracks</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const playlists = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/deezer/playlists");
    const data = await res.json();

    playlists.value = data.data || [];
  } catch (e) {
    console.error(e);
  }

  loading.value = false;
});
</script>

<style scoped>
.playlist-page {
  padding: 30px;
  margin-left: 230px; /* nkhliw blassa l sidebar */
  color: white;
  min-height: 100vh;
  background-color: #0d0f16;
  
}

.page-title {
  font-size: 50px;
  /*margin-bottom: 20px;*/
  font-weight: bold;
  margin-top:70 ;
}

.loading {
  font-size: 20px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
}

.playlist-card {
  background: #161a23;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  transition: 0.3s;
  cursor: pointer;
  border: 1px solid rgba(255, 0, 60, 0.3);
}

.playlist-card:hover {
  transform: scale(1.05);
  border-color: #ff003c;
  box-shadow: 0 0 15px #ff003c;
}

.playlist-cover {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 10px;
}

.track-count {
  opacity: 0.7;
  font-size: 14px;
}
</style>


<!-- <template>
  <div class="min-h-screen bg-gray-950 text-white p-6">

    <h1 class="text-3xl font-bold mb-6 text-red-500">
      🎵 All Deezer Playlists
    </h1>

    <div v-if="loading" class="text-gray-400">
      Loading playlists...
    </div>

    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="bg-gray-900 rounded-xl p-4 hover:scale-105 transition cursor-pointer"
        @click="goToDetails(playlist.id)"
      >
        <img
          :src="playlist.picture_big"
          class="rounded-xl w-full h-48 object-cover"
        />

        <h2 class="mt-3 text-lg font-semibold">
          {{ playlist.title }}
        </h2>

        <p class="text-sm text-gray-400">
          {{ playlist.nb_tracks }} tracks
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
//import { getAllPlaylists } from "../services/deezer.js";

const playlists = ref([
    { id: 1, title: 'My Favorites', tracks: 25 },
  { id: 2, title: 'Chill Vibes', tracks: 40 },
  { id: 3, title: 'Workout', tracks: 30 }
]);
const loading = ref(true);
const router = useRouter();

import { getPlaylists } from '../services/deezer';

/* onMounted(async () => {
  playlists.value = await getPlaylists();
  loading.value = false;
}); */
onMounted(async () => {
  const res = await fetch("http://localhost:3000/api/deezer/playlists");
  const data = await res.json();

  console.log(data);
  playlists.value = data.data; 
});



const goToDetails = (id) => {
  router.push(`/playlist/${id}`);
};
</script>
 -->