# MiniBlog 前后端集成指南

## 项目结构

```
Ublog/
├── web/              # React 前端项目
├── cmd/              # Go 后端项目
├── api/              # API 定义
├── configs/          # 配置文件
└── ...
```

## 启动后端

确保你有一个运行中的 Go 后端服务。如果还没有，请按以下步骤启动：

```bash
# 在项目根目录下
cd D:\Myproject\Ublog

# 编译后端项目
make build BINS=mb-apiserver

# 启动后端服务
_output/platforms/windows/amd64/mb-apiserver
```

后端默认运行在 `http://localhost:5555`

## 启动前端

```bash
# 进入前端目录
cd web

# 安装依赖（如果还没有安装）
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 `http://localhost:5173`

## 首次使用

1. 打开浏览器访问 `http://localhost:5173`
2. 点击 "Register" 创建新用户
3. 填写用户信息（用户名和密码必填）
4. 注册成功后会自动登录
5. 开始创建博客文章！

## 功能说明

### 认证功能
- 用户注册
- 用户登录
- JWT Token 自动管理
- 登出功能

### 博客管理
- 创建文章
- 查看文章列表（支持分页和搜索）
- 查看文章详情
- 编辑文章
- 删除文章

### 用户管理
- 查看个人资料
- 更新个人信息（昵称、邮箱、电话）
- 查看文章统计

## API 端点说明

### 认证
- `POST /login` - 用户登录
- `POST /v1/users` - 用户注册
- `PUT /refresh-token` - 刷新令牌

### 文章
- `GET /v1/posts` - 获取文章列表
- `GET /v1/posts/{postID}` - 获取文章详情
- `POST /v1/posts` - 创建文章
- `PUT /v1/posts/{postID}` - 更新文章
- `DELETE /v1/posts` - 删除文章

### 用户
- `GET /v1/users/{userID}` - 获取用户信息
- `PUT /v1/users/{userID}` - 更新用户信息
- `PUT /v1/users/{userID}/change-password` - 修改密码

## 环境变量

前端项目中的 `.env` 文件配置：

```
VITE_API_BASE_URL=http://localhost:5555
```

如果你的后端运行在不同端口或地址，请修改此配置。

## 生产构建

构建生产版本：

```bash
cd web
npm run build
```

构建产物在 `dist` 目录中，可以部署到任何静态文件服务器。

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

### 后端
- Go 1.23+
- Gin Web Framework
- GORM
- JWT
- Casbin

## 故障排除

### 1. 无法连接到后端
- 检查后端是否正在运行
- 检查 `.env` 文件中的 `VITE_API_BASE_URL` 配置是否正确
- 查看浏览器控制台的网络请求

### 2. 登录后立即登出
- 检查 JWT Token 是否正确存储
- 查看后端日志确认 Token 验证是否成功

### 3. 无法创建或编辑文章
- 确认用户已正确登录
- 检查后端是否有足够的权限

## 注意事项

- 确保后端和前端都在运行
- 后端默认端口 5555，前端默认端口 5173
- Token 存储在浏览器的 localStorage 中
- 前端会自动在请求头中添加 Bearer Token
