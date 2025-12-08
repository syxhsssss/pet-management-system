const bcrypt = require('bcryptjs');
const db = require('./config/database');

// 创建管理员账号
async function createAdmin() {
  try {
    console.log('开始创建管理员账号...');

    // 检查管理员是否已存在
    const [existingAdmin] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      ['admin', 'admin@petworld.com']
    );

    if (existingAdmin.length > 0) {
      console.log('管理员账号已存在！');
      console.log('用户名: admin');
      console.log('邮箱: admin@petworld.com');
      console.log('密码: admin123');
      process.exit(0);
    }

    // 生成密码哈希
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 插入管理员账号
    await db.query(
      `INSERT INTO users (username, email, password, nickname, role, avatar, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'admin',
        'admin@petworld.com',
        hashedPassword,
        '系统管理员',
        'admin',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        '宠物世界系统管理员'
      ]
    );

    console.log('\n✅ 管理员账号创建成功！\n');
    console.log('====================================');
    console.log('  管理员登录信息');
    console.log('====================================');
    console.log('  用户名: admin');
    console.log('  邮箱: admin@petworld.com');
    console.log('  密码: admin123');
    console.log('====================================\n');
    console.log('请登录后台管理系统：http://localhost:3002/admin');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('创建管理员账号失败:', error);
    process.exit(1);
  }
}

// 运行
createAdmin();
