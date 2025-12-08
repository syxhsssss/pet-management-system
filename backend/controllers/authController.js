const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

// 用户注册
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { username, email, password, phone, nickname } = req.body;

    // 检查用户是否已存在
    const [existing] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被注册'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, phone, nickname, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, phone || null, nickname || username, `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`]
    );

    // 生成token
    const token = generateToken(result.insertId, 'user');

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        id: result.insertId,
        username,
        email,
        nickname: nickname || username,
        token
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
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
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 检查账户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, phone, nickname, avatar, bio, role, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
};

// 更新用户信息
const updateProfile = async (req, res) => {
  try {
    const { nickname, phone, bio, avatar } = req.body;
    const userId = req.user.id;

    await db.query(
      'UPDATE users SET nickname = ?, phone = ?, bio = ?, avatar = ? WHERE id = ?',
      [nickname, phone, bio, avatar, userId]
    );

    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败',
      error: error.message
    });
  }
};

// 修改密码
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请提供旧密码和新密码'
      });
    }

    // 获取用户当前密码
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, users[0].password);

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: '旧密码错误'
      });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败',
      error: error.message
    });
  }
};

// 获取所有用户（管理员）
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, phone, nickname, avatar, bio, role, status, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  getAllUsers
};
