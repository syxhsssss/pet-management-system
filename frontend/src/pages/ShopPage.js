import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Rate, Tag, message, Select, Input, Empty } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { shopAPI } from '../services/api';

const { Search } = Input;
const { Option } = Select;

function ShopPage({ user }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('sales');

  useEffect(() => {
    fetchProducts();
  }, [category, sort]);

  const fetchProducts = async () => {
    try {
      const response = await shopAPI.getAllProducts({ category, sort });
      setProducts(response.data.data);
    } catch (error) {
      message.error('加载商品失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    if (!user) {
      message.warning('请先登录');
      return;
    }

    try {
      await shopAPI.addToCart({ product_id: product.id, quantity: 1 });
      message.success('已添加到购物车');
    } catch (error) {
      message.error('添加失败：' + (error.response?.data?.message || '未知错误'));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🛒 宠物商城</h1>
        <div>
          <Select
            placeholder="选择分类"
            style={{ width: 120, marginRight: 16 }}
            onChange={setCategory}
            allowClear
          >
            <Option value="食品">食品</Option>
            <Option value="玩具">玩具</Option>
            <Option value="用品">用品</Option>
          </Select>
          <Select
            value={sort}
            style={{ width: 120 }}
            onChange={setSort}
          >
            <Option value="sales">按销量</Option>
            <Option value="price_asc">价格↑</Option>
            <Option value="price_desc">价格↓</Option>
            <Option value="rating">按评分</Option>
          </Select>
        </div>
      </div>

      {products.length === 0 && !loading ? (
        <Empty description="暂无商品" />
      ) : (
        <Row gutter={[24, 24]}>
          {products.map((product) => {
            const images = product.images ? JSON.parse(product.images) : [];
            return (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => navigate(`/shop/${product.id}`)}
                  cover={
                    <img
                      alt={product.name}
                      src={images[0] || 'http://localhost:3001/images/dog1.jpg'}
                      style={{ height: 200, objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'http://localhost:3001/images/dog1.jpg';
                      }}
                    />
                  }
                >
                  <div style={{ minHeight: 80 }}>
                    <h3 style={{ fontSize: 14, marginBottom: 8 }}>{product.name}</h3>
                    <Tag color="blue">{product.category}</Tag>
                    <div style={{ marginTop: 8 }}>
                      <Rate disabled defaultValue={product.rating} style={{ fontSize: 14 }} />
                      <span style={{ marginLeft: 8, color: '#999' }}>
                        销量: {product.sales}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 20, color: '#ff4d4f', fontWeight: 'bold' }}>
                      ¥{product.price}
                    </span>
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      加购
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}

export default ShopPage;
