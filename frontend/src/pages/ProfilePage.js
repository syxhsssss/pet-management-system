import React, { useState, useEffect } from 'react';
import { Card, Avatar, Descriptions, Button, Modal, Form, Input, message, List, Tag } from 'antd';
import { UserOutlined, EditOutlined, LikeOutlined, CommentOutlined } from '@ant-design/icons';
import { authAPI, adoptionAPI, socialAPI } from '../services/api';

function ProfilePage({ user }) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyApplications();
      loadMyPosts();
    }
  }, [user]);

  const loadMyApplications = async () => {
    setApplicationsLoading(true);
    try {
      const response = await adoptionAPI.getMyApplications();
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('加载申请失败:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const loadMyPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await socialAPI.getUserPosts(user.id);
      if (response.data.success) {
        setMyPosts(response.data.data);
      }
    } catch (error) {
      console.error('加载动态失败:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleEdit = async (values) => {
    setLoading(true);
    try {
      await authAPI.updateProfile(values);
      message.success('资料更新成功，请重新登录以查看最新信息');
      setEditModalVisible(false);
    } catch (error) {
      message.error('更新失败：' + (error.response?.data?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar size={100} src={user?.avatar} icon={<UserOutlined />} />
          <div style={{ marginLeft: 24 }}>
            <h2>{user?.nickname || user?.username}</h2>
            <p style={{ color: '#666' }}>@{user?.username}</p>
          </div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ marginLeft: 'auto' }}
            onClick={() => setEditModalVisible(true)}
          >
            编辑资料
          </Button>
        </div>

        <Descriptions title="个人信息" bordered>
          <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="昵称">{user?.nickname || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色" span={2}>
            {user?.role === 'admin' ? '管理员' : '普通用户'}
          </Descriptions.Item>
          <Descriptions.Item label="个人简介" span={3}>
            {user?.bio || '这个人很懒，什么都没写'}
          </Descriptions.Item>
          <Descriptions.Item label="注册时间" span={3}>
            {user?.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="我的动态" style={{ marginTop: 24 }}>
        <List
          loading={postsLoading}
          dataSource={myPosts}
          locale={{ emptyText: '暂无动态' }}
          renderItem={(post) => {
            let images = [];
            try {
              images = post.images ? JSON.parse(post.images) : [];
            } catch (error) {
              console.error('解析图片数据失败:', error);
              images = [];
            }
            return (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div>
                      <span>{post.content}</span>
                      {post.tags && post.tags.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {post.tags.map((tag, idx) => (
                            <Tag key={idx} color="pink" style={{ marginRight: 4 }}>
                              {tag.name}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      {images.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 8 }}>
                          {images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt=""
                              style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                            />
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 16, color: '#999', marginTop: 8 }}>
                        <span><LikeOutlined /> {post.likes_count || 0}</span>
                        <span><CommentOutlined /> {post.comments_count || 0}</span>
                        <span>{new Date(post.created_at).toLocaleString('zh-CN')}</span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Card title="我的申请" style={{ marginTop: 24 }}>
        <List
          loading={applicationsLoading}
          dataSource={applications}
          locale={{ emptyText: '暂无收养申请' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={`申请收养: ${item.pet_name || '未知宠物'}`}
                description={
                  <div>
                    <p>联系人: {item.name} | 电话: {item.phone}</p>
                    <p>申请时间: {new Date(item.created_at).toLocaleString('zh-CN')}</p>
                  </div>
                }
              />
              <div>
                <Tag color={
                  item.status === 'approved' ? 'success' :
                  item.status === 'rejected' ? 'error' : 'warning'
                }>
                  {item.status === 'approved' ? '已通过' :
                   item.status === 'rejected' ? '已拒绝' : '待审核'}
                </Tag>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="编辑个人资料"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleEdit}
          initialValues={{
            nickname: user?.nickname,
            phone: user?.phone,
            bio: user?.bio,
            avatar: user?.avatar
          }}
        >
          <Form.Item label="昵称" name="nickname">
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="头像URL" name="avatar">
            <Input placeholder="请输入头像链接" />
          </Form.Item>

          <Form.Item label="个人简介" name="bio">
            <Input.TextArea rows={4} placeholder="介绍一下自己吧" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProfilePage;
