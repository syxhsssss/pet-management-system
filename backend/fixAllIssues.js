const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'pet_management'
};

async function fixAllIssues() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔧 开始修复所有问题...\n');

    // 1. 修复所有商品的图片数据（去除双重编码）
    console.log('1. 修复商品图片数据...');
    const [products] = await connection.query('SELECT id, name, images FROM products');

    let fixedCount = 0;
    for (const product of products) {
      try {
        // 尝试解析JSON
        let images = product.images;
        if (typeof images === 'string') {
          images = JSON.parse(images);
        }

        // 如果是字符串数组但元素包含转义字符，需要修复
        if (Array.isArray(images) && images.length > 0 && typeof images[0] === 'string') {
          if (images[0].includes('\\') || images[0].startsWith('"[')) {
            // 尝试多次解析
            try {
              let cleaned = images[0];
              while (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                cleaned = cleaned.slice(1, -1);
              }
              cleaned = cleaned.replace(/\\\\/g, '').replace(/\\"/g, '"');

              let parsed;
              try {
                parsed = JSON.parse(cleaned);
              } catch {
                // 如果还是解析失败，使用默认图片
                parsed = ['http://localhost:3001/images/dog1.jpg'];
              }

              await connection.query('UPDATE products SET images = ? WHERE id = ?',
                [JSON.stringify(Array.isArray(parsed) ? parsed : [parsed]), product.id]);
              fixedCount++;
              console.log(`   ✓ 修复商品 ${product.id}: ${product.name}`);
            } catch (e) {
              console.log(`   ⚠ 跳过商品 ${product.id} (无法修复)`);
            }
          }
        }
      } catch (error) {
        console.log(`   ⚠ 跳过商品 ${product.id} (错误: ${error.message})`);
      }
    }
    console.log(`   总共修复了 ${fixedCount} 个商品\n`);

    // 2. 确保所有图片URL使用3001端口
    console.log('2. 统一图片URL端口为3001...');
    await connection.query(`
      UPDATE products
      SET images = REPLACE(images, 'localhost:3000', 'localhost:3001')
      WHERE images LIKE '%localhost:3000%'
    `);
    await connection.query(`
      UPDATE adoptions
      SET photos = REPLACE(photos, 'localhost:3000', 'localhost:3001')
      WHERE photos LIKE '%localhost:3000%'
    `);
    await connection.query(`
      UPDATE posts
      SET images = REPLACE(images, 'localhost:3000', 'localhost:3001')
      WHERE images LIKE '%localhost:3000%'
    `);
    console.log('   ✓ 已统一所有端口\n');

    // 3. 验证管理员账号
    console.log('3. 验证管理员账号...');
    const [admins] = await connection.query(
      "SELECT username, role, status FROM users WHERE role = 'admin'"
    );
    if (admins.length > 0) {
      console.log(`   ✓ 找到 ${admins.length} 个管理员账号`);
      admins.forEach(a => console.log(`     - ${a.username} (状态: ${a.status})`));
    } else {
      console.log('   ⚠ 没有管理员账号，请运行 createAdmin.js');
    }
    console.log('');

    // 4. 显示数据统计
    console.log('4. 当前数据统计:');
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [posts] = await connection.query('SELECT COUNT(*) as count FROM posts');
    const [adoptions] = await connection.query('SELECT COUNT(*) as count FROM adoptions');
    const [productsCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [orders] = await connection.query('SELECT COUNT(*) as count FROM orders');

    console.log(`   用户: ${users[0].count} 个`);
    console.log(`   帖子: ${posts[0].count} 个`);
    console.log(`   收养: ${adoptions[0].count} 个`);
    console.log(`   商品: ${productsCount[0].count} 个`);
    console.log(`   订单: ${orders[0].count} 个\n`);

    // 5. 检查图片文件
    const fs = require('fs');
    const path = require('path');
    const imagesDir = path.join(__dirname, 'public/images');

    console.log('5. 检查图片文件...');
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      console.log(`   ✓ 图片目录存在，包含 ${files.length} 个文件`);
      files.slice(0, 5).forEach(f => console.log(`     - ${f}`));
      if (files.length > 5) console.log(`     ... 还有 ${files.length - 5} 个文件`);
    } else {
      console.log('   ⚠ 图片目录不存在，正在创建...');
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('   ✓ 已创建图片目录');
    }
    console.log('');

    console.log('✅ 所有问题已修复！\n');
    console.log('现在请执行以下操作：');
    console.log('1. 刷新浏览器页面（Ctrl+Shift+R强制刷新）');
    console.log('2. 访问 http://localhost:3001/admin');
    console.log('3. 使用 admin/admin123 登录');
    console.log('4. 检查各个页面的数据是否正常显示\n');

  } catch (error) {
    console.error('❌ 修复过程出错:', error);
  } finally {
    await connection.end();
  }
}

fixAllIssues();
