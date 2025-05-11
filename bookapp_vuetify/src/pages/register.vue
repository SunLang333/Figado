<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="pa-4 elevation-3 rounded-lg">
          <div class="text-center mb-6">
            <v-avatar size="80" class="mb-4" color="primary">
              <v-icon size="48" color="white">mdi-account-plus</v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-bold primary--text">注册 Figado</h1>
            <p class="text-subtitle-1 text-medium-emphasis">创建您的个人书籍分享账户</p>
          </div>

          <v-form ref="form" v-model="isFormValid" @submit.prevent="register">
            <v-text-field
              v-model="username"
              label="用户名"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              :rules="usernameRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="email"
              label="邮箱"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              :rules="emailRules"
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

            <v-text-field
              v-model="confirmPassword"
              label="确认密码"
              prepend-inner-icon="mdi-lock-check"
              :type="showConfirmPassword ? 'text' : 'password'"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              variant="outlined"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              :rules="confirmPasswordRules"
              required
            ></v-text-field>

            <v-autocomplete
              v-model="languages"
              label="擅长语言"
              prepend-inner-icon="mdi-translate"
              variant="outlined"
              :items="availableLanguages"
              multiple
              chips
            ></v-autocomplete>

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
              注 册
            </v-btn>

            <div class="text-center">
              <span class="text-medium-emphasis">已有账号？</span>
              <v-btn variant="text" color="primary" to="/login"> 登录 </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import mobileService from '@/services/MobileService'

const router = useRouter()
const isFormValid = ref(false)
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const languages = ref([])
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const form = ref(null)

// 可选语言列表
const availableLanguages = [
  '中文',
  '英语',
  '日语',
  '韩语',
  '法语',
  '德语',
  '西班牙语',
  '俄语',
  '阿拉伯语'
]

// 表单验证规则
const usernameRules = [
  (v: string) => !!v || '用户名不能为空',
  (v: string) => v.length >= 3 || '用户名不能少于3个字符',
  (v: string) => /^[a-zA-Z0-9_]+$/.test(v) || '用户名只能包含字母、数字和下划线'
]

const emailRules = [
  (v: string) => !!v || '邮箱不能为空',
  (v: string) => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址'
]

const passwordRules = [
  (v: string) => !!v || '密码不能为空',
  (v: string) => v.length >= 8 || '密码不能少于8个字符',
  (v: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || '密码必须包含大小写字母和数字'
]

const confirmPasswordRules = [
  (v: string) => !!v || '请确认密码',
  (v: string) => v === password.value || '两次输入的密码不一致'
]

async function register() {
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
    }

    // 真实API注册调用
    const response = await fetch('http://localhost:8000/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
        languages: languages.value
      })
    })

    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch (e) {}
      errorMessage.value = errorData && errorData.detail ? errorData.detail : '注册失败，请重试'
      isLoading.value = false
      return
    }

    await mobileService.showToast('注册成功！请登录')
    router.push('/login')
  } catch (error) {
    console.error('Registration error:', error)
    errorMessage.value = '注册过程中发生错误'
  } finally {
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
