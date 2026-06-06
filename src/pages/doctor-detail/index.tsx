import React from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { timeSlots } from '@/data/doctors';

const reviewsData = [
  {
    id: '1',
    name: '宠物主人***8',
    avatar: '🐱',
    rating: 5,
    content: '医生很专业，耐心解答了我所有的问题，猫咪恢复得很好！',
    time: '2024-05-20'
  },
  {
    id: '2',
    name: '宠物主人***3',
    avatar: '🐕',
    rating: 5,
    content: '挂号不贵，检查很仔细，开药也很合理，强烈推荐！',
    time: '2024-05-15'
  },
  {
    id: '3',
    name: '宠物主人***6',
    avatar: '🐰',
    rating: 4,
    content: '医生态度很好，就是排队时间有点长，建议早点到。',
    time: '2024-05-10'
  }
];

const DoctorDetailPage: React.FC = () => {
  const router = useRouter();
  const { doctors, setSelectedDoctorForAppointment } = useApp();
  const doctorId = router.params.id;

  const doctor = doctors.find(d => d.id === doctorId);

  if (!doctor) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text>未找到医生信息</Text>
        </View>
      </View>
    );
  }

  const handleAppointment = () => {
    setSelectedDoctorForAppointment(doctor.id);
    Taro.switchTab({
      url: '/pages/appointment/index'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.doctorInfo}>
          <View className={styles.avatar}>
            <Image className={styles.avatarImage} src={doctor.avatar} mode="aspectFill" />
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{doctor.name}</Text>
            <Text className={styles.title}>{doctor.title}</Text>
            <Text className={styles.department}>{doctor.department}</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.content}>
          <View className={styles.card}>
            <Text className={styles.cardTitle}>
              <Text className={styles.cardTitleIcon}>💰</Text>
              挂号费用
            </Text>
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel}>专家门诊</Text>
              <Text className={styles.priceValue}>
                <Text className={styles.unit}>¥</Text>{doctor.price}
              </Text>
            </View>
            <View className={styles.ratingRow}>
              <View className={styles.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Text key={star} className={styles.star}>
                    {star <= Math.floor(doctor.rating) ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>
              <Text className={styles.ratingText}>{doctor.rating}分 · {doctor.reviewCount}条评价</Text>
            </View>
          </View>

          <View className={styles.card}>
            <Text className={styles.cardTitle}>
              <Text className={styles.cardTitleIcon}>🎯</Text>
              擅长领域
            </Text>
            <View className={styles.specialtyTags}>
              {doctor.specialty.map((item, index) => (
                <Text key={index} className={styles.specialtyTag}>{item}</Text>
              ))}
            </View>
          </View>

          <View className={styles.card}>
            <Text className={styles.cardTitle}>
              <Text className={styles.cardTitleIcon}>📝</Text>
              医生简介
            </Text>
            <Text className={styles.introText}>{doctor.intro}</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>可预约时段</Text>
        <View className={styles.content}>
          <View className={styles.timeGrid}>
            {timeSlots.map((slot, index) => (
              <Text
                key={slot}
                className={`${styles.timeSlot} ${index % 5 === 2 ? styles.timeSlotDisabled : ''}`}
              >
                {slot}
              </Text>
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>用户评价</Text>
        <View className={styles.content}>
          <View className={styles.card}>
            {reviewsData.map(review => (
              <View key={review.id} className={styles.reviewItem}>
                <View className={styles.reviewHeader}>
                  <View className={styles.reviewAvatar}>
                    <Text>{review.avatar}</Text>
                  </View>
                  <Text className={styles.reviewName}>{review.name}</Text>
                  <View className={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Text key={star} className={styles.reviewStar}>
                        {star <= review.rating ? '⭐' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>
                <Text className={styles.reviewContent}>{review.content}</Text>
                <Text className={styles.reviewTime}>{review.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAppointment}>
          <Text className={styles.btnText}>立即预约</Text>
        </View>
      </View>
    </View>
  );
};

export default DoctorDetailPage;
