<template>
  <div>
    <NavBar />
    <inscription />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import Inscription from '../components/Inscription.vue';


export default {
  name: 'Home',
  components: {
    NavBar,
    Inscription,
  },
}
</script>

