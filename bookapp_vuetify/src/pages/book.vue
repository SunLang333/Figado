<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-4">
          <v-img :src="book.coverUrl" height="300" class="mb-4" v-if="book.coverUrl" />
          <h1 class="text-h4 font-weight-bold mb-2">{{ book.title }}</h1>
          <div class="mb-2"><span class="text-subtitle-1">作者：</span>{{ book.author }}</div>
          <div class="mb-2">
            <span class="text-subtitle-1">分类：</span>{{ book.category }}
            <span class="ml-4 text-subtitle-1">语言：</span>{{ book.language }}
          </div>
          <div class="mb-2">
            <span class="text-subtitle-1">评分：</span>
            <v-rating
              v-model="book.rating"
              color="amber"
              density="compact"
              size="small"
              readonly
              half-increments
            ></v-rating>
            <span class="ml-2">{{ book.rating.toFixed(1) }}</span>
          </div>
          <div class="mb-2">
            <span class="text-subtitle-1">简介：</span>
            <span>{{ book.description }}</span>
          </div>
          <v-divider class="my-4" />
          <div class="d-flex align-center mb-4">
            <v-btn
              v-if="book && book.id"
              color="primary"
              prepend-icon="mdi-download"
              class="mr-2"
              @click="downloadEpub"
            >
              下载 EPUB
            </v-btn>
            <v-btn color="primary" @click="goBack">返回列表</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="isLoading" justify="center" align="center" style="height: 30vh">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>
    <v-row v-if="networkError" justify="center" align="center" style="height: 30vh">
      <v-col cols="12" class="text-center">
        <v-icon icon="mdi-wifi-off" size="64" color="grey-lighten-1"></v-icon>
        <h2 class="text-h5 mt-4 text-grey-darken-1">网络连接错误</h2>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchBook">重试</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mobileService from '@/services/MobileService'
import { useAuthStore } from '@/stores/auth'
import ApiServiceDebug from '@/services/ApiServiceDebug'

interface Book {
  id: number
  title: string
  author: string
  coverUrl: string
  rating: number
  category: string
  language: string
  description: string
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isLoading = ref(false)
const networkError = ref(false)
const book = ref<Book>({
  id: 0,
  title: '',
  author: '',
  coverUrl: '',
  rating: 0,
  category: '',
  language: '',
  description: ''
})

async function fetchBook() {
  try {
    isLoading.value = true
    networkError.value = false
    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      networkError.value = true
      isLoading.value = false
      return
    }
    const bookId = route.params.id
    const raw = await ApiServiceDebug.get<any>(`/api/books/${bookId}/`, auth.accessToken)
    book.value = {
      id: raw.id,
      title: raw.title,
      author: raw.author,
      coverUrl: raw.cover_image || '',
      rating: typeof raw.rating === 'number' ? raw.rating : 0,
      category: raw.category || '',
      language: raw.language || '',
      description: raw.description || ''
    }
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching book:', error)
    networkError.value = true
    isLoading.value = false
  }
}

function goBack() {
  router.push('/books')
}

async function downloadEpub() {
  if (!book.value || !book.value.id) return
  let baseUrl = ''
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrl = 'http://localhost:8000'
  } else {
    baseUrl = window.location.origin
  }
  const url = `${baseUrl}/api/books/${book.value.id}/download/`
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`
      }
    })
    if (!res.ok) {
      throw new Error('下载失败，状态码：' + res.status)
    }
    const blob = await res.blob()
    const contentDisposition = res.headers.get('Content-Disposition')
    let filename = 'book.epub'
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/)
      if (match) filename = decodeURIComponent(match[1])
    }
    const blobUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(blobUrl)
  } catch (e) {
    alert('下载失败：' + e)
  }
}

onMounted(fetchBook)
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}
</style>
