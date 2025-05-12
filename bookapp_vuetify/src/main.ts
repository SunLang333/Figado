/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Services
import mobileService from './services/MobileService'
import syncService from './services/SyncService'

// Styles
import 'unfonts.css'

// Pinia
import { createPinia } from 'pinia'

const app = createApp(App)

app.use(createPinia())

registerPlugins(app)

// 在移动设备上初始化状态栏
document.addEventListener(
  'deviceready',
  async () => {
    await mobileService.initStatusBar()
  },
  false
)

// Mount the app
app.mount('#app')

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker registration failed:', err))
  })
}
