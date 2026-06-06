import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const clinicsData = [
  {
    id: '1',
    name: '爱宠动物诊所（总店）',
    icon: '🏥',
    distance: '0.5km',
    address: '北京市朝阳区建国路88号爱宠大厦1层',
    phone: '010-12345678',
    hours: '09:00-21:00（24小时急诊）',
    services: ['全科门诊', '外科手术', '皮肤专科', '影像检查', '住院护理']
  },
  {
    id: '2',
    name: '爱宠动物诊所（朝阳分店）',
    icon: '🏥',
    distance: '1.2km',
    address: '北京市朝阳区朝阳北路100号万象汇B1层',
    phone: '010-87654321',
    hours: '09:00-21:00',
    services: ['全科门诊', '疫苗接种', '健康体检', '美容洗护']
  },
  {
    id: '3',
    name: '爱宠动物诊所（海淀分店）',
    icon: '🏥',
    distance: '3.8km',
    address: '北京市海淀区中关村大街1号中关村广场3层',
    phone: '010-11112222',
    hours: '09:00-20:00',
    services: ['全科门诊', '眼科专科', '牙科诊疗', '中兽医']
  },
  {
    id: '4',
    name: '爱宠24小时急诊中心',
    icon: '🚑',
    distance: '2.5km',
    address: '北京市朝阳区东三环中路55号急救中心1层',
    phone: '400-123-4567',
    hours: '24小时营业',
    services: ['急诊抢救', '夜间门诊', '外科急诊', '重症监护']
  }
];

const ClinicsPage: React.FC = () => {
  const handleCall = (phone: string) => {
    Taro.makePhoneCall({
      phoneNumber: phone
    });
  };

  const handleNavigate = (address: string) => {
    Taro.showModal({
      title: '导航前往',
      content: `即将打开地图导航到：${address}`,
      confirmText: '开始导航',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '正在打开地图...', icon: 'none' });
        }
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        {clinicsData.map(clinic => (
          <View key={clinic.id} className={styles.clinicCard}>
            <View className={styles.clinicHeader}>
              <View className={styles.clinicIcon}>
                <Text>{clinic.icon}</Text>
              </View>
              <View className={styles.clinicInfo}>
                <Text className={styles.clinicName}>{clinic.name}</Text>
                <Text className={styles.clinicDistance}>{clinic.distance}</Text>
              </View>
            </View>

            <View className={styles.clinicItem}>
              <Text className={styles.clinicItemIcon}>📍</Text>
              <Text className={styles.clinicItemText}>{clinic.address}</Text>
            </View>

            <View className={styles.clinicItem}>
              <Text className={styles.clinicItemIcon}>📞</Text>
              <Text className={styles.clinicItemText}>{clinic.phone}</Text>
            </View>

            <View className={styles.clinicItem}>
              <Text className={styles.clinicItemIcon}>⏰</Text>
              <Text className={styles.clinicItemText}>{clinic.hours}</Text>
            </View>

            <View className={styles.clinicItem}>
              <Text className={styles.clinicItemIcon}>✨</Text>
              <Text className={styles.clinicItemText}>{clinic.services.join(' · ')}</Text>
            </View>

            <View className={styles.clinicActions}>
              <View className={styles.actionBtn} onClick={() => handleNavigate(clinic.address)}>
                <Text className={styles.actionBtnText}>导航前往</Text>
              </View>
              <View className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => handleCall(clinic.phone)}>
                <Text className={styles.actionBtnTextPrimary}>立即拨打</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ClinicsPage;
