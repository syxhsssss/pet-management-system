const db = require('../config/database');

// 获取所有待收养宠物
const getAllAdoptions = async (req, res) => {
  try {
    const { species, status = 'available' } = req.query;
    let query = `
      SELECT a.*, u.username as publisher_name, u.phone as publisher_phone
      FROM adoptions a
      LEFT JOIN users u ON a.publisher_id = u.id
      WHERE a.status = ?
    `;
    const params = [status];

    if (species) {
      query += ' AND a.species = ?';
      params.push(species);
    }

    query += ' ORDER BY a.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取收养列表失败:', error);
    res.status(500).json({ success: false, message: '获取收养列表失败', error: error.message });
  }
};

// 获取单个待收养宠物详情
const getAdoptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT a.*, u.username as publisher_name, u.avatar as publisher_avatar
      FROM adoptions a
      LEFT JOIN users u ON a.publisher_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '收养信息不存在' });
    }

    // 增加浏览次数
    await db.query('UPDATE adoptions SET views = views + 1 WHERE id = ?', [id]);

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('获取收养详情失败:', error);
    res.status(500).json({ success: false, message: '获取收养详情失败', error: error.message });
  }
};

// 发布待收养宠物
const createAdoption = async (req, res) => {
  try {
    const { name, species, breed, age, gender, color, location, health_status, vaccinated, description, photos, contact_phone } = req.body;
    const publisher_id = req.user.id;

    const [result] = await db.query(`
      INSERT INTO adoptions (publisher_id, name, species, breed, age, gender, color, location, health_status, vaccinated, description, photos, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [publisher_id, name, species, breed, age, gender, color, location, health_status, vaccinated, description, JSON.stringify(photos), contact_phone]);

    res.status(201).json({ success: true, message: '发布成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('发布收养信息失败:', error);
    res.status(500).json({ success: false, message: '发布失败', error: error.message });
  }
};

// 申请收养
const applyForAdoption = async (req, res) => {
  try {
    const { adoption_id } = req.params;
    const { name, phone, address, experience, reason } = req.body;
    const applicant_id = req.user.id;

    // 检查是否已经申请过
    const [existing] = await db.query(
      'SELECT * FROM adoption_applications WHERE adoption_id = ? AND applicant_id = ?',
      [adoption_id, applicant_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '您已经申请过了' });
    }

    const [result] = await db.query(`
      INSERT INTO adoption_applications (adoption_id, applicant_id, name, phone, address, experience, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [adoption_id, applicant_id, name, phone, address, experience, reason]);

    res.status(201).json({ success: true, message: '申请提交成功，请等待审核' });
  } catch (error) {
    console.error('提交申请失败:', error);
    res.status(500).json({ success: false, message: '提交申请失败', error: error.message });
  }
};

// 获取我的收养申请
const getMyApplications = async (req, res) => {
  try {
    const applicant_id = req.user.id;
    const [rows] = await db.query(`
      SELECT aa.*, a.name as pet_name, a.species, a.photos
      FROM adoption_applications aa
      LEFT JOIN adoptions a ON aa.adoption_id = a.id
      WHERE aa.applicant_id = ?
      ORDER BY aa.created_at DESC
    `, [applicant_id]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取申请列表失败:', error);
    res.status(500).json({ success: false, message: '获取申请列表失败', error: error.message });
  }
};

// 删除待收养宠物（管理员）
const deleteAdoption = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM adoptions WHERE id = ?', [id]);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除收养信息失败:', error);
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
};

module.exports = {
  getAllAdoptions,
  getAdoptionById,
  createAdoption,
  applyForAdoption,
  getMyApplications,
  deleteAdoption
};
