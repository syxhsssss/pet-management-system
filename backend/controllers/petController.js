const db = require('../config/database');

// 获取所有宠物
const getAllPets = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pets ORDER BY created_at DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取宠物列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取宠物列表失败',
      error: error.message
    });
  }
};

// 根据ID获取单个宠物
const getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM pets WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取宠物详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取宠物详情失败',
      error: error.message
    });
  }
};

// 创建新宠物
const createPet = async (req, res) => {
  try {
    const { name, species, breed, age, gender, color, weight, owner_name, owner_phone, description, photo_url } = req.body;

    if (!name || !species) {
      return res.status(400).json({
        success: false,
        message: '宠物名称和物种为必填项'
      });
    }

    const [result] = await db.query(
      'INSERT INTO pets (name, species, breed, age, gender, color, weight, owner_name, owner_phone, description, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, species, breed || null, age || null, gender || 'unknown', color || null, weight || null, owner_name || null, owner_phone || null, description || null, photo_url || null]
    );

    res.status(201).json({
      success: true,
      message: '宠物创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建宠物失败:', error);
    res.status(500).json({
      success: false,
      message: '创建宠物失败',
      error: error.message
    });
  }
};

// 更新宠物信息
const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, species, breed, age, gender, color, weight, owner_name, owner_phone, description, photo_url } = req.body;

    // 检查宠物是否存在
    const [existing] = await db.query('SELECT * FROM pets WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在'
      });
    }

    const [result] = await db.query(
      'UPDATE pets SET name = ?, species = ?, breed = ?, age = ?, gender = ?, color = ?, weight = ?, owner_name = ?, owner_phone = ?, description = ?, photo_url = ? WHERE id = ?',
      [name, species, breed, age, gender, color, weight, owner_name, owner_phone, description, photo_url, id]
    );

    res.json({
      success: true,
      message: '宠物信息更新成功'
    });
  } catch (error) {
    console.error('更新宠物失败:', error);
    res.status(500).json({
      success: false,
      message: '更新宠物失败',
      error: error.message
    });
  }
};

// 删除宠物
const deletePet = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查宠物是否存在
    const [existing] = await db.query('SELECT * FROM pets WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在'
      });
    }

    await db.query('DELETE FROM pets WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '宠物删除成功'
    });
  } catch (error) {
    console.error('删除宠物失败:', error);
    res.status(500).json({
      success: false,
      message: '删除宠物失败',
      error: error.message
    });
  }
};

module.exports = {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet
};
