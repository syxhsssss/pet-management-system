import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(values);
      message.success('注册成功！请登录');
      navigate('/login');
    } catch (error) {
      message.error('注册失败：' + (error.response?.data?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-banner">
          <h1>🐾 加入宠物世界</h1>
          <p>开启你的爱宠之旅</p>
          <ul>
            <li>✨ 记录宠物成长点滴</li>
            <li>❤️ 参与宠物救助行动</li>
            <li>🛒 购买优质宠物用品</li>
            <li>👥 认识志同道合的朋友</li>
          </ul>
        </div>

        <div className="login-form-wrapper">
          <Card className="login-card">
            <h2 style={{ textAlign: 'center', marginBottom: 30 }}>用户注册</h2>
            <Form
              name="register"
              onFinish={onRegister}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="邮箱"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[{ pattern: /^1\d{10}$/, message: '请输入有效的手机号' }]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="手机号（选填）"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                rules={[{ required: true, message: '请确认密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  size="large"
                >
                  注册
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                已有账号？ <Link to="/login">立即登录</Link>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
