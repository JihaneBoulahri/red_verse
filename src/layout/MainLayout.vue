<!-- src/layout/MainLayout.vue 
<template>
  <div class="main-layout">
    <NavBar v-if="showNav" />
    <SideBar v-if="showSidebar" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>
<template>
  <div class="main-layout" :class="{ 'with-sidebar': showSidebar }">
    <NavBar v-if="showNav" />
    <SideBar v-if="showSidebar" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>-->
<template>
  <div class="flex">
    <SidBar v-if="route.meta.showSidebar" />

    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>


<script setup>
import { ref, provide, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import SideBar from '../components/SideBar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = computed(() => route.meta.showNav ?? true)
/*
const showSidebar = computed(() => {
  // Afficher la sidebar que si l'utilisateur est connecté
  //const user = localStorage.getItem('redverse_user')
  //return !!user && route.meta.showSidebar !== false
  route.meta.showSidebar ?? true
})*/
//li bdlna
const showSidebar = computed(() => {
  const user = localStorage.getItem('redverse_user')
  return !!user && route.meta.showSidebar !== false
})

</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-top: 70px;
  width: 100%;
  /*margin-left: 0;*/
  transition: margin-left 0.3s ease;
}
.with-sidebar .main-content {
  margin-left: 280px;
  width: calc(100% - 280px);
}
/*
.main-layout:has(> .sidebar) .main-content {
  margin-left: 280px;
  width: calc(100% - 280px);
}*/

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
  }

  .main-layout:has(> .sidebar) .main-content {
    margin-left: 0;
    width: 100%;
  }
}
</style>
