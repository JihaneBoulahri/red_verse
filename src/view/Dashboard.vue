<template>
  <div class="min-h-screen bg-black text-white flex">


    <!-- Main Content -->
    <main class="flex-1 p-8">

      <!-- Top Navbar -->
      <header
        class="bg-gradient-to-r from-gray-900/60 to-black/60 backdrop-blur border border-red-600/20 p-6 rounded-xl mb-8 flex justify-between items-center">
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
          Dashboard
        </h1>
        <button
          class="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 transition font-semibold shadow-lg shadow-red-600/30">
          Profil
        </button>
      </header>

      <!-- Cards -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-6 rounded-xl hover:border-red-600/50 transition shadow-xl shadow-red-600/10">
          <h3 class="text-xl font-semibold mb-4 text-gray-300">Total Users</h3>
          <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">1,204</p>
          <p class="text-xs text-gray-500 mt-2">↑ 12% depuis hier</p>
        </div>
        <div
          class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-6 rounded-xl hover:border-red-600/50 transition shadow-xl shadow-red-600/10">
          <h3 class="text-xl font-semibold mb-4 text-gray-300">Total Users</h3>
          <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">1,204</p>
          <p class="text-xs text-gray-500 mt-2">↑ 12% depuis hier</p>
        </div>

        <div
          class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-6 rounded-xl hover:border-red-600/50 transition shadow-xl shadow-red-600/10">
          <h3 class="text-xl font-semibold mb-4 text-gray-300">Total Users</h3>
          <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">1,204</p>
          <p class="text-xs text-gray-500 mt-2">↑ 12% depuis hier</p>
        </div>
        <div
          class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-6 rounded-xl hover:border-red-600/50 transition shadow-xl shadow-red-600/10">
          <h3 class="text-xl font-semibold mb-4 text-gray-300">Total Users</h3>
          <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">1,204</p>
          <p class="text-xs text-gray-500 mt-2">↑ 12% depuis hier</p>
        </div>

        <div
          class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-6 rounded-xl hover:border-red-600/50 transition shadow-xl shadow-red-600/10">
          <h3 class="text-xl font-semibold mb-4 text-gray-300">Musics Played</h3>
          <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">8,920</p>
          <p class="text-xs text-gray-500 mt-2">↑ 23% cette semaine</p>
        </div>

        <div
          class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-6 rounded-xl hover:border-red-600/50 transition shadow-xl shadow-red-600/10">
          <h3 class="text-xl font-semibold mb-4 text-gray-300">Musics Played</h3>
          <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">8,920</p>
          <p class="text-xs text-gray-500 mt-2">↑ 23% cette semaine</p>
        </div>

        <div
          class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-6 rounded-xl hover:border-red-600/50 transition shadow-xl shadow-red-600/10">
          <h3 class="text-xl font-semibold mb-4 text-gray-300">Followers</h3>
          <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">3,451</p>
          <p class="text-xs text-gray-500 mt-2">↑ 8% ce mois</p>
        </div>
      </section>

      <!-- Deezer Top Tracks (Top 10) -->
      <section
        class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-8 rounded-xl shadow-xl shadow-red-600/10">
        <h3 class="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
          🎧 Top 10 Musiques (Deezer)
        </h3>

        <div v-if="tracks.length === 0" class="text-center py-12">
          <p class="text-gray-400 text-lg">Chargement des pistes...</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="track in tracks.slice(0, 10)"
            :key="track.id"
            @click="playTrack(track)"
            class="cursor-pointer bg-gray-900/80 backdrop-blur border border-gray-700/50 p-4 rounded-xl hover:border-red-600/50 hover:shadow-lg hover:shadow-red-600/20 transition transform hover:scale-105"
          >
            <img :src="track.album.cover_big" class="w-full rounded-lg mb-4 shadow-lg" />
            <h4 class="text-lg font-semibold text-white truncate">{{ track.title }}</h4>
            <p class="text-sm text-gray-400 truncate">{{ track.artist.name }}</p>
          </div>
        </div>
      </section>

      <!-- Audio Player (Fixed bottom) -->
      <div
        v-if="currentTrack"
        class="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[50%] 
        bg-gray-900/90 backdrop-blur border border-red-600/30 p-4 rounded-2xl shadow-xl flex items-center gap-4"
      >
        <img :src="currentTrack.album.cover_small" class="w-14 h-14 rounded-lg" />

        <div class="flex-1">
          <h4 class="text-white font-semibold">{{ currentTrack.title }}</h4>
          <p class="text-gray-400 text-sm">{{ currentTrack.artist.name }}</p>
        </div>

        <audio ref="audioPlayer" controls class="w-32">
          <source :src="currentTrack.preview" type="audio/mpeg" />
        </audio>
      </div>

    </main>
  </div>
</template>

<script>
import { getTopTracks } from "../services/deezer.js";

export default {
  data() {
    return {
      tracks: [],
      currentTrack: null,
    };
  },

  async mounted() {
    this.tracks = await getTopTracks();
    console.log(this.tracks); // Vérifie que chaque track a preview
  },

  methods: {
    playTrack(track) {
      if (!track.preview) {
        alert("Preview non disponible pour cette piste !");
        return;
      }

      // Changer le track
      this.currentTrack = track;

      this.$nextTick(() => {
        const audio = this.$refs.audioPlayer;

        // Stop et reset l'audio précédent
        audio.pause();
        audio.currentTime = 0;

        // Reload le nouveau source
        audio.load();

        // Jouer le nouvel audio
        audio.play();
      });
    },
  },
};
</script>

<style scoped></style>
