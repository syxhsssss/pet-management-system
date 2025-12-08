import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Button, Modal, Form, Input, message, Select, Empty } from 'antd';
import { HeartOutlined, EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import { adoptionAPI } from '../services/api';

function AdoptionPage({ user }) {
  const navigate = useNavigate();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAdoption, setSelectedAdoption] = useState(null);

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    try {
      const response = await adoptionAPI.getAllAdoptions({ status: 'available' });
      setAdoptions(response.data.data);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (adoption, e) => {
    e.stopPropagation();
    if (!user) {
      message.warning('请先登录');
      return;
    }
    setSelectedAdoption(adoption);
    setModalVisible(true);
  };

  const onSubmitApplication = async (values) => {
    try {
      await adoptionAPI.applyForAdoption(selectedAdoption.id, values);
      message.success('申请已提交，请等待审核');
      setModalVisible(false);
    } catch (error) {
      message.error('申请失败：' + (error.response?.data?.message || '未知错误'));
    }
  };

  return (
    <div>
      <h1>🏠 宠物收养</h1>
      <p style={{ marginBottom: 24 }}>给它们一个温暖的家</p>

      {adoptions.length === 0 && !loading ? (
        <Empty description="暂无待收养宠物" />
      ) : (
        <Row gutter={[24, 24]}>
          {adoptions.map((adoption) => (
            <Col key={adoption.id} xs={24} sm={12} md={8}>
              <Card
                hoverable
                onClick={() => navigate(`/adoption/${adoption.id}`)}
                cover={
                  <img
                    alt={adoption.name}
                    src={adoption.photos ? JSON.parse(adoption.photos)[0] : 'http://localhost:3001/images/dog1.jpg'}
                    style={{ height: 200, objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'http://localhost:3001/images/dog1.jpg';
                    }}
                  />
                }
              >
                <Card.Meta
                  title={<span style={{ fontSize: 18 }}>{adoption.name}</span>}
                  description={
                    <div>
                      <Tag color="blue">{adoption.species}</Tag>
                      {adoption.breed && <Tag>{adoption.breed}</Tag>}
                      {adoption.age && <Tag>约{adoption.age}岁</Tag>}
                      {adoption.vaccinated && <Tag color="green">已接种疫苗</Tag>}
                      <div style={{ marginTop: 12 }}>
                        <EnvironmentOutlined /> {adoption.location}
                      </div>
                      <div style={{ marginTop: 8, color: '#666' }}>
                        {adoption.description}
                      </div>
                    </div>
                  }
                />
                <Button
                  type="primary"
                  icon={<HeartOutlined />}
                  block
                  style={{ marginTop: 16 }}
                  onClick={(e) => handleApply(adoption, e)}
                >
                  申请收养
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}

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

export default AdoptionPage;
