import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { remindersData } from '@/data/bills';
import { Reminder } from '@/types';

const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(remindersData);

  const getTypeIcon = (type: string) => {
    const map: Record<string, string> = {
      medicine: '💊',
      recheck: '📅',
      vaccine: '💉'
    };
    return map[type] || '🔔';
  };

  const getTypeClass = (type: string) => {
    const map: Record<string, string> = {
      medicine: styles.typeMedicine,
      recheck: styles.typeRecheck,
      vaccine: styles.typeVaccine
    };
    return map[type] || '';
  };

  const handleToggle = (id: string) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  };

  const handleAdd = () => {
    Taro.showToast({ title: '添加提醒功能开发中', icon: 'none' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>用药提醒</Text>
        <View className={styles.addBtn} onClick={handleAdd}>
          <Text className={styles.addBtnText}>+ 添加提醒</Text>
        </View>
      </View>

      <View className={styles.content}>
        {reminders.length > 0 ? (
          reminders.map(reminder => (
            <View key={reminder.id} className={styles.reminderCard}>
              <View className={styles.reminderHeader}>
                <View className={`${styles.typeIcon} ${getTypeClass(reminder.type)}`}>
                  <Text>{getTypeIcon(reminder.type)}</Text>
                </View>
                <View className={styles.reminderInfo}>
                  <Text className={styles.reminderTitle}>{reminder.title}</Text>
                  <Text className={styles.reminderPet}>{reminder.petName}</Text>
                </View>
              </View>
              <View className={styles.reminderTime}>
                <View className={styles.timeInfo}>
                  <Text className={styles.timeText}>{reminder.time}</Text>
                  <Text className={styles.repeatText}>{reminder.repeat}</Text>
                </View>
                <View
                  className={`${styles.switch} ${reminder.enabled ? styles.switchActive : ''}`}
                  onClick={() => handleToggle(reminder.id)}
                >
                  <View className={`${styles.switchDot} ${reminder.enabled ? styles.switchDotActive : ''}`} />
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyTip}>
            <Text className={styles.emptyIcon}>💊</Text>
            <Text className={styles.emptyText}>暂无用药提醒</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default RemindersPage;
