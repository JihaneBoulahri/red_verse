<!-- src/layout/MainLayout.vue -->
<template>
  <div>
    <NavBar v-if="showNav" />
    <div class="flex flex-row w-screen">
      <div class="w-[25%]" v-if="showSideBar">
        <SideBar/>
      </div>
      <div class="mt-20"
            :class="showSideBar ? 'md:w-[70%] w-[75%]' : 'w-[100%]' ">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import NavBar from '../components/NavBar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SideBar from '../components/SideBar.vue'

const route = useRoute()
const showNav = computed(() => route.meta.showNav ?? true)
const showSideBar = computed(() => route.meta.showSideBar ?? true)

</script>