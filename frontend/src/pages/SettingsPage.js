import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Tabs } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';

function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const onChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('密码修改成功');
    } catch (error) {
      message.error('修改失败：' + (error.response?.data?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: '1',
      label: '修改密码',
      children: (
        <Card>
          <Form
            layout="vertical"
            onFinish={onChangePassword}
            style={{ maxWidth: 500 }}
          >
            <Form.Item
              label="当前密码"
              name="oldPassword"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              rules={[{ required: true, message: '请确认新密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1>⚙️ 设置</h1>
      <Tabs items={items} />
    </div>
  );
}

export default SettingsPage;
