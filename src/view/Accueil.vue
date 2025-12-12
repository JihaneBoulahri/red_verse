<template>
  <NavBar />
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
            and modern musical experience.
        </p>
        <!-- <button
          class="bg-gray-500/10 backdrop-blur text-white fixed w-full top-0 left-0 z-50 p-4"
        >
          Start Listening
        </button> -->
        <button @click="startListening"
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
        🎧 RedVerse is more than a platform — it’s a universe crafted by true music lovers for everyone who feels the power of sound.
In a world where music never stops evolving, RedVerse becomes the place where artists, beats, cultures, and listeners connect in harmony.

Our mission is simple: bring music from every corner of the world into one vibrant, inclusive hub.
From global hits to underground discoveries, RedVerse gathers it all, making exploration easy and exciting.

Here, artists shine, albums get the attention they deserve, and playlists turn into real journeys.
Music isn’t just entertainment — it’s a language that unites us and sparks emotion.

With RedVerse, you don’t just listen — you explore, feel, and connect.
Our platform celebrates creativity and diversity, giving each user the freedom to shape their own musical universe.

RedVerse — where every beat tells a story.
      </p>
    </section>

    <!-- Autre section -->
    <section class="py-24 px-10 md:px-24">
      <h2 class="text-4xl font-bold text-red-500 mb-6">Join the Community</h2>
      <p class="text-gray-300 text-lg leading-relaxed max-w-3xl">
        Create your own playlists, share your favorite tracks, and discover what others are listening to.
RedVerse gives you the freedom to express your musical identity — from the songs that inspire you to the beats that define your mood.

Connect with listeners from around the world, explore their playlists, and dive into new sounds you never knew you needed.
Share moments, exchange emotions, and build a community where music is the bridge that brings everyone together.

Whether you're crafting the perfect vibe, discovering hidden gems, or revisiting timeless classics, RedVerse is the place where your musical journey comes alive.
Here, the sound never stops — and neither does the inspiration.
      </p>
    </section>
  </div>
</template>

<script setup>
import NavBar from '../components/NavBar.vue'
import { useRouter } from 'vue-router';

const router = useRouter()

function startListening() {
  const user = localStorage.getItem("redverse_user");
  if(user)
    router.push('/dashboard')
  else 
    router.push('/Signup')
}
</script>
