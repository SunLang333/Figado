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
          <v-btn color="primary" prepend-icon="mdi-filter-variant">
            筛选
            <v-menu activator="parent" location="bottom end">
              <v-card min-width="300">
                <v-list>
                  <v-list-subheader>分类</v-list-subheader>
                  <v-list-item v-for="category in categories" :key="category.value">
                    <template v-slot:prepend>
                      <v-checkbox
                        v-model="selectedCategories"
                        :value="category.value"
                        hide-details
                        density="compact"
                      ></v-checkbox>
                    </template>
                    <v-list-item-title>{{ category.text }}</v-list-item-title>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-subheader>语言</v-list-subheader>
                  <v-list-item v-for="language in languages" :key="language.value">
                    <template v-slot:prepend>
                      <v-checkbox
                        v-model="selectedLanguages"
                        :value="language.value"
                        hide-details
                        density="compact"
                      ></v-checkbox>
                    </template>
                    <v-list-item-title>{{ language.text }}</v-list-item-title>
                  </v-list-item>
                </v-list>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn variant="text" @click="resetFilters">重置</v-btn>
                  <v-btn color="primary" @click="applyFilters">应用</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-btn>
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
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            :elevation="isHovering ? 8 : 2"
            @click="viewBookDetails(book.id)"
            class="book-card"
          >
            <v-img
              :src="book.coverUrl"
              height="200"
              cover
              class="align-end"
              :class="{ 'on-hover': isHovering }"
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

            <v-divider v-if="isHovering" class="mx-4"></v-divider>
            <v-card-actions v-if="isHovering">
              <v-btn variant="text" size="small" color="primary"> 查看详情 </v-btn>
              <v-spacer></v-spacer>
              <v-btn icon variant="text" size="small">
                <v-icon>mdi-heart</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small">
                <v-icon>mdi-bookmark</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <!-- 分页控件 -->
    <v-row justify="center" class="mt-4">
      <v-pagination
        v-model="page"
        :length="totalPages"
        :total-visible="5"
        rounded
        @click:next="nextPage"
        @click:prev="prevPage"
        @update:modelValue="changePage"
      ></v-pagination>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

// 分类和语言筛选
const selectedCategories = ref<string[]>([])
const selectedLanguages = ref<string[]>([])

const categories = [
  { text: '小说', value: 'novel' },
  { text: '散文', value: 'essay' },
  { text: '诗歌', value: 'poetry' },
  { text: '历史', value: 'history' },
  { text: '科学', value: 'science' },
  { text: '技术', value: 'technology' }
]

const languages = [
  { text: '中文', value: 'zh' },
  { text: '英语', value: 'en' },
  { text: '日语', value: 'ja' },
  { text: '法语', value: 'fr' },
  { text: '德语', value: 'de' }
]

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

function viewBookDetails(bookId: number) {
  router.push({ path: `/book/${bookId}` })
}

function searchBooks() {
  // 实现搜索功能
  console.log('Searching for:', searchQuery.value)
  // 实际项目中应调用API进行搜索
}

function resetFilters() {
  selectedCategories.value = []
  selectedLanguages.value = []
}

function applyFilters() {
  // 实现筛选功能
  console.log('Applied filters:', {
    categories: selectedCategories.value,
    languages: selectedLanguages.value
  })
  // 实际项目中应调用API进行筛选
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

.book-card:hover {
  transform: translateY(-5px);
}

.on-hover {
  opacity: 1 !important;
}

@media (max-width: 600px) {
  .search-field {
    max-width: 120px;
  }
}
</style>
