以下所有任务预期 **今日内** 完成，基于后端已就绪的注册/登录/Token 接口：

1. 环境初始化  
   - 用 Vite + Vue 3 + TypeScript 搭建前端项目  
   - 安装依赖：axios、vue-router、pinia（或 vuex）、element-plus  

2. Axios 与鉴权配置  
   - 创建 `src/utils/http.ts`，封装 axios 实例  
   - 自动带入 `Authorization: Bearer <access_token>`  
   - 请求拦截器：若收到 401，自动调用 `/api/auth/token/refresh/`  

3. 路由与页面框架  
   - 配置 `src/router/index.ts`：`/login`、`/register`、`/profile`、`/books`  
   - 全局导航守卫：未登录重定向到 `/login`  

4. 状态管理（Pinia）  
   - `src/stores/auth.ts`：保存 `access`、`refresh`、`userInfo`  
   - 提供 `login()`, `register()`, `refreshToken()`, `logout()` 方法  

5. 登录 & 注册页  
   - 登录表单：用户名 + 密码 → 调用 `login()` → 存 Token → 跳转 `/books`  
   - 注册表单：用户名 + 邮箱 + 密码 + 语言偏好（多选标签）→ 调用 `register()` → 跳转 `/login`  

6. 用户个人中心  
   - `/profile`：展示当前用户 `username`, `email`, `languages`  
   - 编辑语言：语言多选控件 → 提交后调用后端更新接口（可选自建 `PUT /api/users/me/`）  

7. 书籍列表骨架  
   - `/books`：页面布局 + 空状态提示  
   - 准备调用 `GET /api/books/`（后端后续实现）  

8. 本地测试与文档  
   - 在开发过程中随时查阅 Swagger UI (`http://127.0.0.1:8000/api/docs/`)  
   - 在项目根目录更新 `docs/api.md`：记录前端调用示例及注意事项  

完成以上步骤后，即可进入书籍管理、评论、推荐等后续功能的开发。

## 后端当前进度
- 已定义并迁移 CustomUser 模型，包含 languages 字段
- 实现 RegisterSerializer、RegisterView，支持用户注册
- 使用 SimpleJWT 提供 TokenObtainPairView、TokenRefreshView 实现登录与刷新
- 在 `urls.py` 中添加 `/api/auth/register/`、`/api/auth/login/`、`/api/auth/token/refresh/` 路由
- 配置 `settings.py`：AUTH_USER_MODEL、REST_FRAMEWORK、SIMPLE_JWT
- 集成 drf-yasg 并提供 Swagger UI (`/api/docs/`) 文档接口

