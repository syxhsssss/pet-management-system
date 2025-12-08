import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Rate, Tag, InputNumber, message, Descriptions, Image } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { shopAPI } from '../services/api';

function ProductDetailPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await shopAPI.getProductById(id);
      setProduct(response.data.data);
    } catch (error) {
      message.error('加载商品失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    try {
      await shopAPI.addToCart({ product_id: product.id, quantity });
      message.success('已添加到购物车');
    } catch (error) {
      message.error('添加失败');
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!product) return <div>商品不存在</div>;

  const images = product.images ? JSON.parse(product.images) : [];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/shop')} style={{ marginBottom: 20 }}>
        返回商城
      </Button>

      <Card>
        <div style={{ display: 'flex', gap: 40 }}>
          <div style={{ flex: 1 }}>
            <Image
              src={images[0] || 'https://via.placeholder.com/400'}
              alt={product.name}
              style={{ width: '100%', borderRadius: 8 }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 28, marginBottom: 16 }}>{product.name}</h1>

            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{product.category}</Tag>
              {product.tags && product.tags.split(',').map((tag, idx) => (
                <Tag key={idx}>{tag}</Tag>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <Rate disabled value={product.rating} style={{ marginRight: 8 }} />
              <span style={{ color: '#666' }}>销量: {product.sales}</span>
            </div>

            <div style={{ fontSize: 32, color: '#ff4d4f', fontWeight: 'bold', marginBottom: 24 }}>
              ¥{product.price}
            </div>

            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="库存">{product.stock} 件</Descriptions.Item>
              <Descriptions.Item label="商品描述">{product.description}</Descriptions.Item>
            </Descriptions>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span>数量：</span>
              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={setQuantity}
              />
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
              >
                加入购物车
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProductDetailPage;
