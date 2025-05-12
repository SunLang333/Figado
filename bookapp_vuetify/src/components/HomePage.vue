<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6">
          <h1 class="text-h4 font-weight-bold mb-4">Figado 书籍管理与分享平台</h1>
          <p class="mb-4">
            Figado 是一个基于 <b>Django</b> +
            <b>Vue3</b>
            的全栈开源书籍管理与分享平台。你可以在这里上传、浏览、搜索、评分和下载书籍，还能直接在线阅读
            EPUB 格式电子书。
          </p>
          <v-divider class="my-4" />
          <h2 class="text-h6 font-weight-bold mb-2">主要功能</h2>
          <ul class="mb-4">
            <li>📚 书籍上传、封面管理、EPUB 文件存储</li>
            <li>🔍 书籍搜索与筛选，支持多条件组合</li>
            <li>⭐ 书籍评分与评论，优质内容推荐</li>
            <li>📖 在线 EPUB 阅读器，支持目录与翻页</li>
            <li>⬇️ 书籍下载，随时离线阅读</li>
            <li>👤 用户注册、登录、个人中心与权限管理</li>
            <li>📱 响应式设计，移动端友好体验</li>
          </ul>
          <v-divider class="my-4" />
          <h2 class="text-h6 font-weight-bold mb-2">技术栈</h2>
          <ul>
            <li>后端：Python 3.12, Django, Django REST Framework, SimpleJWT</li>
            <li>前端：Vue3, Pinia, Vuetify, epub.js</li>
            <li>数据库：SQLite3（可扩展为 MySQL/PostgreSQL）</li>
          </ul>
          <v-divider class="my-4" />
          <div class="text-center">
            <v-btn color="primary" to="/books" prepend-icon="mdi-format-list-bulleted">
              立即浏览书籍
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// 无需脚本
</script>

<style scoped>
/* 可根据需要自定义样式 */
</style>
