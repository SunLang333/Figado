<template>
  <v-container>
    <!-- 加载中提示 -->
    <v-row v-if="isLoading" justify="center" align="center" style="height: 70vh">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>

    <!-- 错误信息 -->
    <v-row v-else-if="error" justify="center" align="center" style="height: 70vh">
      <v-col cols="12" md="8" class="text-center">
        <v-icon icon="mdi-alert-circle" size="64" color="error"></v-icon>
        <h2 class="text-h5 mt-4">加载失败</h2>
        <p class="text-body-1 mb-4">无法加载书籍详情，请稍后再试</p>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchBookDetails">重试</v-btn>
        <v-btn variant="text" to="/books" class="ml-2">返回列表</v-btn>
      </v-col>
    </v-row>

    <!-- 书籍详情 -->
    <template v-else-if="book">
      <!-- 返回按钮 -->
      <v-row>
        <v-col cols="12">
          <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/books" class="mb-4">
            返回列表
          </v-btn>
        </v-col>
      </v-row>

      <!-- 书籍基本信息 -->
      <v-row>
        <v-col cols="12" sm="4">
          <v-img :src="book.coverUrl" height="400" class="rounded-lg book-cover" cover></v-img>
          <div class="d-flex justify-center mt-4">
            <v-btn color="primary" prepend-icon="mdi-share-variant" class="mx-1"> 分享 </v-btn>
            <v-btn
              variant="outlined"
              :color="isFavorite ? 'red' : ''"
              prepend-icon="mdi-heart"
              class="mx-1"
              @click="toggleFavorite"
            >
              {{ isFavorite ? '已收藏' : '收藏' }}
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" sm="8">
          <h1 class="text-h3 font-weight-bold">{{ book.title }}</h1>
          <h2 class="text-h5 text-medium-emphasis mb-3">{{ book.author }}</h2>

          <div class="d-flex align-center mb-4 flex-wrap">
            <v-rating
              v-model="book.rating"
              color="amber"
              half-increments
              readonly
              class="mr-2"
            ></v-rating>
            <span class="text-body-1 mr-3">{{ book.rating.toFixed(1) }}</span>
            <v-chip color="primary" size="small" class="mr-2">{{ book.category }}</v-chip>
            <v-chip variant="outlined" size="small">{{ book.language }}</v-chip>
            <v-spacer></v-spacer>
            <v-btn
              v-if="isOwner"
              variant="text"
              color="primary"
              size="small"
              prepend-icon="mdi-pencil"
              @click="editBook"
            >
              编辑
            </v-btn>
          </div>

          <v-divider class="mb-4"></v-divider>

          <h3 class="text-h6 mb-2">简介</h3>
          <p class="text-body-1 mb-4">{{ book.description }}</p>

          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-book-open-variant"></v-icon>
              </template>
              <v-list-item-title>页数</v-list-item-title>
              <v-list-item-subtitle>{{ book.pageCount }} 页</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-calendar"></v-icon>
              </template>
              <v-list-item-title>出版日期</v-list-item-title>
              <v-list-item-subtitle>{{ book.publishDate }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-certificate"></v-icon>
              </template>
              <v-list-item-title>出版社</v-list-item-title>
              <v-list-item-subtitle>{{ book.publisher }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-identifier"></v-icon>
              </template>
              <v-list-item-title>ISBN</v-list-item-title>
              <v-list-item-subtitle>{{ book.isbn }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>

      <!-- 评论区 -->
      <v-row>
        <v-col cols="12">
          <h3 class="text-h5 mb-3">评论 ({{ book.comments.length }})</h3>

          <!-- 写评论 -->
          <v-card class="mb-4">
            <v-card-text>
              <v-textarea
                v-model="newComment"
                rows="3"
                label="写下你的评论"
                variant="outlined"
                counter
                maxlength="500"
              ></v-textarea>
              <div class="d-flex align-center">
                <span class="mr-2">评分：</span>
                <v-rating v-model="newRating" color="amber" half-increments></v-rating>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  :disabled="!newComment || newRating === 0"
                  @click="submitComment"
                >
                  提交评论
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- 评论列表 -->
          <v-card v-for="comment in book.comments" :key="comment.id" class="mb-3">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar size="40">
                  <v-img :src="comment.avatarUrl"></v-img>
                </v-avatar>
              </template>
              <v-card-title>{{ comment.username }}</v-card-title>
              <v-card-subtitle>
                <v-rating
                  :model-value="comment.rating"
                  color="amber"
                  density="compact"
                  size="x-small"
                  readonly
                ></v-rating>
                <span class="text-caption ml-2">{{ formatDate(comment.date) }}</span>
              </v-card-subtitle>
            </v-card-item>
            <v-card-text>
              {{ comment.content }}
            </v-card-text>
          </v-card>

          <!-- 无评论提示 -->
          <div v-if="book.comments.length === 0" class="text-center py-6">
            <v-icon icon="mdi-comment-text-outline" size="64" color="grey-lighten-1"></v-icon>
            <p class="text-body-1 mt-2 text-medium-emphasis">暂无评论，成为第一个评论的人吧！</p>
          </div>
        </v-col>
      </v-row>

      <!-- 相关书籍推荐 -->
      <v-row>
        <v-col cols="12">
          <h3 class="text-h5 mb-3">相关推荐</h3>
          <v-slide-group show-arrows>
            <v-slide-group-item v-for="relatedBook in relatedBooks" :key="relatedBook.id">
              <v-card width="150" class="ma-2" @click="goToBook(relatedBook.id)">
                <v-img :src="relatedBook.coverUrl" height="200" cover></v-img>
                <v-card-title class="text-subtitle-1 py-1">{{ relatedBook.title }}</v-card-title>
                <v-card-subtitle class="py-0">{{ relatedBook.author }}</v-card-subtitle>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>
        </v-col>
      </v-row>
    </template>
  </v-container>

  <!-- 分享弹窗 -->
  <v-dialog v-model="showShareDialog" max-width="400">
    <v-card>
      <v-card-title>分享书籍</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item prepend-icon="mdi-wechat" title="微信" @click="shareViaWechat"></v-list-item>
          <v-list-item prepend-icon="mdi-qqchat" title="QQ" @click="shareViaQQ"></v-list-item>
          <v-list-item
            prepend-icon="mdi-twitter"
            title="Twitter"
            @click="shareViaTwitter"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-facebook"
            title="Facebook"
            @click="shareViaFacebook"
          ></v-list-item>
          <v-list-item prepend-icon="mdi-link" title="复制链接" @click="copyLink"></v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="showShareDialog = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mobileService from '@/services/MobileService'

interface Comment {
  id: number
  username: string
  avatarUrl: string
  content: string
  rating: number
  date: string
}

interface Book {
  id: number
  title: string
  author: string
  coverUrl: string
  description: string
  rating: number
  category: string
  language: string
  pageCount: number
  publishDate: string
  publisher: string
  isbn: string
  comments: Comment[]
}

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const error = ref(false)
const book = ref<Book | null>(null)
const isFavorite = ref(false)
const isOwner = ref(false)
const newComment = ref('')
const newRating = ref(0)
const showShareDialog = ref(false)

// 相关书籍
const relatedBooks = ref([
  {
    id: 101,
    title: '相关书籍 1',
    author: '作者 A',
    coverUrl: 'https://picsum.photos/150/200?random=101'
  },
  {
    id: 102,
    title: '相关书籍 2',
    author: '作者 B',
    coverUrl: 'https://picsum.photos/150/200?random=102'
  },
  {
    id: 103,
    title: '相关书籍 3',
    author: '作者 C',
    coverUrl: 'https://picsum.photos/150/200?random=103'
  },
  {
    id: 104,
    title: '相关书籍 4',
    author: '作者 D',
    coverUrl: 'https://picsum.photos/150/200?random=104'
  },
  {
    id: 105,
    title: '相关书籍 5',
    author: '作者 E',
    coverUrl: 'https://picsum.photos/150/200?random=105'
  }
])

onMounted(async () => {
  // 检查网络连接
  const isConnected = await mobileService.checkNetwork()
  if (!isConnected) {
    error.value = true
    isLoading.value = false
    return
  }

  // 获取书籍 ID
  const bookId = (route.params as { id: string }).id
  if (!bookId) {
    error.value = true
    isLoading.value = false
    return
  }

  // 获取书籍详情
  await fetchBookDetails()

  // 检查是否是收藏的书籍
  await checkIfFavorite()

  // 检查是否是书籍上传者
  checkIfOwner()
})

async function fetchBookDetails() {
  try {
    isLoading.value = true
    error.value = false

    // 检查网络连接
    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      error.value = true
      isLoading.value = false
      return
    } // 模拟API调用延迟
    setTimeout(() => {
      // 模拟数据 - 实际项目中应从API获取
      const bookIdStr = (route.params as { id: string }).id
      book.value = {
        id: parseInt(bookIdStr),
        title: '三体',
        author: '刘慈欣',
        coverUrl: `https://picsum.photos/400/600?random=${bookIdStr}`,
        description:
          '三体是刘慈欣创作的长篇科幻小说，由《地球往事三部曲》组成。该系列小说主要讲述了地球人类文明和三体文明的信息交流、生死搏杀及两个文明在宇宙中的兴衰历程。其第一部经过刘宇昆翻译后获得了第73届雨果奖最佳长篇小说奖。',
        rating: 4.8,
        category: '科幻',
        language: '中文',
        pageCount: 302,
        publishDate: '2008-01-01',
        publisher: '重庆出版社',
        isbn: '9787536692930',
        comments: [
          {
            id: 1,
            username: '用户A',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            content: '这是一本改变我世界观的书，强烈推荐！',
            rating: 5,
            date: '2023-04-15'
          },
          {
            id: 2,
            username: '用户B',
            avatarUrl: 'https://i.pravatar.cc/150?img=2',
            content: '科学与哲学的完美结合，语言优美，情节扣人心弦。',
            rating: 4.5,
            date: '2023-05-20'
          },
          {
            id: 3,
            username: '用户C',
            avatarUrl: 'https://i.pravatar.cc/150?img=3',
            content: '宏大的视角，精细的描写，读完后久久不能平静。',
            rating: 5,
            date: '2023-06-05'
          }
        ]
      }
      isLoading.value = false
    }, 800)
  } catch (err: any) {
    console.error('Error fetching book details:', err)
    error.value = true
    isLoading.value = false
  }
}

async function checkIfFavorite() {
  try {
    // 实际项目中应从API或本地存储中获取收藏状态
    const favoriteBooks = (await mobileService.getData('favoriteBooks')) || []
    const bookIdStr = (route.params as { id: string }).id
    isFavorite.value = favoriteBooks.includes(parseInt(bookIdStr))
  } catch (error: any) {
    console.error('Error checking favorite status:', error)
  }
}

function checkIfOwner() {
  // 实际项目中应根据登录用户ID和书籍上传者ID进行比对
  // 这里简单模拟，ID为奇数的书籍为当前用户上传
  const bookIdStr = (route.params as { id: string }).id
  isOwner.value = parseInt(bookIdStr) % 2 === 1
}

async function toggleFavorite() {
  try {
    isFavorite.value = !isFavorite.value

    // 更新本地存储中的收藏状态
    let favoriteBooks = (await mobileService.getData('favoriteBooks')) || []
    const bookIdStr = (route.params as { id: string }).id
    const bookId = parseInt(bookIdStr)

    if (isFavorite.value) {
      if (!favoriteBooks.includes(bookId)) {
        favoriteBooks.push(bookId)
      }
      await mobileService.showToast('已添加到收藏')
    } else {
      favoriteBooks = favoriteBooks.filter((id: number) => id !== bookId)
      await mobileService.showToast('已取消收藏')
    }

    await mobileService.saveData('favoriteBooks', favoriteBooks)
  } catch (err: any) {
    console.error('Error toggling favorite:', err)
  }
}

function editBook() {
  const bookIdStr = (route.params as { id: string }).id
  router.push(`/edit-book/${bookIdStr}`)
}

async function submitComment() {
  if (!newComment.value || newRating.value === 0) return

  try {
    // 模拟API调用 - 实际项目中应发送到服务器
    if (book.value) {
      // 创建新评论
      const newCommentObj = {
        id: Date.now(),
        username: localStorage.getItem('username') || '匿名用户',
        avatarUrl: 'https://i.pravatar.cc/150?img=8',
        content: newComment.value,
        rating: newRating.value,
        date: new Date().toISOString().split('T')[0]
      }

      // 添加到评论列表
      book.value.comments.unshift(newCommentObj)

      // 重新计算书籍平均评分
      const totalRating = book.value.comments.reduce((sum, comment) => sum + comment.rating, 0)
      book.value.rating = totalRating / book.value.comments.length

      // 清空表单
      newComment.value = ''
      newRating.value = 0

      await mobileService.showToast('评论已提交')
    }
  } catch (err: any) {
    console.error('Error submitting comment:', err)
    await mobileService.showToast('评论提交失败')
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

function goToBook(bookId: number) {
  router.push(`/book/${bookId}`)
}

async function shareViaWechat() {
  // 实现微信分享
  await mobileService.showToast('分享到微信')
  showShareDialog.value = false
}

async function shareViaQQ() {
  // 实现QQ分享
  await mobileService.showToast('分享到QQ')
  showShareDialog.value = false
}

async function shareViaTwitter() {
  // 实现Twitter分享
  await mobileService.showToast('分享到Twitter')
  showShareDialog.value = false
}

async function shareViaFacebook() {
  // 实现Facebook分享
  await mobileService.showToast('分享到Facebook')
  showShareDialog.value = false
}

async function copyLink() {
  // 复制链接到剪贴板
  try {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    await mobileService.showToast('链接已复制')
  } catch (err: any) {
    console.error('Failed to copy link:', err)
    await mobileService.showToast('复制失败')
  }
  showShareDialog.value = false
}
</script>

<style scoped>
.book-cover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .text-h3 {
    font-size: 1.75rem !important;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }
}
</style>
