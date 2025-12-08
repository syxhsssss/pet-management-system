import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { petAPI } from '../services/api';
import './PetList.css';

function PetList() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await petAPI.getAllPets();
      if (response.data.success) {
        setPets(response.data.data);
      }
    } catch (err) {
      setError('获取宠物列表失败，请检查后端服务是否启动');
      console.error('Error fetching pets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`确定要删除宠物 "${name}" 吗？`)) {
      try {
        await petAPI.deletePet(id);
        fetchPets(); // 重新获取列表
      } catch (err) {
        alert('删除失败：' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (pets.length === 0) {
    return (
      <div className="empty-state">
        <p>还没有宠物信息，快去添加吧！</p>
        <Link to="/add" className="btn btn-primary">添加第一个宠物</Link>
      </div>
    );
  }

  return (
    <div className="pet-list">
      <div className="pet-list-header">
        <h2>宠物列表 ({pets.length})</h2>
      </div>
      <div className="pet-grid">
        {pets.map((pet) => (
          <div key={pet.id} className="pet-card">
            <div className="pet-card-header">
              <h3>{pet.name}</h3>
              <span className={`gender-badge ${pet.gender}`}>
                {pet.gender === 'male' ? '♂' : pet.gender === 'female' ? '♀' : '?'}
              </span>
            </div>
            <div className="pet-card-body">
              <p><strong>物种：</strong>{pet.species}</p>
              {pet.breed && <p><strong>品种：</strong>{pet.breed}</p>}
              {pet.age && <p><strong>年龄：</strong>{pet.age} 岁</p>}
              {pet.color && <p><strong>颜色：</strong>{pet.color}</p>}
              {pet.owner_name && <p><strong>主人：</strong>{pet.owner_name}</p>}
            </div>
            <div className="pet-card-actions">
              <Link to={`/pet/${pet.id}`} className="btn btn-info">详情</Link>
              <Link to={`/edit/${pet.id}`} className="btn btn-warning">编辑</Link>
              <button
                onClick={() => handleDelete(pet.id, pet.name)}
                className="btn btn-danger"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PetList;
