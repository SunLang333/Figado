// Mobile Device Service for Figaro App
import { Network } from '@capacitor/network'
import { Preferences } from '@capacitor/preferences'
import { Toast } from '@capacitor/toast'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import type { Photo } from '@capacitor/camera'

/**
 * 提供与移动设备交互的服务
 */
class MobileService {
  /**
   * 初始化移动设备服务
   */
  constructor() {
    // 监听网络状态变化
    Network.addListener('networkStatusChange', status => {
      console.log('网络状态变化', status.connected)
    })
  }

  /**
   * 初始化状态栏
   */
  async initStatusBar() {
    try {
      await StatusBar.setStyle({ style: Style.Light })
      await StatusBar.setBackgroundColor({ color: '#1976D2' })
    } catch (e) {
      console.log('状态栏初始化错误（可能是在浏览器中）', e)
    }
  }
  /**
   * 显示消息提示
   */
  async showToast(message: string, duration: 'short' | 'long' = 'short') {
    await Toast.show({
      text: message,
      duration: duration
    })
  }

  /**
   * 保存数据到本地存储
   */
  async saveData(key: string, value: any) {
    await Preferences.set({
      key: key,
      value: JSON.stringify(value)
    })
  }

  /**
   * 从本地存储中获取数据
   */ async getData(key: string): Promise<any> {
    const result = await Preferences.get({ key })
    if (result.value) {
      return JSON.parse(result.value)
    }
    return null
  }

  /**
   * 保存书籍到本地缓存
   */
  async cacheBook(bookId: string | number, bookData: any) {
    // 获取现有缓存
    let cachedBooks = (await this.getData('cachedBooks')) || {}

    // 更新特定书籍
    cachedBooks[bookId] = {
      ...bookData,
      cachedAt: new Date().toISOString()
    }

    // 保存回本地存储
    await this.saveData('cachedBooks', cachedBooks)
  }

  /**
   * 获取缓存的书籍信息
   */
  async getCachedBook(bookId: string | number): Promise<any> {
    const cachedBooks = (await this.getData('cachedBooks')) || {}
    return cachedBooks[bookId] || null
  }

  /**
   * 获取所有缓存的书籍
   */
  async getAllCachedBooks(): Promise<any[]> {
    const cachedBooks = (await this.getData('cachedBooks')) || {}
    return Object.values(cachedBooks)
  }

  /**
   * 删除缓存中的书籍
   */
  async removeCachedBook(bookId: string | number) {
    const cachedBooks = (await this.getData('cachedBooks')) || {}
    if (cachedBooks[bookId]) {
      delete cachedBooks[bookId]
      await this.saveData('cachedBooks', cachedBooks)
    }
  }

  /**
   * 检查网络状态
   */ async checkNetwork() {
    const status = await Network.getStatus()
    return status.connected
  }

  /**
   * 从相机拍照
   */
  async takePicture(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      })

      return image.dataUrl || null
    } catch (e) {
      console.error('相机错误', e)
      return null
    }
  }

  /**
   * 从图库选择图片
   */
  async selectFromGallery(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      })

      return image.dataUrl || null
    } catch (e) {
      console.error('选择图片错误', e)
      return null
    }
  }
}

// 创建一个单例
const mobileService = new MobileService()
export { mobileService }
export default mobileService
