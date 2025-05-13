<template>
  <v-app-bar app color="primary" dark :elevation="3" class="with-safe-area-top">
    <v-app-bar-nav-icon v-if="!showButtons" @click.stop="drawer = !drawer" />
    <v-toolbar-title @click="navigateTo('/books')" class="text-truncate"
      >Figaro 书籍分享</v-toolbar-title
    >
    <v-spacer />

    <!-- 大屏幕上显示的按钮 -->
    <div class="d-none d-sm-flex">
      <v-btn variant="text" to="/books" prepend-icon="mdi-format-list-bulleted">列表</v-btn>
      <v-btn v-if="!loggedIn" variant="text" to="/login">登录</v-btn>
      <v-btn v-if="!loggedIn" variant="text" to="/register">注册</v-btn>
      <v-btn v-if="loggedIn" variant="text" to="/profile">个人中心</v-btn>
      <v-btn v-if="loggedIn" variant="text" @click="logout">退出</v-btn>
    </div>

    <!-- 用户头像 -->
    <v-avatar v-if="loggedIn" class="ml-2" size="36">
      <v-img src="https://i.pravatar.cc/150?img=7"></v-img>
    </v-avatar>
  </v-app-bar>

  <!-- 抽屉导航 (小屏幕) -->
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item title="Figaro 书籍分享" prepend-icon="mdi-book-open-page-variant" />
      <v-divider></v-divider>
      <v-list-item to="/books" prepend-icon="mdi-format-list-bulleted">列表</v-list-item>
      <template v-if="!loggedIn">
        <v-list-item to="/login" prepend-icon="mdi-login">登录</v-list-item>
        <v-list-item to="/register" prepend-icon="mdi-account-plus">注册</v-list-item>
      </template>
      <template v-else>
        <v-list-item to="/profile" prepend-icon="mdi-account">
          <v-list-item-title>个人中心</v-list-item-title>
          <v-list-item-subtitle>{{ username }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item @click="logout" prepend-icon="mdi-logout">退出</v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import mobileService from '../services/MobileService'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const router = useRouter()
const drawer = ref(false)

const loggedIn = computed(() => auth.loggedIn)
const username = computed(() => auth.username)

const showButtons = ref(true)

function updateShowButtons() {
  showButtons.value = window.innerWidth >= 600
}

onMounted(() => {
  updateShowButtons()
  window.addEventListener('resize', updateShowButtons)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateShowButtons)
})

function navigateTo(path: string) {
  router.push(path)
  drawer.value = false
}

async function logout() {
  auth.logout()
  await mobileService.showToast('退出登录成功')
  router.push('/login')
  drawer.value = false
}
</script>

<style scoped>
.v-toolbar-title {
  cursor: pointer;
  max-width: 180px;
}

/* 针对移动设备的额外样式 */
@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1.1rem;
  }
}

/* 只在安卓App/PWA下，NavBar顶部适配安全区 */
.with-safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}
</style>
