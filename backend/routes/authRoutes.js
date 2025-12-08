const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { body } = require('express-validator');

// 注册
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('用户名至少3个字符'),
  body('email').isEmail().withMessage('请输入有效的邮箱'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符')
], authController.register);

// 登录
router.post('/login', authController.login);

// 获取当前用户信息（需要认证）
router.get('/me', verifyToken, authController.getCurrentUser);

// 更新用户信息
router.put('/profile', verifyToken, authController.updateProfile);

// 修改密码
router.post('/change-password', verifyToken, authController.changePassword);

// 获取所有用户（管理员）
router.get('/users', verifyToken, verifyAdmin, authController.getAllUsers);

module.exports = router;
