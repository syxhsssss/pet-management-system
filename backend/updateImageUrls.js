const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'pet_management'
};

async function updateImageUrls() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('开始更新数据库中的图片URL（从3000端口改为3001端口）...\n');

    // 更新收养表的图片
    console.log('1. 更新收养表（adoptions）的图片...');
    const [adoptionResult] = await connection.query(`
      UPDATE adoptions
      SET photos = REPLACE(photos, 'localhost:3000', 'localhost:3001')
      WHERE photos LIKE '%localhost:3000%'
    `);
    console.log(`   ✓ 更新了 ${adoptionResult.affectedRows} 条收养记录\n`);

    // 更新帖子表的图片
    console.log('2. 更新帖子表（posts）的图片...');
    const [postResult] = await connection.query(`
      UPDATE posts
      SET images = REPLACE(images, 'localhost:3000', 'localhost:3001')
      WHERE images LIKE '%localhost:3000%'
    `);
    console.log(`   ✓ 更新了 ${postResult.affectedRows} 条帖子记录\n`);

    // 更新商品表的图片
    console.log('3. 更新商品表（products）的图片...');
    const [productResult] = await connection.query(`
      UPDATE products
      SET images = REPLACE(images, 'localhost:3000', 'localhost:3001')
      WHERE images LIKE '%localhost:3000%'
    `);
    console.log(`   ✓ 更新了 ${productResult.affectedRows} 条商品记录\n`);

    // 验证更新结果
    console.log('4. 验证更新结果...');
    const [adoptions] = await connection.query("SELECT COUNT(*) as count FROM adoptions WHERE photos LIKE '%localhost:3001%'");
    const [posts] = await connection.query("SELECT COUNT(*) as count FROM posts WHERE images LIKE '%localhost:3001%'");
    const [products] = await connection.query("SELECT COUNT(*) as count FROM products WHERE images LIKE '%localhost:3001%'");

    console.log(`   收养记录使用新端口: ${adoptions[0].count} 条`);
    console.log(`   帖子记录使用新端口: ${posts[0].count} 条`);
    console.log(`   商品记录使用新端口: ${products[0].count} 条\n`);

    console.log('✅ 所有图片URL更新完成！');
    console.log('现在可以正常访问 http://localhost:3001/admin 了\n');

  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await connection.end();
  }
}

updateImageUrls();
