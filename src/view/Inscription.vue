
<template>
  <div v-if="!isLoggedIn" 
    class="min-h-screen flex items-center justify-center bg-cover bg-center relative"
    :style="{ backgroundImage: `url('/src/assets/logo.png')` }"
  >
    <!-- Overlay sombre -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

    <!-- Formulaire centré -->
    <div
      class="relative z-10 w-full sm:w-[380px] md:w-[420px] lg:w-[450px] bg-gradient-to-br from-gray-900/95 to-black/95 border border-red-500/40 rounded-2xl text-white p-10 shadow-2xl shadow-red-600/30"
    >
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <img
          src="/src/assets/logo.png"
          alt="RedVerse Logo"
          class="w-20 h-20 rounded-full shadow-lg shadow-red-600/50 border-2 border-red-500/50"
        />
      </div>

      <!-- Titre -->
      <h1 class="text-center text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
        RedVerse
      </h1>
      <p class="text-center text-gray-400 text-sm mb-8">
        {{ tab === "signin" ? "Sign in to your account" : "Create a new account" }}
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

  <!-- Afficher la sidebar et contenu après connexion -->
  <div v-else class="logged-in-layout">
    <SideBar /><Dashboard/>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import SideBar from "../components/SideBar.vue";
import { isValidEmail, isValidPassword } from "../services/Valide.js";
import Dashboard from "./Dashboard.vue";

const handleSignup = async () => {

  localStorage.setItem("redverse_user", JSON.stringify({ username }))

  router.push('/dashboard')
}


const router = useRouter();
const isLoggedIn = ref(false);
const tab = ref("signin");
const username = ref("");
const email = ref("");
const password = ref("");
const staySignedIn = ref(false);
const loading = ref(false);

const emailError = ref("");
const passwordError = ref("");

// Vérifier si l'utilisateur est déjà connecté au chargement
onMounted(() => {
  const user = localStorage.getItem('redverse_user');
  if (user) {
    try {
      const userData = JSON.parse(user); 
      isLoggedIn.value = true;
      username.value = userData.username || 'User';
    } catch (e) {
      isLoggedIn.value = false;
    }
  }
});

const clearErrors = () => {
  emailError.value = '';
  passwordError.value = '';
};

//  Fonction de validation + envoi au serveur JSON
const handleSubmit = async () => {
  clearErrors();
  loading.value = true;
  router.push('/dashboard');


  try {
    // Validation
    if (tab.value === 'signup') {
      if (!username.value.trim()) {
        emailError.value = 'Username is required';
        loading.value = false;
        return;
      }
    }

    if (!isValidEmail(email.value)) {
      emailError.value = "Invalid email (e.g., user@example.com)";
      loading.value = false;
      return;
    }

    if (!isValidPassword(password.value)) {
      passwordError.value =
        "Password must be ≥ 8 characters with 1 uppercase letter and 1 digit.";
      loading.value = false;
      return;
    }

    // API Call
    let endpoint = '';
    let payload = {};

    if (tab.value === 'signup') {
      endpoint = '/signup';
      payload = { username: username.value, email: email.value, password: password.value };
    } else if (tab.value === 'signin') {
      endpoint = '/signin';
      payload = { email: email.value, password: password.value };
    }

    const response = await fetch('http://localhost:3000' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.message) {
        alert('❌ ' + data.message);
      } else {
        alert('❌ Erreur serveur');
      }
      loading.value = false;
      return;
    }

    /* Success - save user and show sidebar
    alert('✅ ' + data.message);

    // Save user data
    if (tab.value === 'signin' && data.user) {
      if (staySignedIn.value) {
        localStorage.setItem('redverse_user', JSON.stringify(data.user));
      } else {
        localStorage.setItem('redverse_user', JSON.stringify(data.user));
      }
      username.value = data.user.username || email.value;
    } else if (tab.value === 'signup') {
      localStorage.setItem('redverse_user', JSON.stringify({ username: username.value, email: email.value }));
    }

    // Show the sidebar by setting isLoggedIn
    isLoggedIn.value = true;
    
    // Reset fields
    email.value = '';
    password.value = '';*/
    // Success - save user and show sidebar
alert('✅ ' + data.message);

// Save user data
if (tab.value === 'signin' && data.user) {
  localStorage.setItem('redverse_user', JSON.stringify(data.user));
  username.value = data.user.username || email.value;

  // Show dashboard + sidebar
  isLoggedIn.value = true;
  router.push('/dashboard'); // redirect to dashboard
} 
else if (tab.value === 'signup') {
  localStorage.setItem('redverse_user', JSON.stringify({ username: username.value, email: email.value }));

  // Show dashboard + sidebar
  isLoggedIn.value = true;
  router.push('/dashboard'); // redirect to dashboard
}

// Reset fields
email.value = '';
password.value = '';

    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Network error: ' + error.message);
  } finally {
    loading.value = false;
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

/* Layout après connexion */
.logged-in-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 100px 40px 40px;
  width: calc(100% - 280px);
}

.welcome-section {
  background: linear-gradient(135deg, rgba(255, 26, 26, 0.1) 0%, rgba(255, 68, 68, 0.05) 100%);
  border: 1px solid rgba(255, 26, 26, 0.2);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
}

.welcome-section h1 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  background: linear-gradient(135deg, #ff1a1a, #ff6666);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-section p {
  margin: 0;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 80px 20px 20px;
  }
}
</style>
