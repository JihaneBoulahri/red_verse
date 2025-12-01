<template>
 <!--<router-view /> -->
    <Sidebar />

  <main class="main-content">
    <router-view />
  </main>
</template>

<script>

export default {
  name: 'App',
  
}
</script>
<!-- <template>
  <div>
    <TopTracks />
  </div>
</template>

<script>
import TopTracks from './components/TopTracks.vue'

export default {
  components: { TopTracks }
}
</script>
 -->