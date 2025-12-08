const db = require('../config/database');

// ==================== 宠物管理 ====================

// 获取所有宠物（包括私有）
exports.getAllPets = async (req, res) => {
  try {
    const [pets] = await db.query(`
      SELECT p.*, u.username, u.nickname
      FROM pets p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: pets
    });
  } catch (error) {
    console.error('获取宠物列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取宠物列表失败'
    });
  }
};

// 删除宠物
exports.deletePet = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM pets WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在'
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除宠物失败:', error);
    res.status(500).json({
      success: false,
      message: '删除宠物失败'
    });
  }
};

// ==================== 用户管理 ====================

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, username, email, nickname, phone, avatar, bio, role, status, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
};

// 更新用户状态
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive', 'banned'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: '无效的状态值'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户状态失败'
    });
  }
};

// 更新用户角色
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: '无效的角色值'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '角色更新成功'
    });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户角色失败'
    });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  // 防止删除自己
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({
      success: false,
      message: '不能删除自己的账号'
    });
  }

  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败'
    });
  }
};

// ==================== 帖子管理 ====================

// 获取所有帖子（包括私有）
exports.getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.*, u.username, u.nickname, u.avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子列表失败'
    });
  }
};

// 删除帖子
exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM posts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '删除帖子失败'
    });
  }
};

// ==================== 收养管理 ====================

// 获取所有收养信息
exports.getAllAdoptions = async (req, res) => {
  try {
    const [adoptions] = await db.query(`
      SELECT a.*, u.username, u.nickname
      FROM adoptions a
      JOIN users u ON a.publisher_id = u.id
      ORDER BY a.created_at DESC
    `);

    res.json({
      success: true,
      data: adoptions
    });
  } catch (error) {
    console.error('获取收养列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收养列表失败'
    });
  }
};

// 删除收养信息
exports.deleteAdoption = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM adoptions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '收养信息不存在'
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除收养信息失败:', error);
    res.status(500).json({
      success: false,
      message: '删除收养信息失败'
    });
  }
};

// 获取所有收养申请
exports.getAllApplications = async (req, res) => {
  try {
    const [applications] = await db.query(`
      SELECT aa.*, a.name as pet_name, u.username, u.nickname
      FROM adoption_applications aa
      JOIN adoptions a ON aa.adoption_id = a.id
      JOIN users u ON aa.applicant_id = u.id
      ORDER BY aa.created_at DESC
    `);

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('获取申请列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取申请列表失败'
    });
  }
};

// 审核收养申请
exports.reviewApplication = async (req, res) => {
  const { id } = req.params;
  const { status, reviewer_note } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: '无效的审核状态'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE adoption_applications SET status = ?, reviewer_note = ? WHERE id = ?',
      [status, reviewer_note || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '申请不存在'
      });
    }

    res.json({
      success: true,
      message: '审核成功'
    });
  } catch (error) {
    console.error('审核申请失败:', error);
    res.status(500).json({
      success: false,
      message: '审核申请失败'
    });
  }
};

// ==================== 商品管理 ====================

// 创建商品
exports.createProduct = async (req, res) => {
  const { name, category, description, price, stock, images, tags } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO products (name, category, description, price, stock, images, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category, description, price, stock, JSON.stringify(images), tags]
    );

    res.status(201).json({
      success: true,
      message: '商品创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({
      success: false,
      message: '创建商品失败'
    });
  }
};

// 更新商品
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, price, stock, images, tags, status } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE products
       SET name = ?, category = ?, description = ?, price = ?,
           stock = ?, images = ?, tags = ?, status = ?
       WHERE id = ?`,
      [name, category, description, price, stock, JSON.stringify(images), tags, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      message: '商品更新成功'
    });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({
      success: false,
      message: '更新商品失败'
    });
  }
};

// 删除商品
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({
      success: false,
      message: '删除商品失败'
    });
  }
};

// 获取所有订单
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.username, u.nickname
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败'
    });
  }
};

// 更新订单状态
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'paid', 'shipped', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: '无效的订单状态'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      message: '订单状态更新成功'
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新订单状态失败'
    });
  }
};

// ==================== 统计数据 ====================

// 获取系统统计数据
exports.getStatistics = async (req, res) => {
  try {
    // 用户统计
    const [userStats] = await db.query(`
      SELECT COUNT(*) as total_users,
             SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
             SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users
      FROM users
    `);

    // 宠物统计
    const [petStats] = await db.query('SELECT COUNT(*) as total_pets FROM pets');

    // 收养统计
    const [adoptionStats] = await db.query(`
      SELECT COUNT(*) as total_adoptions,
             SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_count,
             SUM(CASE WHEN status = 'adopted' THEN 1 ELSE 0 END) as adopted_count
      FROM adoptions
    `);

    // 帖子统计
    const [postStats] = await db.query('SELECT COUNT(*) as total_posts FROM posts');

    // 商品统计
    const [productStats] = await db.query(`
      SELECT COUNT(*) as total_products,
             SUM(stock) as total_stock,
             SUM(sales) as total_sales
      FROM products
    `);

    // 订单统计
    const [orderStats] = await db.query(`
      SELECT COUNT(*) as total_orders,
             SUM(total_amount) as total_revenue,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders
      FROM orders
    `);

    res.json({
      success: true,
      data: {
        users: userStats[0],
        pets: petStats[0],
        adoptions: adoptionStats[0],
        posts: postStats[0],
        products: productStats[0],
        orders: orderStats[0]
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
};
