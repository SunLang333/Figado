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
        <p class="text-body-1 mb-4">无法加载书籍信息，请稍后再试</p>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchBookDetails">重试</v-btn>
        <v-btn variant="text" @click="goBack" class="ml-2">返回</v-btn>
      </v-col>
    </v-row>

    <!-- 编辑表单 -->
    <template v-else>
      <v-row>
        <v-col cols="12">
          <v-toolbar flat color="transparent">
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="goBack" class="mr-2">
              返回详情
            </v-btn>
            <v-toolbar-title class="text-h5">编辑书籍</v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-form ref="form" v-model="isFormValid" @submit.prevent="submitEdit">
        <v-row>
          <!-- 左侧：封面上传 -->
          <v-col cols="12" md="4">
            <v-card class="mb-4">
              <v-card-text class="text-center">
                <v-img
                  :src="coverPreview || bookData.coverUrl"
                  height="350"
                  cover
                  class="rounded mb-4 book-cover"
                ></v-img>

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

            <!-- 其他文件上传（如PDF） -->
            <v-card>
              <v-card-title class="d-flex align-center">
                书籍文件
                <v-chip v-if="hasExistingFile" color="success" size="small" class="ml-2">
                  已上传
                </v-chip>
              </v-card-title>
              <v-card-text>
                <v-file-input
                  v-model="bookFile"
                  label="上传新书籍文件"
                  accept=".pdf,.epub,.mobi"
                  variant="outlined"
                  :rules="bookFileRules"
                  hint="支持 PDF, EPUB, MOBI 格式"
                  persistent-hint
                  show-size
                  density="comfortable"
                  chips
                  truncate-length="20"
                ></v-file-input>
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
                <v-btn
                  color="error"
                  prepend-icon="mdi-delete"
                  variant="text"
                  @click="confirmDelete"
                >
                  删除书籍
                </v-btn>
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
                  保存修改
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </template>

    <!-- 成功提示对话框 -->
    <v-dialog v-model="showSuccessDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          修改成功
        </v-card-title>
        <v-card-text> 书籍《{{ bookData.title }}》已更新成功！ </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="goToBookDetail"> 查看详情 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          确认删除
        </v-card-title>
        <v-card-text> 您确定要删除书籍《{{ bookData.title }}》吗？此操作不可撤销。 </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showDeleteDialog = false">
            取消
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteBook" :loading="isDeleting">
            删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mobileService from '@/services/MobileService'

const route = useRoute()
const router = useRouter()
const bookId = ref<string>('')
const form = ref(null)
const isFormValid = ref(false)
const isLoading = ref(true)
const error = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const showSuccessDialog = ref(false)
const showDeleteDialog = ref(false)
const hasExistingFile = ref(false)

// 封面上传
const coverImage = ref<File | null>(null)
const coverPreview = ref<string | null>(null)

// 书籍文件上传
const bookFile = ref<File | null>(null)

// 定义书籍数据类型
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
  visibility: string
  allowComments: boolean
  coverUrl: string
}

// 定义书籍详情类型，包含额外属性
interface BookDetail extends BookData {
  id: number
  hasFile: boolean
  [key: string]: string | number | boolean | null
}

// 表单数据
const bookData = reactive<BookData>({
  title: '',
  author: '',
  language: '',
  category: '',
  tags: '',
  description: '',
  publisher: '',
  publishDate: '',
  isbn: '',
  pageCount: null,
  visibility: 'public',
  allowComments: true,
  coverUrl: ''
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

const bookFileRules = [(v: any) => !v || v.size < 100 * 1024 * 1024 || '文件大小不能超过100MB']

onMounted(async () => {
  // 获取书籍 ID
  bookId.value = (route.params as { id: string }).id
  if (!bookId.value) {
    error.value = true
    isLoading.value = false
    return
  }

  // 检查网络连接
  const isConnected = await mobileService.checkNetwork()
  if (!isConnected) {
    error.value = true
    isLoading.value = false
    return
  }

  // 获取书籍详情
  await fetchBookDetails()
})

// 获取书籍详情
async function fetchBookDetails() {
  try {
    isLoading.value = true
    error.value = false

    // 检查网络连接
    const isConnected = await mobileService.checkNetwork()

    // 优先尝试从网络加载
    if (isConnected) {
      // 模拟API调用延迟 - 实际项目中从后端API获取
      setTimeout(async () => {
        // 模拟数据 - 实际项目中应从API获取
        const bookDetail: BookDetail = {
          id: parseInt(bookId.value),
          title: '三体',
          author: '刘慈欣',
          language: '中文',
          category: '科幻',
          tags: '科幻,宇宙,文明',
          description:
            '三体是刘慈欣创作的长篇科幻小说，由《地球往事三部曲》组成。该系列小说主要讲述了地球人类文明和三体文明的信息交流、生死搏杀及两个文明在宇宙中的兴衰历程。其第一部经过刘宇昆翻译后获得了第73届雨果奖最佳长篇小说奖。',
          publisher: '重庆出版社',
          publishDate: '2008-01-01',
          isbn: '9787536692930',
          pageCount: 302,
          visibility: 'public',
          allowComments: true,
          coverUrl: `https://picsum.photos/400/600?random=${bookId.value}`,
          hasFile: true
        } // 填充表单数据 - 直接赋值对应属性
        bookData.title = bookDetail.title
        bookData.author = bookDetail.author
        bookData.language = bookDetail.language
        bookData.category = bookDetail.category
        bookData.tags = bookDetail.tags
        bookData.description = bookDetail.description
        bookData.publisher = bookDetail.publisher
        bookData.publishDate = bookDetail.publishDate
        bookData.isbn = bookDetail.isbn
        bookData.pageCount = bookDetail.pageCount
        bookData.visibility = bookDetail.visibility
        bookData.allowComments = bookDetail.allowComments
        bookData.coverUrl = bookDetail.coverUrl

        // 缓存数据供离线使用
        await mobileService.cacheBook(bookId.value, bookDetail)

        hasExistingFile.value = bookDetail.hasFile
        isLoading.value = false
      }, 800)
    } else {
      // 网络不可用时，尝试从缓存加载
      const cachedBook = (await mobileService.getCachedBook(bookId.value)) as BookDetail | null

      if (cachedBook) {
        // 使用缓存数据 - 直接赋值对应属性
        bookData.title = cachedBook.title
        bookData.author = cachedBook.author
        bookData.language = cachedBook.language
        bookData.category = cachedBook.category
        bookData.tags = cachedBook.tags
        bookData.description = cachedBook.description
        bookData.publisher = cachedBook.publisher
        bookData.publishDate = cachedBook.publishDate
        bookData.isbn = cachedBook.isbn
        bookData.pageCount = cachedBook.pageCount
        bookData.visibility = cachedBook.visibility
        bookData.allowComments = cachedBook.allowComments
        bookData.coverUrl = cachedBook.coverUrl

        hasExistingFile.value = cachedBook.hasFile || false
        isLoading.value = false

        // 显示提示
        await mobileService.showToast('使用离线缓存数据')
      } else {
        // 无网络且无缓存时显示错误
        error.value = true
        isLoading.value = false
        await mobileService.showToast('网络不可用，且无本地缓存数据')
      }
    }
  } catch (error: any) {
    console.error('Error fetching book details:', error)
    error.value = true
    isLoading.value = false

    try {
      await mobileService.showToast(error.message || '加载书籍数据失败')
    } catch {
      // 忽略toast错误
    }
  }
}

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

// 重置表单
function resetForm() {
  // 重新获取原始数据
  fetchBookDetails()

  // 重置文件上传
  coverImage.value = null
  coverPreview.value = null
  bookFile.value = null
}

// 提交表单
async function submitEdit() {
  if (!isFormValid.value) return

  try {
    isSubmitting.value = true

    // 准备要提交的数据
    const bookToSubmit = {
      ...bookData,
      id: bookId.value,
      coverChanged: !!coverImage.value,
      fileChanged: !!bookFile.value,
      lastUpdated: new Date().toISOString()
    }

    // 检查网络连接
    const isConnected = await mobileService.checkNetwork()

    if (isConnected) {
      // 在线状态：发送到服务器
      // 模拟API调用
      setTimeout(async () => {
        try {
          // 实际项目中应上传文件和表单数据到服务器
          console.log('提交数据到服务器', bookToSubmit)

          // 更新本地缓存
          await mobileService.cacheBook(bookId.value, bookToSubmit)

          // 显示成功对话框
          showSuccessDialog.value = true
          isSubmitting.value = false
        } catch (error) {
          console.error('Error updating book:', error)
          await mobileService.showToast('更新书籍失败，请重试')
          isSubmitting.value = false
        }
      }, 1200)
    } else {
      // 离线状态：保存到本地缓存，并标记为需要同步
      await mobileService.cacheBook(bookId.value, {
        ...bookToSubmit,
        pendingSync: true
      })

      // 本地存储变更状态
      await mobileService.saveData('pendingChanges', {
        ...((await mobileService.getData('pendingChanges')) || {}),
        [bookId.value]: {
          type: 'update',
          timestamp: new Date().toISOString()
        }
      })

      await mobileService.showToast('已保存到本地，将在网络恢复时自动同步')
      isSubmitting.value = false
      showSuccessDialog.value = true
    }
  } catch (error) {
    console.error('Error updating book:', error)
    await mobileService.showToast('更新过程中发生错误')
    isSubmitting.value = false
  }
}

// 确认删除对话框
function confirmDelete() {
  showDeleteDialog.value = true
}

// 删除书籍
async function deleteBook() {
  try {
    isDeleting.value = true

    // 检查网络连接
    const isConnected = await mobileService.checkNetwork()
    if (!isConnected) {
      await mobileService.showToast('网络连接错误，请检查您的网络')
      isDeleting.value = false
      return
    }

    // 模拟API调用
    setTimeout(async () => {
      try {
        // 实际项目中应调用API删除书籍

        await mobileService.showToast('书籍已成功删除')
        showDeleteDialog.value = false
        isDeleting.value = false

        // 返回书籍列表
        router.push('/books')
      } catch (error) {
        console.error('Error deleting book:', error)
        await mobileService.showToast('删除书籍失败，请重试')
        isDeleting.value = false
      }
    }, 1000)
  } catch (error) {
    console.error('Error deleting book:', error)
    await mobileService.showToast('删除过程中发生错误')
    isDeleting.value = false
  }
}

// 返回上一页
function goBack() {
  router.back()
}

// 查看书籍详情
function goToBookDetail() {
  showSuccessDialog.value = false
  router.push(`/book/${bookId.value}`)
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

// 从设备选择文件的辅助方法
function selectBookFile() {
  // 通过编程方式触发文件输入点击
  const fileInputElement = document.querySelector('input[type="file"][accept=".pdf,.epub,.mobi"]')
  if (fileInputElement) {
    ;(fileInputElement as HTMLInputElement).click()
  } else {
    mobileService.showToast('无法访问文件选择器')
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
</script>

<style scoped>
.book-cover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1.25rem !important;
  }
}
</style>
