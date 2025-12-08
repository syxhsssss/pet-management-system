import React from 'react';
import { Card, Row, Col, Statistic, Button, Carousel, Divider } from 'antd';
import {
  HeartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const bannerSlides = [
    {
      image: 'https://img.freepik.com/premium-vector/cute-dog-cat-together-cartoon-illustration-pet-adoption-concept_138676-8901.jpg',
      title: '给流浪宠物一个家',
      subtitle: '每一个小生命都值得被温柔以待',
      buttonText: '立即收养',
      link: '/adoption'
    },
    {
      image: 'https://img.freepik.com/premium-vector/pet-shop-store-with-cute-animals-products-cartoon-illustration_138676-7823.jpg',
      title: '宠物用品商城',
      subtitle: '优质商品，呵护爱宠每一天',
      buttonText: '前往商城',
      link: '/shop'
    },
    {
      image: 'https://img.freepik.com/premium-vector/happy-pets-playing-together-cute-cartoon-animals-illustration_138676-9012.jpg',
      title: '宠物社交分享',
      subtitle: '记录成长瞬间，分享快乐时光',
      buttonText: '浏览动态',
      link: '/social'
    },
    {
      image: 'https://img.freepik.com/premium-vector/pet-care-grooming-cute-animals-cartoon-illustration_138676-6734.jpg',
      title: '宠物护理知识',
      subtitle: '科学养宠，让爱宠健康成长',
      buttonText: '学习护理',
      link: '/care'
    }
  ];

  return (
    <div className="home-page">
      {/* Banner轮播 */}
      <Carousel autoplay className="home-banner">
        {bannerSlides.map((slide, index) => (
          <div key={index} className="banner-slide">
            <div
              className="banner-image"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="banner-overlay">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Button type="primary" size="large">
                  <Link to={slide.link}>{slide.buttonText}</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* 统计数据 */}
      <div className="stats-section">
        <Row gutter={24}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="待收养宠物"
                value={128}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="商品种类"
                value={1563}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="注册用户"
                value={8924}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="分享动态"
                value={12453}
                prefix={<PictureOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* 功能板块 */}
      <Divider orientation="left">
        <h2>平台特色</h2>
      </Divider>

      <Row gutter={[24, 24]} className="features-section">
        <Col xs={24} md={12}>
          <Card
            hoverable
            cover={
              <img
                alt="宠物收养"
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600"
                style={{ height: 250, objectFit: 'cover' }}
              />
            }
          >
            <Card.Meta
              title="🏠 宠物收养"
              description="帮助流浪动物找到温暖的家，给它们第二次生命的机会"
            />
            <Button type="link" style={{ marginTop: 16 }}>
              <Link to="/adoption">查看待收养宠物 →</Link>
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            hoverable
            cover={
              <img
                alt="宠物商城"
                src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600"
                style={{ height: 250, objectFit: 'cover' }}
              />
            }
          >
            <Card.Meta
              title="🛒 宠物商城"
              description="优质宠物用品一站式采购，让爱宠生活更美好"
            />
            <Button type="link" style={{ marginTop: 16 }}>
              <Link to="/shop">前往商城 →</Link>
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            hoverable
            cover={
              <img
                alt="社交分享"
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600"
                style={{ height: 250, objectFit: 'cover' }}
              />
            }
          >
            <Card.Meta
              title="📸 社交分享"
              description="记录宠物成长的每一刻，分享欢乐时光"
            />
            <Button type="link" style={{ marginTop: 16 }}>
              <Link to="/social">浏览动态 →</Link>
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            hoverable
            cover={
              <img
                alt="宠物社区"
                src="https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=600"
                style={{ height: 250, objectFit: 'cover' }}
              />
            }
          >
            <Card.Meta
              title="👥 宠物社区"
              description="结识志同道合的爱宠人士，交流养宠经验"
            />
            <Button type="link" style={{ marginTop: 16 }}>
              <Link to="/social">加入社区 →</Link>
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default HomePage;
