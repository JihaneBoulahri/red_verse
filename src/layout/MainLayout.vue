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
</template>
<template>
  <div class="flex">
    <NavBar v-if="showNav" />
    <SidBar v-if="route.meta.showSidebar" />

    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>-->
<template>
  <NavBar v-if="showNav" />
  <aside class="sidebar">
  </aside>

  <main class="dashboard">
    <router-view />
  </main>
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


