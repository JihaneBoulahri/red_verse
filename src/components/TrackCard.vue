<template>
  <div @click="onPlay" class="track-card">
    <img :src="cover" class="thumb" @error="handleImageError" />
    <div class="meta">
      <h4 class="title">{{ track.title }}</h4>
      <p class="artist">{{ track.artist?.name }}</p>
      
    </div>
    <div class="z-[99999]" @click.stop>
      <AddFavoriteButton :music="track.title" :album="track.album?.title || 'Unknown'" />
      <AddPlaylistButton 
              :music="track.title"
              :album="track.album?.title || 'Unknown'"
              :artist="track.artist?.name || 'Unknown'"
              :preview="track.preview || null"
              :id="track.id"
              @added="onMusicAddedToPlaylist"
              @playlist-created="onPlaylistCreated"
              
            />
    </div>
  </div>
</template>

<script>
import AddFavoriteButton from './AddFavoriteButton.vue'
import AddPlaylistButton from './AddPlaylistButton.vue'

export default {
  name: 'TrackCard',
  components: { AddFavoriteButton, AddPlaylistButton },
  props: {
    track: { type: Object, required: true }
  },
  emits: ['play'],
  computed: {
    cover() {
      const small = this.track.album?.cover_small || this.track.cover_small || null
      const medium = this.track.album?.cover_medium || this.track.cover_medium || null
      if (small) return small
      if (medium) return medium
      const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>" +
        "<rect width='100%' height='100%' fill='#0f1720'/>" +
        "<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='18' fill='#9ca3af' font-family='Arial'>♪</text>" +
        "</svg>"
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
    }
  },
  methods: {
    handleImageError(e) {
      e.target.src = this.cover
    },
    onMusicAddedToPlaylist() {},
    onPlaylistCreated() {}
  },
  methods: {
    onPlay() {
      this.$emit('play', this.track)
    }
  }
}
</script>

<style scoped>
.track-card {
  display: flex;
  gap: 12px;
  align-items: center;
  background: rgba(17,24,39,0.6);
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
}
.track-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.thumb { width:64px; height:64px; border-radius:8px; object-fit:cover; }
.meta { flex:1; min-width:0 }
.title { color:#fff; font-weight:600; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0 }
.artist { color:#9ca3af; font-size:0.85rem; margin-top:4px }
</style>
