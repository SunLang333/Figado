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

const app = createApp(App)

registerPlugins(app)

// 在移动设备上初始化状态栏
document.addEventListener(
  'deviceready',
  async () => {
    await mobileService.initStatusBar()
  },
  false
)

app.mount('#app')
