const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 商品相关（公开）
router.get('/products', shopController.getAllProducts);
router.get('/products/:id', shopController.getProductById);

// 商品管理（管理员）
router.post('/products', verifyToken, verifyAdmin, shopController.createProduct);
router.put('/products/:id', verifyToken, verifyAdmin, shopController.updateProduct);
router.delete('/products/:id', verifyToken, verifyAdmin, shopController.deleteProduct);

// 购物车（需要登录）
router.get('/cart', verifyToken, shopController.getCart);
router.post('/cart', verifyToken, shopController.addToCart);
router.put('/cart/:id', verifyToken, shopController.updateCartItem);
router.delete('/cart/:id', verifyToken, shopController.removeFromCart);

// 订单（需要登录）
router.post('/orders', verifyToken, shopController.createOrder);
router.get('/my-orders', verifyToken, shopController.getMyOrders);
router.get('/orders/all', verifyToken, verifyAdmin, shopController.getAllOrders);

module.exports = router;
