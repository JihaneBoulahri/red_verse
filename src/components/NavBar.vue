<template>
  <nav class="navbar bg-black/20 backdrop-blur-sm fixed w-full top-0 left-0 z-50">
    <div class="navbar-container">
      <!-- Logo on left -->
      <div class="logo">
        <router-link :to="{ name: 'Accueil' }">
          <img
            src="/src/assets/logo.png"
            alt="RedVerse Logo"
            class="h-20"
          />
        </router-link>
        <h2 @click="router.push('/')">RedVerse</h2>      
      </div>

      <!-- Center Search -->
      <div v-if="isLoggedIn" class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="search-btn">🔍</button>
      </div>

      <!-- Right: Navigation + Account -->
      <div class="navbar-right">
        <ul class="nav-links-right">
          <li><router-link :to="{ name: 'Accueil' }">Home</router-link></li>
          <li><router-link :to="{ name: 'aPropos' }">About</router-link></li>
          <li><router-link :to="{ name: 'Contact' }">Contact</router-link></li>

          <div v-if="isLoggedIn" class="account-item">
            <button @click="toggleAccountMenu" class="account-btn">
              👤 Account
            </button>
            <div v-if="showAccountMenu" class="account-menu">
              <div class="account-email">{{ userEmail }}</div>
              <button @click="handleLogout" class="logout-btn-menu">log out</button>
            </div>
          </div>
        </ul>

        <!-- Mobile hamburger -->
        <button class="hamburger" @click="toggleMobile" aria-label="Toggle menu">
          <span :class="{ open: mobileOpen }">☰</span>
        </button>
      </div>
    </div>

    <!-- Mobile menu (for small screens) -->
    <ul class="nav-links-mobile" :class="{ open: mobileOpen }">
      <li><router-link :to="{ name: 'Accueil' }">Home</router-link></li>
      <li><router-link :to="{ name: 'aPropos' }">About</router-link></li>
      <li><router-link :to="{ name: 'Contact' }">Contact</router-link></li>
      <li v-if="isLoggedIn" class="search-container-mobile">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="search-btn">🔍</button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = ref(false);
const userEmail = ref('');
const searchQuery = ref('');
const showAccountMenu = ref(false);
const mobileOpen = ref(false);

// Vérifier si l'utilisateur est connecté au chargement
onMounted(() => {
  const user = localStorage.getItem('redverse_user');
  console.log("hhhhh : ", user)
  if (user) {
    try {
      const userData = JSON.parse(user);
      isLoggedIn.value = true;
      userEmail.value = userData.email || 'User';
    } catch (e) {
      isLoggedIn.value = false;
    }
  }
});

/* Fonction logout */
const handleLogout = () => {
  localStorage.removeItem('redverse_user');
  isLoggedIn.value = false;
  userEmail.value = '';
  searchQuery.value = '';
  router.push('/');
  alert('✅ You have been logged out!');
};

// Fonction recherche de musique
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    alert('⚠️ Please enter a search term');
    return;
  }

  try {
    // Appel à l'API Jamendo pour chercher de la musique
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_CLIENT_ID&search=${encodeURIComponent(searchQuery.value)}&limit=10`
    );
    
    if (!response.ok) throw new Error('Search error');
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Stocker les résultats dans localStorage
      localStorage.setItem('search_results', JSON.stringify(data.results));
      alert(`✅ ${data.results.length} tracks found! Redirecting...`);
      router.push('/playlist');
    } else {
      alert('❌ No music found');
    }
  } catch (error) {
    console.error('Erreur:', error);
    // Fallback: recherche locale dans la playlist
    alert('🔍 Local search activated');
    router.push('/playlist');
  }
  
  searchQuery.value = '';
};

// Toggle compte menu
const toggleAccountMenu = () => {
  showAccountMenu.value = !showAccountMenu.value;
};

const toggleMobile = () => {
  mobileOpen.value = !mobileOpen.value;
};
</script>

<style scoped>
.navbar {
  display: flex;
  flex-direction: column;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 40px;
  gap: 20px;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 40px;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo h2 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 2px;
  cursor: pointer;
}

/* Center Search */
.search-container {
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 26, 26, 0.3);
  flex: 1;
  max-width: 350px;
}

.search-input {
  background: transparent;
  border: none;
  color: white;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.search-btn:hover {
  transform: scale(1.2);
}

/* Right navbar (Navigation + Account + Hamburger) */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

.nav-links-right {
  list-style: none;
  display: flex;
  gap: 25px;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links-right a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links-right a:hover {
  color: #ff1a1a;
}

/* Account item */
.account-item {
  position: relative;
}

.account-btn {
  background: linear-gradient(135deg, #ff1a1a, #ff4444);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.account-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 26, 26, 0.4);
}

.account-btn:active {
  transform: scale(0.95);
}

/* Dropdown menu */
.account-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 26, 26, 0.5);
  border-radius: 12px;
  min-width: 200px;
  z-index: 1000;
  margin-top: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.account-email {
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(255, 26, 26, 0.2);
  word-break: break-all;
}

.logout-btn-menu {
  width: 100%;
  background: transparent;
  color: #ff1a1a;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 0.9rem;
}

.logout-btn-menu:hover {
  background: rgba(255, 26, 26, 0.1);
  color: #ff4444;
}

/* Hamburger */
.hamburger {
  display: none;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.6rem;
  cursor: pointer;
}

.hamburger span.open {
  transform: rotate(90deg);
}

/* Mobile menu */
.nav-links-mobile {
  list-style: none;
  display: none;
  flex-direction: column;
  gap: 10px;
  padding: 12px 20px;
  margin: 0;
  background: rgba(10,10,10,0.97);
}

.nav-links-mobile.open {
  display: flex;
}

.nav-links-mobile li {
  width: 100%;
}

.nav-links-mobile a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  display: block;
  padding: 8px 0;
}

.nav-links-mobile a:hover {
  color: #ff1a1a;
}

.search-container-mobile {
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 26, 26, 0.3);
  margin-top: 10px;
}

@media (max-width: 1024px) {
  .navbar-container {
    padding: 0px 20px;
    gap: 15px;
  }

  .nav-links-right {
    gap: 15px;
  }

  .search-container {
    max-width: 250px;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0px 15px;
  }

  .nav-links-right {
    gap: 10px;
  }

  .nav-links-right a {
    font-size: 0.9rem;
  }

  .logo h2 {
    font-size: 1.4rem;
  }

  .logo img {
    height: 16px;
  }

  .search-container {
    display: none;
  }

  .hamburger {
    display: block;
  }
}

@media (max-width: 640px) {
  .navbar-container {
    justify-content: space-between;
    padding: 0px 12px;
  }

  .nav-links-right {
    display: none;
  }

  .logo h2 {
    font-size: 1.2rem;
  }

  .logo img {
    height: 14px;
  }

  .search-container {
    display: none;
  }

  .navbar-right {
    gap: 10px;
  }

  .account-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .hamburger {
    display: block;
    font-size: 1.4rem;
  }

  .nav-links-mobile {
    display: none;
  }

  .nav-links-mobile.open {
    display: flex;
  }
}
</style>

