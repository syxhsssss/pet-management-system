const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');
const { verifyToken, verifyAdmin, optionalAuth } = require('../middleware/auth');

// 获取所有待收养宠物（公开）
router.get('/adoptions', adoptionController.getAllAdoptions);

// 获取待收养宠物详情
router.get('/adoptions/:id', adoptionController.getAdoptionById);

// 发布待收养宠物（需要登录）
router.post('/adoptions', verifyToken, adoptionController.createAdoption);

// 删除待收养宠物（管理员）
router.delete('/adoptions/:id', verifyToken, verifyAdmin, adoptionController.deleteAdoption);

// 申请收养（需要登录）
router.post('/adoptions/:adoption_id/apply', verifyToken, adoptionController.applyForAdoption);

// 获取我的收养申请
router.get('/my-applications', verifyToken, adoptionController.getMyApplications);

module.exports = router;
