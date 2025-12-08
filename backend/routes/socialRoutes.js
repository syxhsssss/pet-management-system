const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// 动态列表（公开，但登录后可以看到是否已点赞）
router.get('/posts', optionalAuth, socialController.getAllPosts);

// 动态详情
router.get('/posts/:id', optionalAuth, socialController.getPostById);

// 用户的动态
router.get('/users/:userId/posts', socialController.getUserPosts);

// 创建动态（需要登录）
router.post('/posts', verifyToken, socialController.createPost);

// 删除动态（需要登录）
router.delete('/posts/:id', verifyToken, socialController.deletePost);

// 点赞/取消点赞（需要登录）
router.post('/posts/:id/like', verifyToken, socialController.toggleLike);

// 添加评论（需要登录）
router.post('/posts/:id/comments', verifyToken, socialController.addComment);

// 获取所有标签
router.get('/tags', socialController.getAllTags);

// 获取热门标签
router.get('/tags/popular', socialController.getPopularTags);

module.exports = router;
