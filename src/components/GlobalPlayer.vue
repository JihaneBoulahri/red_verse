<template>
  <div
    v-if="currentTrack"
    class="global-player fixed bottom-0 left-0
           w-full
           bg-black/95 backdrop-blur-xl
           px-4 py-3
           flex items-center gap-4
           z-50 "
  >
    <!-- Cover -->
    <img
      :src="coverUrl"
      class="w-14 h-14 rounded-lg object-cover shadow-md"
    />

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="text-white font-semibold truncate">
        {{ currentTrack.title }}
      </div>
      <div class="text-gray-400 text-sm truncate">
        {{ currentTrack.artist?.name || currentTrack.artist }}
      </div>

      <div class="mt-2 flex items-center gap-3">
        <input
          type="range"
          min="0"
          :max="duration || 1"
          step="0.1"
          :value="progress"
          @input="onSeek($event)"
          class="w-full h-1 rounded-full
                 accent-red-600
                 bg-gray-700 cursor-pointer"
        />
        <div class="text-xs text-gray-500 whitespace-nowrap">
          {{ formatTime(progress) }} / {{ formatTime(duration) }}
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-2">
      <button
        @click="toggle"
        class="w-10 h-10 flex items-center justify-center
               bg-gray-900 hover:bg-gray-800
               text-white rounded-full transition"
      >
        {{ playing ? '❚❚' : '▶' }}
      </button>

      <button
        @click="stop"
        class="w-10 h-10 flex items-center justify-center
               bg-gray-900 hover:bg-red-600
               text-white rounded-full transition"
      >
        ✕
      </button>
    </div>
  </div>
</template>


<script setup>
import player from '../services/player'
import { computed } from 'vue'

const currentTrack = computed(() => player.currentTrack.value)
const playing = computed(() => player.playing.value)
const progress = computed(() => player.progress.value)
const duration = computed(() => player.duration.value)

const coverUrl = computed(() => {
  const t = player.currentTrack.value
  if (!t) return null
  const small = t.album?.cover_small || t.cover_small
  const medium = t.album?.cover_medium || t.cover_medium
  if (small || medium) return small || medium
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>" +
    "<rect width='100%' height='100%' fill='#0f1720'/>" +
    "<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='18' fill='#9ca3af' font-family='Arial'>♪</text>" +
    "</svg>"
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
})

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const sec = Math.floor(s)
  const m = Math.floor(sec / 60)
  const ss = String(sec % 60).padStart(2, '0')
  return `${m}:${ss}`
}

function onSeek(e) { const v = parseFloat(e.target.value); player.seek(v) }
function stop() { player.pause(); player.currentTrack.value = null }
function toggle() { player.toggle() }
</script>

<style scoped>
.global-player {
  height: 86px; 
}
</style>
