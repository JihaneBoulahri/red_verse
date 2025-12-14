<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gray-50">
    <!-- Content card -->
    <div class="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row items-center max-w-4xl w-full p-10 border-l-8 border-orange-600">
      
      <!-- Illustration -->
      <div class="flex-1 flex justify-center items-center mb-8 md:mb-0 md:mr-10">
        <img
          src="../assets/err404.png"
          alt="404 Illustration"
          class="w-64 md:w-80 animate-bounce-slow"
        />
      </div>

      <!-- Text Content -->
      <div class="flex-1 text-center md:text-left">
        <h1 class="text-7xl font-extrabold text-orange-600 mb-3">404</h1>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Page introuvable</h2>
        <p class="text-gray-500 mb-8">
          La page que vous cherchez n’existe pas ou a été déplacée.<br />
          Retournez à l’accueil pour continuer votre navigation.
        </p>

        <!-- Button -->
        <router-link
          to="/dashboard"
          class="inline-block px-8 py-3 rounded-xl bg-orange-600 text-white font-bold shadow-lg hover:bg-orange-700 transition-all duration-300"
        >
          Retour à l’accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-bounce-slow {
  animation: bounce-slow 4s infinite;
}
</style>