<template>
  <div class="min-h-screen bg-black text-white overflow-x-hidden">
    <!-- Section principale -->
    <section class="flex flex-col md:flex-row items-center justify-between px-10 md:px-24 ">
      <!-- Texte à gauche -->
      <div class="max-w-lg">
        <h1 class="text-6xl font-extrabold leading-tight">
          <span class="text-red-600">Discover</span><br />
          RedVerse
        </h1>
        <p class="mt-6 text-gray-300 text-lg">
            Welcome to Redverse Dive into the world of music with Redverse,
            the new platform that lets you listen, discover,
            and share your favorite tracks. Create your playlist, 
            explore new artists, and enjoy a unique, smooth, 
            and modern musical experience.
        </p>
        <!-- <button
          class="bg-gray-500/10 backdrop-blur text-white fixed w-full top-0 left-0 z-50 p-4"
        >
          Start Listening
        </button> -->
        <button
          class="mt-10 bg-red-600 hover:bg-red-700 px-8 py-3 rounded-full font-semibold transition-all duration-300"
        >
          Start Listening
        </button>
      </div>

      <!-- Image guitare à droite -->
      <div class="flex justify-end mt-10 md:mt-0">
        <img
          src="../assets/guitar.png"
          alt="Guitar"
          class="w-[350px] md:w-[400px] lg:w-[450px] max-w-full h-auto"
        />
      </div>
    </section>

    <!-- Section suivante -->
    <section class="py-24 px-10 md:px-24">
      <h2 class="text-4xl font-bold text-red-500 mb-6">Why choose Redverse?</h2>
      <p class="text-gray-300 text-lg leading-relaxed max-w-3xl">
        RedVerse is a platform built by music lovers, for music lovers.  
        We bring together artists, albums, and playlists from every corner of the world.
      </p>
    </section>

    <!-- Autre section -->
    <section class="py-24 px-10 md:px-24">
      <h2 class="text-4xl font-bold text-red-500 mb-6">Join the Community</h2>
      <p class="text-gray-300 text-lg leading-relaxed max-w-3xl">
        Create your own playlists, share your favorites, and connect with other listeners.
        RedVerse is where the sound never stops.
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>
