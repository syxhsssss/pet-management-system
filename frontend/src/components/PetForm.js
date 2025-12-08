import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { petAPI } from '../services/api';
import './PetForm.css';

function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: 'unknown',
    color: '',
    weight: '',
    owner_name: '',
    owner_phone: '',
    description: '',
    photo_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchPetData();
    }
  }, [id]);

  const fetchPetData = async () => {
    try {
      setLoading(true);
      const response = await petAPI.getPetById(id);
      if (response.data.success) {
        setFormData(response.data.data);
      }
    } catch (err) {
      setError('获取宠物信息失败');
      console.error('Error fetching pet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.species) {
      alert('请填写宠物名称和物种');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await petAPI.updatePet(id, formData);
        alert('宠物信息更新成功');
      } else {
        await petAPI.createPet(formData);
        alert('宠物添加成功');
      }

      navigate('/');
    } catch (err) {
      setError(isEditMode ? '更新失败' : '添加失败');
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="pet-form-container">
      <div className="pet-form-header">
        <Link to="/" className="back-link">← 返回列表</Link>
        <h2>{isEditMode ? '编辑宠物' : '添加宠物'}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="pet-form">
        <div className="form-section">
          <h3>基本信息</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">宠物名称 <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="请输入宠物名称"
              />
            </div>

            <div className="form-group">
              <label htmlFor="species">物种 <span className="required">*</span></label>
              <input
                type="text"
                id="species"
                name="species"
                value={formData.species}
                onChange={handleChange}
                required
                placeholder="例如：猫、狗、鸟"
              />
            </div>

            <div className="form-group">
              <label htmlFor="breed">品种</label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="例如：金毛、英短"
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">年龄（岁）</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="0"
                placeholder="例如：3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">性别</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="unknown">未知</option>
                <option value="male">雄性</option>
                <option value="female">雌性</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="color">颜色</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="例如：金色、白色"
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">体重（kg）</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="例如：5.5"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>主人信息</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="owner_name">主人姓名</label>
              <input
                type="text"
                id="owner_name"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="请输入主人姓名"
              />
            </div>

            <div className="form-group">
              <label htmlFor="owner_phone">联系电话</label>
              <input
                type="tel"
                id="owner_phone"
                name="owner_phone"
                value={formData.owner_phone}
                onChange={handleChange}
                placeholder="请输入联系电话"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>其他信息</h3>
          <div className="form-group full-width">
            <label htmlFor="description">描述</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="请输入宠物的详细描述..."
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="photo_url">照片URL</label>
            <input
              type="url"
              id="photo_url"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleChange}
              placeholder="请输入照片链接"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '提交中...' : (isEditMode ? '更新' : '添加')}
          </button>
          <Link to="/" className="btn btn-secondary">取消</Link>
        </div>
      </form>
    </div>
  );
}

export default PetForm;
