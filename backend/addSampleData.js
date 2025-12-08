const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'pet_management'
};

async function addSampleAdoptions() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('开始添加示例收养数据...');

    // 获取用户ID
    const [users] = await connection.query('SELECT id FROM users LIMIT 5');
    if (users.length === 0) {
      console.log('没有找到用户，请先创建用户');
      return;
    }

    const adoptions = [
      {
        publisher_id: users[0].id,
        name: '小黄',
        species: '狗',
        breed: '金毛',
        age: 24, // 24个月 = 2岁
        gender: 'male',
        color: '金黄色',
        location: '北京市朝阳区',
        health_status: 'healthy',
        vaccinated: 1,
        description: '性格温顺，喜欢和人玩耍，因主人工作原因无法继续照顾',
        photos: JSON.stringify(['http://localhost:3001/images/dog1.jpg']),
        contact_phone: '13800138001'
      },
      {
        publisher_id: users[1]?.id || users[0].id,
        name: '咪咪',
        species: '猫',
        breed: '英短',
        age: 12, // 12个月 = 1岁
        gender: 'female',
        color: '蓝色',
        location: '上海市浦东新区',
        health_status: 'healthy',
        vaccinated: 1,
        description: '非常可爱的小猫，已绝育，寻找爱心家庭',
        photos: JSON.stringify(['http://localhost:3001/images/cat1.jpg']),
        contact_phone: '13900139002'
      },
      {
        publisher_id: users[2]?.id || users[0].id,
        name: '大黑',
        species: '狗',
        breed: '拉布拉多',
        age: 36, // 36个月 = 3岁
        gender: 'male',
        color: '黑色',
        location: '广州市天河区',
        health_status: 'healthy',
        vaccinated: 1,
        description: '忠诚的伙伴，适合有院子的家庭',
        photos: JSON.stringify(['http://localhost:3001/images/dog2.jpg']),
        contact_phone: '13700137003'
      },
      {
        publisher_id: users[3]?.id || users[0].id,
        name: '橘子',
        species: '猫',
        breed: '橘猫',
        age: 6, // 6个月
        gender: 'male',
        color: '橘黄色',
        location: '深圳市南山区',
        health_status: 'healthy',
        vaccinated: 0,
        description: '活泼可爱的小橘猫，等待新家',
        photos: JSON.stringify(['http://localhost:3001/images/cat2.jpg']),
        contact_phone: '13600136004'
      },
      {
        publisher_id: users[4]?.id || users[0].id,
        name: '二哈',
        species: '狗',
        breed: '哈士奇',
        age: 18, // 18个月 = 1.5岁
        gender: 'female',
        color: '黑白',
        location: '杭州市西湖区',
        health_status: 'healthy',
        vaccinated: 1,
        description: '精力充沛,需要有时间陪伴的主人',
        photos: JSON.stringify(['http://localhost:3001/images/dog3.jpg']),
        contact_phone: '13500135005'
      }
    ];

    for (const adoption of adoptions) {
      const [result] = await connection.query(
        `INSERT INTO adoptions (publisher_id, name, species, breed, age, gender, color, location, health_status, vaccinated, description, photos, contact_phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
        [
          adoption.publisher_id,
          adoption.name,
          adoption.species,
          adoption.breed,
          adoption.age,
          adoption.gender,
          adoption.color,
          adoption.location,
          adoption.health_status,
          adoption.vaccinated,
          adoption.description,
          adoption.photos,
          adoption.contact_phone
        ]
      );
      console.log(`添加收养宠物: ${adoption.name} (ID: ${result.insertId})`);
    }

    console.log('完成！成功添加所有示例收养数据');
  } catch (error) {
    console.error('添加失败:', error);
  } finally {
    await connection.end();
  }
}

addSampleAdoptions();
