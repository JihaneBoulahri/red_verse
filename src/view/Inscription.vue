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
            <label class="label">Username</label>
            <input
              v-model="username"
              type="text"
              placeholder="Choose a unique name"
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
          <label class="label mt-4">Password</label>
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
            <label class="label mt-4">Confirm Password</label>
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
              <span>I accept the<a href="#" class="link">terms of use</a></span>
            </label>
          </div>

          <a v-if="tab === 'signin'" href="#" class="link forgot-password mt-4">
            forgot password?
          </a>

          <!-- Submit Button -->
          <button
            @click="handleSubmit"
            :disabled="isLoading"
            class="btn-send"
          >
            <span v-if="!isLoading">
              {{ tab === "signin" ? "Log in" : "Sign up" }}
            </span>
            <span v-else>⏳Loading...</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Right Side - Info / Toggle -->
        <div class="right-side">
          <h2 class="section-title">
            {{ tab === "signin" ? "No account?" : "You have an account?" }}
          </h2>

          <p class="info-text">
            {{ tab === "signin" 
              ? "Create an account to access all our services and enjoy the full RedVerse experience." 
              : "Log in to access your playlists, your favorites, and continue your musical adventure." }}
          </p>

          <button
            @click="toggleTab"
            class="btn-send mt-6"
          >
            {{ tab === "signin" ? "Create an account" : "Log in" }}
          </button>

          <!-- Features -->
          <div class="features-list mt-8">
            <div class="feature">
              <span class="icon">🎵</span>
              <span>Discover the music</span>
            </div>
            <div class="feature">
              <span class="icon">🎧</span>
              <span>Custom Playlists</span>
            </div>
            <div class="feature">
              <span class="icon">❤️</span>
              <span>Your favorites in one click</span>
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
import { useRouter } from "vue-router";

const router = useRouter();


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
  confirmPassword: "",
});

//VALIDATION FUNCTIONS
const validateUsername = () => {
  errors.value.username = "";
  if (tab.value === "signup" && username.value.length < 3) {
    errors.value.username = "Min 3 characters";
  }
};

const validateEmail = () => {
  errors.value.email = "";
  if (!isValidEmail(email.value)) {
    errors.value.email = "Invalid email";
  }
};

const validatePassword = () => {
  errors.value.password = "";
  if (!isValidPassword(password.value)) {
    errors.value.password = "Minimum 8 characters (1 uppercase letter, 1 number)";
  }
};

const validateConfirmPassword = () => {
  errors.value.confirmPassword = "";
  if (tab.value === "signup" && password.value !== confirmPassword.value) {
    errors.value.confirmPassword = "The passwords do not match";
  }
};

//TOGGLE TAB
const toggleTab = () => {
  tab.value = tab.value === "signin" ? "signup" : "signin";
  clearForm();
};


// CLEAR FORM
const clearForm = () => {
  username.value = "";
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
  acceptTerms.value = false;
  showPassword.value = false;

  errors.value = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
};


//SUBMIT HANDLER:

const handleSubmit = async () => {
  validateUsername();
  validateEmail();
  validatePassword();

  if (tab.value === "signup") {
    validateConfirmPassword();

    if (!acceptTerms.value) {
      Toast.error("Accept the terms of use");
      return;
    }
  }

  if (Object.values(errors.value).some((e) => e)) {
    Toast.error("❗Please correct the errors");
    return;
  }

  isLoading.value = true;

  try {
    /* -------------------- SIGN IN -------------------- */
    if (tab.value === "signin") {
      const response = await fetch("http://localhost:3000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      if (!response.ok) throw new Error("Connection failed");

      const data = await response.json();
      const userNameFromDb = data?.user?.username;

      localStorage.setItem(
        "redverse_user",
        JSON.stringify({ username: userNameFromDb })
      );

      Toast.success("Connection successful !");
      router.push("/dashboard");
      clearForm();
    }

    /* -------------------- SIGN UP -------------------- */
    else {
      const response = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value,
          email: email.value,
          password: password.value,
        }),
      });

      if (!response.ok) throw new Error("Registration failed");

      const data = await response.json();

      localStorage.setItem(
        "redverse_user",
        JSON.stringify({ username: username.value })
      );

      Toast.success("Inscription successful! Welcome!");
      router.push("/dashboard");
      clearForm();
      tab.value = "signin";
    }
  } catch (error) {
    Toast.error(error.message || "An error has occurred");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.right-side {
  width: 60%;
}

.left-side {
  width: 40%;
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
