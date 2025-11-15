<!-- src/layout/MainLayout.vue -->
<template>
  <div>
    <NavBar v-if="showNav" />
    <router-view />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import NavBar from '../components/NavBar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = computed(() => route.meta.showNav ?? true)

</script>
