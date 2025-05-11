<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-toolbar color="transparent" flat>
          <v-toolbar-title class="text-h5">书籍列表</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="searchQuery"
            density="compact"
            variant="outlined"
            label="搜索书籍"
            append-inner-icon="mdi-magnify"
            single-line
            hide-details
            class="mr-2 search-field"
            @keyup.enter="searchBooks"
          ></v-text-field>
        </v-toolbar>
      </v-col>
    </v-row>

    <!-- 加载中提示 -->
    <v-row v-if="isLoading" justify="center" align="center" style="height: 50vh">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>

    <!-- 网络错误提示 -->
    <v-row v-else-if="networkError" justify="center" align="center" style="height: 50vh">
      <v-col cols="12" md="6" class="text-center">
        <v-icon icon="mdi-wifi-off" size="64" color="grey-lighten-1"></v-icon>
        <h2 class="text-h5 mt-4 text-grey-darken-1">网络连接错误</h2>
        <p class="text-body-1 mb-4">无法加载书籍列表，请检查您的网络连接</p>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchBooks">重试</v-btn>
      </v-col>
    </v-row>

    <!-- 无结果提示 -->
    <v-row v-else-if="books.length === 0" justify="center" align="center" style="height: 50vh">
      <v-col cols="12" md="6" class="text-center">
        <v-icon icon="mdi-book-off" size="64" color="grey-lighten-1"></v-icon>
        <h2 class="text-h5 mt-4 text-grey-darken-1">暂无书籍</h2>
        <p class="text-body-1 mb-4">没有找到符合条件的书籍</p>
        <v-btn color="primary" prepend-icon="mdi-plus" to="/add-book">添加新书籍</v-btn>
      </v-col>
    </v-row>

    <!-- 书籍列表 -->
    <v-row v-else>
      <v-col v-for="book in books" :key="book.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="book-card" @click="viewBookDetails(book.id)" elevation="2">
          <v-img
            :src="book.coverUrl"
            height="200"
            cover
            class="align-end"
            gradient="to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%"
          >
            <v-card-title class="text-white pb-0">{{ book.title }}</v-card-title>
            <v-card-subtitle class="text-white pb-2">{{ book.author }}</v-card-subtitle>
          </v-img>

          <v-card-text>
            <div class="d-flex align-center mb-1">
              <v-rating
                v-model="book.rating"
                color="amber"
                density="compact"
                size="small"
                readonly
                half-increments
              ></v-rating>
              <span class="text-body-2 ml-2">{{ book.rating.toFixed(1) }}</span>
            </div>
            <div class="mb-2">
              <v-chip size="small" color="primary" class="mr-1">{{ book.category }}</v-chip>
              <v-chip size="small" variant="outlined">{{ book.language }}</v-chip>
            </div>
            <p class="text-truncate">{{ book.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 分页控件 -->
    <!-- <v-row justify="center" class="mt-4">
      <v-pagination
        v-model="page"
        :length="totalPages"
        :total-visible="5"
        rounded
        @click:next="nextPage"
        @click:prev="prevPage"
        @update:modelValue="changePage"
      ></v-pagination>
    </v-row> -->
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const auth = useAuthStore()
const isLoading = ref(false)
const networkError = ref(false)
const searchQuery = ref('')
const books = ref<Book[]>([])
const page = ref(1)
const totalPages = ref(5)
const itemsPerPage = 8

onMounted(async () => {
  // 检查网络连接
  const isConnected = await mobileService.checkNetwork()
  if (!isConnected) {
    networkError.value = true
    return
  }

  // 加载书籍列表
  await fetchBooks()
})

async function fetchBooks() {
  try {
    isLoading.value = true
    networkError.value = false

    // 检查网络连接
    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      networkError.value = true
      isLoading.value = false
      return
    }

    // 从后端API获取书籍数据，token自动由ApiServiceDebug带上
    const rawBooks = await ApiServiceDebug.get<any[]>('/api/books/', auth.accessToken)
    books.value = rawBooks.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_image || '',
      rating: typeof book.rating === 'number' ? book.rating : 0,
      category: book.category || '',
      language: book.language || '',
      description: book.description || ''
    }))
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching books:', error)
    networkError.value = true
    isLoading.value = false
  }
}

async function searchBooks() {
  try {
    isLoading.value = true
    networkError.value = false

    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      networkError.value = true
      isLoading.value = false
      return
    }

    // 构造查询参数
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)

    const url = `/api/books/?${params.toString()}`
    const rawBooks = await ApiServiceDebug.get<any[]>(url, auth.accessToken)
    books.value = rawBooks.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_image || '',
      rating: typeof book.rating === 'number' ? book.rating : 0,
      category: book.category || '',
      language: book.language || '',
      description: book.description || ''
    }))
    isLoading.value = false
  } catch (error) {
    console.error('Error searching books:', error)
    networkError.value = true
    isLoading.value = false
  }
}

function viewBookDetails(bookId: number) {
  router.push({ path: `/book/${bookId}` })
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--
  }
}

function changePage(newPage: number) {
  console.log('Changed to page:', newPage)
  // 实际项目中应调用API获取指定页码的数据
}
</script>

<style scoped>
.book-card {
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  height: 100%;
}

/* 移除悬浮动画 */
.book-card:hover {
  transform: none;
  box-shadow: none;
}

@media (max-width: 600px) {
  .search-field {
    max-width: 120px;
  }
}
</style>
