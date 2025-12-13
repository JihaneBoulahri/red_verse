import { ref } from 'vue'

const currentTrack = ref(null)
const playing = ref(false)
const progress = ref(0)
const duration = ref(0)

const audio = new Audio()
audio.crossOrigin = 'anonymous'

audio.addEventListener('timeupdate', () => {
  if (audio.duration && !isNaN(audio.duration)) {
    progress.value = audio.currentTime
    duration.value = audio.duration
  }
})

audio.addEventListener('ended', () => {
  playing.value = false
})

audio.addEventListener('play', () => { playing.value = true })
audio.addEventListener('pause', () => { playing.value = false })

async function play(track) {
  if (!track) return
  if (!track.preview) {
    console.warn('No preview for track', track)
    return
  }

  // resume if same track
  if (currentTrack.value && currentTrack.value.id === track.id) {
    try { await audio.play(); playing.value = true } catch (e) { console.error(e) }
    return
  }

  currentTrack.value = track
  try {
    audio.src = track.preview
    audio.load()
    await audio.play()
    playing.value = true
  } catch (e) {
    console.error('player play error', e)
    playing.value = false
  }
}

function pause() { audio.pause() }
function toggle() { if (playing.value) pause(); else if (currentTrack.value) play(currentTrack.value) }
function seek(t) { if (!isNaN(t) && audio.duration) audio.currentTime = Math.min(Math.max(0, t), audio.duration) }
function setVolume(v) { audio.volume = Math.min(Math.max(0, v), 1) }

export default {
  currentTrack,
  playing,
  progress,
  duration,
  play,
  pause,
  toggle,
  seek,
  setVolume
}
