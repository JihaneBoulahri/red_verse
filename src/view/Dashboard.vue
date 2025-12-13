<template>
  <div class="min-h-screen bg-black text-white flex">


    <!-- Main Content -->
    <main class="flex-1 p-8">

      <!-- Top Artists (Top 10) -->
      <section class="mt-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-8 rounded-xl shadow-xl shadow-red-600/10">
        <h3 class="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">🎤 Top 10 Artistes</h3>

        <div v-if="topArtists.length === 0" class="text-center py-8">
          <p class="text-gray-400">Chargement des artistes...</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          <ArtistCard v-for="artist in topArtists" :key="artist.id" :artist="artist" />
        </div>
      </section>

      <!-- Top Playlists (Top 10) -->
      <section class="mt-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-8 rounded-xl shadow-xl shadow-red-600/10">
        <h3 class="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">📚 Top 10 Playlists</h3>

        <div v-if="playlists.length === 0" class="text-center py-8">
          <p class="text-gray-400">Chargement des playlists...</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <PlaylistCard v-for="pl in playlists.slice(0, 10)" :key="pl.id" :playlist="pl" @open="openPlaylist" />
        </div>
      </section>

      <!-- Deezer Top Tracks (Top 10) -->
      <section
        class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-red-600/20 p-8 rounded-xl shadow-xl shadow-red-600/10">
        <h3 class="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
          🎧 Top 10 Tracks
        </h3>

        <div v-if="tracks.length === 0" class="text-center py-12">
          <p class="text-gray-400 text-lg">Chargement des pistes...</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 ">
          <TrackCard v-for="track in tracks.slice(0, 10)" :key="track.id" :track="track" @play="playTrack" />
        </div>
      </section>


    </main>
  </div>
</template>

<script>
import { Toast } from '../ui/Toast.js'
import player from '../services/player'
import { getTopTracks, getPlaylists, getPlaylistDetails } from "../services/deezer.js";
import TrackCard from '../components/TrackCard.vue'
import PlaylistCard from '../components/PlaylistCard.vue'
import ArtistCard from '../components/ArtistCard.vue'

export default {
  components: { TrackCard, PlaylistCard, ArtistCard },
  data() {
    return {
      tracks: [],
      playlists: [],
      currentTrack: null,
    };
  },

  async mounted() {
    this.tracks = await getTopTracks();
    this.playlists = await getPlaylists();
    console.log(this.tracks); // Vérifie que chaque track a preview
  },

  methods: {
    
    async openPlaylist(playlist) {
      try {
        const details = await getPlaylistDetails(playlist.id);
        const tracks = details?.tracks?.data || details?.data?.tracks || [];
        if (tracks.length && tracks[0].preview) {
          player.play(tracks[0])
        } else {
          Toast.info('Aucun aperçu disponible pour cette playlist');
        }
      } catch (err) {
        console.error(err);
        Toast.error('Impossible de charger la playlist');
      }
    },
    playTrack(track) {
      if (!track.preview) {
        Toast.info("Preview non disponible pour cette piste !");
        return;
      }
      player.play(track)
    },
  },
  computed: {
    topArtists() {
      const map = {};
      this.tracks.forEach(t => {
        if (!t?.artist) return;
        const a = t.artist;
        if (!map[a.id]) map[a.id] = { ...a, count: 0 };
        map[a.id].count++;
      });
      return Object.values(map).sort((x, y) => y.count - x.count).slice(0, 10);
    }
  },
};
</script>

<style scoped></style>
