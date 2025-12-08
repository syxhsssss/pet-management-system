import React, { useState, useEffect } from 'react';
import { Layout, Menu, Table, Button, Modal, Form, Input, Select, message, Space, Tag, Popconfirm, Card, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  HeartOutlined,
  FileTextOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { adoptionAPI, shopAPI, socialAPI } from '../services/api';
import axios from 'axios';
import './AdminPage.css';

const { Sider, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

function AdminPage({ user }) {
  const [selectedKey, setSelectedKey] = useState('dashboard');

  // 检查是否是管理员
  if (user?.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <h2>访问受限</h2>
        <p>只有管理员才能访问此页面</p>
      </div>
    );
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '数据概览'
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理'
    },
    {
      key: 'posts',
      icon: <FileTextOutlined />,
      label: '帖子管理'
    },
    {
      key: 'adoptions',
      icon: <HeartOutlined />,
      label: '收养管理'
    },
    {
      key: 'applications',
      icon: <CheckOutlined />,
      label: '收养申请'
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: '商品管理'
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: '订单管理'
    }
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'posts':
        return <PostManagement />;
      case 'adoptions':
        return <AdoptionManagement />;
      case 'applications':
        return <ApplicationManagement />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout className="admin-layout">
      <Sider width={220} className="admin-sider">
        <div className="admin-logo">
          <h2>🔧 管理后台</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(key)}
          items={menuItems}
          className="admin-menu"
        />
      </Sider>
      <Content className="admin-content">
        {renderContent()}
      </Content>
    </Layout>
  );
}

// 数据概览
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/statistics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data.data);
    } catch (error) {
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>;
  }

  return (
    <div>
      <h2>数据概览</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.users?.total_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.users?.active_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="管理员数"
              value={stats.users?.admin_count || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="宠物总数"
              value={stats.pets?.total_pets || 0}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="待收养宠物"
              value={stats.adoptions?.available_count || 0}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="已收养宠物"
              value={stats.adoptions?.adopted_count || 0}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="帖子总数"
              value={stats.posts?.total_posts || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="商品总数"
              value={stats.products?.total_products || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="总销量"
              value={stats.products?.total_sales || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.orders?.total_orders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="完成订单"
              value={stats.orders?.completed_orders || 0}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.orders?.total_revenue || 0}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// 用户管理
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data.data || []);
    } catch (error) {
      message.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/users/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('状态更新成功');
      fetchUsers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/users/${id}/role`, { role }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('角色更新成功');
      fetchUsers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          style={{ width: 100 }}
          onChange={(value) => handleUpdateRole(record.id, value)}
        >
          <Option value="user">普通用户</Option>
          <Option value="admin">管理员</Option>
        </Select>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 90 }}
          onChange={(value) => handleUpdateStatus(record.id, value)}
        >
          <Option value="active">正常</Option>
          <Option value="inactive">禁用</Option>
          <Option value="banned">封禁</Option>
        </Select>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="确认删除该用户？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <h2>用户管理</h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

// 帖子管理
function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/posts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPosts(response.data.data || []);
    } catch (error) {
      message.error('加载帖子失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('删除成功');
      fetchPosts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户', dataIndex: 'nickname', key: 'nickname' },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true, width: 300 },
    { title: '点赞', dataIndex: 'likes_count', key: 'likes_count', width: 80 },
    { title: '评论', dataIndex: 'comments_count', key: 'comments_count', width: 80 },
    {
      title: '公开',
      dataIndex: 'is_public',
      key: 'is_public',
      render: (isPublic) => (
        <Tag color={isPublic ? 'green' : 'red'}>{isPublic ? '是' : '否'}</Tag>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <h2>帖子管理</h2>
      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

// 收养管理
function AdoptionManagement() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/adoptions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAdoptions(response.data.data || []);
    } catch (error) {
      message.error('加载收养信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/admin/adoptions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('删除成功');
      fetchAdoptions();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '物种', dataIndex: 'species', key: 'species' },
    { title: '品种', dataIndex: 'breed', key: 'breed' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '所在地', dataIndex: 'location', key: 'location' },
    { title: '发布者', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          available: { text: '待收养', color: 'green' },
          pending: { text: '审核中', color: 'orange' },
          adopted: { text: '已收养', color: 'blue' }
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <h2>收养管理</h2>
      <Table
        columns={columns}
        dataSource={adoptions}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

// 收养申请管理
function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/adoption-applications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setApplications(response.data.data || []);
    } catch (error) {
      message.error('加载申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/adoption-applications/${id}/review`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      message.success('审核成功');
      fetchApplications();
    } catch (error) {
      message.error('审核失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '宠物名称', dataIndex: 'pet_name', key: 'pet_name' },
    { title: '申请人', dataIndex: 'nickname', key: 'nickname' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { text: '待审核', color: 'orange' },
          approved: { text: '已通过', color: 'green' },
          rejected: { text: '已拒绝', color: 'red' }
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      }
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === 'pending' ? (
          <Space>
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleReview(record.id, 'approved')}>
              通过
            </Button>
            <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleReview(record.id, 'rejected')}>
              拒绝
            </Button>
          </Space>
        ) : null
      )
    }
  ];

  return (
    <div>
      <h2>收养申请管理</h2>
      <Table
        columns={columns}
        dataSource={applications}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
      />
    </div>
  );
}

// 商品管理
function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await shopAPI.getAllProducts({});
      setProducts(response.data.data || []);
    } catch (error) {
      message.error('加载商品失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      images: product.images ? JSON.stringify(product.images) : ''
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('删除成功');
      fetchProducts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      let images = [];
      if (values.images) {
        try {
          images = JSON.parse(values.images);
        } catch (e) {
          images = [values.images];
        }
      }

      const data = { ...values, images };

      if (editingProduct) {
        await axios.put(
          `http://localhost:3001/api/admin/products/${editingProduct.id}`,
          data,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );
        message.success('更新成功');
      } else {
        await axios.post('http://localhost:3001/api/admin/products', data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (price) => `¥${price}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '销量', dataIndex: 'sales', key: 'sales' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2>商品管理</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
        添加商品
      </Button>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select>
              <Option value="食品">食品</Option>
              <Option value="玩具">玩具</Option>
              <Option value="用品">用品</Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true, message: '请输入价格' }]}>
            <Input type="number" min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="stock" label="库存" rules={[{ required: true, message: '请输入库存' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="images" label="图片URL (JSON数组格式)">
            <TextArea rows={2} placeholder='["http://example.com/image.jpg"]' />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="用逗号分隔，如：狗粮,进口,营养" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingProduct ? '更新' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// 订单管理
function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data.data || []);
    } catch (error) {
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('状态更新成功');
      fetchOrders();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '用户', dataIndex: 'nickname', key: 'nickname' },
    { title: '总金额', dataIndex: 'total_amount', key: 'total_amount', render: (amount) => `¥${amount}` },
    { title: '收货人', dataIndex: 'recipient_name', key: 'recipient_name' },
    { title: '电话', dataIndex: 'recipient_phone', key: 'recipient_phone' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 100 }}
          onChange={(value) => handleUpdateStatus(record.id, value)}
        >
          <Option value="pending">待支付</Option>
          <Option value="paid">已支付</Option>
          <Option value="shipped">已发货</Option>
          <Option value="completed">已完成</Option>
          <Option value="cancelled">已取消</Option>
        </Select>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN')
    }
  ];

  return (
    <div>
      <h2>订单管理</h2>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

export default AdminPage;
