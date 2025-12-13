<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-black">
    <!-- Content card -->
    <div class="bg-gray-900 rounded-3xl shadow-2xl shadow-red-900/30 flex flex-col md:flex-row items-center max-w-4xl w-full p-10 border-l-8 border-red-600 relative overflow-hidden">
      
      <!-- Background decorative elements -->
      <div class="absolute inset-0 overflow-hidden opacity-10">
        <div class="absolute -top-20 -left-20 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-red-600 rounded-full blur-3xl"></div>
      </div>
      
      <!-- Illustration -->
      <div class="flex-1 flex justify-center items-center mb-8 md:mb-0 md:mr-10 relative z-10">
        <img
          src="../assets/p.png"
          alt="404 Illustration"
          class="w-64 md:w-80 animate-bounce-slow filter drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]"
        />
      </div>

      <!-- Text Content -->
      <div class="flex-1 text-center md:text-left relative z-10">
        <h1 class="text-7xl font-extrabold text-red-600 mb-3 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">404</h1>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">Page not found</h2>
        <p class="text-gray-300 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.<br />
          Return to the home to continue browsing.
        </p>

        <!-- Button -->
        <router-link
          to="/"
          class="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg shadow-red-900/50 hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-red-900/70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Return to homepage
        </router-link>

      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
@keyframes bounce-slow {
  0%, 100% { 
    transform: translateY(0); 
  }
  50% { 
    transform: translateY(-12px); 
  }
}

@keyframes glow {
  0%, 100% { 
    filter: drop-shadow(0 0 15px rgba(220, 38, 38, 0.5));
  }
  50% { 
    filter: drop-shadow(0 0 25px rgba(220, 38, 38, 0.8));
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}

.filter {
  animation: glow 2s infinite ease-in-out;
}

.bg-black {
  background: #050505;
}

.bg-gray-900 {
  background: #000000;
}
</style>