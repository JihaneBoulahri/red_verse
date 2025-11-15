<template>
  <div
    class="min-h-screen flex items-center justify-center bg-cover bg-center relative"
  >
    <!-- Overlay sombre -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

    <!-- Formulaire centré -->
    <div
      class="relative z-10 w-full sm:w-[380px] md:w-[420px] lg:w-[450px] bg-gradient-to-br from-gray-900/95 to-black/95 border border-red-500/40 rounded-2xl text-white p-10 shadow-2xl shadow-red-600/30"
    >
      <!-- Logo -->
      <div class="flex justify-center ">
        <img
          src="/src/assets/logo.png"
          alt="RedVerse Logo"
          class="h-50 "
        />
      </div>

      <!-- Titre -->
      <h1 class="text-center text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
        RedVerse
      </h1>
      <p class="text-center text-gray-400 text-sm mb-8">
        {{ tab === "signin" ? "Connectez-vous à votre compte" : "Créez un nouveau compte" }}
      </p>

      <!-- Onglets -->
      <div class="flex justify-center gap-1 mb-10">
        <button
          :class="[
            'px-6 py-2.5 font-semibold transition-all duration-300 rounded-t-lg',
            tab === 'signin' 
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50' 
              : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
          ]"
          @click="tab = 'signin'"
        >
          SIGN IN
        </button>
        <button
          :class="[
            'px-6 py-2.5 font-semibold transition-all duration-300 rounded-t-lg',
            tab === 'signup' 
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50' 
              : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
          ]"
          @click="tab = 'signup'"
        >
          SIGN UP
        </button>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="Enter your username"
            class="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-500 transition-all duration-300"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-500 transition-all duration-300"
          />
          <p v-if="emailError" class="text-red-400 text-xs mt-2">{{ emailError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-500 transition-all duration-300"
          />
          <p v-if="passwordError" class="text-red-400 text-xs mt-2">{{ passwordError }}</p>
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300">
            <input type="checkbox" v-model="staySignedIn" class="accent-red-500 rounded" />
            Stay signed in
          </label>
          <a href="#" class="text-red-500 hover:text-red-400 font-medium transition">Forgot Password?</a>
        </div>

        <button
          type="submit"
          class="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-600/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          {{ tab === "signin" ? "SIGN IN" : "SIGN UP" }}
        </button>
      </form>

      <!-- Texte en bas -->
      <div class="text-center mt-8 text-gray-500 text-sm border-t border-gray-700/50 pt-6">
        {{ tab === "signin" ? "Don't have an account?" : "Already have an account?" }}
        <button
          class="text-red-500 hover:text-red-400 font-bold ml-2 transition"
          @click="tab = tab === 'signin' ? 'signup' : 'signin'"
        >
          {{ tab === "signin" ? "Create one" : "Sign in" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { isValidEmail, isValidPassword } from "../services/Valide.js";

const tab = ref("signin");
const username = ref("");
const email = ref("");
const password = ref("");
const staySignedIn = ref(false);

const emailError = ref("");
const passwordError = ref("");

// 🔍 Fonction de validation
const handleSubmit = () => {
  emailError.value = "";
  passwordError.value = "";

  if (!isValidEmail(email.value)) {
    emailError.value = "Email invalide (ex: user@example.com)";
  }

  if (!isValidPassword(password.value)) {
    passwordError.value =
      "Mot de passe ≥ 8 caractères, avec 1 majuscule et 1 chiffre.";
  }

  if (emailError.value || passwordError.value) return;

  if (tab.value === "signin") {
    alert(`Bienvenue, ${username.value}!`);
  } else {
    alert(`Compte créé pour ${username.value}!`);
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap");

* {
  font-family: "Orbitron", sans-serif;
}

body {
  margin: 0;
  background-color: #000;
}
</style>
