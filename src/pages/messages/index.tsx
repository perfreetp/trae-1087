import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { Message } from '@/types';

const MessagesPage: React.FC = () => {
  const { messages, setMessages } = useApp();

  const getTypeIcon = (type: string) => {
    const map: Record<string, string> = {
      appointment: '📅',
      result: '📋',
      notice: '📢',
      system: '🔔'
    };
    return map[type] || '📩';
  };

  const getTypeClass = (type: string) => {
    const map: Record<string, string> = {
      appointment: styles.typeAppointment,
      result: styles.typeResult,
      notice: styles.typeNotice,
      system: styles.typeSystem
    };
    return map[type] || '';
  };

  const handleMessageClick = (msg: Message) => {
    setMessages(prev =>
      prev.map(m => m.id === msg.id ? { ...m, read: true } : m)
    );

    if (msg.relatedType === 'appointment_detail' && msg.relatedId) {
      Taro.navigateTo({ url: `/pages/appointment-detail/index?id=${msg.relatedId}` });
    } else if (msg.relatedType === 'appointment') {
      Taro.switchTab({ url: '/pages/appointment/index' });
    } else if (msg.relatedType === 'reminder') {
      Taro.navigateTo({ url: '/pages/reminders/index' });
    } else if (msg.relatedType === 'record') {
      Taro.navigateTo({ url: '/pages/records/index' });
    } else if (msg.relatedType === 'bill') {
      Taro.navigateTo({ url: '/pages/bills/index' });
    } else if (msg.type === 'appointment') {
      Taro.switchTab({ url: '/pages/appointment/index' });
    } else if (msg.type === 'result') {
      Taro.navigateTo({ url: '/pages/records/index' });
    }
  };

  const handleReadAll = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    Taro.showToast({ title: '已全部标为已读', icon: 'success' });
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>消息中心</Text>
        {unreadCount > 0 && (
          <Text className={styles.readAll} onClick={handleReadAll}>全部已读</Text>
        )}
      </View>

      <View className={styles.content}>
        {messages.length > 0 ? (
          messages.map(msg => (
            <View
              key={msg.id}
              className={styles.messageItem}
              onClick={() => handleMessageClick(msg)}
            >
              {!msg.read && <View className={styles.unreadDot} />}
              <View className={styles.messageHeader}>
                <View className={`${styles.typeIcon} ${getTypeClass(msg.type)}`}>
                  <Text>{getTypeIcon(msg.type)}</Text>
                </View>
                <View className={styles.messageInfo}>
                  <Text className={styles.messageTitle}>{msg.title}</Text>
                  <Text className={styles.messageTime}>{msg.time}</Text>
                </View>
              </View>
              <Text className={styles.messageContent}>{msg.content}</Text>
              {msg.relatedType && (
                <View className={styles.messageRelated}>
                  <Text className={styles.relatedText}>
                    {msg.relatedType === 'appointment' && '查看预约 →'}
                    {msg.relatedType === 'reminder' && '查看提醒 →'}
                    {msg.relatedType === 'record' && '查看记录 →'}
                    {msg.relatedType === 'bill' && '查看账单 →'}
                  </Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyTip}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无消息</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default MessagesPage;
