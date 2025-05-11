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
      },
      credentials: 'include',
      body: formData
    })

    console.log('响应状态:', response.status, response.statusText)
    console.log('响应头:', Array.from(response.headers.entries()))

    if (!response.ok) {
      let errorData = {}
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
  } catch (err) {
    console.error('上传书籍时出错:', err)
    await mobileService.showToast('上传失败: ' + (err.message || '未知错误'))
  } finally {
    isSubmitting.value = false
  }
}
