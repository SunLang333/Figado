<template>
  <v-container style="max-height: 80vh; overflow-y: auto">
    <v-row>
      <v-col cols="12">
        <v-toolbar flat color="transparent">
          <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/books" class="mr-2">
            返回列表
          </v-btn>
          <v-toolbar-title class="text-h5">添加新书籍</v-toolbar-title>
        </v-toolbar>
      </v-col>
    </v-row>

    <v-form ref="form" v-model="isFormValid" @submit.prevent="submitBook">
      <v-row>
        <!-- 左侧：封面上传 -->
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-text class="text-center">
              <v-img
                v-if="coverPreview"
                :src="coverPreview"
                height="350"
                cover
                class="rounded mb-4 book-cover"
              ></v-img>
              <div v-else class="no-cover">
                <v-icon size="64" color="grey-lighten-1">mdi-image</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">选择或拍照上传封面</p>
              </div>

              <v-row class="mt-4">
                <v-col>
                  <v-btn
                    block
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    @click="captureCover"
                    color="primary"
                    class="mb-2"
                  >
                    拍照
                  </v-btn>
                </v-col>
                <v-col>
                  <v-btn
                    block
                    variant="outlined"
                    prepend-icon="mdi-image-album"
                    @click="selectCoverFromGallery"
                    color="primary"
                    class="mb-2"
                  >
                    从相册选择
                  </v-btn>
                </v-col>
              </v-row>

              <v-file-input
                v-model="coverImage"
                label="或从文件选择封面"
                accept="image/*"
                prepend-icon=""
                class="mt-2"
                variant="outlined"
                density="compact"
                hide-details
                @change="previewCover"
              ></v-file-input>
            </v-card-text>
          </v-card>

          <!-- 其他文件上传（仅支持EPUB） -->
          <v-card>
            <v-card-title>书籍文件 <small class="text-grey">(仅支持EPUB)</small></v-card-title>
            <v-card-text>
              <v-file-input
                v-model="bookFile"
                label="上传EPUB文件"
                accept=".epub"
                variant="outlined"
                :rules="bookFileRules"
                hint="仅支持 EPUB 格式，上传后自动解析元数据"
                persistent-hint
                show-size
                density="comfortable"
                chips
                truncate-length="20"
                @change="onEpubFileChange"
              ></v-file-input>
              <p class="text-caption text-medium-emphasis mt-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                上传EPUB后将自动解析书名、作者、简介、封面等信息
              </p>
              <v-btn
                block
                variant="outlined"
                class="mt-2"
                prepend-icon="mdi-file-document"
                @click="selectBookFile"
              >
                从设备选择文件
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 右侧：书籍信息表单 -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-text>
              <!-- 基本信息 -->
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-3">基本信息</h3>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="bookData.title"
                    label="书名*"
                    variant="outlined"
                    :rules="titleRules"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="bookData.author"
                    label="作者*"
                    variant="outlined"
                    :rules="authorRules"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="bookData.language"
                    label="语言*"
                    variant="outlined"
                    :items="languageOptions"
                    :rules="languageRules"
                    required
                  ></v-select>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="bookData.category"
                    label="分类*"
                    variant="outlined"
                    :items="categoryOptions"
                    :rules="categoryRules"
                    required
                  ></v-select>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="bookData.tags"
                    label="标签"
                    variant="outlined"
                    hint="使用逗号分隔多个标签"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-divider class="my-3"></v-divider>

              <!-- 详细信息 -->
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-3">详细信息</h3>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="bookData.description"
                    label="简介*"
                    variant="outlined"
                    :rules="descriptionRules"
                    auto-grow
                    rows="4"
                    required
                  ></v-textarea>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="bookData.publisher"
                    label="出版社"
                    variant="outlined"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="bookData.publishDate"
                    label="出版日期"
                    variant="outlined"
                    type="date"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="bookData.isbn"
                    label="ISBN"
                    variant="outlined"
                    hint="国际标准书号"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="bookData.pageCount"
                    label="页数"
                    variant="outlined"
                    type="number"
                    min="1"
                  ></v-text-field>
                </v-col>

                <!-- 新增评分输入 -->
                <v-col cols="12" sm="6">
                  <v-rating
                    :model-value="bookData.rating ?? 0"
                    @update:model-value="
                      val => (bookData.rating = typeof val === 'number' ? val : 0)
                    "
                    length="5"
                    color="amber"
                    background-color="grey lighten-2"
                    large
                    half-increments
                    clearable
                    label="评分"
                    :rules="ratingRules"
                  ></v-rating>
                  <span class="ml-2">{{
                    bookData.rating ? bookData.rating + ' 分' : '未评分'
                  }}</span>
                </v-col>
              </v-row>

              <v-divider class="my-3"></v-divider>

              <!-- 分享设置 -->
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-3">分享设置</h3>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-radio-group v-model="bookData.visibility" inline>
                    <template v-slot:label>
                      <div>可见性：</div>
                    </template>
                    <v-radio value="public" label="公开"></v-radio>
                    <v-radio value="private" label="私密"></v-radio>
                  </v-radio-group>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-switch
                    v-model="bookData.allowComments"
                    label="允许评论"
                    color="primary"
                    hide-details
                  ></v-switch>
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn variant="outlined" @click="resetForm" class="mr-2" :disabled="isSubmitting">
                重置
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
                :loading="isSubmitting"
                :disabled="!isFormValid || isSubmitting"
              >
                发布书籍
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-form>

    <!-- 成功提示对话框 -->
    <v-dialog v-model="showSuccessDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          发布成功
        </v-card-title>
        <v-card-text> 您的书籍《{{ bookData.title }}》已成功发布！ </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="goToBookDetail"> 查看详情 </v-btn>
          <v-btn color="primary" variant="text" @click="goToBookList"> 返回列表 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import mobileService from '@/services/MobileService'
import * as EpubJS from 'epubjs'

const emit = defineEmits(['success', 'cancel'])

const router = useRouter()
const form = ref(null)
const isFormValid = ref(false)
const isSubmitting = ref(false)
const showSuccessDialog = ref(false)
const newBookId = ref(0)

// 封面上传
const coverImage = ref<File | null>(null)
const coverPreview = ref<string | null>(null)

// 书籍文件上传
const bookFile = ref<File | null>(null)

// 表单数据
interface BookData {
  title: string
  author: string
  language: string
  category: string
  tags: string
  description: string
  publisher: string
  publishDate: string
  isbn: string
  pageCount: number | null
  rating: number | null // 新增评分字段
  visibility: string
  allowComments: boolean
}

const bookData = reactive<BookData>({
  title: '',
  author: '',
  language: '中文',
  category: '',
  tags: '',
  description: '',
  publisher: '',
  publishDate: '',
  isbn: '',
  pageCount: null,
  rating: null, // 新增评分字段
  visibility: 'public',
  allowComments: true
})

// 选项列表
const languageOptions = ['中文', '英语', '日语', '韩语', '法语', '德语', '俄语', '西班牙语', '其他']
const categoryOptions = [
  '小说',
  '散文',
  '诗歌',
  '传记',
  '历史',
  '哲学',
  '科学',
  '技术',
  '教育',
  '艺术',
  '经济',
  '政治',
  '心理',
  '健康',
  '生活',
  '儿童',
  '漫画',
  '其他'
]

// 表单验证规则
const titleRules = [
  (v: string) => !!v || '书名不能为空',
  (v: string) => v.length <= 100 || '书名不能超过100个字符'
]

const authorRules = [
  (v: string) => !!v || '作者不能为空',
  (v: string) => v.length <= 50 || '作者名不能超过50个字符'
]

const languageRules = [(v: string) => !!v || '请选择语言']

const categoryRules = [(v: string) => !!v || '请选择分类']

const descriptionRules = [
  (v: string) => !!v || '简介不能为空',
  (v: string) => v.length >= 10 || '简介不能少于10个字符',
  (v: string) => v.length <= 2000 || '简介不能超过2000个字符'
]

const bookFileRules = [
  (v: File | null) => !v || (v && v.name.endsWith('.epub')) || '只允许上传EPUB文件',
  (v: File | null) => !v || v.size < 100 * 1024 * 1024 || '文件大小不能超过100MB'
]

const ratingRules = [(v: number | null) => v === null || (v >= 0 && v <= 5) || '评分必须在0到5之间']

// 预览封面
function previewCover(event: Event) {
  const file = coverImage.value
  if (!file) {
    coverPreview.value = null
    return
  }

  const reader = new FileReader()
  reader.onload = e => {
    coverPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// 使用相机拍照
async function captureCover() {
  try {
    const image = await mobileService.takePicture()
    if (image) {
      coverPreview.value = image
      // 将dataURL转换为File对象
      const imageFile = dataURLtoFile(image, `cover_${Date.now()}.jpg`)
      coverImage.value = imageFile
    }
  } catch (error) {
    console.error('拍照过程出错:', error)
    await mobileService.showToast('拍照失败，请重试或选择图片')
  }
}

// 从图库选择图片
async function selectCoverFromGallery() {
  try {
    const image = await mobileService.selectFromGallery()
    if (image) {
      coverPreview.value = image
      // 将dataURL转换为File对象
      const imageFile = dataURLtoFile(image, `cover_${Date.now()}.jpg`)
      coverImage.value = imageFile
    }
  } catch (error) {
    console.error('选择图片出错:', error)
    await mobileService.showToast('选择图片失败，请重试')
  }
}

// 辅助函数：将dataURL转换为File对象
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

// 重置表单
function resetForm() {
  // 重置表单数据
  for (const key in bookData) {
    if (key === 'visibility') {
      bookData.visibility = 'public'
    } else if (key === 'allowComments') {
      bookData.allowComments = true
    } else if (key === 'pageCount') {
      bookData.pageCount = null
    } else if (key === 'rating') {
      bookData.rating = null
    } else {
      // reset remaining string fields
      bookData[
        key as
          | 'title'
          | 'author'
          | 'language'
          | 'category'
          | 'tags'
          | 'description'
          | 'publisher'
          | 'publishDate'
          | 'isbn'
      ] = ''
    }
  }

  // 重置文件上传
  coverImage.value = null
  coverPreview.value = null
  bookFile.value = null

  // 重置表单验证
  if (form.value) {
    ;(form.value as any).reset()
  }
}

// 提交表单
async function submitBook() {
  if (!isFormValid.value) return

  try {
    // 检查网络连接
    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      await mobileService.showToast('网络连接错误，请检查您的网络')
      return
    }

    isSubmitting.value = true

    // 构造 FormData
    const formData = new FormData()
    formData.append('title', bookData.title)
    formData.append('author', bookData.author)
    formData.append('language', bookData.language)
    formData.append('category', bookData.category)
    formData.append('tags', bookData.tags)
    formData.append('description', bookData.description)
    formData.append('publisher', bookData.publisher)
    formData.append('publish_date', bookData.publishDate)
    formData.append('isbn', bookData.isbn)
    if (bookData.pageCount) formData.append('page_count', String(bookData.pageCount))
    if (bookData.rating) formData.append('rating', String(bookData.rating))
    formData.append('visibility', bookData.visibility)
    formData.append('allow_comments', String(bookData.allowComments))
    if (coverImage.value) formData.append('cover_image', coverImage.value)
    if (bookFile.value) formData.append('book_file', bookFile.value)

    // 真实API调用
    const token = localStorage.getItem('access')
    const response = await fetch('http://192.168.124.3:8000/api/books/', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      await mobileService.showToast(errorData.detail || '发布书籍失败，请重试')
      isSubmitting.value = false
      return
    }
    const data = await response.json()
    newBookId.value = data.id
    showSuccessDialog.value = true
    isSubmitting.value = false
    // 通知父组件（如 profile.vue）
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('success', { detail: { id: data.id } })
      window.dispatchEvent(event)
    }
  } catch (error) {
    console.error('Error submitting book:', error)
    await mobileService.showToast('发布过程中发生错误')
    isSubmitting.value = false
  }
}

// 查看书籍详情
function goToBookDetail() {
  showSuccessDialog.value = false
  // 触发父组件事件
  emit('success', newBookId.value)
}

// 返回书籍列表
function goToBookList() {
  showSuccessDialog.value = false
  emit('success')
}

// 从设备选择文件的辅助方法
function selectBookFile() {
  // 通过编程方式触发文件输入点击
  const fileInputElement = document.querySelector('input[type="file"][accept=".epub"]')
  if (fileInputElement) {
    ;(fileInputElement as HTMLInputElement).click()
  } else {
    mobileService.showToast('无法访问文件选择器')
  }
}

// 监听EPUB文件变更并解析元数据
async function onEpubFileChange(file: File | null) {
  if (!file) return
  try {
    const epubFileUrl = URL.createObjectURL(file)
    const book = EpubJS.default()
    book.open(epubFileUrl)
    isSubmitting.value = true
    await mobileService.showToast('正在解析EPUB文件...')
    // 解析元数据
    const metadata = await book.loaded.metadata
    if (metadata.title) bookData.title = metadata.title
    if (metadata.creator) bookData.author = metadata.creator
    if (metadata.description) bookData.description = metadata.description
    // 语言
    if (metadata.language) {
      const langMap: Record<string, string> = {
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
      bookData.language = Object.prototype.hasOwnProperty.call(langMap, langCode)
        ? langMap[langCode]
        : '其他'
    }
    // 分类/标签
    const metadataAny = metadata as any
    if (metadataAny.subject) {
      if (Array.isArray(metadataAny.subject)) {
        bookData.category = metadataAny.subject[0] || ''
        bookData.tags = metadataAny.subject.join(',')
      } else {
        bookData.category = metadataAny.subject
        bookData.tags = metadataAny.subject
      }
    }
    // 出版社
    if (metadata.publisher) bookData.publisher = metadata.publisher
    // ISBN
    if (metadata.identifier) bookData.isbn = metadata.identifier
    // 封面
    book.loaded.cover.then(cover => {
      if (cover) {
        book.archive.createUrl(cover, { base64: true }).then((url: string) => {
          coverPreview.value = url
          fetch(url)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' })
              coverImage.value = file
            })
        })
      }
    })
    await mobileService.showToast('EPUB解析完成')
  } catch (err) {
    console.error('解析EPUB文件时出错:', err)
    await mobileService.showToast('EPUB解析失败')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.book-cover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.no-cover {
  height: 350px;
  border: 2px dashed #e0e0e0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.v-container {
  max-height: 80vh;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1.25rem !important;
  }
}
</style>
