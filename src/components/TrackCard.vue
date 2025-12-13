<template>
  <div @click="onPlay" class="track-card">
    <img :src="track.album?.cover_small || track.album?.cover_medium || ''" class="thumb" />
    <div class="meta">
      <h4 class="title">{{ track.title }}</h4>
      <p class="artist">{{ track.artist?.name }}</p>
      
    </div>
    <div class="z-[99999]" @click.stop>
      <AddFavoriteButton :music="track.title" :album="track.album?.title || 'Unknown'" />
      <AddPlaylistButton :track="track" />
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
      return (
        this.track.album?.cover_small ||
        this.track.album?.cover_medium ||
        'https://via.placeholder.com/64x64?text=🎵'
      )
    }
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
