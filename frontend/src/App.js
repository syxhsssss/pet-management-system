import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Space, message } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  HeartOutlined,
  UserOutlined,
  LoginOutlined,
  ShoppingCartOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
  SettingOutlined,
  BookOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';

// 导入页面组件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdoptionPage from './pages/AdoptionPage';
import AdoptionDetailPage from './pages/AdoptionDetailPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SocialPage from './pages/SocialPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import PetEncyclopedia from './pages/PetEncyclopedia';
import PetCare from './pages/PetCare';

import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // 从 localStorage 加载用户信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    message.success('已退出登录');
    window.location.href = '/';
  };

  const userMenu = (
    <Menu>
      {user?.role === 'admin' && (
        <>
          <Menu.Item key="admin" icon={<SettingOutlined />}>
            <Link to="/admin">管理后台</Link>
          </Menu.Item>
          <Menu.Divider />
        </>
      )}
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人中心</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">设置</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Router>
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="logo">
            <Link to="/">
              <span className="logo-icon">🐾</span>
              <span className="logo-text">宠物世界</span>
            </Link>
          </div>

          <Menu
            theme="dark"
            mode="horizontal"
            className="main-menu"
            defaultSelectedKeys={['home']}
          >
            <Menu.Item key="home" icon={<HomeOutlined />}>
              <Link to="/">首页</Link>
            </Menu.Item>
            <Menu.Item key="social" icon={<PlusCircleOutlined />}>
              <Link to="/social">宠物动态</Link>
            </Menu.Item>
            <Menu.Item key="adoption" icon={<HeartOutlined />}>
              <Link to="/adoption">宠物收养</Link>
            </Menu.Item>
            <Menu.Item key="shop" icon={<ShoppingOutlined />}>
              <Link to="/shop">宠物商城</Link>
            </Menu.Item>
            <Menu.Item key="encyclopedia" icon={<BookOutlined />}>
              <Link to="/encyclopedia">品种科普</Link>
            </Menu.Item>
            <Menu.Item key="care" icon={<MedicineBoxOutlined />}>
              <Link to="/care">护理知识</Link>
            </Menu.Item>
          </Menu>

          <div className="header-right">
            {user ? (
              <Space size="large">
                <Link to="/cart">
                  <Badge count={cartCount} offset={[10, 0]}>
                    <ShoppingCartOutlined style={{ fontSize: 20, color: '#fff' }} />
                  </Badge>
                </Link>
                <Dropdown overlay={userMenu} placement="bottomRight">
                  <Space className="user-info" style={{ cursor: 'pointer' }}>
                    <Avatar src={user.avatar} icon={<UserOutlined />} />
                    <span style={{ color: '#fff' }}>{user.nickname || user.username}</span>
                  </Space>
                </Dropdown>
              </Space>
            ) : (
              <Space>
                <Link to="/login">
                  <Button type="primary" icon={<LoginOutlined />}>
                    登录
                  </Button>
                </Link>
                <Link to="/register">
                  <Button icon={<UserOutlined />}>注册</Button>
                </Link>
              </Space>
            )}
          </div>
        </Header>

        <Content className="app-content">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage setUser={setUser} />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/social" element={<SocialPage user={user} />} />
              <Route path="/adoption" element={<AdoptionPage user={user} />} />
              <Route path="/adoption/:id" element={<AdoptionDetailPage user={user} />} />
              <Route path="/shop" element={<ShopPage user={user} />} />
              <Route path="/shop/:id" element={<ProductDetailPage user={user} />} />
              <Route path="/encyclopedia" element={<PetEncyclopedia />} />
              <Route path="/care" element={<PetCare />} />
              <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
              <Route path="/admin" element={user?.role === 'admin' ? <AdminPage user={user} /> : <Navigate to="/" />} />
            </Routes>
          </div>
        </Content>

        <Footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>关于我们</h4>
              <p>宠物世界是一个集社交、收养、商城于一体的综合宠物平台</p>
            </div>
            <div className="footer-section">
              <h4>联系方式</h4>
              <p>邮箱: contact@petworld.com</p>
              <p>电话: 400-888-8888</p>
            </div>
            <div className="footer-section">
              <h4>关注我们</h4>
              <Space>
                <Button type="link">微博</Button>
                <Button type="link">微信</Button>
                <Button type="link">抖音</Button>
              </Space>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 宠物世界 Pet World. All rights reserved.</p>
          </div>
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
