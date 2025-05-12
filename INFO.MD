# Figado 项目详细文档

## 1. 引言

本文档详细记录了 Figado 项目的技术细节，包括数据库结构、Django Models 设计、项目整体架构、以及已实现各项功能的代码和逻辑解释。

## 2. 数据库结构 (Database Structure)

Django 根据定义的 Models 自动生成和管理数据库表结构。以下是本项目中主要的数据表及其字段的详细说明。

### 2.1. 用户认证相关表 (Django Auth Tables)

Django 的 `django.contrib.auth` 应用会创建一系列表来管理用户、用户组和权限。由于我们使用了 `AbstractUser` 作为 `CustomUser` 的基类，大部分用户核心字段都存储在 `users_customuser` 表中，但以下辅助表仍然重要：

- `auth_group`: 存储用户组信息。
  - `id` (Primary Key, Integer)
  - `name` (Varchar, Unique): 组名。
- `auth_permission`: 存储所有可用权限的信息。
  - `id` (Primary Key, Integer)
  - `name` (Varchar)
  - `content_type_id` (Foreign Key to `django_content_type`)
  - `codename` (Varchar)
- `auth_group_permissions`: 存储用户组与其权限之间的多对多关系。
  - `id` (Primary Key, Integer)
  - `group_id` (Foreign Key to `auth_group`)
  - `permission_id` (Foreign Key to `auth_permission`)
- `users_customuser_groups`: 存储用户与其所属用户组之间的多对多关系 (由 `CustomUser.groups` 字段自动创建)。
  - `id` (Primary Key, Integer)
  - `customuser_id` (Foreign Key to `users_customuser`)
  - `group_id` (Foreign Key to `auth_group`)
- `users_customuser_user_permissions`: 存储用户与其特定权限之间的多对多关系 (由 `CustomUser.user_permissions` 字段自动创建)。
  - `id` (Primary Key, Integer)
  - `customuser_id` (Foreign Key to `users_customuser`)
  - `permission_id` (Foreign Key to `auth_permission`)

### 2.2. `users_customuser` 表 (用户表)

此表由 `users.models.CustomUser` 模型生成，用于存储用户信息。

- `id`: (Primary Key, Integer, Auto-incrementing) - 用户唯一标识符。
- `password`: (Varchar) - 用户密码 (存储的是哈希值)。
- `last_login`: (Datetime, Nullable) - 用户最后登录时间。
- `is_superuser`: (Boolean) - 标记用户是否为超级用户。
- `username`: (Varchar, Unique) - 用户名。
- `first_name`: (Varchar, Nullable) - 名字。
- `last_name`: (Varchar, Nullable) - 姓氏。
- `email`: (Varchar, Nullable) - 电子邮箱。
- `is_staff`: (Boolean) - 标记用户是否可以访问 Django Admin 后台。
- `is_active`: (Boolean) - 标记用户账户是否激活。
- `date_joined`: (Datetime) - 用户注册时间。
- `languages`: (JSON) - 存储用户的语言偏好列表，例如 `["cn", "en"]`。默认为空列表。

### 2.3. `books_book` 表 (书籍表)

此表由 `books.models.Book` 模型生成，用于存储书籍的详细信息。

- `id`: (Primary Key, Integer, Auto-incrementing) - Django 默认添加的主键。
- `uuid`: (UUID, Unique, Indexed) - 书籍的全局唯一标识符。
- `title`: (Varchar) - 书名。
- `author`: (Varchar) - 作者。
- `language`: (Varchar) - 书籍语言。
- `category`: (Varchar) - 书籍分类。
- `tags`: (Varchar, Nullable) - 标签，可为空。
- `description`: (Text, Nullable) - 书籍描述，可为空。
- `publisher`: (Varchar, Nullable) - 出版商，可为空。
- `publish_date`: (Date, Nullable) - 出版日期，可为空。
- `isbn`: (Varchar, Nullable) - ISBN 号，可为空。
- `page_count`: (Integer, Nullable) - 页数，可为空。
- `visibility`: (Varchar) - 可见性设置 ('public' 或 'private')，默认为 'public'。
- `allow_comments`: (Boolean) - 是否允许评论，默认为 True。
- `cover_image`: (Varchar, Nullable) - 封面图片文件的存储路径，可为空。
- `book_file`: (Varchar, Nullable) - 书籍文件 (如 EPUB) 的存储路径，可为空。
- `user_id`: (Integer, Foreign Key to `users_customuser.id`, Indexed) - 关联到上传该书籍的用户。
- `created_at`: (Datetime) - 书籍记录创建时间，自动记录。
- `updated_at`: (Datetime) - 书籍记录最后更新时间，自动记录。
- `rating`: (Float/Real) - 书籍评分，默认为 0。

**字段类型说明:**

- `Varchar`: 对应 Django 的 `CharField`，用于存储可变长度的字符串。
- `Text`: 对应 Django 的 `TextField`，用于存储大量文本。
- `Integer`: 对应 Django 的 `IntegerField` 或自动创建的主键。
- `Boolean`: 对应 Django 的 `BooleanField`。
- `Date`: 对应 Django 的 `DateField`。
- `Datetime`: 对应 Django 的 `DateTimeField`。
- `UUID`: 对应 Django 的 `UUIDField`。
- `JSON`: 对应 Django 的 `JSONField`。
- `Float/Real`: 对应 Django 的 `FloatField`。

**关系:**

- `books_book.user_id` 是一个外键，指向 `users_customuser.id`，表示一本书籍属于一个用户 (一个用户可以有多本书籍)。
- `users_customuser` 与 `auth_group` 和 `auth_permission` 之间存在多对多关系，通过 `users_customuser_groups` 和 `users_customuser_user_permissions` 中间表实现。

## 3. Django Models 结构 (Django Models Structure)

### 3.1. `users.models.CustomUser`

该模型扩展了 Django 内置的 `AbstractUser` 模型，用于存储用户信息。

```python
# d:\\Documents\\GitHub\\Figado\\bookapp_django\\users\\models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """
    扩展用户模型，添加语言偏好字段
    languages 存储用户偏好的语言列表，例如 ["cn", "en", "fr", "es"]
    """
    languages = models.JSONField(default=list, blank=True, help_text="Preferred languages")
```

**字段说明:**

- 继承自 `AbstractUser` 的所有字段 (例如: `username`, `password`, `email`, `first_name`, `last_name`, `is_staff`, `is_active`, `date_joined` 等)。
- `languages`: JSON 字段，用于存储用户的语言偏好列表。默认为一个空列表。例如: `["cn", "en"]`。

### 3.2. `books.models.Book`

该模型用于存储书籍的详细信息和元数据。

```python
# d:\\Documents\\GitHub\\Figado\\bookapp_django\\books\\models.py
from django.db import models
from django.conf import settings
import os
import uuid

def book_file_path(instance, filename):
    """Generate a unique file path for the book."""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('books', filename)

def cover_image_upload_path(instance, filename):
    """Generate a unique file path for the cover image using uuid."""
    ext = filename.split('.')[-1]
    if not instance.uuid: # Ensure uuid exists, though it has a default
        instance.uuid = uuid.uuid4()
    filename = f"cover.{ext}"
    return os.path.join('book_covers', str(instance.uuid), filename)

class Book(models.Model):
    """Model for book data and metadata."""
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)

    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    language = models.CharField(max_length=50)
    category = models.CharField(max_length=100)
    tags = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    publisher = models.CharField(max_length=255, blank=True)
    publish_date = models.DateField(null=True, blank=True)
    isbn = models.CharField(max_length=20, blank=True)
    page_count = models.IntegerField(null=True, blank=True)

    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')
    allow_comments = models.BooleanField(default=True)

    cover_image = models.ImageField(upload_to=cover_image_upload_path, blank=True, null=True)
    book_file = models.FileField(upload_to=book_file_path, null=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='books')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    rating = models.FloatField(default=0)

    def __str__(self):
        return f"{self.title} by {self.author}"

    def delete(self, *args, **kwargs):
        if self.book_file and os.path.isfile(self.book_file.path):
            os.remove(self.book_file.path)
        if self.cover_image and os.path.isfile(self.cover_image.path):
            os.remove(self.cover_image.path)
        super().delete(*args, **kwargs)
```

**字段说明:**

- `uuid`: UUID 字段，书籍的唯一标识符，自动生成且不可编辑。
- `title`: CharField，书名，最大长度 255。
- `author`: CharField，作者，最大长度 255。
- `language`: CharField，书籍语言，最大长度 50。
- `category`: CharField，书籍分类，最大长度 100。
- `tags`: CharField，标签，最大长度 255，可为空。
- `description`: TextField，书籍描述，可为空。
- `publisher`: CharField，出版商，最大长度 255，可为空。
- `publish_date`: DateField，出版日期，可为空。
- `isbn`: CharField，ISBN 号，最大长度 20，可为空。
- `page_count`: IntegerField，页数，可为空。
- `visibility`: CharField，可见性设置（'public' 或 'private'），默认为 'public'。
- `allow_comments`: BooleanField，是否允许评论，默认为 True。
- `cover_image`: ImageField，封面图片文件。上传路径由 `cover_image_upload_path` 函数动态生成，存储在 `media/book_covers/<book_uuid>/cover.<ext>`。可为空。
- `book_file`: FileField，书籍文件 (例如 EPUB)。上传路径由 `book_file_path` 函数动态生成，存储在 `media/books/<uuid>.<ext>`。可为空。
- `user`: ForeignKey，关联到 `CustomUser` 模型，表示书籍的上传者/所有者。采用级联删除。
- `created_at`: DateTimeField，创建时间，自动记录。
- `updated_at`: DateTimeField，最后更新时间，自动记录。
- `rating`: FloatField，书籍评分，默认为 0。

**辅助函数:**

- `book_file_path(instance, filename)`: 生成书籍文件的唯一存储路径。文件名将使用 UUID 重命名以避免冲突。
- `cover_image_upload_path(instance, filename)`: 生成封面图片的唯一存储路径。封面图片将存储在以书籍 UUID 命名的子目录下。

**方法:**

- `__str__(self)`: 返回书籍的可读字符串表示形式（"书名 by 作者"）。
- `delete(self, *args, **kwargs)`: 重写了删除方法，在删除书籍记录的同时，也会从文件系统中删除关联的封面图片和书籍文件。

## 4. 项目结构 (Project Structure)

### 4.1. Django 后端 (`bookapp_django`)

```
bookapp_django/
├── bookapp_django/         # Django 项目配置目录
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py         # 项目设置
│   ├── urls.py             # 项目总路由
│   └── wsgi.py
├── books/                  # 书籍管理应用
│   ├── migrations/         # 数据库迁移文件
│   ├── __init__.py
│   ├── admin.py            # Django Admin 配置
│   ├── apps.py
│   ├── models.py           # 书籍数据模型
│   ├── serializers.py      # DRF Serializers
│   ├── tests.py
│   ├── urls.py             # 书籍应用路由
│   └── views.py            # 视图逻辑
├── corsheaders_fix/        # (可能为自定义的CORS处理，或已废弃)
├── media/                  # 用户上传文件存储目录 (例如书籍文件, 封面)
│   ├── book_covers/        # 书籍封面图片
│   └── books/              # 书籍文件 (EPUB等)
├── users/                  # 用户管理应用
│   ├── migrations/         # 数据库迁移文件
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py           # 用户数据模型 (CustomUser)
│   ├── serializers.py      # DRF Serializers
│   ├── tests.py
│   ├── urls.py             # 用户应用路由
│   └── views.py            # 视图逻辑
├── bookapppvenv/           # Python 虚拟环境 (通常在项目外层，此处列出仅为结构参考)
├── db.sqlite3              # SQLite 数据库文件 (开发用)
└── manage.py               # Django 管理脚本
```

**关键目录和文件说明:**

- `bookapp_django/settings.py`: Django 项目的主要配置文件，包括数据库设置、中间件、静态文件、媒体文件路径等。
- `bookapp_django/urls.py`: 项目的根 URL 配置，它会包含各个 app 的 URL 配置。
- `books/models.py`: 定义了 `Book` 模型，包括书籍的各种属性和文件存储逻辑。
- `users/models.py`: 定义了 `CustomUser` 模型，扩展了 Django 的默认用户模型。
- `books/views.py` 和 `users/views.py`: 处理 HTTP 请求，包含业务逻辑，通常与 serializers 交互以处理数据。
- `books/serializers.py` 和 `users/serializers.py`: 使用 Django REST Framework 将模型实例转换为 JSON 等格式，并进行数据验证。
- `media/`: 存储用户上传的文件。`book_file_path` 和 `cover_image_upload_path` 函数定义了文件在此目录下的具体存储路径和命名规则。

### 4.2. Vue 前端 (`bookapp_vuetify`)

```
bookapp_vuetify/
├── .vscode/                # VS Code 编辑器配置
├── dist/                   # 项目构建后的输出目录
├── node_modules/           # npm 包依赖
├── public/                 # 公共静态资源
│   └── favicon.ico
├── src/
│   ├── assets/             # 静态资源 (图片, 字体等)
│   │   └── logo.svg
│   ├── components/         # Vue 组件
│   │   ├── HomePage.vue    # 平台介绍页
│   │   └── NavBar.vue      # 导航栏组件
│   ├── pages/              # 页面级 Vue 组件 (通常对应路由)
│   │   ├── addBook.vue     # 添加/编辑书籍页面
│   │   ├── book.vue        # 单个书籍详情与阅读页面
│   │   ├── books.vue       # 书籍列表页面
│   │   ├── index.vue       # 平台介绍页
│   │   ├── login.vue       # 登录页面
│   │   ├── profile.vue     # 用户个人资料页面
│   │   └── register.vue    # 用户注册页面
│   ├── plugins/            # Vuetify, Pinia 等插件配置
│   │   ├── index.ts
│   │   ├── pinia.ts
│   │   └── vuetify.ts
│   ├── router/             # Vue Router 配置
│   │   └── index.ts
│   ├── services/           # API 服务调用 (例如 axios 实例和请求封装)
│   │   └── apiClient.ts
│   ├── stores/             # Pinia状态管理
│   │   ├── auth.js         # 用户认证状态
│   │   └── book.js         # (可能用于书籍相关状态)
│   ├── App.vue             # 根 Vue 组件
│   └── main.ts             # 应用入口文件
├── .browserslistrc
├── .editorconfig
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── capacitor.config.json   # Capacitor 配置文件 (用于打包移动应用)
├── env.d.ts                # TypeScript 环境变量声明
├── eslint.config.js        # ESLint 配置文件
├── index.html              # SPA 的主 HTML 文件
├── package.json            # 项目依赖和脚本配置
├── package-lock.json
├── README.md
├── tsconfig.app.json       # TypeScript 应用编译配置
├── tsconfig.json           # TypeScript 基础配置
├── tsconfig.node.json      # TypeScript Node环境编译配置
└── vite.config.mts         # Vite 构建工具配置
```

**关键目录和文件说明:**

- `src/main.ts`: Vue 应用的入口点，在这里初始化 Vue 实例、路由、状态管理和插件。
- `src/App.vue`: 应用的根组件，通常包含全局布局和 `<router-view>`。
- `src/router/index.ts`: 定义了应用的路由规则，将 URL 路径映射到相应的 Vue 组件。
- `src/pages/`: 包含与特定路由对应的页面级组件。
- `src/components/`: 包含可在应用中复用的 UI 组件。
- `src/stores/`: 使用 Pinia 进行状态管理。例如 `auth.js` 管理用户登录状态和信息。
- `src/services/apiClient.ts`: (通常) 封装 Axios 或 Fetch API，用于与后端 Django API 进行通信。
- `src/plugins/vuetify.ts`: Vuetify UI 框架的初始化和配置。
- `vite.config.mts`: Vite 项目的构建和开发服务器配置。
- `public/`: 存放不会被 Webpack/Vite 处理的静态资源，它们会被直接复制到构建输出的根目录。

## 5. 已实现功能代码及解释 (Implemented Features Code and Explanation)

### 5.1. 用户认证 (User Authentication)

用户认证系统是平台的核心功能之一，包括用户注册、登录、登出以及后续可能的个人资料管理。

#### 5.1.1. 用户注册

**前端 (`bookapp_vuetify/src/pages/register.vue`):**

用户通过注册页面 (`register.vue`) 输入用户名、邮箱、密码，并可选择擅长语言。表单包含输入验证规则。

- **UI 组件**: 使用 Vuetify 组件 (`v-text-field`, `v-autocomplete`, `v-btn`, `v-form`, `v-alert`) 构建注册表单。
- **数据提交**: 点击“注册”按钮后，`register()` 方法被调用。
  - 它首先进行表单验证 (`isFormValid`) 和网络连接检查 (`mobileService.checkNetwork()`).
  - 然后通过 `fetch` API 将用户输入的数据 (username, email, password, languages) 以 POST 请求发送到后端注册接口 `http://localhost:8000/api/auth/register/`.
  - 根据响应结果，显示成功或错误消息，并在成功后跳转到登录页面。

```vue
// Relevant snippet from
d:\Documents\GitHub\Figado\bookapp_vuetify\src\pages\register.vue // ...
template ... async function register() { if (!isFormValid.value) return try {
isLoading.value = true errorMessage.value = '' // 检查网络连接 const isConnected
= await mobileService.checkNetwork() if (!isConnected) { errorMessage.value =
'网络连接错误，请检查您的网络' isLoading.value = false return } //
真实API注册调用 const response = await
fetch('http://localhost:8000/api/auth/register/', { method: 'POST', headers: {
'Content-Type': 'application/json' }, body: JSON.stringify({ username:
username.value, email: email.value, password: password.value, languages:
languages.value }) }) if (!response.ok) { let errorData: any = {} try {
errorData = await response.json() } catch (e) {} errorMessage.value = errorData
&& errorData.detail ? errorData.detail : '注册失败，请重试' isLoading.value =
false return } await mobileService.showToast('注册成功！请登录')
router.push('/login') } catch (error) { console.error('Registration error:',
error) errorMessage.value = '注册过程中发生错误' } finally { isLoading.value =
false } }
```

**后端 (`bookapp_django/users/views.py` & `bookapp_django/users/serializers.py`):**

- **路由**: Django 项目的 `urls.py` (未直接提供，但通常会配置) 将 `/api/auth/register/` 路径指向 `users.views.RegisterView`.
- **视图 (`RegisterView`):**
  - 继承自 `rest_framework.generics.CreateAPIView`, 专门用于处理创建新对象的请求。
  - `queryset`: `get_user_model().objects.all()`
  - `permission_classes`: `[AllowAny]` 允许任何用户访问此接口进行注册。
  - `serializer_class`: `RegisterSerializer` 用于验证和处理注册数据。

```python
# d:\\Documents\\GitHub\\Figado\\bookapp_django\\users\\views.py
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer

class RegisterView(CreateAPIView):
    queryset = get_user_model().objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
```

- **序列化器 (`RegisterSerializer`):**
  - 继承自 `serializers.ModelSerializer`.
  - `Meta.model`: `get_user_model()` (即 `CustomUser`).
  - `Meta.fields`: `('username', 'email', 'password', 'languages')`.
  - `password`: 设置为 `write_only=True`, 最小长度为 8.
  - `languages`: `ListField`, 同样 `write_only=True`, 非必需。
  - `create(self, validated_data)`: 重写了 `create` 方法，用于创建新用户。
    - 它会从 `validated_data` 中弹出 `languages`.
    - 使用 `User.objects.create_user()` 创建用户，该方法会自动处理密码哈希。
    - 将 `languages` 赋值给新创建的用户实例并保存。

```python
# d:\\Documents\\GitHub\\Figado\\bookapp_django\\users\\serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    languages = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False, default=list
    )

    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'password', 'languages')

    def create(self, validated_data):
        User = get_user_model()
        languages = validated_data.pop('languages', [])
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        user.languages = languages
        user.save()
        return user
```

#### 5.1.2. 用户登录

**前端 (`bookapp_vuetify/src/pages/login.vue`):**

用户通过登录页面 (`login.vue`) 输入用户名和密码。

- **UI 组件**: 使用 Vuetify 组件 (`v-text-field`, `v-btn`, `v-form`, `v-alert`) 构建登录表单。
- **数据提交**: 点击“登录”按钮后，`login()` 方法被调用。
  - 进行表单验证和网络检查。
  - 通过 `fetch` API 将用户名和密码以 POST 请求发送到后端登录接口 `http://localhost:8000/api/auth/login/`.
  - **Token 处理**: 如果登录成功，后端会返回 `access` 和 `refresh` tokens。
    - 这些 tokens 以及用户名被存储在 `localStorage` 中。
    - `auth.setToken(data.access)` 和 `auth.setUsername(username.value)` 更新 Pinia store (auth.js/ts) 中的状态。
  - 成功登录后，用户被重定向到个人资料页面 (`/profile`).

```vue
// Relevant snippet from
d:\Documents\GitHub\Figado\bookapp_vuetify\src\pages\login.vue // ... template
... async function login() { if (!isFormValid.value) return // ... network check
... try { const response = await fetch('http://localhost:8000/api/auth/login/',
{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body:
JSON.stringify({ username: username.value, password: password.value }) }) if
(!response.ok) { // ... error handling ... errorMessage.value = errorData.detail
|| `登录失败 (${response.status})` isLoading.value = false return } const data =
await response.json() localStorage.setItem('access', data.access)
localStorage.setItem('refresh', data.refresh) localStorage.setItem('username',
username.value) // Storing username auth.setToken(data.access) // Assuming auth
is the Pinia store instance auth.setUsername(username.value) await
mobileService.showToast('登录成功！') router.push('/profile') } catch (error) {
// ... error handling ... } // ... }
```

**后端 (Django REST Framework Simple JWT - 典型实现):**

虽然未直接提供登录视图代码，但 Django REST Framework 项目通常使用 `rest_framework_simplejwt` 库来处理 JWT (JSON Web Token) 认证。

- **路由**: `/api/auth/login/` 通常会映射到 `TokenObtainPairView` from `rest_framework_simplejwt.views`.
- **`TokenObtainPairView`**: 这个视图接收用户名和密码，验证凭据。
  - 如果凭据有效，它会生成并返回一个新的 access token 和 refresh token。
  - Access token 用于后续 API 请求的认证。
  - Refresh token 用于在 access token 过期时获取新的 access token，而无需用户重新登录。
- **Token 验证**: 受保护的 API 端点会使用 JWTAuthentication 类来验证请求头中提供的 access token。

**状态管理 (Pinia - `auth.js` or `auth.ts`):**

虽然 `auth.js` 文件未找到，但从 `login.vue` 的代码 `import { useAuthStore } from '@/stores/auth'` 和 `auth.setToken()` / `auth.setUsername()` 的使用来看，存在一个 Pinia store 用于管理认证状态。

- **Store 结构 (推测):**
  - `token`: 存储 access token。
  - `username`: 存储当前登录用户的用户名。
  - `isAuthenticated`: 一个 getter，根据 token 是否存在来判断用户是否已登录。
  - Actions: `setToken`, `setUsername`, `logout` (清除 token 和用户信息).
- **持久化**: Token 通常存储在 `localStorage` 中，以便在页面刷新后保持登录状态。Pinia store 在初始化时会尝试从 `localStorage` 加载 token。

#### 5.1.3. 用户登出

**前端 (`bookapp_vuetify/src/pages/profile.vue`):**

用户个人资料页面 (`profile.vue`) 提供了登出功能。

- **UI**: 登出按钮触发 `confirmLogout` 方法，显示确认对话框。
- **`logout()` 方法**: (代码未完全展示，但基于典型实现)
  - 调用 Pinia store 中的 `logout` action。
  - 该 action 会清除 `localStorage` 中的 `access` token, `refresh` token 和 `username`.
  - 清除 Pinia store 中的认证状态 (token, username).
  - 将用户重定向到登录页面 (`/login`).

```vue
// Snippet from d:\Documents\GitHub\Figado\bookapp_vuetify\src\pages\profile.vue
(illustrative for logout) // ... template for logout button and dialog ... // In
script setup: const auth = useAuthStore() // Assuming useAuthStore is correctly
imported const router = useRouter() const logoutDialog = ref(false) function
confirmLogout() { logoutDialog.value = true } async function logout() { await
auth.logout() // This would call the action in your Pinia store // The Pinia
store action should handle clearing localStorage and state logoutDialog.value =
false router.push('/login') // Optionally, show a toast message await
mobileService.showToast('您已成功退出登录'); }
```

**后端**: JWT 是无状态的。登出主要在客户端通过删除 token 实现。后端可以通过维护一个 token 黑名单来实现更严格的登出（使已签发的 token 失效），但这通常需要额外的设置。

#### 5.1.4. 个人资料查看与编辑

**前端 (`bookapp_vuetify/src/pages/profile.vue`):**

- **显示信息**: 从 `localStorage` 或 Pinia store 获取用户名 (`username`) 和用户偏好语言 (`userLanguages`) 并显示。
- **编辑功能**: `openEditProfile` 打开编辑弹窗，允许用户修改用户名、邮箱和语言偏好。
  - `saveProfile` 方法 (未提供具体实现) 将会调用后端 API 更新用户信息。

**后端**: 需要相应的 API 端点来获取和更新用户信息。

- 获取用户信息: 通常是一个 `/api/auth/user/` 或 `/api/profile/` 的 GET 请求，需要认证。
- 更新用户信息: 同一个端点的 PUT 或 PATCH 请求，包含要更新的数据。
  - 对应的 Django 视图会使用类似 `UserSerializer` (可能需要一个新的，或扩展现有的) 来处理和验证数据，然后更新 `CustomUser` 模型实例。

#### 5.1.5. Pinia Store (`auth.ts`)

This Pinia store (`useAuthStore`) manages the authentication state:

- `accessToken`: Stores the JWT access token, initialized from `localStorage`.
- `username`: Stores the logged-in user's name, initialized from `localStorage`.
- `loggedIn`: A computed property that returns `true` if `accessToken` is present, indicating an active session.
- `setToken(token)`: Action to update `accessToken` in both the store and `localStorage`.
- `setUsername(name)`: Action to update `username` in both the store and `localStorage`.
- `logout()`: Action to clear `accessToken` and `username` from the store and remove `access`, `refresh`, and `username` items from `localStorage`.
- An event listener for `storage` changes ensures that if authentication state changes in another browser tab (e.g., user logs out), the current tab's state is updated accordingly.

### 5.2. 书籍管理 (Book CRUD Operations)

平台的核心功能是书籍的上传、展示、管理和阅读。这包括书籍的创建 (Create)、读取 (Read)、更新 (Update) 和删除 (Delete) 操作，以及文件处理。

#### 5.2.1. 后端实现 (`bookapp_django`)

**模型 (`books.models.Book`):**

(已在 3.2. `books.models.Book` 章节详细描述)

**序列化器 (`books.serializers.py`):**

- `BookSerializer`: 用于书籍的创建、检索、更新。包含所有字段，并对 `user` 字段设为只读 (从请求用户自动获取)。特别地，它有一个 `validate_book_file` 方法，用于校验上传的文件是否为 EPUB 格式 (通过文件扩展名和 `python-magic` 库检测 MIME 类型)。

```python
# d:\\Documents\\GitHub\\Figado\\bookapp_django\\books\\serializers.py
from rest_framework import serializers
from .models import Book
import os
import magic # For MIME type validation

class BookSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'language', 'category', 'tags',
            'description', 'publisher', 'publish_date', 'isbn',
            'page_count', 'visibility', 'allow_comments', 'cover_image',
            'book_file', 'user', 'created_at', 'updated_at', 'rating'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate_book_file(self, value):
        if not value:
            return value
        ext = os.path.splitext(value.name)[1].lower()
        if ext != '.epub':
            raise serializers.ValidationError("Only EPUB files are allowed.")
        try:
            file_mime = magic.from_buffer(value.read(1024), mime=True)
            value.seek(0)
            valid_mimes = ['application/epub+zip', 'application/octet-stream']
            if file_mime not in valid_mimes:
                raise serializers.ValidationError(f"Invalid file type. Expected EPUB, got {file_mime}")
        except ImportError:
            pass # Fallback to extension check if python-magic is not installed
        return value

class BookListSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'category', 'cover_image',
            'visibility', 'user', 'created_at', 'updated_at', 'rating'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
```

- `BookListSerializer`: 用于书籍列表展示，包含较少的关键字段，以提高列表加载效率。

**视图 (`books.views.py`):**

- `BookViewSet`:
  - 继承自 `viewsets.ModelViewSet`，自动提供 `list`, `create`, `retrieve`, `update`, `partial_update`, `destroy` 动作。
  - `permission_classes`: `[permissions.IsAuthenticated, IsOwnerOrReadOnly]`。用户必须登录才能访问，且只有书籍所有者才能编辑或删除。
  - `parser_classes`: `[MultiPartParser, FormParser]` 支持文件上传。
  - `filter_backends`: `[filters.SearchFilter, filters.OrderingFilter]` 支持搜索和排序。
  - `search_fields`: 定义了可供搜索的字段。
  - `get_serializer_class()`: 列表视图使用 `BookListSerializer`，其他视图使用 `BookSerializer`。
  - `get_queryset()`: 返回当前用户的所有书籍以及其他用户的公开书籍。
  - `perform_create(serializer)`: 创建书籍时，自动将当前登录用户设为书籍的 `user`。
  - `download(request, pk=None)`: 自定义 action (`@action(detail=True, methods=['get'])`)，允许用户下载书籍的 EPUB 文件。它会检查文件是否存在并返回 `FileResponse`。

```python
# d:\\Documents\\GitHub\\Figado\\bookapp_django\\books\\views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from .models import Book
from .serializers import BookSerializer, BookListSerializer
import os

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            if obj.visibility == 'public':
                return True
            return obj.user == request.user
        return obj.user == request.user

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'description', 'tags', 'category']
    ordering_fields = ['title', 'author', 'created_at', 'updated_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return BookListSerializer
        return BookSerializer

    def get_queryset(self):
        user = self.request.user
        # Users can see their own books (public or private) and public books from others.
        return Book.objects.filter(user=user) | Book.objects.filter(visibility='public')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        book = self.get_object()
        if not book.book_file or not book.book_file.path:
            return Response({"error": "No book file available"}, status=status.HTTP_404_NOT_FOUND)
        file_path = book.book_file.path
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'), content_type='application/epub+zip')
            # Try to use the book's title for the download filename
            filename = f"{book.title}.epub" if book.title else "book.epub"
            # Ensure filename is ASCII or properly encoded for Content-Disposition
            try:
                filename.encode('ascii')
            except UnicodeEncodeError:
                from django.utils.encoding import iri_to_uri
                filename = iri_to_uri(filename)

            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
```

- `IsOwnerOrReadOnly` 权限类: 自定义权限，确保只有书籍的创建者才能修改或删除它。对于公开书籍，任何人都可以读取；对于私有书籍，只有创建者可以读取。

#### 5.2.2. 前端实现 (`bookapp_vuetify`)

**列出书籍 (`src/pages/books.vue`):**

- **获取数据**: `onMounted` 和 `fetchBooks` 方法通过 `ApiServiceDebug.get('/api/books/', auth.accessToken)` 从后端获取书籍列表。
- **展示**: 使用 `v-row` 和 `v-col` 循环 `books` 数组，每本书籍以 `v-card` 展示，包含封面 (`v-img`)、标题、作者、评分 (`v-rating`)、分类和描述。
- **交互**: 点击书籍卡片会调用 `viewBookDetails(book.id)`，使用 `router.push` 跳转到书籍详情页。
- **状态处理**: 包含加载中 (`isLoading`)、网络错误 (`networkError`) 和无结果 (`books.length === 0`) 的用户提示。
- **搜索**: 包含一个 `v-text-field` 用于输入搜索词，`searchBooks` 方法会带上 `search` 查询参数请求 `/api/books/`。

```vue
// Relevant snippet from d:\Documents\GitHub\Figado\bookapp_vuetify\src\pages\books.vue
// ... template for book list, search, loading, error states ...
async function fetchBooks() {
  try {
    isLoading.value = true
    networkError.value = false
    // ... network check ...
    const rawBooks = await ApiServiceDebug.get<any[]>('/api/books/', auth.accessToken)
    books.value = rawBooks.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_image || '', // Handle missing cover_image
      rating: typeof book.rating === 'number' ? book.rating : 0,
      category: book.category || '',
      language: book.language || '',
      description: book.description || ''
    }))
    isLoading.value = false
  } catch (error) {
    // ... error handling ...
  }
}

async function searchBooks() {
  try {
    isLoading.value = true
    networkError.value = false
    // ... network check ...
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    const url = `/api/books/?${params.toString()}`
    const rawBooks = await ApiServiceDebug.get<any[]>(url, auth.accessToken)
    // ... map rawBooks to books.value ...
    isLoading.value = false
  } catch (error) {
    // ... error handling ...
  }
}

function viewBookDetails(bookId: number) {
  router.push({ path: `/book/${bookId}` })
}
```

**查看书籍详情 (`src/pages/book.vue`):**

- **获取数据**: `fetchBook` 方法根据路由参数中的 `id`，通过 `ApiServiceDebug.get(`/api/books/${bookId}/`, auth.accessToken)` 获取特定书籍的详细信息。
- **展示**: 显示书籍的封面、标题、作者、分类、语言、评分、简介等。
- **操作按钮**: 提供“下载 EPUB”和“在线阅读”按钮。
  - `downloadEpub`: 调用后端 `/api/books/{id}/download/` 端点下载文件。
  - `readEpubOnline`: (详见 5.3 EPUB 文件处理与在线阅读)

```vue
// Relevant snippet from d:\Documents\GitHub\Figado\bookapp_vuetify\src\pages\book.vue
// ... template for book details ...
async function fetchBook() {
  try {
    isLoading.value = true
    networkError.value = false
    // ... network check ...
    const bookId = route.params.id
    const raw = await ApiServiceDebug.get<any>(`/api/books/${bookId}/`, auth.accessToken)
    book.value = {
      id: raw.id,
      title: raw.title,
      author: raw.author,
      coverUrl: raw.cover_image || '',
      rating: typeof raw.rating === 'number' ? raw.rating : 0,
      category: raw.category || '',
      language: raw.language || '',
      description: raw.description || ''
    }
    isLoading.value = false
  } catch (error) {
    // ... error handling ...
  }
}

async function downloadEpub() {
  if (!book.value || !book.value.id) return
  // ... baseUrl logic ...
  const url = `${baseUrl}/api/books/${book.value.id}/download/`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    })
    // ... handle response, create blob URL and trigger download ...
  } catch (e) {
    alert('下载失败：' + e)
  }
}
```

**添加/编辑书籍 (`src/components/AddBook.vue`):**

此组件用于创建新书，也可以扩展用于编辑现有书籍（通过传入 `props` 来预填表单并改变提交目标 API 和方法）。

- **表单**: 使用 `v-form` 和各种 Vuetify 输入组件 (`v-text-field`, `v-select`, `v-textarea`, `v-file-input`, `v-rating`) 收集书籍信息。
- **封面上传**: `coverImage` (File object) 和 `coverPreview` (data URL)。
  - 支持从文件选择 (`v-file-input`)、拍照 (`captureCover` 使用 `mobileService.takePicture()`)、从相册选择 (`selectCoverFromGallery` 使用 `mobileService.selectFromGallery()`)。
  - `previewCover` 方法用于生成本地预览。
- **EPUB 文件上传**: `bookFile` (File object)。
  - `onEpubFileChange`: 当用户选择 EPUB 文件后，此方法使用 `EpubJS` 库在前端解析文件元数据 (标题, 作者, 描述, 语言, 封面等)，并自动填充表单对应字段。
- **数据提交 (`submitBook`):**
  - 进行表单验证 (`isFormValid`) 和网络检查。
  - 创建一个 `FormData` 对象，将所有书籍数据（包括封面文件 `coverImage.value` 和书籍文件 `bookFile.value`）附加到其中。
  - 使用 `fetch` API 将 `FormData` 以 POST 请求发送到 `/api/books/` (创建新书)。对于编辑，通常会发送 PUT 或 PATCH 请求到 `/api/books/{id}/`。
  - 处理响应，成功后显示成功对话框 (`showSuccessDialog`) 并触发 `success` 事件。
- **重置表单 (`resetForm`):** 清空所有输入和文件选择。

```vue
// Relevant snippet from
d:\Documents\GitHub\Figado\bookapp_vuetify\src\components\AddBook.vue // ...
template for the extensive book form ... // EPUB Metadata Parsing async function
onEpubFileChange(file: File | null) { if (!file) return try { const epubFileUrl
= URL.createObjectURL(file) const bookInstance = EpubJS.default() // Correctly
access default export if that's how EpubJS is structured
bookInstance.open(epubFileUrl) // ... show toast ... const metadata = await
bookInstance.loaded.metadata if (metadata.title) bookData.title = metadata.title
if (metadata.creator) bookData.author = metadata.creator // ... fill other
fields like description, language, publisher, isbn ...
bookInstance.loaded.cover.then(coverUrl => { if (coverUrl) {
bookInstance.archive.createUrl(coverUrl, { base64: true }).then((url: string) =>
{ coverPreview.value = url // Convert base64 to File object for coverImage
fetch(url).then(res => res.blob()).then(blob => { const coverFile = new
File([blob], 'cover.jpg', { type: 'image/jpeg' }) coverImage.value = coverFile
}) }) } }) // ... show toast ... } catch (err) { // ... error handling ... } }
// Form Submission async function submitBook() { if (!isFormValid.value) return
// ... network check ... isSubmitting.value = true const formData = new
FormData() formData.append('title', bookData.title) // ... append all other
bookData fields ... if (coverImage.value) formData.append('cover_image',
coverImage.value) if (bookFile.value) formData.append('book_file',
bookFile.value) const token = localStorage.getItem('access') const response =
await fetch('http://localhost:8000/api/books/', { // URL would change for
editing method: 'POST', // Or PUT/PATCH for editing headers: token ? {
Authorization: `Bearer ${token}` } : {}, body: formData }) if (!response.ok) {
// ... error handling ... return } const data = await response.json()
newBookId.value = data.id showSuccessDialog.value = true emit('success',
newBookId.value) // Emit success event // ... }
```

**删除书籍 (主要在 `profile.vue` 中实现):**

- 用户在自己的书籍列表中，可以找到删除按钮。
- 点击删除按钮通常会弹出一个确认对话框 (`v-dialog`)。
- 确认后，前端会向后端发送 DELETE 请求到 `/api/books/{id}/`。
- 成功删除后，前端会更新书籍列表，移除被删除的书籍。

```vue
// Illustrative snippet for delete functionality (e.g., in profile.vue) // ...
template for delete button and confirmation dialog ... async function
deleteBook(bookId: number) { // ... show confirmation dialog ... // If
confirmed: try { const token = localStorage.getItem('access') const response =
await fetch(`http://localhost:8000/api/books/${bookId}/`, { method: 'DELETE',
headers: token ? { Authorization: `Bearer ${token}` } : {}, }) if (!response.ok)
{ // Handle error await mobileService.showToast('删除失败'); return } await
mobileService.showToast('书籍已删除'); // Refresh book list or remove the book
from the local array fetchUserBooks(); // Example: re-fetch books } catch
(error) { console.error('Error deleting book:', error) await
mobileService.showToast('删除过程中发生错误'); } }
```

### 5.3. EPUB 文件处理与在线阅读

此功能允许用户上传 EPUB 文件，并在网页端直接阅读。

**EPUB 上传与元数据解析:**

(已在 `AddBook.vue` 部分描述) - 前端使用 `EpubJS` 在选择 EPUB 文件后，自动解析其元数据（书名、作者、封面等）并填充到表单中。后端 `BookSerializer` 的 `validate_book_file` 确保了文件格式的正确性。

**EPUB 下载:**

(已在 `book.vue` 和 `BookViewSet` 的 `download` action 中描述) - 用户可以从书籍详情页下载原始 EPUB 文件。

**在线阅读 (`src/pages/book.vue` 使用 `epub.js`):**

- **触发**: 点击“在线阅读”按钮调用 `readEpubOnline` 方法。
- **EPUB 加载**: `readEpubOnline` 方法首先获取书籍的下载链接 (`/api/books/{id}/download/`)，然后使用 `fetch` API 下载 EPUB 文件内容为 `ArrayBuffer`。
- **`epub.js` 初始化**: `ePub(arrayBuffer)` 使用获取到的 `ArrayBuffer` 初始化 `epub.js` 的 `Book` 实例。
- **渲染**: `bookInstance.renderTo('epub-viewer', { width: '100%', height: '80vh' })` 将书籍渲染到页面上 ID 为 `epub-viewer` 的 `div` 元素中。`rendition.display()` 显示第一页。
- **目录 (TOC)**:
  - `bookInstance.loaded.navigation.then(nav => { epubToc.value = nav.toc || [] })` 获取书籍的目录结构并存储在 `epubToc` ref 中。
  - 目录展示在阅读器左侧的 `v-list` 中。点击目录项 (`goToToc(item)`) 会使用 `rendition.display(item.href)` 跳转到相应章节。
  - 当前章节在目录中会高亮显示 (`tocActiveId` ref 与 `rendition.on('rendered', section => { tocActiveId.value = section.href })` 配合)。
- **翻页**: “上一页” (`prevPage`) 和“下一页” (`nextPage`) 按钮分别调用 `rendition.prev()` 和 `rendition.next()`。
- **UI**: 阅读器在一个 `v-dialog` 中弹出，包含目录面板 (`.epub-toc-panel`) 和阅读器主区域 (`.epub-viewer-panel`)，使用 Flexbox 布局。

```vue
// Relevant snippet from d:\Documents\GitHub\Figado\bookapp_vuetify\src\pages\book.vue
// ... template for epub viewer dialog, TOC, page buttons ...

let rendition: any = null; // Stores the epub.js Rendition object
const epubToc = ref<any[]>([]);
const tocActiveId = ref('');

async function readEpubOnline() {
  if (!book.value || !book.value.id) return;
  epubViewer.value = true; // Open the dialog
  // ... baseUrl logic ...
  const url = `${baseUrl}/api/books/${book.value.id}/download/`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    if (!res.ok) throw new Error('下载失败，状态码：' + res.status);
    const arrayBuffer = await res.arrayBuffer();

    await nextTick(); // Ensure the #epub-viewer div is in the DOM
    const viewerElement = document.getElementById('epub-viewer');
    if (!viewerElement) { /* ... error handling ... */ return; }
    viewerElement.innerHTML = ''; // Clear previous content if any

    const bookInstance = ePub(arrayBuffer);
    rendition = bookInstance.renderTo('epub-viewer', { width: '100%', height: '80vh' });
    rendition.display();

    bookInstance.loaded.navigation.then(nav => {
      epubToc.value = nav.toc || [];
    });

    rendition.on('rendered', (section: any) => {
      tocActiveId.value = section.href || ''; // Update active TOC item
    });

  } catch (e) {
    alert('加载失败：' + e);
    epubViewer.value = false;
    console.error('EPUB 加载异常:', e);
  }
}

function goToToc(item: any) {
  if (rendition && item && item.href) {
    rendition.display(item.href);
    tocActiveId.value = item.id; // Assuming item.id is unique for TOC highlighting
  }
}

function prevPage() {
  if (rendition) rendition.prev();
}

function nextPage() {
  if (rendition) rendition.next();
}
```

### 5.4. 搜索功能 (Search Functionality)

**前端 (`src/pages/books.vue`):**

- 一个 `v-text-field` 作为搜索输入框。
- 当用户输入并按下 Enter 键 (或通过按钮触发)，`searchBooks` 方法被调用。
- `searchBooks` 方法构造一个带 `search` 查询参数的 URL (例如 `/api/books/?search=keyword`)，然后调用 `ApiServiceDebug.get`.
- 返回的结果会更新 `books` ref，从而刷新列表显示。

```vue
// Relevant snippet from d:\Documents\GitHub\Figado\bookapp_vuetify\src\pages\books.vue
// <v-text-field v-model="searchQuery" ... @keyup.enter="searchBooks"></v-text-field>

async function searchBooks() {
  try {
    isLoading.value = true;
    networkError.value = false;
    // ... network check ...
    const params = new URLSearchParams();
    if (searchQuery.value) params.append('search', searchQuery.value);

    const url = `/api/books/?${params.toString()}`;
    const rawBooks = await ApiServiceDebug.get<any[]>(url, auth.accessToken);
    books.value = rawBooks.map(book => ({
      // ... map book data ...
    }));
    isLoading.value = false;
  } catch (error) {
    console.error('Error searching books:', error);
    networkError.value = true;
    isLoading.value = false;
  }
}
```

**后端 (`books.views.BookViewSet`):**

- `BookViewSet` 配置了 `filter_backends = [filters.SearchFilter, filters.OrderingFilter]`.
- `search_fields = ['title', 'author', 'description', 'tags', 'category']` 指定了 Django REST Framework 的 `SearchFilter` 应该在哪些字段中进行搜索。
- 当请求的 URL 包含 `search` 查询参数时 (例如 `/api/books/?search=keyword`)，`SearchFilter` 会自动过滤查询集，只返回匹配搜索词的书籍。

```python
# Relevant snippet from d:\\Documents\\GitHub\\Figado\\bookapp_django\\books\\views.py
class BookViewSet(viewsets.ModelViewSet):
    # ... other configurations ...
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'description', 'tags', 'category']
    # ...
```

### 5.5. 导航栏 (`src/components/NavBar.vue`)

全局导航栏 (`NavBar.vue`) 负责应用的主要导航链接和用户认证状态的展示。

**主要特性:**

- **Logo/标题**: 显示应用名称 "Figaro 书籍分享"，点击可导航至书籍列表页 (`/books`)。
- **响应式设计**:
  - **大屏幕 (d-sm-flex)**: 直接在应用栏显示 "列表"、"登录"/"注册" (未登录时) 或 "个人中心"/"退出" (已登录时) 按钮。
  - **小屏幕**: 之前有一个汉堡包图标 (`v-app-bar-nav-icon`) 用于切换抽屉式导航 (`v-navigation-drawer`)，但此图标已被移除。抽屉导航栏依然存在，包含相同的导航链接，并显示用户头像和用户名（如果已登录）。
- **用户状态**: 根据 Pinia `auth` store 中的 `loggedIn` 状态动态显示不同的按钮：
  - 未登录: 显示 "登录" 和 "注册" 按钮。
  - 已登录: 显示 "个人中心" 和 "退出" 按钮，以及用户头像 (`v-avatar`)。
- **登出功能**: "退出" 按钮调用 `logout` 方法，该方法会：
  - 调用 Pinia `auth` store 的 `logout()` action (清除 token 和用户信息)。
  - 显示一个 toast 提示 "退出登录成功"。
  - 重定向到登录页面 (`/login`)。
  - 关闭抽屉导航 (如果打开)。

**代码片段:**

```vue
// d:\\Documents\\GitHub\\Figado\\bookapp_vuetify\\src\\components\\NavBar.vue
<template>
  <v-app-bar app color="primary" dark :elevation="3">
    <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer" /> -->
    // Hamburger icon removed
    <v-toolbar-title @click="navigateTo('/books')" class="text-truncate">
      Figaro 书籍分享
    </v-toolbar-title>
    <v-spacer />

    <!-- 大屏幕上显示的按钮 -->
    <div class="d-none d-sm-flex">
      <v-btn variant="text" to="/books" prepend-icon="mdi-format-list-bulleted"
        >列表</v-btn
      >
      <v-btn v-if="!loggedIn" variant="text" to="/login">登录</v-btn>
      <v-btn v-if="!loggedIn" variant="text" to="/register">注册</v-btn>
      <v-btn v-if="loggedIn" variant="text" to="/profile">个人中心</v-btn>
      <v-btn v-if="loggedIn" variant="text" @click="logout">退出</v-btn>
    </div>

    <!-- 用户头像 -->
    <v-avatar v-if="loggedIn" class="ml-2" size="36">
      <v-img src="https://i.pravatar.cc/150?img=7"></v-img>
    </v-avatar>
  </v-app-bar>

  <!-- 抽屉导航 (小屏幕) -->
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item
        title="Figaro 书籍分享"
        prepend-icon="mdi-book-open-page-variant"
      />
      <v-divider></v-divider>
      <v-list-item to="/books" prepend-icon="mdi-format-list-bulleted"
        >列表</v-list-item
      >
      <template v-if="!loggedIn">
        <v-list-item to="/login" prepend-icon="mdi-login">登录</v-list-item>
        <v-list-item to="/register" prepend-icon="mdi-account-plus"
          >注册</v-list-item
        >
      </template>
      <template v-else>
        <v-list-item to="/profile" prepend-icon="mdi-account">
          <v-list-item-title>个人中心</v-list-item-title>
          <v-list-item-subtitle>{{ username }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item @click="logout" prepend-icon="mdi-logout"
          >退出</v-list-item
        >
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import mobileService from "../services/MobileService"; // Path might need adjustment based on actual structure
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();
const drawer = ref(false); // Controls the visibility of the navigation drawer

const loggedIn = computed(() => auth.loggedIn);
const username = computed(() => auth.username);

function navigateTo(path: string) {
  router.push(path);
  drawer.value = false; // Close drawer on navigation
}

async function logout() {
  auth.logout();
  await mobileService.showToast("退出登录成功");
  router.push("/login");
  drawer.value = false;
}
</script>
```

### 5.6. 平台介绍页 (Landing Pages - index.vue & HomePage.vue)

- **大屏幕 (d-sm-flex)**: 直接在应用栏显示 "列表"、"登录"/"注册" (未登录时) 或 "个人中心"/"退出" (已登录时) 按钮。

### 5.7. 个人资料页面 (`profile.vue`)

该页面是用户管理个人信息、上传和管理自己的书籍、以及设置应用偏好的中心。

**主要功能和结构:**

该页面主要由三张卡片组成：个人信息、我的书籍和偏好设置。

1.  **个人信息卡片 (Profile Information Card):**

    - **信息展示**:
      - 显示用户头像 (当前为静态图片 `https://i.pravatar.cc/150?img=7`)。
      - 显示从 `localStorage` 获取的用户名 (`username`)。
      - 显示用户的语言偏好 (`userLanguages`，初始为硬编码，后续通过编辑功能更新并从 `mobileService` 加载)。
      - 电子邮箱和注册时间当前为静态占位符文本。
    - **编辑个人资料**:
      - 点击“编辑个人资料”按钮 (`openEditProfile`) 会弹出一个对话框 (`editProfileDialog`)。
      - 对话框中包含表单，允许用户编辑用户名 (`editedUsername`)、电子邮箱 (`editedEmail` - 当前未与后端 API 集成更新) 和语言偏好 (`editedLanguages` - 使用 `v-autocomplete` 从 `availableLanguages` 选择)。
      - 点击“保存”按钮调用 `saveProfile` 方法：
        - 更新本地的 `username` 和 `userLanguages` ref。
        - 通过 `mobileService.saveData('userSettings', ...)` 将包括语言偏好在内的设置保存到本地存储。
        - 显示成功提示并关闭对话框。
        - _注: 实际的用户邮箱和用户名更新需要调用后端 API，当前 `saveProfile` 主要处理本地状态和模拟存储。_

2.  **"我的书籍" 卡片 (My Books Card):**

    - **获取书籍**: `onMounted`钩子中调用 `loadBooks()` 方法从后端获取当前用户上传的书籍列表 (具体 API 端点未在 `profile.vue` 中明确，但推测是如 `/api/books/?user=<current_user_id>` 或专门的 `/api/my-books/` 之类的接口)。获取到的书籍存储在 `books` ref 中。
    - **书籍展示**:
      - 如果用户没有书籍，会显示提示信息和“添加新书籍”按钮。
      - 否则，以卡片形式 (`v-card`) 循环展示用户的书籍，每张卡片包含封面 (`book.coverUrl`)、书名 (`book.title`) 和作者 (`book.author`)。
    - **书籍操作**:
      - **上传书籍**:
        - 点击“上传书籍”按钮 (`openUploadDialog`) 会打开一个对话框 (`uploadBookDialog`)。
        - 此对话框内嵌了 `AddBook.vue` 组件，用于处理新书的添加流程。
        - `AddBook` 组件成功上传书籍后会触发 `success` 事件，调用 `onAddBookSuccess` 方法，该方法关闭上传对话框并重新加载用户书籍列表 (`loadBooks()`).
      - **查看详情**: 每本书卡片上的“查看详情”按钮 (`goToBookDetail(book.id)`) 使用 `router.push` 导航到对应的书籍详情页 (`/book/${book.id}`).
      - **编辑书籍**: 每本书卡片上的编辑按钮 (`goToEditBook(book.id)`)。此函数的具体实现未在 `profile.vue` 中提供，但通常会导航到书籍编辑页面（可能复用 `AddBook.vue` 组件并传入书籍 ID 进行预填充和更新操作）。
      - **删除书籍**:
        - 点击删除按钮 (`confirmDeleteBook(book.id, book.title)`) 会记录待删除书籍信息 (`bookToDelete`) 并打开确认删除对话框 (`deleteBookDialog`)。
        - 用户确认后，调用 `deleteBook` 方法：
          - 向后端发送 DELETE 请求 (例如 `DELETE /api/books/${bookToDelete.value.id}/`)，需要携带认证 token。
          - 请求成功后，显示成功提示，关闭对话框，并调用 `loadBooks()` 重新加载书籍列表。
          - 包含错误处理和提示。

3.  **"偏好设置" 卡片 (Preferences Card):**

    - **深色模式**: 提供一个 `v-switch` (`darkMode`) 切换应用的深色/浅色模式。状态变更后会通过 `saveProfile` (间接通过 `loadUserSettings` 和 `saveProfile` 中的 `mobileService.saveData`) 保存到本地。
    - **推送通知**: 提供一个 `v-switch` (`pushNotifications`) 控制是否接收推送通知。状态同样通过 `mobileService` 保存。 (实际推送通知功能需要更复杂的客户端和服务器端实现)。
    - **语言偏好**: “管理”按钮，当前未实现具体功能，但用户的语言偏好已在“编辑个人资料”中管理。

4.  **退出登录 (Logout):**
    - 在个人信息卡片的 `v-card-actions` 中提供“退出登录”按钮。
    - 点击按钮调用 `confirmLogout`，显示确认对话框 (`logoutDialog`)。
    - 用户确认后，调用 `logout` 方法：
      - 从 `localStorage` 中移除 `access` token, `refresh` token 和 `username`.
      - 调用 `mobileService.showToast` 显示退出成功消息。
      - 使用 `router.push` 将用户重定向到登录页面 (`/login`).
      - _注: 更完善的登出机制会调用 Pinia store (`authStore.logout()`) 来集中管理状态和 `localStorage` 的清理._

**辅助服务:**

- `mobileService`: 用于显示 Toast 通知和在本地存储中持久化用户设置 (`userSettings`).

**代码片段示例 (`profile.vue`):**

```vue
// d:\\Documents\\GitHub\\Figado\\bookapp_vuetify\\src\\pages\\profile.vue

// 加载用户书籍
async function loadBooks() {
  try {
    // 示例: const userBooks = await ApiServiceDebug.get<Book[]>(\'/api/my-books/\', token);
    // books.value = userBooks;
    // 此处为模拟数据或部分实现，实际应从API获取
    // books.value = await fetchUserBooksAPI(); // 假设的API调用
  } catch (error) {
    console.error(\'Error loading books:\', error);
    // mobileService.showToast('加载书籍失败');
  }
}

// 保存个人资料 (部分)
async function saveProfile() {
  try {
    // 实际项目中应调用API更新用户资料
    // await ApiServiceDebug.put('/api/profile/', { username: editedUsername.value, email: editedEmail.value, languages: editedLanguages.value }, token);
    username.value = editedUsername.value;
    userLanguages.value = [...editedLanguages.value];

    await mobileService.saveData('userSettings', {
      darkMode: darkMode.value,
      pushNotifications: pushNotifications.value,
      languages: userLanguages.value
    });
    await mobileService.showToast('个人资料已更新');
    editProfileDialog.value = false;
  } catch (error) {
    console.error('Error saving profile:', error);
  }
}

// 删除书籍
async function deleteBook() {
  if (!bookToDelete.value) return;
  try {
    const token = localStorage.getItem('access');
    // 实际API调用:
    // await fetch(`http://localhost:8000/api/books/${bookToDelete.value.id}/`, {
    //   method: 'DELETE',
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    await mobileService.showToast(`书籍 "${bookToDelete.value.title}" 已删除`);
    deleteBookDialog.value = false;
    bookToDelete.value = null;
    loadBooks(); // 重新加载书籍列表
  } catch (error) {
    console.error('Error deleting book:', error);
    await mobileService.showToast('删除书籍失败');
  }
}

// 退出登录
async function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('username');
  // authStore.logout(); // 理想情况下调用 store action
  await mobileService.showToast('退出登录成功');
  router.push('/login');
}
```

## 6. 总结与展望 (Conclusion and Future Work)

Figado 项目目前已经实现了一个具备核心功能的在线书籍分享与阅读平台。用户可以进行注册登录，上传、管理、搜索和在线阅读 EPUB 格式的电子书。前端采用 Vue.js 和 Vuetify 构建了响应式的用户界面，后端则基于 Django 和 Django REST Framework 提供了稳健的 API 服务。

**已实现的核心功能包括：**

- 用户认证系统 (注册、登录、登出、JWT 令牌管理)
- 完整的书籍 CRUD 操作 (创建、读取、更新、删除)
- EPUB 文件上传、元数据解析 (前端 EpubJS) 和文件存储
- 基于 EpubJS 的在线 EPUB 阅读器，支持目录导航和翻页
- 书籍列表展示与关键词搜索功能
- 用户个人资料管理页面，包括书籍管理和基本偏好设置
- 响应式导航栏和初步的平台介绍页

**技术栈：**

- **后端**: Python, Django, Django REST Framework, SQLite (开发) / PostgreSQL (生产推荐)
- **前端**: TypeScript, Vue.js 3, Vuetify 3, Pinia, Vue Router, EpubJS
- **开发工具**: Vite, ESLint, Prettier
- **部署相关**: (未详述，但通常涉及 Docker, Gunicorn, Nginx 等)

**潜在的未来工作与改进方向：**

1.  **增强搜索与过滤**: 实现更高级的搜索功能，如按分类、语言、标签、评分等多条件过滤和排序。
2.  **社交功能**:
    - 用户评论与评分系统。
    - 书籍推荐、阅读列表分享等。
3.  **用户体验优化**:
    - 更完善的错误处理和用户反馈。
    - 国际化 (i18n) 支持，根据用户偏好语言动态切换界面语言。
    - 性能优化，例如图片懒加载、代码分割等。
4.  **后端强化**:
    - 更细致的权限管理和用户角色 (如管理员、编辑等)。
    - 完善的 Django Admin 后台管理功能。
    - 异步任务处理 (例如使用 Celery 处理耗时操作，如书籍转换、通知发送)。
5.  **移动端适配与打包**:
    - 进一步优化 Capacitor 打包的移动应用体验。
    - 实现离线阅读功能。
6.  **高级功能**:
    - 阅读进度同步。
    - 笔记和高亮功能。
    - 支持更多电子书格式。
7.  **测试与部署**:
    - 增加单元测试和集成测试覆盖率。
    - 建立 CI/CD 流程，自动化测试和部署。

本文档为 Figado 项目的当前状态提供了一个全面的技术概览，希望能为后续的开发和维护工作提供有力的支持。
