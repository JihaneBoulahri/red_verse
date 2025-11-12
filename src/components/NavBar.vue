<template>
  <nav class="navbar">
    <div class="logo">
      <span class="logo-icon">🎵</span>
      <h2>RedVerse</h2>
    </div>
    <ul class="nav-links">
      <li><a href="#">Accueil</a></li>
      <li><a href="#">À propos</a></li>
      <li><a href="#">Menu</a></li>
      <li><a href="#">Playlist</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #3a0ca3, #ff004c);
  color: white;
  padding: 15px 40px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo h2 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 2px;
  cursor: pointer;
}

.logo-icon {
  font-size: 2rem; 
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 30px;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: #ffde59;
}
</style>

