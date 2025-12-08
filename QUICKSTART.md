# 宠物世界 (Pet World) - 快速启动指南

## 已完成的功能

###  后端 API (100% 完成)

1. **用户认证系统**
   - 用户注册/登录
   - JWT Token 认证
   - 个人资料管理
   - 密码修改

2. **宠物收养模块**
   - 发布待收养宠物
   - 浏览收养列表
   - 申请收养
   - 查看我的申请

3. **宠物用品商城**
   - 商品列表和搜索
   - 购物车管理
   - 订单创建
   - 订单查询

4. **社交分享模块**
   - 发布宠物动态
   - 点赞和评论
   - 浏览动态流
   - 用户互动

## 快速启动

### 1. 初始化数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本（会自动创建数据库和所有表，并插入示例数据）
source C:/Users/as/pet-management-system/database/init.sql
```

### 2. 启动后端服务

```bash
cd C:/Users/as/pet-management-system/backend
npm start
```

后端将运行在 `http://localhost:3000`

访问 `http://localhost:3000` 可以看到完整的 API 文档。

### 3. 测试 API

#### 注册新用户
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"123456\",\"nickname\":\"测试用户\"}"
```

#### 登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"123456\"}"
```

返回的 `token` 需要在后续请求中使用。

#### 获取收养列表
```bash
curl http://localhost:3000/api/adoptions
```

#### 获取商品列表
```bash
curl http://localhost:3000/api/products
```

#### 获取社交动态
```bash
curl http://localhost:3000/api/posts
```

### 4. 使用 Token 访问需要认证的接口

```bash
# 将 YOUR_TOKEN 替换为登录后返回的 token
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API 端点一览

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息（需登录）
- `PUT /api/auth/profile` - 更新个人资料（需登录）
- `POST /api/auth/change-password` - 修改密码（需登录）

### 收养相关
- `GET /api/adoptions` - 获取所有待收养宠物
- `GET /api/adoptions/:id` - 获取收养详情
- `POST /api/adoptions` - 发布待收养宠物（需登录）
- `POST /api/adoptions/:id/apply` - 申请收养（需登录）
- `GET /api/my-applications` - 我的收养申请（需登录）

### 商城相关
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `GET /api/cart` - 获取购物车（需登录）
- `POST /api/cart` - 添加到购物车（需登录）
- `PUT /api/cart/:id` - 更新购物车商品（需登录）
- `DELETE /api/cart/:id` - 删除购物车商品（需登录）
- `POST /api/orders` - 创建订单（需登录）
- `GET /api/my-orders` - 我的订单（需登录）

### 社交相关
- `GET /api/posts` - 获取所有动态
- `GET /api/posts/:id` - 获取动态详情
- `GET /api/users/:userId/posts` - 获取用户的动态
- `POST /api/posts` - 发布动态（需登录）
- `DELETE /api/posts/:id` - 删除动态（需登录）
- `POST /api/posts/:id/like` - 点赞/取消点赞（需登录）
- `POST /api/posts/:id/comments` - 添加评论（需登录）

### 宠物管理
- `GET /api/pets` - 获取所有宠物
- `GET /api/pets/:id` - 获取宠物详情
- `POST /api/pets` - 添加宠物（需登录）
- `PUT /api/pets/:id` - 更新宠物信息（需登录）
- `DELETE /api/pets/:id` - 删除宠物（需登录）

## 数据库账户

示例数据中包含以下测试账户：

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 系统管理员账户 |
| user1 | user123 | 用户 | 普通用户 |
| user2 | user123 | 用户 | 普通用户 |

注意：密码在数据库中已加密存储，实际使用时需要通过注册接口创建新用户，或修改 init.sql 中的密码哈希值。

## 下一步

前端开发正在进行中，将包括：
- 使用 Ant Design 的美观界面
- 完整的用户认证流程
- 收养宠物展示和申请
- 商城购物功能
- 社交动态分享

继续等待前端完成，或者您可以使用 Postman 等工具测试现有的 API。
