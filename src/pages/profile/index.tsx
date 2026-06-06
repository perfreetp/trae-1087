import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { petsData } from '@/data/pets';
import { recordsData } from '@/data/records';
import { billsData } from '@/data/bills';

const ProfilePage: React.FC = () => {
  const menuItems = [
    { icon: '📋', text: '就诊记录', path: '/pages/records/index', color: styles.menuIconBlue },
    { icon: '💊', text: '用药提醒', path: '/pages/reminders/index', color: styles.menuIconGreen },
    { icon: '💰', text: '费用账单', path: '/pages/bills/index', color: styles.menuIconOrange },
    { icon: '📄', text: '电子发票', path: '', color: styles.menuIconPurple },
    { icon: '📊', text: '健康报告', path: '/pages/records/index', color: styles.menuIconBlue },
  ];

  const settingsItems = [
    { icon: '🔔', text: '消息通知设置', path: '', color: styles.menuIconOrange },
    { icon: '⚙️', text: '账号设置', path: '', color: styles.menuIconPurple },
    { icon: '📞', text: '客服热线', path: '', color: styles.menuIconGreen },
    { icon: 'ℹ️', text: '关于我们', path: '', color: styles.menuIconRed },
  ];

  const handleMenuClick = (path: string) => {
    if (path) {
      Taro.navigateTo({ url: path });
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  const handleCall = () => {
    Taro.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  };

  const handleNavigation = () => {
    Taro.showToast({ title: '正在打开地图...', icon: 'none' });
  };

  const totalSpent = billsData.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.userCard}>
        <View className={styles.avatar}>
          <Text>👤</Text>
        </View>
        <View className={styles.userInfo}>
          <Text className={styles.userName}>宠物主人</Text>
          <Text className={styles.userPhone}>138****8888</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{petsData.length}</Text>
            <Text className={styles.statLabel}>宠物</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{recordsData.length}</Text>
            <Text className={styles.statLabel}>就诊</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>¥{totalSpent}</Text>
            <Text className={styles.statLabel}>累计消费</Text>
          </View>
        </View>

        <View className={styles.menuGroup}>
          {menuItems.map((item, index) => (
            <View
              key={index}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.path)}
            >
              <View className={`${styles.menuIcon} ${item.color}`}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuText}>{item.text}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.clinicCard}>
          <View className={styles.clinicHeader}>
            <Text className={styles.clinicIcon}>🏥</Text>
            <Text className={styles.clinicName}>爱宠动物诊所</Text>
          </View>
          <Text className={styles.clinicInfo}>📍 北京市朝阳区建国路88号爱宠大厦1层</Text>
          <Text className={styles.clinicInfo}>⏰ 营业时间：09:00-21:00（24小时急诊）</Text>
          <Text className={styles.clinicInfo}>📞 联系电话：400-123-4567</Text>
          <View className={styles.clinicActions}>
            <View className={styles.clinicBtn} onClick={handleNavigation}>
              <Text className={styles.clinicBtnText}>导航前往</Text>
            </View>
            <View className={`${styles.clinicBtn} ${styles.clinicBtnPrimary}`} onClick={handleCall}>
              <Text className={styles.clinicBtnTextPrimary}>立即拨打</Text>
            </View>
          </View>
        </View>

        <View className={styles.menuGroup}>
          {settingsItems.map((item, index) => (
            <View
              key={index}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.path)}
            >
              <View className={`${styles.menuIcon} ${item.color}`}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuText}>{item.text}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
