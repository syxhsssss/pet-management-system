const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'pet_management'
};

async function replaceAllImagesWithLocal() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔄 开始替换所有图片链接...\n');

    // 1. 替换商品图片为本地图片
    console.log('1. 更新商品图片...');
    const products = [
      { id: 1, images: JSON.stringify(['http://localhost:3001/images/dog1.jpg']) },
      { id: 2, images: JSON.stringify(['http://localhost:3001/images/cat1.jpg']) },
      { id: 3, images: JSON.stringify(['http://localhost:3001/images/dog2.jpg']) },
      { id: 4, images: JSON.stringify(['http://localhost:3001/images/cat2.jpg']) },
      { id: 5, images: JSON.stringify(['http://localhost:3001/images/dog3.jpg']) },
      { id: 6, images: JSON.stringify(['http://localhost:3001/images/dog1.jpg']) },
      { id: 7, images: JSON.stringify(['http://localhost:3001/images/cat1.jpg']) },
      { id: 8, images: JSON.stringify(['http://localhost:3001/images/dog2.jpg']) },
      { id: 9, images: JSON.stringify(['http://localhost:3001/images/cat2.jpg']) },
      { id: 10, images: JSON.stringify(['http://localhost:3001/images/dog3.jpg']) },
      { id: 11, images: JSON.stringify(['http://localhost:3001/images/dog1.jpg']) },
      { id: 12, images: JSON.stringify(['http://localhost:3001/images/cat1.jpg']) },
      { id: 13, images: JSON.stringify(['http://localhost:3001/images/dog2.jpg']) }
    ];

    for (const product of products) {
      try {
        await connection.query('UPDATE products SET images = ? WHERE id = ?', [product.images, product.id]);
        console.log(`   ✓ 商品 ${product.id} 图片已更新`);
      } catch (e) {
        console.log(`   ⚠ 商品 ${product.id} 不存在或更新失败`);
      }
    }

    // 2. 替换收养宠物图片
    console.log('\n2. 更新收养宠物图片...');
    await connection.query(`
      UPDATE adoptions SET photos = JSON_ARRAY('http://localhost:3001/images/dog1.jpg')
      WHERE species = '狗' AND id % 3 = 1
    `);
    await connection.query(`
      UPDATE adoptions SET photos = JSON_ARRAY('http://localhost:3001/images/dog2.jpg')
      WHERE species = '狗' AND id % 3 = 2
    `);
    await connection.query(`
      UPDATE adoptions SET photos = JSON_ARRAY('http://localhost:3001/images/dog3.jpg')
      WHERE species = '狗' AND id % 3 = 0
    `);
    await connection.query(`
      UPDATE adoptions SET photos = JSON_ARRAY('http://localhost:3001/images/cat1.jpg')
      WHERE species = '猫' AND id % 2 = 1
    `);
    await connection.query(`
      UPDATE adoptions SET photos = JSON_ARRAY('http://localhost:3001/images/cat2.jpg')
      WHERE species = '猫' AND id % 2 = 0
    `);
    console.log('   ✓ 所有收养宠物图片已更新');

    // 3. 替换帖子图片
    console.log('\n3. 更新帖子图片...');
    await connection.query(`
      UPDATE posts SET images = JSON_ARRAY('http://localhost:3001/images/dog1.jpg')
      WHERE id % 5 = 1 AND images != '[]'
    `);
    await connection.query(`
      UPDATE posts SET images = JSON_ARRAY('http://localhost:3001/images/dog2.jpg')
      WHERE id % 5 = 2 AND images != '[]'
    `);
    await connection.query(`
      UPDATE posts SET images = JSON_ARRAY('http://localhost:3001/images/dog3.jpg')
      WHERE id % 5 = 3 AND images != '[]'
    `);
    await connection.query(`
      UPDATE posts SET images = JSON_ARRAY('http://localhost:3001/images/cat1.jpg')
      WHERE id % 5 = 4 AND images != '[]'
    `);
    await connection.query(`
      UPDATE posts SET images = JSON_ARRAY('http://localhost:3001/images/cat2.jpg')
      WHERE id % 5 = 0 AND images != '[]'
    `);
    console.log('   ✓ 所有帖子图片已更新');

    // 4. 验证结果
    console.log('\n4. 验证更新结果...');
    const [products2] = await connection.query('SELECT COUNT(*) as count FROM products WHERE images LIKE "%localhost:3001%"');
    const [adoptions] = await connection.query('SELECT COUNT(*) as count FROM adoptions WHERE photos LIKE "%localhost:3001%"');
    const [posts] = await connection.query('SELECT COUNT(*) as count FROM posts WHERE images LIKE "%localhost:3001%"');

    console.log(`   商品使用本地图片: ${products2[0].count} 个`);
    console.log(`   收养使用本地图片: ${adoptions[0].count} 个`);
    console.log(`   帖子使用本地图片: ${posts[0].count} 个`);

    console.log('\n✅ 所有图片已替换为本地图片！');
    console.log('\n现在所有图片都使用 localhost:3001/images/，加载速度极快！');

  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await connection.end();
  }
}

replaceAllImagesWithLocal();
