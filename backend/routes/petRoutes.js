const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');

// 宠物相关路由
router.get('/pets', petController.getAllPets);
router.get('/pets/:id', petController.getPetById);
router.post('/pets', petController.createPet);
router.put('/pets/:id', petController.updatePet);
router.delete('/pets/:id', petController.deletePet);

module.exports = router;
