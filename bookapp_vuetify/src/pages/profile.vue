<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar size="96" class="mr-4">
                <v-img src="https://i.pravatar.cc/150?img=7"></v-img>
              </v-avatar>
            </template>
            <v-card-title class="text-h5">{{ username }}</v-card-title>
            <v-card-subtitle>
              <v-chip-group>
                <v-chip v-for="lang in userLanguages" :key="lang" color="primary" size="small">
                  {{ lang }}
                </v-chip>
              </v-chip-group>
            </v-card-subtitle>
          </v-card-item>

          <v-divider></v-divider>

          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-email"></v-icon>
              </template>
              <v-list-item-title>电子邮箱</v-list-item-title>
              <v-list-item-subtitle>user@example.com</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-calendar"></v-icon>
              </template>
              <v-list-item-title>注册时间</v-list-item-title>
              <v-list-item-subtitle>2023年5月11日</v-list-item-subtitle>
            </v-list-item>

            <v-list-item @click="openEditProfile">
              <template v-slot:prepend>
                <v-icon icon="mdi-pencil"></v-icon>
              </template>
              <v-list-item-title>编辑个人资料</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
        <!-- 我的书籍 -->
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-book-multiple" class="mr-2"></v-icon>
              我的书籍
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-upload"
              variant="outlined"
              size="small"
              @click="openUploadDialog"
            >
              上传书籍
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <div class="pa-4">
            <div v-if="books.length === 0" class="text-center py-8">
              <v-icon icon="mdi-bookshelf" size="64" color="grey-lighten-1"></v-icon>
              <div class="text-body-1 mt-2 text-grey-darken-1">您还没有分享任何书籍</div>
              <v-btn color="primary" class="mt-4" prepend-icon="mdi-plus" @click="openUploadDialog">
                添加新书籍
              </v-btn>
            </div>

            <v-row v-else>
              <v-col v-for="book in books" :key="book.id" cols="12" sm="6" md="4">
                <v-card variant="outlined" class="book-card">
                  <v-img :src="book.coverUrl" height="200" cover class="bg-grey-lighten-2"></v-img>
                  <v-card-title>{{ book.title }}</v-card-title>
                  <v-card-subtitle>{{ book.author }}</v-card-subtitle>
                  <v-card-actions>
                    <v-btn variant="text" color="primary" @click="goToBookDetail(book.id)">
                      查看详情
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon variant="text" @click="goToEditBook(book.id)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon variant="text" @click="confirmDeleteBook(book.id, book.title)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card>

        <!-- 偏好设置 -->
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-cog" class="mr-2"></v-icon>
            偏好设置
          </v-card-title>

          <v-divider></v-divider>

          <v-list>
            <v-list-item>
              <v-list-item-title>深色模式</v-list-item-title>
              <template v-slot:append>
                <v-switch v-model="darkMode" hide-details color="primary"></v-switch>
              </template>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>推送通知</v-list-item-title>
              <template v-slot:append>
                <v-switch v-model="pushNotifications" hide-details color="primary"></v-switch>
              </template>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>语言偏好</v-list-item-title>
              <template v-slot:append>
                <v-btn variant="text" color="primary" size="small"> 管理 </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="confirmLogout" variant="text"> 退出登录 </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 退出登录确认弹窗 -->
    <v-dialog v-model="logoutDialog" max-width="400">
      <v-card>
        <v-card-title>确认退出?</v-card-title>
        <v-card-text> 您确定要退出登录吗？ </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="logoutDialog = false"> 取消 </v-btn>
          <v-btn color="error" variant="text" @click="logout"> 退出 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 编辑个人资料弹窗 -->
    <v-dialog v-model="editProfileDialog" max-width="600">
      <v-card>
        <v-card-title>编辑个人资料</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="editedUsername"
              label="用户名"
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="editedEmail"
              label="电子邮箱"
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-autocomplete
              v-model="editedLanguages"
              label="擅长语言"
              variant="outlined"
              :items="availableLanguages"
              multiple
              chips
            ></v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="editProfileDialog = false">
            取消
          </v-btn>
          <v-btn color="primary" variant="text" @click="saveProfile"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 上传书籍弹窗 -->
    <v-dialog v-model="uploadBookDialog" max-width="800" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-upload" class="mr-2"></v-icon>
          上传新书籍
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                icon="mdi-information-outline"
                class="ml-2"
                size="small"
              ></v-icon>
            </template>
            <span>上传EPUB文件后，系统将自动解析书籍标题、作者和封面</span>
          </v-tooltip>
        </v-card-title>

        <v-divider></v-divider>

        <v-overlay v-model="isSubmitting" class="align-center justify-center" persistent>
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <div class="text-subtitle-1 mt-2">正在处理...</div>
        </v-overlay>

        <v-card-text class="py-4">
          <v-form ref="bookUploadForm">
            <v-row>
              <!-- 左侧：封面上传 -->
              <v-col cols="12" md="4">
                <div class="d-flex flex-column align-center">
                  <div
                    class="book-cover-upload mb-3 d-flex justify-center align-center"
                    :class="{ 'has-cover': coverPreview }"
                  >
                    <v-img
                      v-if="coverPreview"
                      :src="coverPreview"
                      height="250"
                      cover
                      class="rounded"
                    ></v-img>
                    <template v-else>
                      <v-icon icon="mdi-image" size="48" color="grey-lighten-1"></v-icon>
                      <div class="text-caption text-center text-grey-darken-1 mt-2">
                        点击上传封面
                      </div>
                    </template>
                    <input
                      type="file"
                      accept="image/*"
                      class="cover-input"
                      @change="handleCoverChange"
                    />
                  </div>
                  <div class="text-caption text-grey">推荐尺寸: 400x600px</div>
                </div>
              </v-col>

              <!-- 右侧：书籍信息 -->
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="bookTitle"
                  label="书籍标题 *"
                  variant="outlined"
                  required
                  class="mb-2"
                ></v-text-field>

                <v-text-field
                  v-model="bookAuthor"
                  label="作者 *"
                  variant="outlined"
                  required
                  class="mb-2"
                ></v-text-field>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="bookLanguage"
                      :items="availableLanguages"
                      label="语言 *"
                      variant="outlined"
                      required
                      class="mb-2"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="bookCategory"
                      :items="availableCategories"
                      label="分类 *"
                      variant="outlined"
                      required
                      class="mb-2"
                    ></v-select>
                  </v-col>
                </v-row>

                <v-textarea
                  v-model="bookDescription"
                  label="书籍描述"
                  variant="outlined"
                  rows="3"
                  class="mb-2"
                ></v-textarea>

                <v-text-field
                  v-model="bookTags"
                  label="标签 (用逗号分隔)"
                  variant="outlined"
                  hint="例如: 科幻,太空,冒险"
                  class="mb-2"
                ></v-text-field>
                <v-file-input
                  v-model="bookFile"
                  label="EPUB电子书文件 *"
                  accept=".epub"
                  variant="outlined"
                  required
                  class="mb-2"
                  placeholder="选择EPUB格式的电子书文件"
                  hint="仅支持EPUB格式，上传后将自动解析书籍信息"
                  @update:model-value="parseEpubFile"
                ></v-file-input>

                <v-divider class="my-3"></v-divider>

                <div class="d-flex align-center mb-2">
                  <div class="text-subtitle-2 mr-4">可见性:</div>
                  <v-radio-group v-model="bookVisibility" inline>
                    <v-radio value="public" label="公开"></v-radio>
                    <v-radio value="private" label="私有"></v-radio>
                  </v-radio-group>
                </div>

                <v-switch v-model="bookAllowComments" label="允许评论" color="primary"></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="uploadBookDialog = false"
            :disabled="isSubmitting"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            @click="submitBookUpload"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            上传
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除书籍确认弹窗 -->
    <v-dialog v-model="deleteBookDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          确认删除
        </v-card-title>
        <v-card-text v-if="bookToDelete">
          您确定要删除书籍《{{ bookToDelete.title }}》吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="deleteBookDialog = false">
            取消
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteBook"> 删除 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import mobileService from '@/services/MobileService'
import * as EpubJS from 'epubjs'

// 类型定义
interface Book {
  id: number
  title: string
  author: string
  coverUrl: string
}

interface UserSettings {
  darkMode: boolean
  pushNotifications: boolean
  languages: string[]
}

const router = useRouter()
const username = ref(localStorage.getItem('username') || '未登录用户')
const userLanguages = ref<string[]>(['中文', '英语'])
const darkMode = ref(false)
const pushNotifications = ref(true)
const logoutDialog = ref(false)
const editProfileDialog = ref(false)
const uploadBookDialog = ref(false)
const deleteBookDialog = ref(false)
const bookToDelete = ref<{ id: number; title: string } | null>(null)

// 编辑个人资料
const editedUsername = ref('')
const editedEmail = ref('')
const editedLanguages = ref<string[]>([])

// 上传书籍表单数据
const bookUploadForm = ref(null)
const bookTitle = ref('')
const bookAuthor = ref('')
const bookLanguage = ref('中文')
const bookCategory = ref('')
const bookDescription = ref('')
const bookTags = ref('')
const bookVisibility = ref('public')
const bookAllowComments = ref(true)
const bookFile = ref<File | null>(null)
const bookCover = ref<File | null>(null)
const coverPreview = ref<string | null>(null)
const isSubmitting = ref(false)

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

// 书籍类别列表
const availableCategories = [
  '小说',
  '散文',
  '诗歌',
  '科幻',
  '奇幻',
  '悬疑',
  '推理',
  '历史',
  '哲学',
  '科学',
  '技术',
  '教育',
  '经济',
  '政治',
  '社会',
  '艺术',
  '文化',
  '生活',
  '健康',
  '其他'
]

// 书籍数据，从数据库加载
const books = ref<Book[]>([])

onMounted(() => {
  // 检查用户是否登录
  if (!localStorage.getItem('access')) {
    router.push('/login')
    return
  }

  // 加载用户设置
  loadUserSettings()

  // 加载用户的书籍列表
  loadBooks()
})

async function loadUserSettings() {
  try {
    // 从本地存储中获取用户设置
    const savedSettings = (await mobileService.getData('userSettings')) as UserSettings | null
    if (savedSettings) {
      darkMode.value = savedSettings.darkMode || false
      pushNotifications.value = savedSettings.pushNotifications || true
      userLanguages.value = savedSettings.languages || ['中文']
    }

    // 设置编辑表单的初始值
    editedUsername.value = username.value
    editedEmail.value = 'user@example.com' // 实际项目中应从API获取
    editedLanguages.value = [...userLanguages.value]
  } catch (error) {
    console.error('Error loading user settings:', error)
  }
}

function confirmLogout() {
  logoutDialog.value = true
}

async function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('username')
  await mobileService.showToast('退出登录成功')
  router.push('/login')
}

function openEditProfile() {
  editProfileDialog.value = true
}

async function saveProfile() {
  try {
    // 实际项目中应调用API更新用户资料
    username.value = editedUsername.value
    userLanguages.value = [...editedLanguages.value]

    // 保存到本地存储
    await mobileService.saveData('userSettings', {
      darkMode: darkMode.value,
      pushNotifications: pushNotifications.value,
      languages: userLanguages.value
    })

    await mobileService.showToast('个人资料已更新')
    editProfileDialog.value = false
  } catch (error) {
    console.error('Error saving profile:', error)
  }
}

// 书籍上传相关函数
function openUploadDialog() {
  resetBookForm()
  uploadBookDialog.value = true
}

function resetBookForm() {
  bookTitle.value = ''
  bookAuthor.value = ''
  bookLanguage.value = '中文'
  bookCategory.value = ''
  bookDescription.value = ''
  bookTags.value = ''
  bookVisibility.value = 'public'
  bookAllowComments.value = true
  bookFile.value = null
  bookCover.value = null
  coverPreview.value = null
}

function handleCoverChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    bookCover.value = input.files[0]
    const reader = new FileReader()
    reader.onload = e => {
      coverPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

async function parseEpubFile() {
  if (!bookFile.value) return

  try {
    const epubFileUrl = URL.createObjectURL(bookFile.value)
    const book = EpubJS.default()
    book.open(epubFileUrl)

    // 显示加载状态
    isSubmitting.value = true
    await mobileService.showToast('正在解析EPUB文件...')

    // 解析元数据
    book.loaded.metadata.then(metadata => {
      if (metadata.title) bookTitle.value = metadata.title
      if (metadata.creator) bookAuthor.value = metadata.creator

      // 可能需要根据语言代码映射到可读语言名称
      if (metadata.language) {
        // 简单映射常见语言代码
        const langMap: { [key: string]: string } = {
          zh: '中文',
          en: '英语',
          ja: '日语',
          ko: '韩语',
          fr: '法语',
          de: '德语',
          es: '西班牙语',
          ru: '俄语',
          ar: '阿拉伯语'
        }

        const langCode = metadata.language.toLowerCase().split('-')[0]
        bookLanguage.value = langMap[langCode] || '中文'
      } // 尝试获取分类信息
      const metadataAny = metadata as any // 使用any类型绕过TypeScript检查
      if (metadataAny.subject) {
        const subject = Array.isArray(metadataAny.subject)
          ? metadataAny.subject[0]
          : metadataAny.subject

        // 检查分类是否在可用分类列表中
        if (subject && availableCategories.includes(subject)) {
          bookCategory.value = subject
        }
      }

      // 尝试提取标签
      if (metadataAny.subject && Array.isArray(metadataAny.subject)) {
        bookTags.value = metadataAny.subject.join(',')
      }

      // 提取描述
      if (metadata.description) {
        bookDescription.value = metadata.description
      }
    })

    // 提取封面
    book.loaded.cover.then(cover => {
      if (cover) {
        book.archive.createUrl(cover, { base64: true }).then((url: string) => {
          coverPreview.value = url

          // 将base64转换为文件对象
          fetch(url)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' })
              bookCover.value = file
            })
        })
      }
    })

    // 完成后恢复状态
    setTimeout(() => {
      isSubmitting.value = false
      mobileService.showToast('EPUB解析完成')
    }, 1000)
  } catch (err) {
    console.error('解析EPUB文件时出错:', err)
    await mobileService.showToast('解析EPUB文件失败')
    isSubmitting.value = false
  }
}

// 加载用户的书籍列表
async function loadBooks() {
  try {
    // 检查是否有网络连接
    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      await mobileService.showToast('网络连接不可用，使用缓存数据')
      // 尝试从缓存获取数据
      const cachedBooks = await mobileService.getData('userBooks')
      if (cachedBooks) {
        books.value = cachedBooks
      }
      return
    }

    // 获取令牌
    const token = localStorage.getItem('access')
    if (!token) {
      throw new Error('用户未登录')
    }

    // 从API获取书籍列表
    const response = await fetch('http://localhost:8000/api/books/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('获取书籍列表失败')
    }

    const data = await response.json()

    // 转换数据格式
    books.value = data.map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_image || `https://picsum.photos/300/450?random=${book.id}`
    }))

    // 缓存书籍数据
    await mobileService.saveData('userBooks', books.value)
  } catch (err: any) {
    console.error('获取书籍列表时出错:', err)
    await mobileService.showToast('获取书籍列表失败: ' + (err.message || '未知错误'))
  }
}

// 书籍详情页面导航
function goToBookDetail(id: number) {
  router.push(`/book/${id}`)
}

// 书籍编辑页面导航
function goToEditBook(id: number) {
  router.push(`/edit-book/${id}`)
}

// 确认删除书籍
function confirmDeleteBook(id: number, title: string) {
  bookToDelete.value = { id, title }
  deleteBookDialog.value = true
}

// 删除书籍
async function deleteBook() {
  if (!bookToDelete.value) return

  try {
    // 检查是否有网络连接
    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      await mobileService.showToast('网络连接不可用，请稍后再试')
      deleteBookDialog.value = false
      return
    }

    // 获取令牌
    const token = localStorage.getItem('access')
    if (!token) {
      throw new Error('用户未登录')
    }

    // 从API删除书籍
    const response = await fetch(`http://localhost:8000/api/books/${bookToDelete.value.id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('删除书籍失败')
    }

    // 从本地列表中移除
    books.value = books.value.filter(book => book.id !== bookToDelete.value?.id)

    // 更新缓存
    await mobileService.saveData('userBooks', books.value)

    await mobileService.showToast('书籍已成功删除')
  } catch (err: any) {
    console.error('删除书籍时出错:', err)
    await mobileService.showToast('删除失败: ' + (err.message || '未知错误'))
  } finally {
    deleteBookDialog.value = false
    bookToDelete.value = null
  }
}

async function submitBookUpload() {
  if (!bookFile.value) {
    await mobileService.showToast('请选择要上传的EPUB文件')
    return
  }

  if (!bookTitle.value || !bookAuthor.value) {
    await mobileService.showToast('请填写书籍标题和作者')
    return
  }

  isSubmitting.value = true

  try {
    // 检查是否有网络连接
    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      await mobileService.showToast('网络连接不可用，请稍后再试')
      isSubmitting.value = false
      return
    }

    // 创建表单数据
    const formData = new FormData()
    formData.append('title', bookTitle.value)
    formData.append('author', bookAuthor.value)
    formData.append('language', bookLanguage.value)
    formData.append('category', bookCategory.value)
    formData.append('description', bookDescription.value)
    formData.append('tags', bookTags.value)
    formData.append('visibility', bookVisibility.value)
    formData.append('allow_comments', bookAllowComments.value ? 'true' : 'false')

    if (bookFile.value) {
      formData.append('book_file', bookFile.value)
    }

    if (bookCover.value) {
      formData.append('cover_image', bookCover.value)
    }

    // 获取令牌
    const token = localStorage.getItem('access')
    if (!token) {
      throw new Error('用户未登录')
    }

    // 发送上传请求到Django API
    console.log('正在发送请求...')
    const response = await fetch('http://localhost:8000/api/books/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
        // 不要在这里设置 Content-Type，让浏览器自动设置正确的 multipart/form-data 和 boundary
      },
      credentials: 'include', // 包含凭证
      body: formData
    })

    console.log('响应状态:', response.status, response.statusText)
    console.log('响应头:', [...response.headers.entries()])
    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch (e) {
        console.error('解析错误响应失败:', e)
      }
      console.error('上传失败:', response.status, errorData)
      throw new Error(errorData.detail || `上传失败 (${response.status})`)
    }

    // 处理成功响应
    const newBook = await response.json()

    // 上传成功后重新加载书籍列表，确保显示最新数据
    await loadBooks()

    await mobileService.showToast('书籍上传成功')
    uploadBookDialog.value = false
  } catch (err: any) {
    console.error('上传书籍时出错:', err)
    await mobileService.showToast('上传失败: ' + (err.message || '未知错误'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.book-card {
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover-upload {
  width: 180px;
  height: 250px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.book-cover-upload:hover {
  border-color: #1867c0;
}

.book-cover-upload.has-cover {
  border: none;
}

.cover-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}
</style>
