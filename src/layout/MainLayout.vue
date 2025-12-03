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
<!-- <template>
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

//li bdlna
const showSidebar = computed(() => {
  const user = localStorage.getItem('redverse_user')
  return !!user && route.meta.showSidebar !== false
})

</script> -->
<template>
  <div class="layout">

    <!-- NAVBAR EN HAUT -->
    <NavBar v-if="showNav" />

    <div class="content-wrapper">
      <!-- SIDEBAR À GAUCHE -->
      <SideBar v-if="showSidebar" class="sidebar"/>

      <!-- CONTENU PRINCIPAL -->
      <main class="dashboard">
        <router-view />
      </main>
    </div>

  </div>
</template>


<script setup>
import { computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import SideBar from '../components/SideBar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Afficher navbar sauf si showNav = false dans meta
const showNav = computed(() => route.meta.showNav ?? true)

// Afficher sidebar seulement si utilisateur existe + meta pas false
const showSidebar = computed(() => {
  const user = localStorage.getItem('redverse_user')
  return !!user && route.meta.showSidebar !== false
})
</script>


<style scoped>
/* Structure générale */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Wrapper entre sidebar + contenu */
.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: #181818;
  color: #fff;
  border-right: 1px solid #333;
  padding: 20px 10px;
  height: 100%;
  overflow-y: auto;
}

/* Contenu principal */
.dashboard {
  flex: 1;
  padding: 20px;
  background: #f4f4f4;
  overflow-y: auto;
}
</style>



