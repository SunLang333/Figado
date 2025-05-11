// Offline Sync Service for Figado App
import { Network } from '@capacitor/network'
import mobileService from './MobileService'

/**
 * 提供离线数据同步服务
 */
class SyncService {
  private syncInProgress: boolean = false
  private retryCount: number = 0
  private maxRetries: number = 3

  /**
   * 初始化同步服务
   */
  constructor() {
    this.setupNetworkListener()
  }

  /**
   * 设置网络状态监听
   */
  private setupNetworkListener() {
    // 监听网络连接恢复
    Network.addListener('networkStatusChange', status => {
      console.log('网络状态变化:', status.connected)

      if (status.connected) {
        console.log('网络已恢复，开始同步...')
        this.syncPendingChanges()
      }
    })
  }

  /**
   * 同步所有待处理的更改
   */
  async syncPendingChanges() {
    // 避免多次同步调用
    if (this.syncInProgress) {
      console.log('同步已在进行中，跳过')
      return
    }

    try {
      this.syncInProgress = true

      // 检查网络连接
      const isConnected = await mobileService.checkNetwork()
      if (!isConnected) {
        console.log('没有网络连接，同步将延迟')
        this.syncInProgress = false
        return
      }

      // 获取所有待同步的更改
      const pendingChanges = (await mobileService.getData('pendingChanges')) || {}
      const pendingKeys = Object.keys(pendingChanges)

      if (pendingKeys.length === 0) {
        console.log('没有待同步的更改')
        this.syncInProgress = false
        return
      }

      console.log(`开始同步 ${pendingKeys.length} 个更改`)

      // 对每个待处理的更改进行处理
      for (const id of pendingKeys) {
        const change = pendingChanges[id]
        const cachedItem = await mobileService.getCachedBook(id)

        if (!cachedItem) {
          console.log(`找不到ID为 ${id} 的缓存项，跳过`)
          continue
        }

        try {
          // 根据更改类型执行不同操作
          switch (change.type) {
            case 'update':
              // 模拟API调用 - 在实际项目中使用实际的API
              console.log(`正在同步更新：${id}`)
              await this.simulateApiCall(id, cachedItem)
              break
            case 'create':
              console.log(`正在同步创建：${id}`)
              await this.simulateApiCall(id, cachedItem)
              break
            case 'delete':
              console.log(`正在同步删除：${id}`)
              await this.simulateApiCall(id, { id, _deleted: true })
              break
          }

          // 成功后，从待处理列表中删除
          delete pendingChanges[id]

          // 如果是删除操作，还需要从缓存中删除
          if (change.type === 'delete') {
            await mobileService.removeCachedBook(id)
          } else {
            // 更新缓存，标记为已同步
            await mobileService.cacheBook(id, {
              ...cachedItem,
              pendingSync: false,
              lastSynced: new Date().toISOString()
            })
          }
        } catch (error) {
          console.error(`同步ID为 ${id} 的项失败:`, error)
          // 保留在待处理列表中
        }
      }

      // 更新待处理的更改列表
      await mobileService.saveData('pendingChanges', pendingChanges)

      // 如果还有未同步的项目，可能是因为出错，记录下来
      const remainingKeys = Object.keys(pendingChanges)
      if (remainingKeys.length > 0) {
        console.log(`还有 ${remainingKeys.length} 个更改未同步`)

        // 显示通知
        await mobileService.showToast(`同步部分完成，${remainingKeys.length} 个更改失败`)
      } else {
        console.log('所有更改同步完成')
        await mobileService.showToast('所有离线更改已同步')
      }
    } catch (error) {
      console.error('同步过程发生错误:', error)

      // 重试机制
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        console.log(`同步失败，将在稍后重试 (${this.retryCount}/${this.maxRetries})`)

        // 延迟后重试
        setTimeout(() => {
          this.syncInProgress = false
          this.syncPendingChanges()
        }, 30000) // 30秒后重试
      } else {
        this.retryCount = 0
        await mobileService.showToast('同步失败，请稍后手动尝试')
      }
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * 模拟API调用
   * 在实际项目中，这里应该调用真实的API端点
   */
  private async simulateApiCall(id: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // 模拟API请求的延迟和随机成功/失败
      setTimeout(() => {
        // 模拟90%的成功率
        if (Math.random() > 0.1) {
          console.log(`API调用成功: ${id}`)
          resolve()
        } else {
          console.log(`API调用失败: ${id}`)
          reject(new Error('API调用失败'))
        }
      }, 700)
    })
  }

  /**
   * 手动启动同步
   */
  async startSync(): Promise<boolean> {
    if (this.syncInProgress) {
      await mobileService.showToast('同步已在进行中')
      return false
    }

    this.syncPendingChanges()
    return true
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(): Promise<{ pendingCount: number; lastSync: string | null }> {
    const pendingChanges = (await mobileService.getData('pendingChanges')) || {}
    const pendingCount = Object.keys(pendingChanges).length
    const lastSync = await mobileService.getData('lastSuccessfulSync')

    return {
      pendingCount,
      lastSync
    }
  }
}

// 创建一个单例
const syncService = new SyncService()
export { syncService }
export default syncService
