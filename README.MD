# Figado：基于 Django 与 Vue 的书籍管理与分享平台（毕业设计）

## 项目概述

本项目是一个前后端一体化的在线书籍管理与分享平台，支持用户注册、登录、书籍上传、在线阅读、评分、搜索、下载等功能。后端采用 Django + Django REST Framework + SimpleJWT，前端采用 Vue3 + Pinia + Vuetify，支持现代响应式 UI 和移动端适配。

## 研究背景

- 调研国内外书籍推荐、Web 全栈开发、数据库设计等相关技术
- 分析现有书籍分享/推荐系统的优缺点，结合实际需求进行系统设计

## 主要功能

- 用户注册、登录、token 鉴权、权限管理
- 书籍上传（含封面、EPUB 文件、评分等元数据）
- 书籍浏览、搜索、筛选、评分、下载
- 书籍详情页支持在线 EPUB 阅读（epub.js 集成，支持目录、翻页）
- 书籍唯一 uuid、封面唯一路径、epub 文件上传与下载
- 后台管理（书籍分类、用户管理、数据统计）
- 响应式 UI，移动端适配，良好交互体验

## 技术选型

- 后端：Python 3.12 + Django + Django REST Framework + SimpleJWT
- 前端：Vue3 + Pinia + Vuetify + epub.js
- 数据库：sqlite3

## 项目进展（详见 TIMELINE.MD）

### 已完成

- 后端：
  - 自定义用户模型，支持多语言字段
  - Book 模型支持 rating、uuid、封面路径唯一、epub 文件上传
  - BookSerializer、BookListSerializer、BookAdmin 支持 rating 字段
  - BookViewSet 支持 /api/books/<id>/download/ 下载接口
  - SimpleJWT 鉴权、CORS 配置、API 文档（Swagger）
- 前端：
  - 注册、登录、token 鉴权、书籍上传、评分、搜索、下载等功能打通
  - AddBook.vue 支持评分输入，上传时 rating 字段一并提交
  - books.vue UI 简洁，去除筛选、分页、悬浮动画
  - book.vue 详情页支持“下载 EPUB”与“在线阅读”按钮，自动适配本地/生产 API 域名
  - 集成 epub.js，支持在线阅读、目录、翻页、章节高亮
  - 响应式导航栏，支持“列表/个人中心/退出”
- 问题排查与修正：
  - 下载按钮鉴权、API 地址拼接、按钮显示逻辑、epub.js 兼容性、容器布局等

### 待完善

- 生产环境 API 域名自动适配优化
- EPUB 阅读器更多交互细节（如字体、主题、进度等）
- 书籍评论、推荐算法、用户资料页等

## 目录结构

- bookapp_django/：后端 Django 项目
- bookapp_vuetify/：前端 Vue3 + Vuetify 项目
- docs/：接口文档、开发记录
- TIMELINE.MD：详细开发进度与变更记录

## 项目价值

- 提供开源、可扩展的书籍管理与分享平台全栈实现范例
- 展示 Django + Vue3 + JWT 前后端分离与集成实践
- 适合作为毕业设计、全栈开发学习与二次开发基础
