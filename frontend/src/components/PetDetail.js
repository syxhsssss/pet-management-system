import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { petAPI } from '../services/api';
import './PetDetail.css';

function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPetDetail();
  }, [id]);

  const fetchPetDetail = async () => {
    try {
      setLoading(true);
      const response = await petAPI.getPetById(id);
      if (response.data.success) {
        setPet(response.data.data);
      }
    } catch (err) {
      setError('获取宠物详情失败');
      console.error('Error fetching pet detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`确定要删除宠物 "${pet.name}" 吗？`)) {
      try {
        await petAPI.deletePet(id);
        navigate('/');
      } catch (err) {
        alert('删除失败：' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error || !pet) {
    return (
      <div className="error">
        <p>{error || '宠物不存在'}</p>
        <Link to="/" className="btn btn-primary">返回列表</Link>
      </div>
    );
  }

  return (
    <div className="pet-detail">
      <div className="pet-detail-header">
        <Link to="/" className="back-link">← 返回列表</Link>
        <h2>宠物详情</h2>
      </div>

      <div className="pet-detail-card">
        <div className="pet-detail-content">
          <div className="detail-section">
            <h3 className="section-title">基本信息</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">名称：</span>
                <span className="value">{pet.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">物种：</span>
                <span className="value">{pet.species}</span>
              </div>
              {pet.breed && (
                <div className="detail-item">
                  <span className="label">品种：</span>
                  <span className="value">{pet.breed}</span>
                </div>
              )}
              {pet.age && (
                <div className="detail-item">
                  <span className="label">年龄：</span>
                  <span className="value">{pet.age} 岁</span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">性别：</span>
                <span className="value">
                  {pet.gender === 'male' ? '雄性 ♂' : pet.gender === 'female' ? '雌性 ♀' : '未知'}
                </span>
              </div>
              {pet.color && (
                <div className="detail-item">
                  <span className="label">颜色：</span>
                  <span className="value">{pet.color}</span>
                </div>
              )}
              {pet.weight && (
                <div className="detail-item">
                  <span className="label">体重：</span>
                  <span className="value">{pet.weight} kg</span>
                </div>
              )}
            </div>
          </div>

          {(pet.owner_name || pet.owner_phone) && (
            <div className="detail-section">
              <h3 className="section-title">主人信息</h3>
              <div className="detail-grid">
                {pet.owner_name && (
                  <div className="detail-item">
                    <span className="label">姓名：</span>
                    <span className="value">{pet.owner_name}</span>
                  </div>
                )}
                {pet.owner_phone && (
                  <div className="detail-item">
                    <span className="label">电话：</span>
                    <span className="value">{pet.owner_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {pet.description && (
            <div className="detail-section">
              <h3 className="section-title">描述</h3>
              <p className="description">{pet.description}</p>
            </div>
          )}

          <div className="detail-section">
            <h3 className="section-title">其他信息</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">创建时间：</span>
                <span className="value">{new Date(pet.created_at).toLocaleString('zh-CN')}</span>
              </div>
              <div className="detail-item">
                <span className="label">更新时间：</span>
                <span className="value">{new Date(pet.updated_at).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pet-detail-actions">
          <Link to={`/edit/${pet.id}`} className="btn btn-warning">编辑</Link>
          <button onClick={handleDelete} className="btn btn-danger">删除</button>
          <Link to="/" className="btn btn-secondary">返回</Link>
        </div>
      </div>
    </div>
  );
}

export default PetDetail;
