-- 创建数据库
CREATE DATABASE IF NOT EXISTS pet_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pet_management;

-- ==================== 用户系统 ====================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(255) COMMENT '头像URL',
    nickname VARCHAR(50) COMMENT '昵称',
    bio TEXT COMMENT '个人简介',
    role ENUM('user', 'admin') DEFAULT 'user' COMMENT '角色',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ==================== 宠物系统 ====================

-- 宠物表
CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '主人ID',
    name VARCHAR(100) NOT NULL COMMENT '宠物名称',
    species VARCHAR(50) NOT NULL COMMENT '物种',
    breed VARCHAR(100) COMMENT '品种',
    age INT COMMENT '年龄',
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown' COMMENT '性别',
    color VARCHAR(50) COMMENT '颜色',
    weight DECIMAL(5,2) COMMENT '体重(kg)',
    description TEXT COMMENT '描述',
    photo_url VARCHAR(255) COMMENT '照片URL',
    is_public BOOLEAN DEFAULT TRUE COMMENT '是否公开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_species (species)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物信息表';

-- ==================== 收养系统 ====================

-- 待收养宠物表
CREATE TABLE IF NOT EXISTS adoptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publisher_id INT NOT NULL COMMENT '发布者ID',
    name VARCHAR(100) NOT NULL COMMENT '宠物名称',
    species VARCHAR(50) NOT NULL COMMENT '物种',
    breed VARCHAR(100) COMMENT '品种',
    age INT COMMENT '年龄',
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
    color VARCHAR(50) COMMENT '颜色',
    location VARCHAR(200) COMMENT '所在地',
    health_status VARCHAR(100) COMMENT '健康状况',
    vaccinated BOOLEAN DEFAULT FALSE COMMENT '是否接种疫苗',
    description TEXT COMMENT '描述',
    photos TEXT COMMENT '照片URLs（JSON数组）',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    status ENUM('available', 'pending', 'adopted') DEFAULT 'available' COMMENT '状态',
    views INT DEFAULT 0 COMMENT '浏览次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_status (status),
    INDEX idx_species (species)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='待收养宠物表';

-- 收养申请表
CREATE TABLE IF NOT EXISTS adoption_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adoption_id INT NOT NULL COMMENT '收养宠物ID',
    applicant_id INT NOT NULL COMMENT '申请人ID',
    name VARCHAR(50) NOT NULL COMMENT '申请人姓名',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    address VARCHAR(200) COMMENT '居住地址',
    experience TEXT COMMENT '养宠经验',
    reason TEXT COMMENT '收养原因',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '申请状态',
    reviewer_note TEXT COMMENT '审核备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adoption_id) REFERENCES adoptions(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_adoption_id (adoption_id),
    INDEX idx_applicant_id (applicant_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收养申请表';

-- ==================== 商城系统 ====================

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    category VARCHAR(50) NOT NULL COMMENT '分类（食品、玩具、用品等）',
    description TEXT COMMENT '商品描述',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    stock INT DEFAULT 0 COMMENT '库存',
    images TEXT COMMENT '商品图片URLs（JSON数组）',
    tags VARCHAR(200) COMMENT '标签',
    sales INT DEFAULT 0 COMMENT '销量',
    rating DECIMAL(2,1) DEFAULT 5.0 COMMENT '评分',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_sales (sales DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    product_id INT NOT NULL COMMENT '商品ID',
    quantity INT DEFAULT 1 COMMENT '数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
    user_id INT NOT NULL COMMENT '用户ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '总金额',
    shipping_address VARCHAR(300) COMMENT '收货地址',
    recipient_name VARCHAR(50) COMMENT '收货人',
    recipient_phone VARCHAR(20) COMMENT '收货电话',
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
    payment_method VARCHAR(50) COMMENT '支付方式',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单详情表
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT '订单ID',
    product_id INT COMMENT '商品ID',
    product_name VARCHAR(200) COMMENT '商品名称（快照）',
    price DECIMAL(10,2) NOT NULL COMMENT '单价',
    quantity INT NOT NULL COMMENT '数量',
    subtotal DECIMAL(10,2) NOT NULL COMMENT '小计',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单详情表';

-- ==================== 社交系统 ====================

-- 宠物动态表
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '发布者ID',
    pet_id INT COMMENT '关联宠物ID',
    content TEXT COMMENT '内容',
    images TEXT COMMENT '图片URLs（JSON数组）',
    location VARCHAR(200) COMMENT '位置',
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    comments_count INT DEFAULT 0 COMMENT '评论数',
    views INT DEFAULT 0 COMMENT '浏览次数',
    is_public BOOLEAN DEFAULT TRUE COMMENT '是否公开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物动态表';

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL COMMENT '动态ID',
    user_id INT NOT NULL COMMENT '评论者ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id INT COMMENT '父评论ID（用于回复）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    post_id INT NOT NULL COMMENT '动态ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post (user_id, post_id),
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';

-- 关注表
CREATE TABLE IF NOT EXISTS follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL COMMENT '关注者ID',
    following_id INT NOT NULL COMMENT '被关注者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower_id (follower_id),
    INDEX idx_following_id (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注表';

-- ==================== 插入示例数据 ====================

-- 插入管理员用户（密码：admin123）
INSERT INTO users (username, email, password, nickname, role, avatar) VALUES
('admin', 'admin@petworld.com', '$2b$10$9xZvqJ.vN5vW5hXGZQJ8..bZYZ1Y6k6X1qJ6E5qY6J6E5qY6J6E5qO', 'Admin', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
('user1', 'user1@example.com', '$2b$10$9xZvqJ.vN5vW5hXGZQJ8..bZYZ1Y6k6X1qJ6E5qY6J6E5qY6J6E5qO', 'PetLover', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'),
('user2', 'user2@example.com', '$2b$10$9xZvqJ.vN5vW5hXGZQJ8..bZYZ1Y6k6X1qJ6E5qY6J6E5qY6J6E5qO', 'CatOwner', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2');

-- 插入宠物数据
INSERT INTO pets (user_id, name, species, breed, age, gender, color, weight, description, photo_url) VALUES
(2, '小白', '狗', '金毛', 3, 'male', '金色', 30.5, '活泼可爱的金毛犬，喜欢游泳和玩飞盘', 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24'),
(2, '旺财', '狗', '哈士奇', 1, 'male', '黑白', 25.0, '精力充沛的小哈，拆家小能手', 'https://images.unsplash.com/photo-1568572933382-74d440642117'),
(3, '咪咪', '猫', '英短', 2, 'female', '灰色', 4.2, '温顺的英国短毛猫，喜欢晒太阳', 'https://images.unsplash.com/photo-1573865526739-10c1dd7aa3a4');

-- 插入待收养宠物
INSERT INTO adoptions (publisher_id, name, species, breed, age, gender, color, location, health_status, vaccinated, description, contact_phone, status) VALUES
(1, '流浪小橘', '猫', '橘猫', 1, 'male', '橘色', '北京市朝阳区', '健康', TRUE, '在小区里救助的流浪猫，性格温顺，希望找到一个温暖的家', '13800138000', 'available'),
(1, '黑贝', '狗', '德牧', 2, 'male', '黑色', '上海市浦东新区', '健康', TRUE, '警犬退役，训练有素，需要有经验的主人', '13900139000', 'available'),
(2, '小花', '猫', '狸花猫', 0, 'female', '棕色花纹', '广州市天河区', '健康', FALSE, '刚满月的小猫，等待领养', '13700137000', 'available');

-- 插入商品数据
INSERT INTO products (name, category, description, price, stock, images, tags, sales, rating) VALUES
('皇家狗粮成犬粮 10kg', '食品', '进口狗粮，营养均衡，适合成年犬', 299.00, 100, '["https://images.unsplash.com/photo-1589924691995-400dc9ecc119"]', '狗粮,进口,营养', 156, 4.8),
('猫咪猫粮三文鱼味 5kg', '食品', '高蛋白猫粮，添加三文鱼，毛发亮泽', 189.00, 150, '["https://images.unsplash.com/photo-1591160690555-5debfba289f0"]', '猫粮,三文鱼,营养', 234, 4.9),
('宠物自动饮水机', '用品', '循环过滤，鼓励宠物多喝水', 128.00, 80, '["https://images.unsplash.com/photo-1583512603806-077998240c7a"]', '饮水机,智能,循环', 89, 4.7),
('猫爬架大型', '玩具', '多层猫爬架，含猫窝和抓板', 368.00, 45, '["https://images.unsplash.com/photo-1545249390-6bdfa286032f"]', '猫爬架,猫窝,抓板', 67, 4.6),
('狗狗益智玩具', '玩具', '可藏食物的益智玩具，训练狗狗智力', 58.00, 200, '["https://images.unsplash.com/photo-1535317220815-731c9c250f7a"]', '玩具,益智,训练', 312, 4.8),
('宠物航空箱', '用品', '便携宠物箱，适合外出旅行', 158.00, 60, '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64"]', '航空箱,外出,便携', 45, 4.5);

-- 插入宠物动态
INSERT INTO posts (user_id, pet_id, content, images, likes_count, comments_count) VALUES
(2, 1, '今天带小白去公园玩啦！它玩得超开心 🐕', '["https://images.unsplash.com/photo-1587300003388-59208cc962cb","https://images.unsplash.com/photo-1601758228041-f3b2795255f1"]', 24, 5),
(3, 3, '咪咪今天又在晒太阳，慵懒的一天 😺', '["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba"]', 18, 3),
(2, 2, '二哈又在家里拆家了，心累... 😅', '["https://images.unsplash.com/photo-1600077106724-946750eeaf3c"]', 32, 8);

-- 插入评论
INSERT INTO comments (post_id, user_id, content) VALUES
(1, 3, '好可爱的狗狗！'),
(1, 1, '金毛真的很温顺'),
(2, 2, '猫咪好惬意啊'),
(3, 3, '哈哈哈，哈士奇本色');

-- 插入点赞
INSERT INTO likes (user_id, post_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 3),
(3, 1), (3, 3);
