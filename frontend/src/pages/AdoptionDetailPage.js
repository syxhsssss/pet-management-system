import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Descriptions, message, Modal, Form, Input } from 'antd';
import { HeartOutlined, ArrowLeftOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { adoptionAPI } from '../services/api';

function AdoptionDetailPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adoption, setAdoption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchAdoption();
  }, [id]);

  const fetchAdoption = async () => {
    try {
      const response = await adoptionAPI.getAdoptionById(id);
      setAdoption(response.data.data);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setModalVisible(true);
  };

  const onSubmitApplication = async (values) => {
    try {
      await adoptionAPI.applyForAdoption(id, values);
      message.success('申请已提交，请等待审核');
      setModalVisible(false);
    } catch (error) {
      message.error('申请失败：' + (error.response?.data?.message || '未知错误'));
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!adoption) return <div>收养信息不存在</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/adoption')} style={{ marginBottom: 20 }}>
        返回收养列表
      </Button>

      <Card>
        <div style={{ display: 'flex', gap: 40 }}>
          <div style={{ flex: 1 }}>
            <img
              src={adoption.photos ? JSON.parse(adoption.photos)[0] : 'https://via.placeholder.com/400'}
              alt={adoption.name}
              style={{ width: '100%', borderRadius: 8 }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 28, marginBottom: 16 }}>{adoption.name}</h1>

            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{adoption.species}</Tag>
              {adoption.breed && <Tag>{adoption.breed}</Tag>}
              {adoption.age !== null && <Tag>约{adoption.age}岁</Tag>}
              {adoption.vaccinated ? <Tag color="green">已接种疫苗</Tag> : <Tag>未接种疫苗</Tag>}
              {adoption.gender === 'male' && <Tag>♂ 雄性</Tag>}
              {adoption.gender === 'female' && <Tag>♀ 雌性</Tag>}
            </div>

            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="所在地">
                <EnvironmentOutlined /> {adoption.location}
              </Descriptions.Item>
              <Descriptions.Item label="健康状况">{adoption.health_status}</Descriptions.Item>
              {adoption.color && <Descriptions.Item label="颜色">{adoption.color}</Descriptions.Item>}
              <Descriptions.Item label="联系电话">{adoption.contact_phone}</Descriptions.Item>
              <Descriptions.Item label="发布者">{adoption.publisher_name}</Descriptions.Item>
              <Descriptions.Item label="浏览次数">{adoption.views}</Descriptions.Item>
              <Descriptions.Item label="描述">{adoption.description}</Descriptions.Item>
            </Descriptions>

            <Button
              type="primary"
              size="large"
              icon={<HeartOutlined />}
              onClick={handleApply}
              block
            >
              申请收养
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        title="申请收养"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form onFinish={onSubmitApplication} layout="vertical">
          <Form.Item name="name" label="您的姓名" rules={[{ required: true }]}>
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="address" label="居住地址">
            <Input placeholder="请输入居住地址" />
          </Form.Item>
          <Form.Item name="experience" label="养宠经验">
            <Input.TextArea rows={3} placeholder="请简述您的养宠经验" />
          </Form.Item>
          <Form.Item name="reason" label="收养原因">
            <Input.TextArea rows={3} placeholder="为什么想收养这只宠物？" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交申请
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdoptionDetailPage;
