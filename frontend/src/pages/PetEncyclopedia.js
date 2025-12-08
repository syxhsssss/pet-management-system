import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Tag, Image } from 'antd';
import './PetEncyclopedia.css';

const { TabPane } = Tabs;

function PetEncyclopedia() {
  const dogBreeds = [
    {
      name: '金毛寻回犬',
      image: 'https://img.freepik.com/premium-vector/cute-golden-retriever-dog-cartoon-vector-icon-illustration-animal-nature-icon-isolated-flat_138676-5618.jpg',
      characteristics: '温顺友善，智商高，容易训练',
      origin: '英国',
      size: '大型犬',
      lifespan: '10-12年',
      weight: '27-36kg',
      height: '51-61cm',
      temperament: '友好、可靠、值得信赖',
      exercise: '每天需要1-2小时运动',
      grooming: '每周需要梳理2-3次',
      description: '金毛寻回犬是最受欢迎的家庭犬之一，性格温和，对儿童友好，非常适合家庭饲养。它们聪明易训，常被训练成导盲犬、搜救犬。需要大量运动和社交，不适合长时间独处。毛发需要定期护理，容易患髋关节发育不良。'
    },
    {
      name: '哈士奇',
      image: 'https://img.freepik.com/premium-vector/cute-husky-dog-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium_138676-6859.jpg',
      characteristics: '活泼好动，独立性强，爱玩耍',
      origin: '西伯利亚',
      size: '中大型犬',
      lifespan: '12-15年',
      weight: '16-27kg',
      height: '50-60cm',
      temperament: '友好、外向、警觉',
      exercise: '每天需要2小时以上运动',
      grooming: '换毛季节需要每天梳理',
      description: '哈士奇精力充沛，需要大量运动，有"二哈"之称，性格开朗活泼。它们独立性强，有时会表现得很固执，训练需要耐心。非常爱"拆家"，需要主人有足够的时间和空间。双层毛发，耐寒但怕热，适合寒冷地区饲养。'
    },
    {
      name: '柯基',
      image: 'https://img.freepik.com/premium-vector/cute-corgi-dog-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium_138676-6199.jpg',
      characteristics: '聪明活泼，忠诚友好，腿短身长',
      origin: '英国威尔士',
      size: '小型犬',
      lifespan: '12-15年',
      weight: '10-14kg',
      height: '25-30cm',
      temperament: '机警、友好、大胆',
      exercise: '每天需要30-60分钟运动',
      grooming: '每周梳理1-2次',
      description: '柯基是英国女王最爱的犬种，短腿大屁股，非常可爱，性格温顺。它们聪明机警，容易训练，是很好的家庭伴侣犬。由于腿短身长，需要注意脊椎健康，避免频繁上下楼梯或跳跃。掉毛较多，需要定期梳理。'
    },
    {
      name: '柴犬',
      image: 'https://img.freepik.com/premium-vector/cute-shiba-inu-dog-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium_138676-6443.jpg',
      characteristics: '忠诚勇敢，独立性强，表情丰富',
      origin: '日本',
      size: '中型犬',
      lifespan: '12-15年',
      weight: '8-11kg',
      height: '35-41cm',
      temperament: '警觉、忠诚、勇敢',
      exercise: '每天需要40-60分钟运动',
      grooming: '换毛季节需要每天梳理',
      description: '柴犬是日本的国犬，以其标志性的微笑和独立个性而闻名。它们忠诚但固执，需要从小进行社会化训练。柴犬很爱干净，几乎没有体味。对陌生人警惕，是很好的看家犬。换毛期掉毛严重，需要加强梳理。'
    },
    {
      name: '泰迪/贵宾犬',
      image: 'https://img.freepik.com/premium-vector/cute-poodle-dog-cartoon-vector-icon-illustration_138676-7891.jpg',
      characteristics: '聪明伶俐，活泼可爱，不易掉毛',
      origin: '法国/德国',
      size: '小型犬',
      lifespan: '12-15年',
      weight: '3-6kg',
      height: '24-28cm',
      temperament: '聪明、活跃、优雅',
      exercise: '每天需要30分钟运动',
      grooming: '需要定期美容修剪',
      description: '泰迪实际上是贵宾犬的一种美容造型，聪明活泼，是最受欢迎的小型犬之一。它们不易掉毛，适合对狗毛过敏的人饲养。需要定期美容修剪，否则毛发会打结。智商极高，容易训练，但也容易被宠坏，需要适当的管教。'
    },
    {
      name: '边境牧羊犬',
      image: 'https://img.freepik.com/premium-vector/cute-border-collie-dog-cartoon-vector-icon-illustration_138676-8123.jpg',
      characteristics: '智商第一，精力旺盛，工作能力强',
      origin: '英国边境地区',
      size: '中型犬',
      lifespan: '12-15年',
      weight: '14-20kg',
      height: '46-56cm',
      temperament: '聪明、警觉、热情',
      exercise: '每天需要2小时以上运动',
      grooming: '每周梳理2-3次',
      description: '边牧是世界上最聪明的狗狗，智商相当于6-8岁儿童。它们精力极其旺盛，需要大量的运动和脑力活动。非常适合进行飞盘、敏捷性训练等运动项目。不适合城市公寓饲养，需要足够的活动空间。如果运动不足，可能会出现破坏行为。'
    }
  ];

  const catBreeds = [
    {
      name: '英国短毛猫',
      image: 'https://img.freepik.com/premium-vector/cute-british-shorthair-cat-cartoon-vector-icon-illustration-animal-nature-icon-concept_138676-5937.jpg',
      characteristics: '温和安静，适应力强，圆脸大眼',
      origin: '英国',
      size: '中型猫',
      lifespan: '13-16年',
      weight: '4-8kg',
      height: '30-35cm',
      temperament: '沉稳、友善、独立',
      grooming: '每周梳理1-2次',
      color: '蓝色、乳色、银渐层等',
      description: '英短是最受欢迎的猫咪品种之一，性格温顺，长相可爱，易于照料。它们适应能力强，不太粘人，适合上班族饲养。体格健壮，不易生病，但要注意肥胖问题。圆脸大眼睛，憨态可掬，尤其是蓝猫和银渐层最受欢迎。'
    },
    {
      name: '美国短毛猫',
      image: 'https://img.freepik.com/premium-vector/cute-american-shorthair-cat-cartoon-vector-icon-illustration-animal-nature-icon_138676-6018.jpg',
      characteristics: '健康强壮，性格温和，捕鼠能力强',
      origin: '美国',
      size: '中型猫',
      lifespan: '15-20年',
      weight: '4-7kg',
      height: '30-35cm',
      temperament: '友好、活泼、适应性强',
      grooming: '每周梳理1次',
      color: '银色虎斑、棕色虎斑等',
      description: '美短身体强健，性格友好，是理想的家庭宠物。它们聪明活泼，善于捕鼠，运动能力强。寿命较长，抗病能力强，饲养简单。虎斑花纹是其特色，尤其是银色虎斑最为经典。性格温和，对儿童友好，是很好的家庭伴侣。'
    },
    {
      name: '布偶猫',
      image: 'https://img.freepik.com/premium-vector/cute-ragdoll-cat-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated_138676-6321.jpg',
      characteristics: '温顺粘人，蓝色眼睛，长毛',
      origin: '美国',
      size: '大型猫',
      lifespan: '12-17年',
      weight: '4.5-9kg',
      height: '35-40cm',
      temperament: '温柔、安静、友好',
      grooming: '每天需要梳理',
      color: '海豹色、蓝色、巧克力色等',
      description: '布偶猫性格非常温顺，像布娃娃一样软萌，非常适合家庭饲养。它们粘人程度很高，喜欢跟随主人，被称为"小狗猫"。蓝色的大眼睛和柔软的长毛是其特征。需要每天梳毛，否则容易打结。性格安静，叫声很轻，适合公寓饲养。'
    },
    {
      name: '橘猫',
      image: 'https://img.freepik.com/premium-vector/cute-orange-tabby-cat-cartoon-vector-icon-illustration-animal-nature-icon-concept_138676-5812.jpg',
      characteristics: '活泼好动，食欲旺盛，容易发胖',
      origin: '各地',
      size: '中型猫',
      lifespan: '12-16年',
      weight: '4-7kg（易胖）',
      height: '30-35cm',
      temperament: '活泼、亲人、贪吃',
      grooming: '每周梳理1次',
      color: '橘黄色',
      description: '橘猫以其标志性的橘色毛发和圆润体型而闻名，性格亲人。它们食欲非常旺盛，有"十橘九胖"的说法，需要控制饮食。性格温和友好，非常粘人，是很好的家庭伴侣。活泼好动，爱玩耍，需要足够的运动量。'
    },
    {
      name: '暹罗猫',
      image: 'https://img.freepik.com/premium-vector/cute-siamese-cat-cartoon-vector-icon-illustration_138676-7234.jpg',
      characteristics: '叫声独特，聪明活泼，重点色',
      origin: '泰国',
      size: '中型猫',
      lifespan: '15-20年',
      weight: '2.5-5.5kg',
      height: '25-30cm',
      temperament: '活泼、忠诚、健谈',
      grooming: '每周梳理1次',
      color: '海豹重点色、蓝重点色等',
      description: '暹罗猫是最古老的猫种之一，以其独特的重点色和蓝眼睛著称。它们非常"健谈"，叫声独特，喜欢与主人交流。性格像狗一样忠诚，会跟随主人。聪明活泼，好奇心强，需要足够的关注和互动。身材纤细优雅，运动能力强。'
    },
    {
      name: '波斯猫',
      image: 'https://img.freepik.com/premium-vector/cute-persian-cat-cartoon-vector-icon-illustration_138676-8456.jpg',
      characteristics: '优雅高贵，性格温顺，扁脸长毛',
      origin: '伊朗（波斯）',
      size: '中型猫',
      lifespan: '12-17年',
      weight: '3-6kg',
      height: '25-30cm',
      temperament: '温和、安静、优雅',
      grooming: '每天需要梳理',
      color: '白色、黑色、蓝色等多种',
      description: '波斯猫是猫中贵族，拥有华丽的长毛和扁平的脸部特征。它们性格温顺安静，喜欢安静的环境。需要每天梳毛和定期清理眼睛，护理要求高。由于脸部结构，容易有泪痕和呼吸问题。性格慵懒，不太活跃，适合喜欢安静的家庭。'
    }
  ];

  return (
    <div className="pet-encyclopedia">
      <div className="page-header">
        <h1>🐾 宠物品种科普</h1>
        <p>了解不同品种宠物的特点，选择最适合你的小伙伴</p>
      </div>

      <Tabs defaultActiveKey="dogs" size="large" className="encyclopedia-tabs">
        <TabPane tab="🐕 狗狗品种" key="dogs">
          <Row gutter={[24, 24]}>
            {dogBreeds.map((breed, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  hoverable
                  cover={
                    <div className="breed-image-wrapper">
                      <Image src={breed.image} alt={breed.name} preview={false} />
                    </div>
                  }
                  className="breed-card"
                >
                  <h3>{breed.name}</h3>
                  <div className="breed-info">
                    <p><strong>特征：</strong>{breed.characteristics}</p>
                    <p><strong>原产地：</strong>{breed.origin}</p>
                    <p><strong>体型：</strong><Tag color="pink">{breed.size}</Tag></p>
                    {breed.weight && <p><strong>体重：</strong>{breed.weight}</p>}
                    {breed.height && <p><strong>肩高：</strong>{breed.height}</p>}
                    {breed.color && <p><strong>颜色：</strong>{breed.color}</p>}
                    <p><strong>寿命：</strong>{breed.lifespan}</p>
                    {breed.temperament && <p><strong>性格：</strong>{breed.temperament}</p>}
                    {breed.exercise && <p><strong>运动：</strong>{breed.exercise}</p>}
                    {breed.grooming && <p><strong>美容：</strong>{breed.grooming}</p>}
                    <p className="breed-desc">{breed.description}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="🐱 猫咪品种" key="cats">
          <Row gutter={[24, 24]}>
            {catBreeds.map((breed, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  hoverable
                  cover={
                    <div className="breed-image-wrapper">
                      <Image src={breed.image} alt={breed.name} preview={false} />
                    </div>
                  }
                  className="breed-card"
                >
                  <h3>{breed.name}</h3>
                  <div className="breed-info">
                    <p><strong>特征：</strong>{breed.characteristics}</p>
                    <p><strong>原产地：</strong>{breed.origin}</p>
                    <p><strong>体型：</strong><Tag color="pink">{breed.size}</Tag></p>
                    {breed.weight && <p><strong>体重：</strong>{breed.weight}</p>}
                    {breed.height && <p><strong>肩高：</strong>{breed.height}</p>}
                    {breed.color && <p><strong>颜色：</strong>{breed.color}</p>}
                    <p><strong>寿命：</strong>{breed.lifespan}</p>
                    {breed.temperament && <p><strong>性格：</strong>{breed.temperament}</p>}
                    {breed.exercise && <p><strong>运动：</strong>{breed.exercise}</p>}
                    {breed.grooming && <p><strong>美容：</strong>{breed.grooming}</p>}
                    <p className="breed-desc">{breed.description}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default PetEncyclopedia;
