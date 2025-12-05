<template>
  <div
    class="min-h-screen bg-cover bg-center"
    :style="{ backgroundImage: `url(${bg})` }"
  >
    <div class="min-h-screen text-white px-4">
      
      <!-- Modal Inscription -->
      <div class="modal main-modal">
        <!-- Left Side - Formulaire -->
        <div class="left-side">
          <h2 class="section-title">
            {{ tab === "signin" ? "Connexion" : "Inscription" }}
          </h2>

          <!-- Username (Sign Up Only) -->
          <div v-if="tab === 'signup'">
            <label class="label">Nom d'utilisateur</label>
            <input
              v-model="username"
              type="text"
              placeholder="Choisissez un nom unique"
              class="input"
              @blur="validateUsername"
            />
            <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
          </div>

          <!-- Email -->
          <label class="label mt-4">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            class="input"
            @blur="validateEmail"
          />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

          <!-- Password -->
          <label class="label mt-4">Mot de passe</label>
          <div class="password-input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="input"
              @blur="validatePassword"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="eye-toggle"
            >
              {{ showPassword ? "👁️" : "👁️‍🗨️" }}
            </button>
          </div>
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

          <!-- Confirm Password (Sign Up Only) -->
          <div v-if="tab === 'signup'">
            <label class="label mt-4">Confirmer le mot de passe</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="input"
              @blur="validateConfirmPassword"
            />
            <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Terms & Options -->
          <div v-if="tab === 'signup'" class="mt-4">
            <label class="checkbox-label">
              <input type="checkbox" v-model="acceptTerms" class="checkbox" />
              <span>J'accepte les <a href="#" class="link">conditions d'utilisation</a></span>
            </label>
          </div>

          <a v-if="tab === 'signin'" href="#" class="link forgot-password mt-4">
            Mot de passe oublié?
          </a>

          <!-- Submit Button -->
          <button
            @click="handleSubmit"
            :disabled="isLoading"
            class="btn-send"
          >
            <span v-if="!isLoading">
              {{ tab === "signin" ? "Se connecter" : "S'inscrire" }}
            </span>
            <span v-else>⏳ Chargement...</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Right Side - Info / Toggle -->
        <div class="right-side">
          <h2 class="section-title">
            {{ tab === "signin" ? "Pas de compte?" : "Vous avez un compte?" }}
          </h2>

          <p class="info-text">
            {{ tab === "signin" 
              ? "Créez un compte pour accéder à tous nos services et profiter de l'expérience RedVerse complète." 
              : "Connectez-vous pour retrouver vos playlists, vos favoris et continuer votre aventure musicale." }}
          </p>

          <button
            @click="toggleTab"
            class="btn-send mt-6"
          >
            {{ tab === "signin" ? "Créer un compte" : "Se connecter" }}
          </button>

          <!-- Features -->
          <div class="features-list mt-8">
            <div class="feature">
              <span class="icon">🎵</span>
              <span>Découvrez la musique</span>
            </div>
            <div class="feature">
              <span class="icon">🎧</span>
              <span>Playlists personnalisées</span>
            </div>
            <div class="feature">
              <span class="icon">❤️</span>
              <span>Vos favoris en un clic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import bg from "../assets/contact-bg.png";
import { isValidEmail, isValidPassword } from "../services/Valide.js";
import { Toast } from "../ui/Toast.js";

// State
const tab = ref("signin");
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const acceptTerms = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);

const errors = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
});

// Validation functions
const validateUsername = () => {
  errors.value.username = "";
  if (tab.value === "signup" && username.value.length < 3) {
    errors.value.username = "Min 3 caractères";
  }
};

const validateEmail = () => {
  errors.value.email = "";
  if (!isValidEmail(email.value)) {
    errors.value.email = "Email invalide";
  }
};

const validatePassword = () => {
  errors.value.password = "";
  if (!isValidPassword(password.value)) {
    errors.value.password = "Min 8 caractères (1 majuscule, 1 chiffre)";
  }
};

const validateConfirmPassword = () => {
  errors.value.confirmPassword = "";
  if (tab.value === "signup" && password.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Les mots de passe ne correspondent pas";
  }
};

// Toggle tab
const toggleTab = () => {
  tab.value = tab.value === "signin" ? "signup" : "signin";
  clearForm();
};

// Clear form
const clearForm = () => {
  username.value = "";
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
  acceptTerms.value = false;
  showPassword.value = false;
  errors.value = { username: "", email: "", password: "", confirmPassword: "" };
};

// Submit handler
const handleSubmit = async () => {
  // Validate all fields
  validateUsername();
  validateEmail();
  validatePassword();
  if (tab.value === "signup") {
    validateConfirmPassword();
    if (!acceptTerms.value) {
      Toast.error("Acceptez les conditions d'utilisation");
      return;
    }
  }

  // Check for errors
  if (Object.values(errors.value).some(e => e)) {
    Toast.error("Veuillez corriger les erreurs");
    return;
  }

  isLoading.value = true;

  try {
    if (tab.value === "signin") {
      // Sign In logic
      const response = await fetch("http://localhost:3000/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value, password: password.value })
      });

      if (!response.ok) {
        throw new Error("Connexion échouée");
      }

      Toast.success("Connexion réussie!");
      clearForm();
    } else {
      // Sign Up logic
      const response = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value,
          email: email.value,
          password: password.value
        })
      });

      if (!response.ok) {
        throw new Error("Inscription échouée");
      }

      Toast.success("Inscription réussie! Bienvenue!");
      clearForm();
      tab.value = "signin";
    }
  } catch (error) {
    Toast.error(error.message || "Une erreur est survenue");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@import url("../css/contact.css");

/* Additional Inscription styles */

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.eye-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s ease;
}

.eye-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
}

.error-text {
  font-size: 0.85rem;
  color: #ff4444;
  margin-top: 4px;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  transition: color 0.2s ease;
}

.checkbox-label:hover {
  color: rgba(255, 255, 255, 1);
}

.checkbox {
  cursor: pointer;
  accent-color: #ff0000;
  width: 16px;
  height: 16px;
}

.link {
  color: #ff0000;
  text-decoration: none;
  transition: all 0.2s ease;
}

.link:hover {
  color: #ff4444;
  text-decoration: underline;
}

.forgot-password {
  display: block;
  margin-top: 8px;
  font-size: 0.9rem;
}


.features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.feature:hover {
  color: #ff0000;
  transform: translateX(5px);
}

.icon {
  font-size: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .main-modal {
    flex-direction: column;
    width: 90%;
    padding: 25px;
  }

  .divider {
    display: none;
  }

  .left-side,
  .right-side {
    width: 100%;
  }
}
</style>
