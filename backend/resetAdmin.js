const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function resetAdminPassword() {
  try {
    console.log('正在重置管理员密码...');

    // 生成新密码哈希
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('新密码哈希:', hashedPassword);

    // 更新数据库
    await db.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );

    console.log('\n✅ 管理员密码重置成功！');
    console.log('用户名: admin');
    console.log('密码: admin123');

    process.exit(0);
  } catch (error) {
    console.error('重置失败:', error);
    process.exit(1);
  }
}

resetAdminPassword();
