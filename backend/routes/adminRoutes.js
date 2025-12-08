const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');

// 所有管理员路由都需要验证管理员权限
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
};

// ==================== 宠物管理 ====================
// 获取所有宠物（包括私有）
router.get('/pets', verifyToken, isAdmin, adminController.getAllPets);

// 删除宠物
router.delete('/pets/:id', verifyToken, isAdmin, adminController.deletePet);

// ==================== 用户管理 ====================
// 获取所有用户
router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);

// 更新用户状态
router.put('/users/:id/status', verifyToken, isAdmin, adminController.updateUserStatus);

// 更新用户角色
router.put('/users/:id/role', verifyToken, isAdmin, adminController.updateUserRole);

// 删除用户
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);

// ==================== 帖子管理 ====================
// 获取所有帖子（包括私有）
router.get('/posts', verifyToken, isAdmin, adminController.getAllPosts);

// 删除帖子
router.delete('/posts/:id', verifyToken, isAdmin, adminController.deletePost);

// ==================== 收养管理 ====================
// 获取所有收养信息
router.get('/adoptions', verifyToken, isAdmin, adminController.getAllAdoptions);

// 删除收养信息
router.delete('/adoptions/:id', verifyToken, isAdmin, adminController.deleteAdoption);

// 获取所有收养申请
router.get('/adoption-applications', verifyToken, isAdmin, adminController.getAllApplications);

// 审核收养申请
router.put('/adoption-applications/:id/review', verifyToken, isAdmin, adminController.reviewApplication);

// ==================== 商品管理 ====================
// 创建商品
router.post('/products', verifyToken, isAdmin, adminController.createProduct);

// 更新商品
router.put('/products/:id', verifyToken, isAdmin, adminController.updateProduct);

// 删除商品
router.delete('/products/:id', verifyToken, isAdmin, adminController.deleteProduct);

// 获取所有订单
router.get('/orders', verifyToken, isAdmin, adminController.getAllOrders);

// 更新订单状态
router.put('/orders/:id/status', verifyToken, isAdmin, adminController.updateOrderStatus);

// ==================== 统计数据 ====================
// 获取系统统计数据
router.get('/statistics', verifyToken, isAdmin, adminController.getStatistics);

module.exports = router;
