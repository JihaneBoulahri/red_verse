import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes/index.js'
import { Toast } from './ui/Toast.js'

const app = createApp(App)
app.use(router)

// Make Toast available to components and global scope
app.config.globalProperties.Toast = Toast
// Also attach to window so scripts that call `Toast` directly work
if (typeof window !== 'undefined') window.Toast = Toast

app.mount('#app')