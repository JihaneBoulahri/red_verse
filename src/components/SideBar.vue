<template>
  <aside class="sidebar" :class="{ open: sidebarOpen }">
    <div class="sidebar-header">
      <h3>Menu</h3>
      <button class="close-btn mobile-only" @click="toggleSidebar">✕</button>
    </div>

    <nav class="sidebar-nav">
    <!-- Home (Accueil) -->
    <div class="nav-section">
      <router-link 
          to="/dashboard"
          class="nav-item"
          :class="{ active: isActive('Accueil') }"
        >
          <span class="icon">🏠</span>
          <span class="label">dashboard</span>
      </router-link>
    </div>



      <div class="nav-section">
        <div class="section-title">My Music</div>
        <button 
          @click="toggleSection('playlists')" 
          class="nav-item collapsible"
          :class="{ expanded: expandedSections.playlists }"
        >
          <span class="icon">📋</span>
          <span class="label">My Playlists</span>
          <span class="toggle">{{ expandedSections.playlists ? '▼' : '▶' }}</span>
        </button>
        <div v-if="expandedSections.playlists" class="sub-items">
          <button 
            @click="goToPlaylist('all')" 
            class="sub-item"
          >
            📚 All Playlists
          </button>
          <button 
            @click="goToPlaylist('create')" 
            class="sub-item create"
          >
            ➕ Create Playlist
          </button>
          <div v-for="playlist in userPlaylists" :key="playlist.id" class="sub-item">
            🎵 {{ playlist.name }}
          </div>
        </div>
      </div>

      <!-- Favorites -->
      <div class="nav-section">
        <button 
          @click="goToFavorites" 
          class="nav-item"
        >
          <span class="icon">❤️</span>
          <span class="label">Liked Songs</span>
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const sidebarOpen = ref(false);

const expandedSections = ref({
  playlists: false,
  genres: false,
  albums: false
});

const userPlaylists = ref([]);

// Toggle section
const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

// Check if route is active
/*const isActive = (path) => {
  return route.path === path;
};*/
const isActive = (name) => {
  return route.name === name;
};


// Navigation functions
const goToPlaylist = (action) => {
  if (action === 'all') {
    router.push('/playlist');
  } else if (action === 'create') {
    router.push('/create/${action}');
  }
};


const goToFavorites = () => {
  router.push('/favorites');
};

const filterByGenre = (genre) => {
  router.push({ path: '/playlist', query: { genre } });
};

const goToAlbum = (albumId) => {
  router.push(`/album/${albumId}`);
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>

<style scoped>
.sidebar {
  width: 25%;
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%);
  border-right: 1px solid rgba(255, 26, 26, 0.2);
  height: 100vh;
  overflow-y: auto;
  padding-top: 80px;
  position: fixed;
  left: 0;
  top: 0;
  color: white;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 2px solid rgba(255, 26, 26, 0.3);
  margin-bottom: 20px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #ff1a1a;
  letter-spacing: 1px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 10px;
}

.nav-section {
  margin-bottom: 15px;
}

.section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: rgba(255, 26, 26, 0.7);
  padding: 10px 12px 5px;
  font-weight: 700;
  letter-spacing: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: rgba(255, 26, 26, 0.15);
  border-color: rgba(255, 26, 26, 0.3);
  color: white;
  transform: translateX(5px);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(255, 26, 26, 0.3), rgba(255, 68, 68, 0.2));
  border-color: #ff1a1a;
  color: #ff1a1a;
}

.icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.label {
  flex: 1;
}

.description {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  display: none;
}

.toggle {
  font-size: 0.8rem;
  color: rgba(255, 26, 26, 0.6);
  transition: transform 0.3s ease;
}

.nav-item.collapsible {
  position: relative;
}

.nav-item.collapsible.expanded .toggle {
  color: #ff1a1a;
}

/* Sub items */
.sub-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding-left: 10px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sub-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 26, 26, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  border: none;
  text-align: left;
  width: 100%;
}

.sub-item:hover {
  background: rgba(255, 26, 26, 0.1);
  color: white;
  transform: translateX(3px);
}

.sub-item.create {
  background: rgba(255, 26, 26, 0.1);
  border: 1px dashed rgba(255, 26, 26, 0.4);
  color: #ff1a1a;
  font-weight: 600;
}

.sub-item.create:hover {
  background: rgba(255, 26, 26, 0.2);
  border-color: #ff1a1a;
}

.mobile-only {
  display: none;
}

/* Scrollbar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 26, 26, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 26, 26, 0.5);
}

@media (max-width: 768px) {
  .sidebar {
    width: 250px;
    padding-top: 70px;
  }

  .description {
    display: none;
  }
}

@media (max-width: 640px) {
  .sidebar {
    width: 240px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 100;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 4px 8px;
  }

  .mobile-only {
    display: block;
  }

  .label {
    display: none;
  }

  .nav-item {
    padding: 12px 12px;
    justify-content: center;
  }

  .nav-item.active {
    border-color: #ff1a1a;
  }

  .section-title {
    display: none;
  }

  .icon {
    font-size: 1.4rem;
  }
}
</style>
