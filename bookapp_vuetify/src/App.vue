<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>

    <!-- 同步状态指示器 -->
    <sync-status-bar />
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import mobileService from './services/MobileService'
import SyncStatusBar from './components/SyncStatusBar.vue'

onMounted(async () => {
  const isOnline = await mobileService.checkNetwork()
  if (!isOnline) {
    mobileService.showToast('您似乎处于离线状态，部分功能可能无法使用')
  }
})
</script>
