<template>
  <div
    class="min-h-screen bg-cover bg-center"
    :style="{ backgroundImage: `url(${bg})` }"
  >
  <div>
    <div class="min-h-screen text-white px-4">

      <!-- Slogan -->
      <h1 class="title-hero pt-20">
        <span class="red">F</span>eel The Beat,
        <span class="red">J</span>oin The Verse
      </h1>

      <!-- Modal Contact -->
      <div class="modal main-modal">
        
        <!-- Contact Form -->
        <div class="left-side">
          <h2 class="section-title">Contact Us</h2>

          <label class="label">Name</label>
          <input type="text" class="input" required />

          <label class="label mt-4">Email</label>
          <input type="email" class="input" required />

          <label class="label mt-4">Message</label>
          <textarea rows="4" class="input textarea" required></textarea>

          <button @click="sendMessage" class="btn-send">Send Message</button>
        </div>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Info -->
        <div class="right-side">
          <h2 class="section-title">Our Info</h2>

          <p class="info-text">
            🎵 Welcome to our music universe.<br />
            📍 Morocco, Meknes<br />
            📧 RedVerse@gmail.com<br />
            ☎ +212 5 00 00 00 00
          </p>
        </div>

      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import bg from "../assets/contact-bg.png";
import { Toast } from "../ui/Toast.js";

function sendMessage() {
  console.log("Message sent");
  Toast.success("success!");
  /* Toast.info("Your message has been sent!");
  Toast.error("err!"); */
}

</script>
