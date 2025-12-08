import React, { useState, useEffect } from 'react';
import { Card, Table, Button, InputNumber, message, Empty, Modal, Radio, QRCode } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { shopAPI } from '../services/api';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [showQRCode, setShowQRCode] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await shopAPI.getCart();
      setCartItems(response.data.data);
    } catch (error) {
      message.error('加载购物车失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await shopAPI.removeFromCart(id);
      message.success('删除成功');
      fetchCart();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      message.warning('购物车是空的');
      return;
    }
    setPaymentModalVisible(true);
  };

  const handlePayment = () => {
    setShowQRCode(true);
    // 模拟支付延迟3秒
    setTimeout(async () => {
      setPaying(true);
      try {
        // 创建订单
        const orderData = {
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          })),
          total_amount: total,
          payment_method: paymentMethod,
          recipient_name: '收货人姓名', // 这里应该从用户输入或用户信息获取
          recipient_phone: '13800138000',
          recipient_address: '收货地址'
        };

        await shopAPI.createOrder(orderData);
        message.success('支付成功！订单已创建');
        setPaymentModalVisible(false);
        setShowQRCode(false);
        fetchCart(); // 刷新购物车（应该已清空）
      } catch (error) {
        message.error('支付失败：' + (error.response?.data?.message || '未知错误'));
      } finally {
        setPaying(false);
      }
    }, 3000);
  };

  const columns = [
    {
      title: '商品',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const images = record.images ? JSON.parse(record.images) : [];
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={images[0]} alt={text} style={{ width: 60, height: 60, marginRight: 12, borderRadius: 4 }} />
            <span>{text}</span>
          </div>
        );
      }
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price}`
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_, record) => `¥${(record.price * record.quantity).toFixed(2)}`
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>
      )
    }
  ];

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h1>🛒 购物车</h1>
      {cartItems.length === 0 ? (
        <Empty description="购物车是空的" />
      ) : (
        <>
          <Table
            dataSource={cartItems}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
          <Card style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>
                总计: <span style={{ fontSize: 24, color: '#ff4d4f', fontWeight: 'bold' }}>¥{total.toFixed(2)}</span>
              </span>
              <Button type="primary" size="large" onClick={handleCheckout}>
                去结算
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* 支付Modal */}
      <Modal
        title="选择支付方式"
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          setShowQRCode(false);
        }}
        footer={null}
        width={400}
      >
        {!showQRCode ? (
          <div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 16, marginBottom: 16 }}>
                订单金额: <span style={{ fontSize: 20, color: '#ff4d4f', fontWeight: 'bold' }}>¥{total.toFixed(2)}</span>
              </p>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%' }}
              >
                <Radio value="wechat" style={{ display: 'block', marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>💚 微信支付</span>
                </Radio>
                <Radio value="alipay" style={{ display: 'block' }}>
                  <span style={{ fontSize: 16 }}>💙 支付宝支付</span>
                </Radio>
              </Radio.Group>
            </div>
            <Button type="primary" block size="large" onClick={handlePayment}>
              确认支付
            </Button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 16, marginBottom: 20 }}>
              {paymentMethod === 'wechat' ? '请使用微信扫码支付' : '请使用支付宝扫码支付'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <QRCode
                value={`https://pay.example.com/${paymentMethod}/${Date.now()}`}
                size={200}
              />
            </div>
            <p style={{ color: '#666' }}>支付金额: ¥{total.toFixed(2)}</p>
            {paying && <p style={{ color: '#1890ff', marginTop: 10 }}>支付处理中，请稍候...</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CartPage;
