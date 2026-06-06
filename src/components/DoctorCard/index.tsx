import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Doctor } from '@/types';

interface DoctorCardProps {
  doctor: Doctor;
  showAction?: boolean;
  onAction?: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, showAction = true, onAction }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/doctor-detail/index?id=${doctor.id}`
    });
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction();
    } else {
      Taro.navigateTo({
        url: `/pages/appointment/index?doctorId=${doctor.id}`
      });
    }
  };

  return (
    <View className={styles.doctorCard} onClick={handleClick}>
      <Image className={styles.avatar} src={doctor.avatar} mode="aspectFill" />
      <View className={styles.info}>
        <View className={styles.header}>
          <Text className={styles.name}>{doctor.name}</Text>
          <Text className={styles.title}>{doctor.title}</Text>
        </View>
        <Text className={styles.department}>{doctor.department}</Text>
        <View className={styles.specialty}>
          {doctor.specialty.slice(0, 3).map((item, index) => (
            <Text key={index} className={styles.tag}>{item}</Text>
          ))}
        </View>
        <View className={styles.footer}>
          <View className={styles.rating}>
            <Text className={styles.star}>⭐</Text>
            <Text className={styles.ratingText}>{doctor.rating}</Text>
            <Text className={styles.reviewCount}>({doctor.reviewCount}条评价)</Text>
          </View>
          {showAction && (
            <View className={styles.actionBtn} onClick={handleAction}>
              <Text className={styles.actionText}>预约</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default DoctorCard;
