# API 文档

## 认证接口

### 用户注册

- **URL**: `/api/auth/register/`
- **方法**: `POST`
- **认证**: 无需认证
- **请求体**:
  ```json
  {
    "username": "alice",
    "email": "alice@example.com",
    "password": "secretpassword",
    "languages": ["cn", "en"]
  }
  ```
- **成功响应**: `201 Created`
  ```json
  {
    "username": "alice",
    "email": "alice@example.com"
  }
  ```
- **错误响应**: `400 Bad Request`

### 用户登录

- **URL**: `/api/auth/login/`
- **方法**: `POST`
- **认证**: 无需认证
- **请求体**:
  ```json
  {
    "username": "alice",
    "password": "secretpassword"
  }
  ```
- **成功响应**: `200 OK`
  ```json
  {
    "refresh": "<refresh_token>",
    "access": "<access_token>"
  }
  ```
- **错误响应**: `401 Unauthorized`

### 刷新令牌

- **URL**: `/api/auth/token/refresh/`
- **方法**: `POST`
- **认证**: 无需认证
- **请求体**:
  ```json
  {
    "refresh": "<refresh_token>"
  }
  ```
- **成功响应**: `200 OK`
  ```json
  {
    "access": "<new_access_token>"
  }
  ```
- **错误响应**: `401 Unauthorized`

### 获取用户资料

- **URL**: `/api/auth/profile/`
- **方法**: `GET`
- **认证**: 需要 JWT 认证
- **请求头**:
  ```
  Authorization: Bearer <access_token>
  ```
- **成功响应**: `200 OK`
  ```json
  {
    "username": "alice",
    "email": "alice@example.com",
    "languages": ["cn", "en"]
  }
  ```
- **错误响应**: `401 Unauthorized`

## 接口调用示例

### 使用 axios 调用

```javascript
// 登录示例
async function login(username, password) {
  try {
    const response = await axios.post("http://localhost:8000/api/auth/login/", {
      username,
      password,
    });

    // 保存 token
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);

    return response.data;
  } catch (error) {
    console.error("登录失败:", error);
    throw error;
  }
}

// 获取个人资料示例
async function getProfile() {
  try {
    const token = localStorage.getItem("access");

    const response = await axios.get(
      "http://localhost:8000/api/auth/profile/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    // 如果是 401 错误，可能需要刷新令牌
    if (error.response && error.response.status === 401) {
      await refreshToken();
      // 重试获取个人资料
      return getProfile();
    }
    console.error("获取资料失败:", error);
    throw error;
  }
}
```
