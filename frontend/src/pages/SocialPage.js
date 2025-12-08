import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Input, message, Empty, Modal, Form, List, Select, Tag } from 'antd';
import { LikeOutlined, CommentOutlined, HeartFilled, PlusOutlined } from '@ant-design/icons';
import { socialAPI } from '../services/api';

const { TextArea } = Input;

function SocialPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [tags, setTags] = useState([]);
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();

  useEffect(() => {
    fetchPosts();
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await socialAPI.getTags();
      setTags(response.data.data || []);
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await socialAPI.getAllPosts();
      setPosts(response.data.data);
    } catch (error) {
      message.error('加载动态失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      message.warning('请先登录');
      return;
    }

    try {
      await socialAPI.toggleLike(postId);
      fetchPosts();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handlePostSubmit = async (values) => {
    try {
      // 验证图片URL格式
      if (values.images) {
        const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i;
        if (!urlPattern.test(values.images)) {
          message.error('图片URL格式不正确，请输入有效的图片链接（如：https://example.com/image.jpg）');
          return;
        }
      }

      await socialAPI.createPost({
        content: values.content,
        images: values.images ? JSON.stringify([values.images]) : null,
        tags: values.tags || []
      });
      message.success('发布成功');
      setPostModalVisible(false);
      form.resetFields();
      fetchPosts();
      fetchTags(); // 重新加载标签以更新使用次数
    } catch (error) {
      message.error('发布失败：' + (error.response?.data?.message || '未知错误'));
    }
  };

  const handleShowComments = async (post) => {
    if (!user) {
      message.warning('请先登录');
      return;
    }
    setSelectedPost(post);
    setCommentModalVisible(true);
    try {
      const response = await socialAPI.getPostById(post.id);
      setComments(response.data.data.comments || []);
    } catch (error) {
      message.error('加载评论失败');
    }
  };

  const handleCommentSubmit = async (values) => {
    try {
      await socialAPI.addComment(selectedPost.id, { content: values.content });
      message.success('评论成功');
      commentForm.resetFields();
      // 重新加载评论
      const response = await socialAPI.getPostById(selectedPost.id);
      setComments(response.data.data.comments || []);
      fetchPosts();
    } catch (error) {
      message.error('评论失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>📸 宠物动态</h1>
          <p>分享你和爱宠的快乐时光</p>
        </div>
        {user && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setPostModalVisible(true)}
          >
            发布动态
          </Button>
        )}
      </div>

      {posts.length === 0 && !loading ? (
        <Empty description="暂无动态，快来发布第一条吧！" />
      ) : (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {posts.map((post) => {
            let images = [];
            try {
              images = post.images ? JSON.parse(post.images) : [];
            } catch (error) {
              console.error('解析图片数据失败:', error);
              images = [];
            }
            return (
              <Card key={post.id} style={{ marginBottom: 24 }}>
                <Card.Meta
                  avatar={<Avatar src={post.avatar}>{post.nickname?.[0]}</Avatar>}
                  title={post.nickname || post.username}
                  description={new Date(post.created_at).toLocaleString('zh-CN')}
                />
                <div style={{ marginTop: 16 }}>
                  <p>{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div style={{ marginTop: 8, marginBottom: 12 }}>
                      {post.tags.map((tag, idx) => (
                        <Tag key={idx} color="pink" style={{ marginBottom: 4 }}>
                          {tag.name}
                        </Tag>
                      ))}
                    </div>
                  )}
                  {images.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt=""
                          style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                  <Button
                    type="text"
                    icon={post.user_liked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <LikeOutlined />}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.likes_count || 0}
                  </Button>
                  <Button
                    type="text"
                    icon={<CommentOutlined />}
                    onClick={() => handleShowComments(post)}
                  >
                    {post.comments_count || 0}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 发布动态弹窗 */}
      <Modal
        title="发布动态"
        open={postModalVisible}
        onCancel={() => setPostModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handlePostSubmit} layout="vertical">
          <Form.Item
            name="content"
            label="分享你的想法"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={4} placeholder="分享你和爱宠的快乐时光..." />
          </Form.Item>
          <Form.Item name="images" label="图片链接（可选）">
            <Input placeholder="输入图片URL" />
          </Form.Item>
          <Form.Item name="tags" label="标签（可选）">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="选择或输入标签"
              maxTagCount={5}
            >
              {tags.map(tag => (
                <Select.Option key={tag.id} value={tag.name}>
                  {tag.name} {tag.use_count > 0 && `(${tag.use_count})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              发布
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 评论弹窗 */}
      <Modal
        title="评论"
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{comment.nickname?.[0] || comment.username?.[0]}</Avatar>}
                title={comment.nickname || comment.username}
                description={
                  <>
                    <div>{comment.content}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {new Date(comment.created_at).toLocaleString('zh-CN')}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无评论' }}
          style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}
        />
        <Form form={commentForm} onFinish={handleCommentSubmit}>
          <Form.Item name="content" rules={[{ required: true, message: '请输入评论内容' }]}>
            <TextArea rows={2} placeholder="写下你的评论..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              发表评论
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SocialPage;
