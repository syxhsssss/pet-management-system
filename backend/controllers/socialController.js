const db = require('../config/database');

// 获取所有动态（带分页）
const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(`
      SELECT p.*, u.username, u.nickname, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as actual_likes_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_public = TRUE AND u.role != 'admin'
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    // 为每个帖子获取标签
    for (let post of rows) {
      const [tags] = await db.query(`
        SELECT t.id, t.name
        FROM tags t
        INNER JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
      `, [post.id]);
      post.tags = tags;
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取动态列表失败:', error);
    res.status(500).json({ success: false, message: '获取动态列表失败', error: error.message });
  }
};

// 获取单个动态详情
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [rows] = await db.query(`
      SELECT p.*, u.username, u.nickname, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as actual_likes_count,
        ${userId ? `(SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ${userId}) as user_liked` : '0 as user_liked'}
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '动态不存在' });
    }

    // 获取评论
    const [comments] = await db.query(`
      SELECT c.*, u.username, u.nickname, u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    const post = rows[0];
    post.comments = comments;

    // 增加浏览次数
    await db.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('获取动态详情失败:', error);
    res.status(500).json({ success: false, message: '获取动态详情失败', error: error.message });
  }
};

// 创建动态
const createPost = async (req, res) => {
  try {
    const { pet_id, content, images, location, tags } = req.body;
    const userId = req.user.id;

    if (!content && (!images || images.length === 0)) {
      return res.status(400).json({ success: false, message: '请提供内容或图片' });
    }

    // 如果images已经是字符串（前端已经JSON.stringify过），就直接使用
    // 如果是数组，则转换为字符串
    const imagesStr = typeof images === 'string' ? images : JSON.stringify(images || []);

    const [result] = await db.query(`
      INSERT INTO posts (user_id, pet_id, content, images, location)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, pet_id || null, content, imagesStr, location]);

    const postId = result.insertId;

    // 处理标签
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        // 查找或创建标签
        const [existingTags] = await db.query('SELECT id FROM tags WHERE name = ?', [tagName]);
        let tagId;

        if (existingTags.length > 0) {
          tagId = existingTags[0].id;
          // 增加标签使用次数
          await db.query('UPDATE tags SET use_count = use_count + 1 WHERE id = ?', [tagId]);
        } else {
          // 创建新标签
          const [newTag] = await db.query('INSERT INTO tags (name, use_count) VALUES (?, 1)', [tagName]);
          tagId = newTag.insertId;
        }

        // 关联帖子和标签
        await db.query('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagId]);
      }
    }

    res.status(201).json({ success: true, message: '发布成功', data: { id: postId } });
  } catch (error) {
    console.error('发布动态失败:', error);
    res.status(500).json({ success: false, message: '发布失败', error: error.message });
  }
};

// 删除动态
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查权限
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [id, userId]);

    if (posts.length === 0) {
      return res.status(403).json({ success: false, message: '无权删除此动态' });
    }

    await db.query('DELETE FROM posts WHERE id = ?', [id]);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除动态失败:', error);
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
};

// 点赞/取消点赞
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查是否已点赞
    const [existing] = await db.query(
      'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      // 取消点赞
      await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, id]);
      await db.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [id]);
      res.json({ success: true, message: '取消点赞', liked: false });
    } else {
      // 点赞
      await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, id]);
      await db.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [id]);
      res.json({ success: true, message: '点赞成功', liked: true });
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({ success: false, message: '操作失败', error: error.message });
  }
};

// 添加评论
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parent_id } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: '评论内容不能为空' });
    }

    const [result] = await db.query(`
      INSERT INTO comments (post_id, user_id, content, parent_id)
      VALUES (?, ?, ?, ?)
    `, [id, userId, content, parent_id || null]);

    // 更新评论数
    await db.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [id]);

    res.status(201).json({ success: true, message: '评论成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({ success: false, message: '评论失败', error: error.message });
  }
};

// 获取用户的动态
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(`
      SELECT p.*, u.username, u.nickname, u.avatar
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.is_public = TRUE
      ORDER BY p.created_at DESC
    `, [userId]);

    // 为每个帖子获取标签
    for (let post of rows) {
      const [tags] = await db.query(`
        SELECT t.id, t.name
        FROM tags t
        INNER JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
      `, [post.id]);
      post.tags = tags;
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取用户动态失败:', error);
    res.status(500).json({ success: false, message: '获取用户动态失败', error: error.message });
  }
};

// 获取所有标签
const getAllTags = async (req, res) => {
  try {
    const [tags] = await db.query('SELECT * FROM tags ORDER BY use_count DESC, name ASC');
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('获取标签失败:', error);
    res.status(500).json({ success: false, message: '获取标签失败', error: error.message });
  }
};

// 获取热门标签（用于管理后台统计）
const getPopularTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [tags] = await db.query('SELECT * FROM tags ORDER BY use_count DESC LIMIT ?', [limit]);
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('获取热门标签失败:', error);
    res.status(500).json({ success: false, message: '获取热门标签失败', error: error.message });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  getUserPosts,
  getAllTags,
  getPopularTags
};
