const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// 导入所有路由
const petRoutes = require('./routes/petRoutes');
const authRoutes = require('./routes/authRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');
const shopRoutes = require('./routes/shopRoutes');
const socialRoutes = require('./routes/socialRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 添加请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 静态文件服务（用于测试）
app.use('/test', express.static(__dirname));

// 提供图片静态文件服务
const path = require('path');
const multer = require('multer');
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/images'));
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'upload-' + uniqueSuffix + ext);
  }
});

// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (jpg, jpeg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制5MB
  fileFilter: fileFilter
});

// ==================== 管理后台专用API ====================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/database');

// 管理后台登录API
app.post('/admin/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('管理后台登录请求:', username);

    if (!username || !password) {
      return res.json({
        success: false,
        message: '请提供用户名和密码'
      });
    }

    // 查找用户
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 检查是否是管理员
    if (user.role !== 'admin') {
      return res.json({
        success: false,
        message: '需要管理员权限'
      });
    }

    // 生成token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'pet_management_secret_key_2024',
      { expiresIn: '7d' }
    );

    console.log('登录成功:', user.username);
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.json({
      success: false,
      message: '登录失败: ' + error.message
    });
  }
});

// 验证token中间件
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.json({ success: false, message: '未提供token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pet_management_secret_key_2024');
    if (decoded.role !== 'admin') {
      return res.json({ success: false, message: '需要管理员权限' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.json({ success: false, message: 'token无效' });
  }
};

// 获取统计数据
app.get('/admin/api/statistics', verifyAdminToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT COUNT(*) as total_users, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active_users FROM users');
    const [pets] = await db.query('SELECT COUNT(*) as total_pets FROM pets');
    const [posts] = await db.query('SELECT COUNT(*) as total_posts FROM posts');
    const [adoptions] = await db.query('SELECT COUNT(*) as total_adoptions, SUM(CASE WHEN status = "available" THEN 1 ELSE 0 END) as available_count FROM adoptions');
    const [products] = await db.query('SELECT COUNT(*) as total_products, SUM(sales) as total_sales FROM products');
    const [orders] = await db.query('SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue FROM orders WHERE status != "cancelled"');
    const [tags] = await db.query('SELECT * FROM tags ORDER BY use_count DESC LIMIT 10');

    res.json({
      success: true,
      data: {
        users: users[0],
        pets: pets[0],
        posts: posts[0],
        adoptions: adoptions[0],
        products: products[0],
        orders: orders[0],
        popularTags: tags
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.json({ success: false, message: error.message });
  }
});

// 获取所有用户
app.get('/admin/api/users', verifyAdminToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, nickname, role, status, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, data: users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 更新用户状态
app.put('/admin/api/users/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 删除用户
app.delete('/admin/api/users/:id', verifyAdminToken, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 获取所有帖子
app.get('/admin/api/posts', verifyAdminToken, async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.*, u.username, u.nickname,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 删除帖子
app.delete('/admin/api/posts/:id', verifyAdminToken, async (req, res) => {
  try {
    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 获取收养信息
app.get('/admin/api/adoptions', verifyAdminToken, async (req, res) => {
  try {
    const [adoptions] = await db.query(`
      SELECT a.*, u.username, u.nickname
      FROM adoptions a
      LEFT JOIN users u ON a.publisher_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, data: adoptions });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 删除收养信息
app.delete('/admin/api/adoptions/:id', verifyAdminToken, async (req, res) => {
  try {
    await db.query('DELETE FROM adoptions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 获取收养申请
app.get('/admin/api/adoption-applications', verifyAdminToken, async (req, res) => {
  try {
    const [applications] = await db.query(`
      SELECT aa.*, u.username, u.nickname, ap.name as pet_name
      FROM adoption_applications aa
      LEFT JOIN users u ON aa.applicant_id = u.id
      LEFT JOIN adoptions ap ON aa.adoption_id = ap.id
      ORDER BY aa.created_at DESC
    `);
    res.json({ success: true, data: applications });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 审核收养申请
app.put('/admin/api/adoption-applications/:id/review', verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE adoption_applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: '审核成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 获取订单
app.get('/admin/api/orders', verifyAdminToken, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.username, u.nickname
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 更新订单状态
app.put('/admin/api/orders/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 添加商品
app.post('/admin/api/products', verifyAdminToken, async (req, res) => {
  try {
    const { name, category, price, stock, description, images, tags } = req.body;

    // 智能处理images字段
    let processedImages;
    if (typeof images === 'string') {
      try {
        processedImages = JSON.parse(images);
        if (!Array.isArray(processedImages)) {
          processedImages = [images];
        }
      } catch {
        processedImages = images.includes(',')
          ? images.split(',').map(url => url.trim())
          : [images.trim()];
      }
    } else if (Array.isArray(images)) {
      processedImages = images;
    } else {
      processedImages = [];
    }

    const [result] = await db.query(
      'INSERT INTO products (name, category, price, stock, description, images, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category, price, stock || 0, description || '', JSON.stringify(processedImages), tags || '']
    );
    res.json({ success: true, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加商品错误:', error);
    res.json({ success: false, message: error.message });
  }
});

// 更新商品
app.put('/admin/api/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const { name, category, price, stock, description, images, tags } = req.body;

    // 智能处理images字段
    let processedImages;
    if (typeof images === 'string') {
      // 如果是字符串，尝试解析为数组或直接作为单个URL
      try {
        processedImages = JSON.parse(images);
        if (!Array.isArray(processedImages)) {
          processedImages = [images]; // 如果解析后不是数组，包装成数组
        }
      } catch {
        // 解析失败，可能是单个URL或逗号分隔的URL
        processedImages = images.includes(',')
          ? images.split(',').map(url => url.trim())
          : [images.trim()];
      }
    } else if (Array.isArray(images)) {
      processedImages = images;
    } else {
      processedImages = [];
    }

    await db.query(
      'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, description = ?, images = ?, tags = ? WHERE id = ?',
      [name, category, price, stock, description, JSON.stringify(processedImages), tags || '', req.params.id]
    );
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.json({ success: false, message: error.message });
  }
});

// 删除商品
app.delete('/admin/api/products/:id', verifyAdminToken, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 更新用户角色
app.put('/admin/api/users/:id/role', verifyAdminToken, async (req, res) => {
  try {
    const { role } = req.body;
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 图片上传API（支持单个和多个文件）
app.post('/api/upload/single', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: '没有上传文件' });
    }
    const imageUrl = `http://localhost:${process.env.PORT || 3001}/images/${req.file.filename}`;
    res.json({
      success: true,
      message: '上传成功',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

app.post('/api/upload/multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({ success: false, message: '没有上传文件' });
    }
    const imageUrls = req.files.map(file => ({
      url: `http://localhost:${process.env.PORT || 3001}/images/${file.filename}`,
      filename: file.filename,
      size: file.size
    }));
    res.json({
      success: true,
      message: '上传成功',
      data: imageUrls
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 添加收养宠物
app.post('/admin/api/adoptions', verifyAdminToken, async (req, res) => {
  try {
    const { name, species, breed, age, gender, color, location, health_status, vaccinated, description, photos, contact_phone } = req.body;

    // 智能处理photos字段
    let processedPhotos;
    if (typeof photos === 'string') {
      try {
        processedPhotos = JSON.parse(photos);
        if (!Array.isArray(processedPhotos)) {
          processedPhotos = [photos];
        }
      } catch {
        processedPhotos = photos.includes(',')
          ? photos.split(',').map(url => url.trim())
          : [photos.trim()];
      }
    } else if (Array.isArray(photos)) {
      processedPhotos = photos;
    } else {
      processedPhotos = [];
    }

    const [result] = await db.query(
      'INSERT INTO adoptions (publisher_id, name, species, breed, age, gender, color, location, health_status, vaccinated, description, photos, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, species, breed || '', age || '', gender || '', color || '', location || '', health_status || 'unknown', vaccinated || 0, description || '', JSON.stringify(processedPhotos), contact_phone || '', 'available']
    );
    res.json({ success: true, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加收养宠物错误:', error);
    res.json({ success: false, message: error.message });
  }
});

// 更新收养宠物
app.put('/admin/api/adoptions/:id', verifyAdminToken, async (req, res) => {
  try {
    const { name, species, breed, age, gender, color, location, health_status, vaccinated, description, photos, contact_phone, status } = req.body;

    // 智能处理photos字段
    let processedPhotos;
    if (typeof photos === 'string') {
      try {
        processedPhotos = JSON.parse(photos);
        if (!Array.isArray(processedPhotos)) {
          processedPhotos = [photos];
        }
      } catch {
        processedPhotos = photos.includes(',')
          ? photos.split(',').map(url => url.trim())
          : [photos.trim()];
      }
    } else if (Array.isArray(photos)) {
      processedPhotos = photos;
    } else {
      processedPhotos = [];
    }

    await db.query(
      'UPDATE adoptions SET name = ?, species = ?, breed = ?, age = ?, gender = ?, color = ?, location = ?, health_status = ?, vaccinated = ?, description = ?, photos = ?, contact_phone = ?, status = ? WHERE id = ?',
      [name, species, breed, age, gender, color, location, health_status, vaccinated, description, JSON.stringify(processedPhotos), contact_phone, status, req.params.id]
    );
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新收养宠物错误:', error);
    res.json({ success: false, message: error.message });
  }
});

// 管理员后台页面
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>宠物世界 - 管理后台</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; }

        /* 登录页面 */
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .login-box {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          width: 400px;
        }
        .login-box h1 { text-align: center; color: #667eea; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 600; }
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
        }
        .form-group input:focus { outline: none; border-color: #667eea; }
        .btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn:hover { opacity: 0.9; }
        .error-msg { color: #dc3545; text-align: center; margin-bottom: 15px; }

        /* 管理后台布局 */
        .admin-container { display: none; min-height: 100vh; }
        .sidebar {
          width: 220px;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          padding: 20px 0;
          overflow-y: auto;
        }
        .sidebar-logo {
          color: white;
          text-align: center;
          padding: 15px;
          font-size: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 20px;
        }
        .sidebar-menu { list-style: none; }
        .sidebar-menu li {
          padding: 12px 20px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.3s;
          margin: 4px 10px;
          border-radius: 8px;
        }
        .sidebar-menu li:hover { background: rgba(102,126,234,0.3); color: white; }
        .sidebar-menu li.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .main-content {
          margin-left: 220px;
          padding: 30px;
          min-height: 100vh;
        }
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .content-header h2 { color: #333; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        .logout-btn {
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        /* 卡片和表格 */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .stat-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
        .stat-card .value { font-size: 28px; font-weight: bold; color: #667eea; }

        .data-table {
          width: 100%;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .data-table th, .data-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
        }
        .data-table th { background: #f8f9fa; font-weight: 600; color: #333; }
        .data-table tr:hover { background: rgba(102,126,234,0.05); }

        .tag {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .tag-green { background: #e8f5e9; color: #2e7d32; }
        .tag-blue { background: #e3f2fd; color: #1565c0; }
        .tag-orange { background: #fff3e0; color: #ef6c00; }
        .tag-red { background: #ffebee; color: #c62828; }

        .action-btn {
          padding: 4px 10px;
          margin: 2px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .action-btn.edit { background: #667eea; color: white; }
        .action-btn.delete { background: #dc3545; color: white; }
        .action-btn.approve { background: #28a745; color: white; }
        .action-btn.reject { background: #ffc107; color: #333; }

        .content-section { display: none; }
        .content-section.active { display: block; }

        .api-list { background: white; border-radius: 12px; padding: 20px; }
        .api-item {
          padding: 10px;
          margin: 8px 0;
          background: #f5f5f5;
          border-radius: 6px;
          display: flex;
          align-items: center;
        }
        .api-method {
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 11px;
          margin-right: 15px;
          min-width: 50px;
          text-align: center;
        }
        .api-method.get { background: #4caf50; color: white; }
        .api-method.post { background: #2196f3; color: white; }
        .api-method.put { background: #ff9800; color: white; }
        .api-method.delete { background: #f44336; color: white; }

        select {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }

        /* Toast通知系统 */
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 99999;
        }
        .toast {
          min-width: 300px;
          padding: 16px 20px;
          margin-bottom: 10px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease-out;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .toast-success { background: #4caf50; color: white; }
        .toast-error { background: #f44336; color: white; }
        .toast-warning { background: #ff9800; color: white; }
        .toast-info { background: #2196f3; color: white; }
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }

        /* Modal样式 */
        .modal-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10000;
          align-items: center;
          justify-content: center;
        }
        .modal-overlay.active {
          display: flex;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: modalSlideIn 0.3s ease-out;
        }
        @keyframes modalSlideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #667eea;
        }
        .modal-title {
          font-size: 24px;
          color: #667eea;
          font-weight: bold;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          color: #999;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-close:hover {
          color: #333;
        }
        .modal-body {
          margin-bottom: 20px;
        }
        .modal-form-group {
          margin-bottom: 16px;
        }
        .modal-form-group label {
          display: block;
          margin-bottom: 6px;
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }
        .modal-form-group input,
        .modal-form-group textarea,
        .modal-form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        .modal-form-group input:focus,
        .modal-form-group textarea:focus,
        .modal-form-group select:focus {
          outline: none;
          border-color: #667eea;
        }
        .modal-form-group textarea {
          resize: vertical;
          min-height: 80px;
        }
        .modal-form-group small {
          display: block;
          margin-top: 4px;
          color: #666;
          font-size: 12px;
        }
        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .modal-btn {
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .modal-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .modal-btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .modal-btn-secondary {
          background: #f0f0f0;
          color: #333;
        }
        .modal-btn-secondary:hover {
          background: #e0e0e0;
        }
      </style>
    </head>
    <body>
      <!-- 登录页面 -->
      <div class="login-container" id="loginPage">
        <div class="login-box">
          <h1>🔧 管理后台</h1>
          <div class="error-msg" id="loginError"></div>
          <div class="form-group">
            <label>用户名或邮箱</label>
            <input type="text" id="loginUsername" placeholder="admin">
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" id="loginPassword" placeholder="admin123">
          </div>
          <button class="btn" onclick="login()">登录</button>
        </div>
      </div>

      <!-- 管理后台 -->
      <div class="admin-container" id="adminPage">
        <div class="sidebar">
          <div class="sidebar-logo">🐾 宠物世界管理</div>
          <ul class="sidebar-menu">
            <li class="active" onclick="showSection('dashboard', this)">📊 数据概览</li>
            <li onclick="showSection('users', this)">👥 用户管理</li>
            <li onclick="showSection('posts', this)">📝 帖子管理</li>
            <li onclick="showSection('adoptions', this)">🏠 收养管理</li>
            <li onclick="showSection('applications', this)">✅ 收养申请</li>
            <li onclick="showSection('products', this)">🛒 商品管理</li>
            <li onclick="showSection('orders', this)">📦 订单管理</li>
            <li onclick="showSection('apis', this)">🔌 API接口</li>
          </ul>
        </div>

        <div class="main-content">
          <div class="content-header">
            <h2 id="sectionTitle">数据概览</h2>
            <div>
              <button class="logout-btn" style="background: #ff9800; margin-right: 10px;" onclick="clearCacheAndReload()">清除缓存</button>
              <button class="logout-btn" onclick="logout()">退出登录</button>
            </div>
          </div>

          <!-- 数据概览 -->
          <div class="content-section active" id="section-dashboard">
            <div class="stats-grid" id="statsGrid"></div>
          </div>

          <!-- 用户管理 -->
          <div class="content-section" id="section-users">
            <table class="data-table" id="usersTable">
              <thead><tr><th>ID</th><th>用户名</th><th>昵称</th><th>邮箱</th><th>角色</th><th>状态</th><th>操作</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>

          <!-- 帖子管理 -->
          <div class="content-section" id="section-posts">
            <table class="data-table" id="postsTable">
              <thead><tr><th>ID</th><th>用户</th><th>内容</th><th>点赞</th><th>评论</th><th>时间</th><th>操作</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>

          <!-- 收养管理 -->
          <div class="content-section" id="section-adoptions">
            <div style="margin-bottom: 20px;">
              <button class="action-btn" style="background: #FFB6C1;" onclick="showAddAdoptionModal()">+ 新增待收养宠物</button>
            </div>
            <table class="data-table" id="adoptionsTable">
              <thead><tr><th>ID</th><th>名称</th><th>物种</th><th>品种</th><th>位置</th><th>状态</th><th>操作</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>

          <!-- 收养申请 -->
          <div class="content-section" id="section-applications">
            <table class="data-table" id="applicationsTable">
              <thead><tr><th>ID</th><th>宠物</th><th>申请人</th><th>电话</th><th>状态</th><th>时间</th><th>操作</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>

          <!-- 商品管理 -->
          <div class="content-section" id="section-products">
            <div style="margin-bottom: 20px;">
              <button class="action-btn" style="background: #FFB6C1;" onclick="showAddProductModal()">+ 新增商品</button>
            </div>
            <table class="data-table" id="productsTable">
              <thead><tr><th>ID</th><th>名称</th><th>分类</th><th>价格</th><th>库存</th><th>销量</th><th>操作</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>

          <!-- 订单管理 -->
          <div class="content-section" id="section-orders">
            <table class="data-table" id="ordersTable">
              <thead><tr><th>订单号</th><th>用户</th><th>金额</th><th>收货人</th><th>状态</th><th>时间</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>

          <!-- API接口 -->
          <div class="content-section" id="section-apis">
            <div class="api-list">
              <h3>认证相关</h3>
              <div class="api-item"><span class="api-method post">POST</span>/api/auth/register</div>
              <div class="api-item"><span class="api-method post">POST</span>/api/auth/login</div>
              <div class="api-item"><span class="api-method get">GET</span>/api/auth/me</div>

              <h3 style="margin-top:20px">管理员接口</h3>
              <div class="api-item"><span class="api-method get">GET</span>/api/admin/statistics</div>
              <div class="api-item"><span class="api-method get">GET</span>/api/admin/users</div>
              <div class="api-item"><span class="api-method get">GET</span>/api/admin/posts</div>
              <div class="api-item"><span class="api-method get">GET</span>/api/admin/adoptions</div>
              <div class="api-item"><span class="api-method get">GET</span>/api/admin/adoption-applications</div>
              <div class="api-item"><span class="api-method get">GET</span>/api/admin/orders</div>
              <div class="api-item"><span class="api-method delete">DELETE</span>/api/admin/users/:id</div>
              <div class="api-item"><span class="api-method delete">DELETE</span>/api/admin/posts/:id</div>
              <div class="api-item"><span class="api-method delete">DELETE</span>/api/admin/products/:id</div>

              <h3 style="margin-top:20px">收养相关</h3>
              <div class="api-item"><span class="api-method get">GET</span>/api/adoption/adoptions</div>
              <div class="api-item"><span class="api-method post">POST</span>/api/adoption/adoptions</div>

              <h3 style="margin-top:20px">商城相关</h3>
              <div class="api-item"><span class="api-method get">GET</span>/api/shop/products</div>
              <div class="api-item"><span class="api-method get">GET</span>/api/shop/cart</div>
              <div class="api-item"><span class="api-method post">POST</span>/api/shop/orders</div>

              <h3 style="margin-top:20px">社交相关</h3>
              <div class="api-item"><span class="api-method get">GET</span>/api/social/posts</div>
              <div class="api-item"><span class="api-method post">POST</span>/api/social/posts</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast通知容器 -->
      <div class="toast-container" id="toastContainer"></div>

      <!-- 收养动物Modal -->
      <div class="modal-overlay" id="adoptionModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title" id="adoptionModalTitle">新增待收养宠物</div>
            <button class="modal-close" onclick="closeAdoptionModal()">×</button>
          </div>
          <div class="modal-body">
            <form id="adoptionForm">
              <div class="modal-form-group">
                <label>宠物名称 <span style="color: red;">*</span></label>
                <input type="text" id="adoption_name" required placeholder="请输入宠物名称">
              </div>
              <div class="modal-form-group">
                <label>物种 <span style="color: red;">*</span></label>
                <select id="adoption_species" required>
                  <option value="">请选择</option>
                  <option value="狗">狗</option>
                  <option value="猫">猫</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div class="modal-form-group">
                <label>品种</label>
                <input type="text" id="adoption_breed" placeholder="例如：金毛、英短">
              </div>
              <div class="modal-form-group">
                <label>年龄</label>
                <input type="text" id="adoption_age" placeholder="例如：2岁、6个月">
              </div>
              <div class="modal-form-group">
                <label>性别</label>
                <select id="adoption_gender">
                  <option value="">请选择</option>
                  <option value="公">公</option>
                  <option value="母">母</option>
                </select>
              </div>
              <div class="modal-form-group">
                <label>颜色</label>
                <input type="text" id="adoption_color" placeholder="例如：棕色、黑白">
              </div>
              <div class="modal-form-group">
                <label>所在地</label>
                <input type="text" id="adoption_location" placeholder="例如：北京朝阳区">
              </div>
              <div class="modal-form-group">
                <label>健康状况</label>
                <select id="adoption_health_status">
                  <option value="unknown">未知</option>
                  <option value="healthy">健康</option>
                  <option value="sick">患病</option>
                </select>
              </div>
              <div class="modal-form-group">
                <label>是否接种疫苗</label>
                <select id="adoption_vaccinated">
                  <option value="0">否</option>
                  <option value="1">是</option>
                </select>
              </div>
              <div class="modal-form-group">
                <label>描述</label>
                <textarea id="adoption_description" placeholder="请输入宠物的详细描述"></textarea>
              </div>
              <div class="modal-form-group">
                <label>联系电话</label>
                <input type="text" id="adoption_contact_phone" placeholder="请输入联系电话">
              </div>
              <div class="modal-form-group">
                <label>图片URL</label>
                <input type="text" id="adoption_photos" placeholder="多个URL用逗号分隔">
                <small>例如：https://example.com/pic1.jpg,https://example.com/pic2.jpg</small>
              </div>
              <div class="modal-form-group" id="adoption_status_group" style="display: none;">
                <label>状态</label>
                <select id="adoption_status">
                  <option value="available">待收养</option>
                  <option value="adopted">已收养</option>
                  <option value="pending">审核中</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" onclick="closeAdoptionModal()">取消</button>
            <button class="modal-btn modal-btn-primary" onclick="submitAdoptionForm()">提交</button>
          </div>
        </div>
      </div>

      <!-- 商品Modal -->
      <div class="modal-overlay" id="productModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title" id="productModalTitle">新增商品</div>
            <button class="modal-close" onclick="closeProductModal()">×</button>
          </div>
          <div class="modal-body">
            <form id="productForm">
              <div class="modal-form-group">
                <label>商品名称 <span style="color: red;">*</span></label>
                <input type="text" id="product_name" required placeholder="请输入商品名称">
              </div>
              <div class="modal-form-group">
                <label>分类 <span style="color: red;">*</span></label>
                <select id="product_category" required>
                  <option value="">请选择</option>
                  <option value="食品">食品</option>
                  <option value="玩具">玩具</option>
                  <option value="用品">用品</option>
                  <option value="药品">药品</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div class="modal-form-group">
                <label>价格 <span style="color: red;">*</span></label>
                <input type="number" id="product_price" required step="0.01" min="0" placeholder="请输入价格">
              </div>
              <div class="modal-form-group">
                <label>库存</label>
                <input type="number" id="product_stock" min="0" placeholder="请输入库存数量">
              </div>
              <div class="modal-form-group">
                <label>描述</label>
                <textarea id="product_description" placeholder="请输入商品描述"></textarea>
              </div>
              <div class="modal-form-group">
                <label>图片URL</label>
                <input type="text" id="product_images" placeholder="多个URL用逗号分隔">
                <small>例如：https://example.com/pic1.jpg,https://example.com/pic2.jpg</small>
              </div>
              <div class="modal-form-group">
                <label>标签</label>
                <input type="text" id="product_tags" placeholder="多个标签用逗号分隔">
                <small>例如：新品,热卖,促销</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" onclick="closeProductModal()">取消</button>
            <button class="modal-btn modal-btn-primary" onclick="submitProductForm()">提交</button>
          </div>
        </div>
      </div>

      <script>
        // Toast通知系统
        function showToast(message, type = 'success') {
          const container = document.getElementById('toastContainer');
          const toast = document.createElement('div');
          toast.className = \`toast toast-\${type}\`;

          const icon = {
            'success': '✓',
            'error': '✗',
            'warning': '⚠',
            'info': 'ℹ'
          }[type] || '✓';

          toast.innerHTML = \`<span style="font-size:20px">\${icon}</span> <span>\${message}</span>\`;
          container.appendChild(toast);

          setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }

        let token = localStorage.getItem('adminToken');
        const API_BASE = ''; // 使用相对路径

        // 检查登录状态
        if (token) {
          showAdmin();
        }

        // 登录
        async function login() {
          const username = document.getElementById('loginUsername').value;
          const password = document.getElementById('loginPassword').value;

          try {
            const res = await fetch('/admin/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success && data.data.user.role === 'admin') {
              token = data.data.token;
              localStorage.setItem('adminToken', token);
              showAdmin();
            } else if (data.success) {
              document.getElementById('loginError').textContent = '需要管理员权限';
            } else {
              document.getElementById('loginError').textContent = data.message || '登录失败';
            }
          } catch (e) {
            document.getElementById('loginError').textContent = '连接服务器失败';
          }
        }

        // 退出
        function logout() {
          localStorage.removeItem('adminToken');
          token = null;
          document.getElementById('loginPage').style.display = 'flex';
          document.getElementById('adminPage').style.display = 'none';
        }

        // 清除缓存并重新加载
        function clearCacheAndReload() {
          localStorage.clear();
          sessionStorage.clear();
          showToast('缓存已清除，3秒后刷新页面...', 'info');
          setTimeout(() => {
            window.location.reload(true);
          }, 3000);
        }

        // 显示管理后台
        function showAdmin() {
          document.getElementById('loginPage').style.display = 'none';
          document.getElementById('adminPage').style.display = 'block';
          loadStats();
        }

        // 切换页面
        function showSection(section, el) {
          document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
          document.querySelectorAll('.sidebar-menu li').forEach(l => l.classList.remove('active'));
          document.getElementById('section-' + section).classList.add('active');
          el.classList.add('active');

          const titles = {
            dashboard: '数据概览', users: '用户管理', posts: '帖子管理',
            adoptions: '收养管理', applications: '收养申请', products: '商品管理',
            orders: '订单管理', apis: 'API接口'
          };
          document.getElementById('sectionTitle').textContent = titles[section];

          // 加载数据
          if (section === 'dashboard') loadStats();
          else if (section === 'users') loadUsers();
          else if (section === 'posts') loadPosts();
          else if (section === 'adoptions') loadAdoptions();
          else if (section === 'applications') loadApplications();
          else if (section === 'products') loadProducts();
          else if (section === 'orders') loadOrders();
        }

        // 加载统计数据
        async function loadStats() {
          try {
            const res = await fetch('/admin/api/statistics', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
              const s = data.data;
              document.getElementById('statsGrid').innerHTML = \`
                <div class="stat-card"><h3>总用户数</h3><div class="value">\${s.users?.total_users || 0}</div></div>
                <div class="stat-card"><h3>活跃用户</h3><div class="value">\${s.users?.active_users || 0}</div></div>
                <div class="stat-card"><h3>宠物总数</h3><div class="value">\${s.pets?.total_pets || 0}</div></div>
                <div class="stat-card"><h3>待收养</h3><div class="value">\${s.adoptions?.available_count || 0}</div></div>
                <div class="stat-card"><h3>帖子总数</h3><div class="value">\${s.posts?.total_posts || 0}</div></div>
                <div class="stat-card"><h3>商品总数</h3><div class="value">\${s.products?.total_products || 0}</div></div>
                <div class="stat-card"><h3>订单总数</h3><div class="value">\${s.orders?.total_orders || 0}</div></div>
                <div class="stat-card"><h3>总收入</h3><div class="value">¥\${s.orders?.total_revenue || 0}</div></div>
              \`;

              // 显示热门标签
              if (s.popularTags && s.popularTags.length > 0) {
                const tagsHtml = \`
                  <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin-bottom: 15px; color: #FFB6C1;">📊 热门标签排行</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                      \${s.popularTags.map((tag, idx) => \`
                        <div style="padding: 12px; background: #fff5f7; border-radius: 6px; border-left: 3px solid #FFB6C1;">
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #333;">\${idx + 1}. \${tag.name}</span>
                            <span style="color: #FFB6C1; font-size: 18px; font-weight: bold;">\${tag.use_count}</span>
                          </div>
                        </div>
                      \`).join('')}
                    </div>
                  </div>
                \`;
                document.getElementById('statsGrid').insertAdjacentHTML('afterend', tagsHtml);
              }
              showToast('数据加载成功', 'success');
            } else {
              showToast('加载失败: ' + data.message, 'error');
              if (data.message === 'token无效' || data.message === '未提供token') {
                setTimeout(() => {
                  logout();
                  showToast('Token已过期，请重新登录', 'warning');
                }, 1500);
              }
            }
          } catch (e) {
            console.error(e);
            showToast('网络错误: ' + e.message, 'error');
          }
        }

        // 加载用户
        async function loadUsers() {
          try {
            const res = await fetch('/admin/api/users', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
              const tbody = document.querySelector('#usersTable tbody');
              tbody.innerHTML = data.data.map(u => \`
                <tr>
                  <td>\${u.id}</td>
                  <td>\${u.username}</td>
                  <td>\${u.nickname || '-'}</td>
                  <td>\${u.email}</td>
                  <td><span class="tag \${u.role === 'admin' ? 'tag-red' : 'tag-blue'}">\${u.role === 'admin' ? '管理员' : '用户'}</span></td>
                  <td>
                    <select onchange="updateUserStatus(\${u.id}, this.value)">
                      <option value="active" \${u.status === 'active' ? 'selected' : ''}>正常</option>
                      <option value="inactive" \${u.status === 'inactive' ? 'selected' : ''}>禁用</option>
                      <option value="banned" \${u.status === 'banned' ? 'selected' : ''}>封禁</option>
                    </select>
                  </td>
                  <td><button class="action-btn delete" onclick="deleteUser(\${u.id})">删除</button></td>
                </tr>
              \`).join('');
              showToast('用户列表加载成功', 'success');
            } else {
              showToast('加载失败: ' + data.message, 'error');
              if (data.message === 'token无效' || data.message === '未提供token') {
                setTimeout(() => logout(), 1500);
              }
            }
          } catch (e) {
            console.error(e);
            showToast('网络错误: ' + e.message, 'error');
          }
        }

        // 加载帖子
        async function loadPosts() {
          try {
            const res = await fetch('/admin/api/posts', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
              const tbody = document.querySelector('#postsTable tbody');
              tbody.innerHTML = data.data.map(p => \`
                <tr>
                  <td>\${p.id}</td>
                  <td>\${p.nickname || p.username}</td>
                  <td>\${(p.content || '').substring(0, 50)}...</td>
                  <td>\${p.likes_count}</td>
                  <td>\${p.comments_count}</td>
                  <td>\${new Date(p.created_at).toLocaleDateString()}</td>
                  <td><button class="action-btn delete" onclick="deletePost(\${p.id})">删除</button></td>
                </tr>
              \`).join('');
            }
          } catch (e) { console.error(e); }
        }

        // 加载收养
        async function loadAdoptions() {
          try {
            const res = await fetch('/admin/api/adoptions', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
              const tbody = document.querySelector('#adoptionsTable tbody');
              tbody.innerHTML = data.data.map(a => \`
                <tr>
                  <td>\${a.id}</td>
                  <td>\${a.name}</td>
                  <td>\${a.species}</td>
                  <td>\${a.breed || '-'}</td>
                  <td>\${a.location || '-'}</td>
                  <td><span class="tag \${a.status === 'available' ? 'tag-green' : a.status === 'adopted' ? 'tag-blue' : 'tag-orange'}">\${a.status === 'available' ? '待收养' : a.status === 'adopted' ? '已收养' : '审核中'}</span></td>
                  <td>
                    <button class="action-btn" onclick='editAdoption(\${JSON.stringify(a).replace(/'/g, "&apos;")})'>编辑</button>
                    <button class="action-btn delete" onclick="deleteAdoption(\${a.id})">删除</button>
                  </td>
                </tr>
              \`).join('');
            }
          } catch (e) { console.error(e); }
        }

        // 加载申请
        async function loadApplications() {
          try {
            const res = await fetch('/admin/api/adoption-applications', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
              const tbody = document.querySelector('#applicationsTable tbody');
              tbody.innerHTML = data.data.map(a => \`
                <tr>
                  <td>\${a.id}</td>
                  <td>\${a.pet_name}</td>
                  <td>\${a.name}</td>
                  <td>\${a.phone}</td>
                  <td><span class="tag \${a.status === 'approved' ? 'tag-green' : a.status === 'rejected' ? 'tag-red' : 'tag-orange'}">\${a.status === 'approved' ? '已通过' : a.status === 'rejected' ? '已拒绝' : '待审核'}</span></td>
                  <td>\${new Date(a.created_at).toLocaleDateString()}</td>
                  <td>
                    \${a.status === 'pending' ? \`
                      <button class="action-btn approve" onclick="reviewApp(\${a.id}, 'approved')">通过</button>
                      <button class="action-btn reject" onclick="reviewApp(\${a.id}, 'rejected')">拒绝</button>
                    \` : '-'}
                  </td>
                </tr>
              \`).join('');
            }
          } catch (e) { console.error(e); }
        }

        // 加载商品
        async function loadProducts() {
          try {
            const res = await fetch(API_BASE + '/api/shop/products');
            const data = await res.json();
            if (data.success) {
              const tbody = document.querySelector('#productsTable tbody');
              tbody.innerHTML = data.data.map(p => \`
                <tr>
                  <td>\${p.id}</td>
                  <td>\${p.name}</td>
                  <td>\${p.category}</td>
                  <td>¥\${p.price}</td>
                  <td>\${p.stock}</td>
                  <td>\${p.sales}</td>
                  <td>
                    <button class="action-btn" onclick='editProduct(\${JSON.stringify(p).replace(/'/g, "&apos;")})'>编辑</button>
                    <button class="action-btn delete" onclick="deleteProduct(\${p.id})">删除</button>
                  </td>
                </tr>
              \`).join('');
            }
          } catch (e) { console.error(e); }
        }

        // 加载订单
        async function loadOrders() {
          try {
            const res = await fetch('/admin/api/orders', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
              const tbody = document.querySelector('#ordersTable tbody');
              tbody.innerHTML = data.data.map(o => \`
                <tr>
                  <td>\${o.order_no || o.id}</td>
                  <td>\${o.nickname || o.user_id}</td>
                  <td>¥\${o.total_amount}</td>
                  <td>\${o.recipient_name || '-'}</td>
                  <td>
                    <select onchange="updateOrderStatus(\${o.id}, this.value)">
                      <option value="pending" \${o.status === 'pending' ? 'selected' : ''}>待支付</option>
                      <option value="paid" \${o.status === 'paid' ? 'selected' : ''}>已支付</option>
                      <option value="shipped" \${o.status === 'shipped' ? 'selected' : ''}>已发货</option>
                      <option value="completed" \${o.status === 'completed' ? 'selected' : ''}>已完成</option>
                      <option value="cancelled" \${o.status === 'cancelled' ? 'selected' : ''}>已取消</option>
                    </select>
                  </td>
                  <td>\${new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              \`).join('');
            }
          } catch (e) { console.error(e); }
        }

        // 操作函数
        async function updateUserStatus(id, status) {
          await fetch('/admin/api/users/' + id + '/status', {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          loadUsers();
        }

        async function deleteUser(id) {
          if (confirm('确认删除该用户？')) {
            await fetch('/admin/api/users/' + id, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            loadUsers();
          }
        }

        async function deletePost(id) {
          if (confirm('确认删除该帖子？')) {
            await fetch('/admin/api/posts/' + id, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            loadPosts();
          }
        }

        async function deleteAdoption(id) {
          if (confirm('确认删除？')) {
            await fetch('/admin/api/adoptions/' + id, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            loadAdoptions();
          }
        }

        async function reviewApp(id, status) {
          await fetch('/admin/api/adoption-applications/' + id + '/review', {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          loadApplications();
        }

        async function deleteProduct(id) {
          if (confirm('确认删除该商品？')) {
            await fetch('/admin/api/products/' + id, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            loadProducts();
          }
        }

        async function updateOrderStatus(id, status) {
          await fetch('/admin/api/orders/' + id + '/status', {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          loadOrders();
        }

        // 添加收养宠物
        let currentEditingAdoptionId = null;

        function showAddAdoptionModal() {
          currentEditingAdoptionId = null;
          document.getElementById('adoptionModalTitle').textContent = '新增待收养宠物';
          document.getElementById('adoption_status_group').style.display = 'none';

          // 清空表单
          document.getElementById('adoptionForm').reset();

          // 显示Modal
          document.getElementById('adoptionModal').classList.add('active');
        }

        function closeAdoptionModal() {
          document.getElementById('adoptionModal').classList.remove('active');
          currentEditingAdoptionId = null;
        }

        async function submitAdoptionForm() {
          const form = document.getElementById('adoptionForm');

          // 验证必填字段
          const name = document.getElementById('adoption_name').value.trim();
          const species = document.getElementById('adoption_species').value;

          if (!name) {
            showToast('请输入宠物名称', 'warning');
            return;
          }
          if (!species) {
            showToast('请选择物种', 'warning');
            return;
          }

          // 收集表单数据
          const formData = {
            name,
            species,
            breed: document.getElementById('adoption_breed').value.trim() || null,
            age: document.getElementById('adoption_age').value.trim() || null,
            gender: document.getElementById('adoption_gender').value || null,
            color: document.getElementById('adoption_color').value.trim() || null,
            location: document.getElementById('adoption_location').value.trim() || null,
            health_status: document.getElementById('adoption_health_status').value,
            vaccinated: parseInt(document.getElementById('adoption_vaccinated').value),
            description: document.getElementById('adoption_description').value.trim() || null,
            contact_phone: document.getElementById('adoption_contact_phone').value.trim() || null,
            photos: document.getElementById('adoption_photos').value.trim() ?
                   document.getElementById('adoption_photos').value.split(',').map(url => url.trim()) : []
          };

          // 如果是编辑模式，添加状态
          if (currentEditingAdoptionId) {
            formData.status = document.getElementById('adoption_status').value;
          }

          try {
            const url = currentEditingAdoptionId ?
                       '/admin/api/adoptions/' + currentEditingAdoptionId :
                       '/admin/api/adoptions';
            const method = currentEditingAdoptionId ? 'PUT' : 'POST';

            const res = await fetch(url, {
              method,
              headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
              showToast(currentEditingAdoptionId ? '更新成功' : '添加成功', 'success');
              closeAdoptionModal();
              loadAdoptions();
            } else {
              showToast((currentEditingAdoptionId ? '更新失败：' : '添加失败：') + (data.message || '未知错误'), 'error');
            }
          } catch (error) {
            console.error('操作失败:', error);
            showToast('网络请求失败，请检查网络连接', 'error');
          }
        }

        // 编辑收养宠物
        function editAdoption(adoption) {
          currentEditingAdoptionId = adoption.id;
          document.getElementById('adoptionModalTitle').textContent = '编辑收养宠物';
          document.getElementById('adoption_status_group').style.display = 'block';

          // 填充表单
          document.getElementById('adoption_name').value = adoption.name || '';
          document.getElementById('adoption_species').value = adoption.species || '';
          document.getElementById('adoption_breed').value = adoption.breed || '';
          document.getElementById('adoption_age').value = adoption.age || '';
          document.getElementById('adoption_gender').value = adoption.gender || '';
          document.getElementById('adoption_color').value = adoption.color || '';
          document.getElementById('adoption_location').value = adoption.location || '';
          document.getElementById('adoption_health_status').value = adoption.health_status || 'unknown';
          document.getElementById('adoption_vaccinated').value = adoption.vaccinated || 0;
          document.getElementById('adoption_description').value = adoption.description || '';
          document.getElementById('adoption_contact_phone').value = adoption.contact_phone || '';
          document.getElementById('adoption_status').value = adoption.status || 'available';

          // 处理photos（可能是数组或JSON字符串）
          let photosStr = '';
          if (adoption.photos) {
            if (Array.isArray(adoption.photos)) {
              photosStr = adoption.photos.join(',');
            } else if (typeof adoption.photos === 'string') {
              try {
                const photosArray = JSON.parse(adoption.photos);
                photosStr = Array.isArray(photosArray) ? photosArray.join(',') : adoption.photos;
              } catch (e) {
                photosStr = adoption.photos;
              }
            }
          }
          document.getElementById('adoption_photos').value = photosStr;

          // 显示Modal
          document.getElementById('adoptionModal').classList.add('active');
        }

        // 添加商品
        let currentEditingProductId = null;

        function showAddProductModal() {
          currentEditingProductId = null;
          document.getElementById('productModalTitle').textContent = '新增商品';

          // 清空表单
          document.getElementById('productForm').reset();

          // 显示Modal
          document.getElementById('productModal').classList.add('active');
        }

        function closeProductModal() {
          document.getElementById('productModal').classList.remove('active');
          currentEditingProductId = null;
        }

        async function submitProductForm() {
          // 验证必填字段
          const name = document.getElementById('product_name').value.trim();
          const category = document.getElementById('product_category').value;
          const price = document.getElementById('product_price').value;

          if (!name) {
            showToast('请输入商品名称', 'warning');
            return;
          }
          if (!category) {
            showToast('请选择分类', 'warning');
            return;
          }
          if (!price || parseFloat(price) <= 0) {
            showToast('请输入有效的价格', 'warning');
            return;
          }

          // 收集表单数据
          const formData = {
            name,
            category,
            price: parseFloat(price),
            stock: parseInt(document.getElementById('product_stock').value) || 0,
            description: document.getElementById('product_description').value.trim(),
            images: document.getElementById('product_images').value.trim() ?
                   document.getElementById('product_images').value.split(',').map(url => url.trim()) : [],
            tags: document.getElementById('product_tags').value.trim()
          };

          try {
            const url = currentEditingProductId ?
                       '/admin/api/products/' + currentEditingProductId :
                       '/admin/api/products';
            const method = currentEditingProductId ? 'PUT' : 'POST';

            const res = await fetch(url, {
              method,
              headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
              showToast(currentEditingProductId ? '更新成功' : '添加成功', 'success');
              closeProductModal();
              loadProducts();
            } else {
              showToast((currentEditingProductId ? '更新失败：' : '添加失败：') + (data.message || '未知错误'), 'error');
            }
          } catch (error) {
            console.error('操作失败:', error);
            showToast('网络请求失败，请检查网络连接', 'error');
          }
        }

        // 编辑商品
        function editProduct(product) {
          currentEditingProductId = product.id;
          document.getElementById('productModalTitle').textContent = '编辑商品';

          // 填充表单
          document.getElementById('product_name').value = product.name || '';
          document.getElementById('product_category').value = product.category || '';
          document.getElementById('product_price').value = product.price || '';
          document.getElementById('product_stock').value = product.stock || 0;
          document.getElementById('product_description').value = product.description || '';
          document.getElementById('product_tags').value = product.tags || '';

          // 处理images（可能是数组或JSON字符串）
          let imagesStr = '';
          if (product.images) {
            if (Array.isArray(product.images)) {
              imagesStr = product.images.join(',');
            } else if (typeof product.images === 'string') {
              try {
                const imagesArray = JSON.parse(product.images);
                imagesStr = Array.isArray(imagesArray) ? imagesArray.join(',') : product.images;
              } catch (e) {
                imagesStr = product.images;
              }
            }
          }
          document.getElementById('product_images').value = imagesStr;

          // 显示Modal
          document.getElementById('productModal').classList.add('active');
        }
      </script>
    </body>
    </html>
  `);
});

// 根路由
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>宠物世界 API - Pet World</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          padding: 40px 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #667eea;
          font-size: 36px;
          margin-bottom: 10px;
          text-align: center;
        }
        .subtitle {
          text-align: center;
          color: #666;
          font-size: 18px;
          margin-bottom: 40px;
        }
        .status {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
          padding: 15px;
          margin-bottom: 30px;
          border-radius: 4px;
        }
        .status-item {
          display: flex;
          align-items: center;
          margin: 8px 0;
        }
        .status-label {
          font-weight: bold;
          margin-right: 10px;
          min-width: 100px;
        }
        .badge {
          background: #4caf50;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
        }
        h2 {
          color: #667eea;
          margin-top: 30px;
          margin-bottom: 15px;
          font-size: 24px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }
        .endpoint-group {
          margin-bottom: 25px;
        }
        .endpoint {
          background: #f5f5f5;
          padding: 12px;
          margin: 8px 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          transition: all 0.3s;
        }
        .endpoint:hover {
          background: #e3f2fd;
          transform: translateX(5px);
        }
        .method {
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
          margin-right: 15px;
          min-width: 60px;
          text-align: center;
        }
        .method.get { background: #4caf50; color: white; }
        .method.post { background: #2196f3; color: white; }
        .method.put { background: #ff9800; color: white; }
        .method.delete { background: #f44336; color: white; }
        .path {
          font-family: 'Courier New', monospace;
          color: #333;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #666;
        }
        .link {
          color: #667eea;
          text-decoration: none;
          font-weight: bold;
        }
        .link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🐾 宠物世界 API</h1>
        <p class="subtitle">Pet World - 一个集社交、收养、商城于一体的宠物平台</p>

        <div class="status">
          <div class="status-item">
            <span class="status-label">服务状态:</span>
            <span class="badge">✓ 运行中</span>
          </div>
          <div class="status-item">
            <span class="status-label">版本:</span>
            <span>2.0.0</span>
          </div>
          <div class="status-item">
            <span class="status-label">前端地址:</span>
            <a href="http://localhost:3002" class="link" target="_blank">http://localhost:3002</a>
          </div>
        </div>

        <h2>📝 认证相关</h2>
        <div class="endpoint-group">
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/auth/register</span>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/auth/login</span>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/auth/me</span>
          </div>
          <div class="endpoint">
            <span class="method put">PUT</span>
            <span class="path">/api/auth/profile</span>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/auth/change-password</span>
          </div>
        </div>

        <h2>🏠 收养相关</h2>
        <div class="endpoint-group">
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/adoption/adoptions</span>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/adoption/adoptions/:id</span>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/adoption/adoptions</span>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/adoption/adoptions/:id/apply</span>
          </div>
        </div>

        <h2>🛒 商城相关</h2>
        <div class="endpoint-group">
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/shop/products</span>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/shop/products/:id</span>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/shop/cart</span>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/shop/cart</span>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/shop/orders</span>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/shop/my-orders</span>
          </div>
        </div>

        <h2>📸 社交相关</h2>
        <div class="endpoint-group">
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/social/posts</span>
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/social/posts/:id</span>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/social/posts</span>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/social/posts/:id/like</span>
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/social/posts/:id/comments</span>
          </div>
        </div>

        <div class="footer">
          <p>© 2024 宠物世界 Pet World. All rights reserved.</p>
          <p style="margin-top: 10px;">
            <a href="http://localhost:3002" class="link" target="_blank">访问前端应用</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api', petRoutes);
app.use('/api/adoption', adoptionRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/admin', adminRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('  宠物世界 Pet World API 服务器');
  console.log('========================================');
  console.log(`  服务器地址: http://localhost:${PORT}`);
  console.log(`  API 文档: http://localhost:${PORT}/`);
  console.log(`  环境: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================\n');
});

module.exports = app;
