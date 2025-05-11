import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // token
  const accessToken = ref(localStorage.getItem('access') || '')
  const username = ref(localStorage.getItem('username') || '')

  // 登录状态
  const loggedIn = computed(() => !!accessToken.value)

  function setToken(token: string) {
    accessToken.value = token
    localStorage.setItem('access', token)
  }

  function setUsername(name: string) {
    username.value = name
    localStorage.setItem('username', name)
  }

  function logout() {
    accessToken.value = ''
    username.value = ''
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('username')
  }

  // 监听 localStorage 变化（多标签页同步）
  window.addEventListener('storage', () => {
    accessToken.value = localStorage.getItem('access') || ''
    username.value = localStorage.getItem('username') || ''
  })

  return { accessToken, username, loggedIn, setToken, setUsername, logout }
})
