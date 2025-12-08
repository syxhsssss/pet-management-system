# 🐾 宠物管理系统 (Pet Management System)

一个集宠物收养、电商购物、社交互动于一体的综合性宠物管理平台。

## 📋 项目简介

**宠物世界（Pet World）** 是一个基于 React + Express + MySQL 的全栈 Web 应用，提供：
- 🏠 **宠物收养平台**：帮助流浪动物找到温暖的家
- 🛒 **宠物电商**：一站式宠物用品购物体验
- 💬 **社交社区**：宠物爱好者交流分享平台
- 🔧 **管理后台**：完善的后台管理系统

## 🚀 技术栈

### 前端
- React 18.x
- React Router 6.x
- Axios
- Ant Design 5.x

### 后端
- Node.js 16.x+
- Express 4.18.x
- MySQL 8.0.x
- JWT 认证
- Bcrypt.js 密码加密
- Multer 文件上传

## 📦 快速开始

### 环境要求
- Node.js 16.x+
- MySQL 8.0+
- npm 或 yarn

### 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 配置数据库

1. 创建数据库：
```sql
CREATE DATABASE pet_management CHARACTER SET utf8mb4;
```

2. 配置环境变量（复制 .env.example 为 .env）：
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=pet_management
JWT_SECRET=你的密钥
PORT=3001
```

3. 初始化数据：
```bash
cd backend
node createAdmin.js              # 创建管理员
node createUsersAndPosts.js      # 创建测试数据
node addSampleData.js            # 创建收养数据
```

### 启动项目

#### 后端
```bash
cd backend
npm start
# 访问：http://localhost:3001
```

#### 前端
```bash
cd frontend
npm start
# 访问：http://localhost:3000 或 3002
```

## 🎯 核心功能

### 用户端功能
- 🐾 **宠物收养**：浏览待收养宠物、在线申请收养
- 🛍️ **宠物商城**：浏览商品、购物车、在线下单
- 💬 **社交广场**：发布帖子、点赞评论、标签分类
- 👤 **个人中心**：管理订单、查看申请状态

### 管理后台功能
- 📊 **数据概览**：系统数据统计、热门标签排行
- 👥 **用户管理**：用户列表、状态管理、角色管理
- 📝 **内容管理**：帖子审核、删除不当内容
- 🏠 **收养管理**：新增/编辑/删除收养信息、审核申请
- 🛒 **商品管理**：新增/编辑/删除商品、库存管理
- 📦 **订单管理**：订单列表、状态更新

## 🔑 默认账号

### 管理后台
- 地址：http://localhost:3001/admin
- 用户名：admin
- 密码：admin123

## 📂 项目结构

```
pet-management-system/
├── backend/              # 后端项目
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── middleware/      # 中间件
│   ├── routes/          # 路由
│   ├── public/images/   # 图片存储
│   └── server.js        # 主服务器文件
├── frontend/            # 前端项目
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   └── services/    # API服务
│   └── public/          # 静态资源
└── 文档/                # 项目文档
```

## 💡 技术亮点

1. **前后端完全分离**：React 独立开发 + Express RESTful API
2. **单文件管理后台**：1300+行嵌入式管理界面，无需额外前端项目
3. **智能图片处理**：支持多种URL格式自动解析，防止双重编码
4. **JWT认证**：Token自动过期检测，角色权限控制
5. **完整CRUD操作**：所有核心功能支持增删改查
6. **实时数据同步**：前后端共享数据库，管理员修改立即生效

## 📊 项目数据

- 代码量：8500+ 行
- 功能模块：46 个
- API接口：57 个
- 数据库表：10 张

## 📖 文档

- [项目汇报文档](./项目汇报文档.md) - 完整的技术文档
- [使用说明](./使用说明.md) - 详细的使用手册
- [PPT大纲](./PPT大纲.md) - 项目汇报PPT制作指南
- [项目结构说明](./项目结构说明.md) - 文件结构和说明

## 🛠️ 常见问题

### Q: 管理后台看不到数据？
A: 点击右上角"清除缓存"按钮，或按 Ctrl+Shift+R 强制刷新

### Q: Token无效？
A: Token有效期7天，过期需重新登录

### Q: 图片加载慢？
A: 使用本地图片 `http://localhost:3001/images/xxx.jpg`

更多问题请查看 [使用说明.md](./使用说明.md)

## 📝 开发计划

- [ ] 在线支付集成
- [ ] 实时聊天系统
- [ ] 地图定位功能
- [ ] Redis缓存
- [ ] Docker容器化

## 📄 License

MIT

## 👨‍💻 作者

项目团队

---

**项目版本**：v1.0
**更新日期**：2025-12-08
