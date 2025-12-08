import React from 'react';
import { Card, Row, Col, Collapse, Tag } from 'antd';
import { HeartOutlined, MedicineBoxOutlined, ScissorOutlined, HomeOutlined } from '@ant-design/icons';
import './PetCare.css';

const { Panel } = Collapse;

function PetCare() {
  const careTopics = [
    {
      icon: <HeartOutlined />,
      title: '日常喂养',
      color: '#FFB6C1',
      tips: [
        { title: '定时定量', content: '每天固定时间喂食，避免暴饮暴食，成年犬猫一般每天2次。' },
        { title: '饮水充足', content: '保证宠物随时有干净的饮用水，每天更换新鲜水。' },
        { title: '营养均衡', content: '选择优质宠物粮，适当搭配蔬菜水果，避免人类食物。' },
        { title: '零食控制', content: '零食不超过每日热量的10%，避免过度喂食。' }
      ]
    },
    {
      icon: <MedicineBoxOutlined />,
      title: '健康护理',
      color: '#FFC0CB',
      tips: [
        { title: '疫苗接种', content: '按时接种疫苗，幼犬猫8周龄开始首次接种，之后每年加强。' },
        { title: '驱虫预防', content: '定期体内外驱虫，体外驱虫每月一次，体内驱虫每3个月一次。' },
        { title: '定期体检', content: '每年至少体检一次，老年宠物建议每半年一次。' },
        { title: '口腔护理', content: '定期刷牙，检查牙齿健康，预防牙结石和口臭。' }
      ]
    },
    {
      icon: <ScissorOutlined />,
      title: '美容清洁',
      color: '#FFB6C1',
      tips: [
        { title: '洗澡频率', content: '狗狗7-10天洗一次，猫咪1-2个月洗一次，使用宠物专用沐浴露。' },
        { title: '毛发梳理', content: '每天梳毛，长毛宠物每天2次，防止打结和掉毛。' },
        { title: '指甲修剪', content: '每2-3周修剪一次指甲，避免过长影响行走。' },
        { title: '耳朵清洁', content: '每周检查并清洁耳朵，防止耳螨和耳道感染。' }
      ]
    },
    {
      icon: <HomeOutlined />,
      title: '环境管理',
      color: '#FFC0CB',
      tips: [
        { title: '生活空间', content: '提供干净舒适的休息区域，定期清洁宠物用品。' },
        { title: '运动锻炼', content: '狗狗每天至少散步30分钟，猫咪提供玩具和猫爬架。' },
        { title: '温度适宜', content: '保持室内温度适宜，夏季注意防暑，冬季注意保暖。' },
        { title: '安全防护', content: '收好危险物品，防止宠物误食，窗户安装防护网。' }
      ]
    }
  ];

  const commonProblems = [
    {
      question: '宠物不吃饭怎么办？',
      answer: '可能原因：1)生病不适 2)食物不新鲜 3)换粮不适应 4)天气炎热。建议先观察精神状态，如果超过24小时不进食应就医检查。'
    },
    {
      question: '如何训练宠物定点上厕所？',
      answer: '1)选择固定地点放置厕所 2)观察宠物排便信号及时引导 3)成功后及时奖励 4)失败不要惩罚，耐心重复训练 5)保持厕所清洁。'
    },
    {
      question: '宠物掉毛严重怎么办？',
      answer: '1)每天梳毛，去除死毛 2)补充营养，选择优质粮食 3)定期洗澡，使用护毛产品 4)检查是否皮肤病，必要时就医。'
    },
    {
      question: '宠物呕吐了要紧吗？',
      answer: '偶尔呕吐可能是正常的，但如果频繁呕吐、呕吐物带血、伴随腹泻发烧等症状，应立即就医。平时注意饮食规律，避免吃不干净的东西。'
    }
  ];

  return (
    <div className="pet-care">
      <div className="page-header">
        <h1>💝 宠物护理知识</h1>
        <p>科学养宠，让爱宠健康快乐成长</p>
      </div>

      <Row gutter={[24, 24]} className="care-topics">
        {careTopics.map((topic, index) => (
          <Col xs={24} sm={12} key={index}>
            <Card
              className="topic-card"
              title={
                <div className="topic-header">
                  <span className="topic-icon" style={{ color: topic.color }}>
                    {topic.icon}
                  </span>
                  <span>{topic.title}</span>
                </div>
              }
            >
              {topic.tips.map((tip, tipIndex) => (
                <div key={tipIndex} className="tip-item">
                  <Tag color="pink">{tip.title}</Tag>
                  <p>{tip.content}</p>
                </div>
              ))}
            </Card>
          </Col>
        ))}
      </Row>

      <div className="common-problems">
        <h2>💡 常见问题解答</h2>
        <Collapse accordion className="problems-collapse">
          {commonProblems.map((problem, index) => (
            <Panel header={problem.question} key={index}>
              <p>{problem.answer}</p>
            </Panel>
          ))}
        </Collapse>
      </div>

      <div className="care-reminder">
        <Card className="reminder-card">
          <h3>🌟 温馨提示</h3>
          <ul>
            <li>每只宠物都是独特的，护理方式需要根据品种、年龄、健康状况调整</li>
            <li>发现宠物异常行为或身体不适，及时咨询专业兽医</li>
            <li>定期学习宠物护理知识，做一个负责任的铲屎官</li>
            <li>给予宠物足够的陪伴和关爱，它们是家庭的一员</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default PetCare;
