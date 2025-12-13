<template>
  <div class="artist-card">
    <div class="avatar">
        <img :src="artist.picture_big || artist.picture_medium || artist.picture || ''" :alt="artist.name" />
    </div>
    <h4 class="artist-name">{{ artist.name }}</h4>
  </div>
</template>

<script>
export default {
  name: 'ArtistCard',
  props: {
    artist: { type: Object, required: true }
  }
}
</script>

<style scoped>
.artist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.artist-name {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 140px;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 9999px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.5);
  border: 3px solid rgba(255,255,255,0.04);
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
