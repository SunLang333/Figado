<template>
  <v-sheet v-if="showStatus" class="sync-status-bar" :color="syncStatusColor" rounded="lg">
    <div class="d-flex align-center pa-2">
      <v-icon :icon="syncStatusIcon" size="small" class="mr-2"></v-icon>
      <span class="text-caption">{{ syncStatusText }}</span>
      <v-spacer></v-spacer>
      <v-btn
        v-if="pendingCount > 0"
        size="x-small"
        icon
        variant="text"
        @click="startSync"
        :loading="isSyncing"
      >
        <v-icon>mdi-sync</v-icon>
      </v-btn>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import mobileService from '@/services/MobileService'
import { syncService } from '@/services/SyncService'
import { Network } from '@capacitor/network'

const isSyncing = ref(false)
const pendingCount = ref(0)
const networkConnected = ref(true)
const lastSync = ref<string | null>(null)
const showStatus = computed(() => pendingCount.value > 0 || !networkConnected.value)

// 网络状态监听器
let networkListener: any = null

// 状态文本
const syncStatusText = computed(() => {
  if (!networkConnected.value) {
    return '离线模式'
  }
  if (pendingCount.value > 0) {
    return `${pendingCount.value} 个更改等待同步`
  }
  return ''
})

// 状态图标
const syncStatusIcon = computed(() => {
  if (!networkConnected.value) {
    return 'mdi-wifi-off'
  }
  if (pendingCount.value > 0) {
    return 'mdi-sync-alert'
  }
  return 'mdi-check-circle'
})

// 状态颜色
const syncStatusColor = computed(() => {
  if (!networkConnected.value) {
    return 'warning'
  }
  if (pendingCount.value > 0) {
    return 'info'
  }
  return 'success'
})

// 启动同步
async function startSync() {
  if (isSyncing.value || !networkConnected.value) return

  isSyncing.value = true
  await syncService.startSync()
  isSyncing.value = false

  // 重新加载同步状态
  loadSyncStatus()
}

// 加载同步状态
async function loadSyncStatus() {
  try {
    const status = await syncService.getSyncStatus()
    pendingCount.value = status.pendingCount
    lastSync.value = status.lastSync
  } catch (error) {
    console.error('加载同步状态出错：', error)
  }
}

// 检查网络状态
async function checkNetworkStatus() {
  try {
    const status = await Network.getStatus()
    networkConnected.value = status.connected
  } catch (error) {
    console.error('检查网络状态出错：', error)
    networkConnected.value = true
  }
}

// 组件挂载
onMounted(async () => {
  // 初始化状态
  await checkNetworkStatus()
  await loadSyncStatus()

  // 设置网络监听
  networkListener = Network.addListener('networkStatusChange', async status => {
    networkConnected.value = status.connected

    // 如果网络恢复且有待同步项，显示提示
    if (status.connected && pendingCount.value > 0) {
      await mobileService.showToast('网络已恢复，正在同步数据')
      startSync()
    }
  })

  // 定期刷新状态
  setInterval(loadSyncStatus, 30000)
})

// 组件卸载
onBeforeUnmount(() => {
  // 移除监听器
  if (networkListener) {
    networkListener.remove()
  }
})
</script>

<style scoped>
.sync-status-bar {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 999;
  max-width: 250px;
}

@media (max-width: 600px) {
  .sync-status-bar {
    max-width: calc(100% - 32px);
  }
}
</style>
