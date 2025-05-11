<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="pa-4 elevation-3 rounded-lg">
          <div class="text-center mb-6">
            <v-avatar size="80" class="mb-4" color="primary">
              <v-icon size="48" color="white">mdi-book-open-page-variant</v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-bold primary--text">登录到 Figado</h1>
            <p class="text-subtitle-1 text-medium-emphasis">您的个人书籍分享平台</p>
          </div>

          <v-form ref="form" v-model="isFormValid" @submit.prevent="login">
            <v-text-field
              v-model="username"
              label="用户名"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              :rules="usernameRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="密码"
              prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              variant="outlined"
              @click:append-inner="showPassword = !showPassword"
              :rules="passwordRules"
              required
            ></v-text-field>

            <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
              {{ errorMessage }}
            </v-alert>

            <v-btn
              block
              size="large"
              color="primary"
              variant="elevated"
              type="submit"
              class="mb-4"
              :loading="isLoading"
              :disabled="!isFormValid || isLoading"
            >
              登 录
            </v-btn>

            <div class="d-flex align-center justify-space-between">
              <v-btn variant="text" color="primary" to="/reset-password"> 忘记密码？ </v-btn>
              <v-btn variant="text" color="primary" to="/register"> 创建新账号 </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import mobileService from '@/services/MobileService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const isFormValid = ref(false)
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const form = ref(null)
const auth = useAuthStore()

// 表单验证规则
const usernameRules = [
  (v: string) => !!v || '用户名不能为空',
  (v: string) => v.length >= 3 || '用户名不能少于3个字符'
]

const passwordRules = [
  (v: string) => !!v || '密码不能为空',
  (v: string) => v.length >= 6 || '密码不能少于6个字符'
]

async function login() {
  if (!isFormValid.value) return

  try {
    isLoading.value = true
    errorMessage.value = ''

    // 检查网络连接
    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      errorMessage.value = '网络连接错误，请检查您的网络'
      isLoading.value = false
      return
    } // 调用真实API登录
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value })
      })
      if (!response.ok) {
        // 处理错误响应
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch (e) {
          console.error('解析错误响应失败:', e)
        }

        if (response.status === 401) {
          errorMessage.value = '用户名或密码错误'
        } else {
          errorMessage.value = errorData.detail || `登录失败 (${response.status})`
        }
        isLoading.value = false
        return
      }

      // 处理成功响应
      const data = await response.json()
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      localStorage.setItem('username', username.value)
      auth.setToken(data.access)
      auth.setUsername(username.value)

      await mobileService.showToast('登录成功！')
      router.push('/profile')
    } catch (error) {
      console.error('Login error:', error)
      errorMessage.value = '登录失败，请检查网络连接'
    } finally {
      isLoading.value = false
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = '登录过程中发生错误'
    isLoading.value = false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

@media (max-width: 600px) {
  .v-container {
    padding: 12px;
  }
}
</style>
