const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'pet_management'
};

async function createUsersAndPosts() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('开始创建用户和帖子...');

    // 创建多个用户
    const users = [
      { username: 'petlover01', email: 'petlover01@example.com', nickname: '爱宠小天使', password: await bcrypt.hash('password123', 10) },
      { username: 'catmom', email: 'catmom@example.com', nickname: '猫咪妈妈', password: await bcrypt.hash('password123', 10) },
      { username: 'dogdad', email: 'dogdad@example.com', nickname: '狗狗爸爸', password: await bcrypt.hash('password123', 10) },
      { username: 'animalfriend', email: 'animalfriend@example.com', nickname: '动物之友', password: await bcrypt.hash('password123', 10) },
      { username: 'petsitter', email: 'petsitter@example.com', nickname: '宠物保姆', password: await bcrypt.hash('password123', 10) }
    ];

    const userIds = [];
    for (const user of users) {
      const [existing] = await connection.query('SELECT id FROM users WHERE username = ?', [user.username]);
      if (existing.length === 0) {
        const [result] = await connection.query(
          'INSERT INTO users (username, email, nickname, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
          [user.username, user.email, user.nickname, user.password, 'user', 'active']
        );
        userIds.push(result.insertId);
        console.log(`创建用户: ${user.nickname}`);
      } else {
        userIds.push(existing[0].id);
        console.log(`用户已存在: ${user.nickname}`);
      }
    }

    // 创建帖子（使用本地图片URL）
    const posts = [
      {
        userId: userIds[0],
        content: '今天带我家金毛去公园玩啦！它超级开心，一直在草地上打滚😊',
        images: JSON.stringify(['http://localhost:3001/images/dog1.jpg']),
        tags: ['萌宠日常', '可爱瞬间']
      },
      {
        userId: userIds[1],
        content: '我家橘猫又胖了，每天除了吃就是睡，真是让人操心啊🐱',
        images: JSON.stringify(['http://localhost:3001/images/cat2.jpg']),
        tags: ['萌宠日常', '喂养经验']
      },
      {
        userId: userIds[2],
        content: '刚学会的训练技巧，分享给大家！让狗狗学会握手其实很简单',
        images: JSON.stringify(['http://localhost:3001/images/dog2.jpg']),
        tags: ['训练技巧', '分享']
      },
      {
        userId: userIds[3],
        content: '请问大家，猫咪不喝水怎么办？试过很多办法都不行😢',
        images: JSON.stringify([]),
        tags: ['求助', '健康护理']
      },
      {
        userId: userIds[4],
        content: '新买的猫爬架终于到了！我家主子非常喜欢，推荐给大家',
        images: JSON.stringify(['http://localhost:3001/images/cat1.jpg']),
        tags: ['宠物用品', '分享']
      },
      {
        userId: userIds[0],
        content: '今天是我家狗狗的生日🎂给它准备了特制的狗粮蛋糕！',
        images: JSON.stringify(['http://localhost:3001/images/dog3.jpg']),
        tags: ['萌宠日常', '可爱瞬间']
      },
      {
        userId: userIds[1],
        content: '分享一下猫咪洗澡的小技巧，让主子不再害怕洗澡',
        images: JSON.stringify(['http://localhost:3001/images/cat1.jpg']),
        tags: ['健康护理', '分享']
      },
      {
        userId: userIds[2],
        content: '带狗狗去宠物医院打疫苗啦，记得每年都要按时接种哦！',
        images: JSON.stringify(['http://localhost:3001/images/dog1.jpg']),
        tags: ['健康护理', '喂养经验']
      }
    ];

    for (const post of posts) {
      const [result] = await connection.query(
        'INSERT INTO posts (user_id, content, images, is_public, created_at) VALUES (?, ?, ?, ?, NOW())',
        [post.userId, post.content, post.images, true]
      );

      const postId = result.insertId;

      // 添加标签
      if (post.tags && post.tags.length > 0) {
        for (const tagName of post.tags) {
          const [existingTags] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);
          let tagId;

          if (existingTags.length > 0) {
            tagId = existingTags[0].id;
            await connection.query('UPDATE tags SET use_count = use_count + 1 WHERE id = ?', [tagId]);
          } else {
            const [newTag] = await connection.query('INSERT INTO tags (name, use_count) VALUES (?, 1)', [tagName]);
            tagId = newTag.insertId;
          }

          await connection.query('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagId]);
        }
      }

      console.log(`创建帖子: ${post.content.substring(0, 20)}...`);
    }

    console.log('完成！成功创建所有用户和帖子');
  } catch (error) {
    console.error('创建失败:', error);
  } finally {
    await connection.end();
  }
}

createUsersAndPosts();
