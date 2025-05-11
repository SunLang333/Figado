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
            <v-btn
              v-if="book && book.id"
              color="secondary"
              prepend-icon="mdi-book-open-page-variant"
              class="mr-2"
              @click="readEpubOnline"
            >
              在线阅读
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
    <v-dialog v-model="epubViewer" max-width="1200px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>EPUB 在线阅读</span>
          <v-btn icon @click="epubViewer = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text style="padding: 0">
          <div class="epub-reader-flex">
            <!-- 目录栏 -->
            <div class="epub-toc-panel">
              <v-list dense>
                <v-list-item
                  v-for="item in epubToc"
                  :key="item.id"
                  @click="goToToc(item)"
                  :class="{ 'bg-grey-lighten-3': tocActiveId === item.id }"
                >
                  <v-list-item-title>{{ item.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
            <!-- 阅读器区域 -->
            <div class="epub-viewer-panel">
              <div id="epub-viewer"></div>
              <div class="epub-page-btns">
                <v-btn size="small" icon @click="prevPage"><v-icon>mdi-chevron-left</v-icon></v-btn>
                <v-btn size="small" icon @click="nextPage"
                  ><v-icon>mdi-chevron-right</v-icon></v-btn
                >
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mobileService from '@/services/MobileService'
import { useAuthStore } from '@/stores/auth'
import ApiServiceDebug from '@/services/ApiServiceDebug'
import ePub from 'epubjs'

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
const epubViewer = ref(false)
let epubBlobUrl = ''
let rendition: any = null

const epubToc = ref<any[]>([])
const tocActiveId = ref('')

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

function goToToc(item: any) {
  if (rendition && item && item.href) {
    rendition.display(item.href)
    tocActiveId.value = item.id
  }
}

function prevPage() {
  if (rendition) rendition.prev()
}

function nextPage() {
  if (rendition) rendition.next()
}

async function readEpubOnline() {
  if (!book.value || !book.value.id) return
  epubViewer.value = true
  let baseUrl = ''
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrl = 'http://localhost:8000'
  } else {
    baseUrl = window.location.origin
  }
  const url = `${baseUrl}/api/books/${book.value.id}/download/`
  try {
    console.log('开始 fetch epub:', url)
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`
      }
    })
    console.log('fetch response:', res)
    if (!res.ok) throw new Error('下载失败，状态码：' + res.status)
    const arrayBuffer = await res.arrayBuffer()
    console.log('arrayBuffer:', arrayBuffer)
    if (epubBlobUrl) {
      window.URL.revokeObjectURL(epubBlobUrl)
      epubBlobUrl = ''
    }
    await nextTick()
    const viewer = document.getElementById('epub-viewer')
    if (!viewer) {
      alert('找不到 epub-viewer 容器')
      epubViewer.value = false
      return
    }
    viewer.innerHTML = '' // 清空旧内容
    // 直接用 arrayBuffer 方式加载 epub
    const bookInstance = ePub(arrayBuffer)
    console.log('bookInstance:', bookInstance)
    rendition = bookInstance.renderTo('epub-viewer', { width: '100%', height: '80vh' })
    console.log('rendition:', rendition)
    rendition.display()
    // 错误调试
    bookInstance.on('error', (err: any) => {
      alert('epub.js 加载错误: ' + err)
      console.error('epub.js error:', err)
    })
    rendition.on('rendered', (section: any) => {
      console.log('EPUB section rendered:', section)
      tocActiveId.value = section.href || ''
    })
    bookInstance.loaded.navigation.then(nav => {
      console.log('EPUB navigation:', nav)
      epubToc.value = nav.toc || []
    })
    bookInstance.loaded.metadata.then(meta => {
      console.log('EPUB metadata:', meta)
    })
    bookInstance.loaded.cover.then(cover => {
      console.log('EPUB cover:', cover)
    })
    console.log('EPUB 渲染已触发')
  } catch (e) {
    alert('加载失败：' + e)
    epubViewer.value = false
    console.error('EPUB 加载异常:', e)
  }
}

onMounted(fetchBook)
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}
.epub-reader-flex {
  display: flex;
  width: 100%;
  height: 80vh;
  min-width: 0;
}
.epub-toc-panel {
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  border-right: 1px solid #eee;
  overflow-y: auto;
  background: #fafafa;
  flex-shrink: 0;
}
.epub-viewer-panel {
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
#epub-viewer {
  width: 100%;
  height: 100%;
  min-width: 0;
  flex: 1;
}
.epub-page-btns {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 2;
  display: flex;
  gap: 8px;
}
</style>
