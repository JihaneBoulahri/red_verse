<template>
  <div @click="onOpen" class="playlist-card">
    <div class="cover">
      <img :src="playlist.picture_big || playlist.picture_medium || playlist.picture || ''" :alt="playlist.title || playlist.name" />
      <div class="overlay">
        <button class="play-btn">▶</button>
      </div>
    </div>
    <div class="info">
      <h4 class="title">{{ playlist.title || playlist.name }}</h4>
      <p class="meta">{{ playlist.nb_tracks ? playlist.nb_tracks + ' tracks' : '' }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlaylistCard',
  props: {
    playlist: { type: Object, required: true }
  },
  emits: ['open'],
  methods: {
    onOpen() {
      this.$emit('open', this.playlist)
    }
  }
}
</script>

<style scoped>
.playlist-card {
  cursor: pointer;
  background: rgba(17,24,39,0.6);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.45);
}
.cover { 
  position: relative; 
  width: 100%; 
  height: 160px; 
}
.cover img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display: block; 
}
.overlay { 
  position: absolute; 
  inset: 0; display:flex; 
  align-items:center; 
  justify-content:center; 
  background: linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.4)); 
  opacity:0; 
  transition: opacity .18s ease; 
}
.playlist-card:hover .overlay { 
  opacity: 1;
}
.play-btn { 
  background: rgba(255,255,255,0.08); 
  border: none; 
  color: #fff; 
  width:44px;
  height:44px;
  border-radius:9999px;
  font-size:18px; 
}
.info { 
  padding: 10px 12px; 
}
.title { 
  color: #fff; 
  font-weight:600; 
  font-size:0.95rem; 
  margin:0; 
  white-space:nowrap; 
  overflow:hidden; 
  text-overflow:ellipsis; 
}
.meta { 
  color: #9ca3af; 
  font-size:0.8rem; 
  margin-top:6px 
}
</style>
