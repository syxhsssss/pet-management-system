import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onLogin = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values);
      const { token, ...userData } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      message.success('登录成功！');
      navigate('/');
    } catch (error) {
      message.error('登录失败：' + (error.response?.data?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-banner">
          <h1>🐾 欢迎来到宠物世界</h1>
          <p>一个温暖的宠物社区</p>
          <ul>
            <li>✨ 分享宠物的快乐时光</li>
            <li>❤️ 帮助流浪宠物找到温暖的家</li>
            <li>🛒 一站式宠物用品采购</li>
            <li>👥 结识更多爱宠人士</li>
          </ul>
        </div>

        <div className="login-form-wrapper">
          <Card className="login-card">
            <h2 style={{ textAlign: 'center', marginBottom: 30 }}>用户登录</h2>
            <Form
              name="login"
              onFinish={onLogin}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名或邮箱' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名或邮箱"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
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
                  登录
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                还没有账号？ <Link to="/register">立即注册</Link>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
