const db = require('../config/database');

// 获取所有商品
const getAllProducts = async (req, res) => {
  try {
    const { category, search, sort = 'sales' } = req.query;
    let query = 'SELECT * FROM products WHERE status = "active"';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 排序
    if (sort === 'sales') {
      query += ' ORDER BY sales DESC';
    } else if (sort === 'price_asc') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    }

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({ success: false, message: '获取商品列表失败', error: error.message });
  }
};

// 获取商品详情
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({ success: false, message: '获取商品详情失败', error: error.message });
  }
};

// 获取购物车
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT c.*, p.name, p.price, p.stock, p.images
      FROM cart_items c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取购物车失败:', error);
    res.status(500).json({ success: false, message: '获取购物车失败', error: error.message });
  }
};

// 添加到购物车
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const userId = req.user.id;

    // 检查商品是否存在且有库存
    const [products] = await db.query('SELECT * FROM products WHERE id = ? AND status = "active"', [product_id]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    if (products[0].stock < quantity) {
      return res.status(400).json({ success: false, message: '库存不足' });
    }

    // 检查是否已经在购物车中
    const [existing] = await db.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existing.length > 0) {
      // 更新数量
      await db.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, product_id]
      );
    } else {
      // 新增
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, product_id, quantity]
      );
    }

    res.json({ success: true, message: '已添加到购物车' });
  } catch (error) {
    console.error('添加购物车失败:', error);
    res.status(500).json({ success: false, message: '添加购物车失败', error: error.message });
  }
};

// 更新购物车商品数量
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, userId]
    );

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新购物车失败:', error);
    res.status(500).json({ success: false, message: '更新失败', error: error.message });
  }
};

// 删除购物车商品
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除购物车失败:', error);
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
};

// 创建订单
const createOrder = async (req, res) => {
  try {
    const { items, shipping_address, recipient_name, recipient_phone, notes } = req.body;
    const userId = req.user.id;

    // 生成订单号
    const order_no = 'PET' + Date.now() + Math.floor(Math.random() * 1000);

    // 计算总金额
    let total_amount = 0;
    for (const item of items) {
      const [products] = await db.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      if (products.length > 0) {
        total_amount += products[0].price * item.quantity;
      }
    }

    // 创建订单
    const [orderResult] = await db.query(`
      INSERT INTO orders (order_no, user_id, total_amount, shipping_address, recipient_name, recipient_phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [order_no, userId, total_amount, shipping_address, recipient_name, recipient_phone, notes]);

    const orderId = orderResult.insertId;

    // 插入订单详情
    for (const item of items) {
      const [products] = await db.query('SELECT name, price FROM products WHERE id = ?', [item.product_id]);
      if (products.length > 0) {
        await db.query(`
          INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [orderId, item.product_id, products[0].name, products[0].price, item.quantity, products[0].price * item.quantity]);

        // 减少库存
        await db.query('UPDATE products SET stock = stock - ?, sales = sales + ? WHERE id = ?', [item.quantity, item.quantity, item.product_id]);
      }
    }

    // 清空购物车
    await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id IN (?)', [userId, items.map(i => i.product_id)]);

    res.status(201).json({ success: true, message: '订单创建成功', data: { order_no, order_id: orderId } });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ success: false, message: '创建订单失败', error: error.message });
  }
};

// 获取我的订单
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT o.*,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('product_name', oi.product_name, 'price', oi.price, 'quantity', oi.quantity, 'subtotal', oi.subtotal))
         FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ success: false, message: '获取订单列表失败', error: error.message });
  }
};

// 获取所有订单（管理员）
const getAllOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*
      FROM orders o
      ORDER BY o.created_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取所有订单失败:', error);
    res.status(500).json({ success: false, message: '获取所有订单失败', error: error.message });
  }
};

// 创建商品（管理员）
const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description, images, tags } = req.body;

    const [result] = await db.query(`
      INSERT INTO products (name, category, price, stock, description, images, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, category, price, stock, description || null, images || null, tags || null]);

    res.status(201).json({
      success: true,
      message: '商品创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({ success: false, message: '创建商品失败', error: error.message });
  }
};

// 更新商品（管理员）
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description, images, tags } = req.body;

    await db.query(`
      UPDATE products
      SET name = ?, category = ?, price = ?, stock = ?, description = ?, images = ?, tags = ?
      WHERE id = ?
    `, [name, category, price, stock, description, images, tags, id]);

    res.json({ success: true, message: '商品更新成功' });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({ success: false, message: '更新商品失败', error: error.message });
  }
};

// 删除商品（管理员）
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 软删除：设置状态为 inactive
    await db.query('UPDATE products SET status = "inactive" WHERE id = ?', [id]);

    res.json({ success: true, message: '商品删除成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({ success: false, message: '删除商品失败', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  createOrder,
  getMyOrders,
  getAllOrders,
  createProduct,
  updateProduct,
  deleteProduct
};
