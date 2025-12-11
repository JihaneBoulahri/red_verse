<template>
  <div class="favorites">
    <h1>❤️ Favorites</h1>

    <div v-for="(f, i) in favorites" :key="i" class="item">
      <h3>{{ f.music }}</h3>
      <p>{{ f.album }}</p>

      <button class="del-btn" @click="remove(f.music)">✕</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { favorites: [] };
  },

  async created() {
    await this.load();
  },

  methods: {
    async load() {
      const res = await fetch("http://localhost:3000/api/favorites");
      this.favorites = await res.json();
    },

    async remove(music) {
      await fetch(`http://localhost:3000/api/favorites/${music}`, {
        method: "DELETE"
      });

      this.load();
    }
  }
};
</script>

<style scoped>
.favorites-page {
  padding: 20px;
  color: white;
}

.favorite-item {
  background: #111;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remove-btn {
  background: #c0392b;
  color: white;
  border: none;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.remove-btn:hover {
  background: #e74c3c;
}

.empty {
  margin-top: 20px;
  color: #aaa;
  text-align: center;
}
</style>