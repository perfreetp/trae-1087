import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import DoctorCard from '@/components/DoctorCard';
import { doctorsData } from '@/data/doctors';
import { useApp } from '@/store';
import { Appointment, Reminder } from '@/types';

const HomePage: React.FC = () => {
  const { appointments, reminders, messages, setReminders } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const todayAppointments = useMemo(() => {
    return appointments.filter(a => a.date === todayStr && a.status !== 'cancelled');
  }, [appointments, todayStr]);

  const todayReminders = useMemo(() => {
    return reminders.filter(r => {
      if (!r.enabled) return false;
      const reminderDate = r.time.split(' ')[0];
      const isToday = reminderDate === todayStr || reminderDate.length === 5;
      return isToday;
    });
  }, [reminders, todayStr]);

  const todayTodos = useMemo(() => {
    const todos: { type: string; id: string; title: string; subtitle: string; icon: string; data: Appointment | Reminder }[] = [];

    todayAppointments.forEach(appt => {
      todos.push({
        type: 'appointment',
        id: appt.id,
        title: `${appt.doctorName} · ${appt.department}`,
        subtitle: `${appt.timeSlot} · ${appt.petName}`,
        icon: '📅',
        data: appt
      });
    });

    todayReminders.forEach(reminder => {
      const typeIcon = reminder.type === 'medicine' ? '💊' : reminder.type === 'recheck' ? '📅' : '💉';
      const typeLabel = reminder.type === 'medicine' ? '用药' : reminder.type === 'recheck' ? '复诊' : '疫苗';
      todos.push({
        type: 'reminder',
        id: reminder.id,
        title: `${typeLabel}提醒：${reminder.title}`,
        subtitle: `${reminder.time} · ${reminder.petName}`,
        icon: typeIcon,
        data: reminder
      });
    });

    return todos;
  }, [todayAppointments, todayReminders]);

  const upcomingAppt = useMemo(() => {
    const activeAppts = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
    return activeAppts.length > 0 ? activeAppts[0] : null;
  }, [appointments]);

  const unreadCount = useMemo(() => {
    return messages.filter(m => !m.read).length;
  }, [messages]);

  const quickActions = [
    { icon: '📅', text: '预约挂号', color: 'rgba(33, 150, 243, 0.1)', path: '/pages/appointment/index', isTab: true },
    { icon: '🐾', text: '宠物档案', color: 'rgba(76, 175, 80, 0.1)', path: '/pages/pets/index', isTab: true },
    { icon: '📋', text: '就诊记录', color: 'rgba(255, 152, 0, 0.1)', path: '/pages/records/index', isTab: false },
    { icon: '💊', text: '用药提醒', color: 'rgba(244, 67, 54, 0.1)', path: '/pages/reminders/index', isTab: false },
    { icon: '💰', text: '费用账单', color: 'rgba(156, 39, 176, 0.1)', path: '/pages/bills/index', isTab: false },
    { icon: '💉', text: '疫苗本', color: 'rgba(0, 188, 212, 0.1)', path: '/pages/pets/index', isTab: true },
    { icon: '📊', text: '健康报告', color: 'rgba(255, 193, 7, 0.1)', path: '/pages/records/index', isTab: false },
    { icon: '📍', text: '附近门店', color: 'rgba(76, 175, 80, 0.1)', path: '/pages/clinics/index', isTab: false },
  ];

  const tabBarPages = ['/pages/home/index', '/pages/pets/index', '/pages/appointment/index', '/pages/messages/index', '/pages/profile/index'];

  const handleQuickAction = (path: string, isTab: boolean) => {
    if (path) {
      if (isTab || tabBarPages.includes(path)) {
        Taro.switchTab({ url: path });
      } else {
        Taro.navigateTo({ url: path });
      }
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  const handleEmergency = () => {
    Taro.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  };

  const handleTodoClick = (todo: any) => {
    if (todo.type === 'appointment') {
      Taro.switchTab({ url: '/pages/appointment/index' });
    } else if (todo.type === 'reminder') {
      Taro.switchTab({ url: '/pages/reminders/index' });
    }
  };

  const handleTodoComplete = (todo: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (todo.type === 'reminder') {
      setReminders(prev =>
        prev.map(r => r.id === todo.id ? { ...r, enabled: false } : r)
      );
      Taro.showToast({ title: '已完成', icon: 'success' });
    } else if (todo.type === 'appointment') {
      Taro.showToast({ title: '请前往预约详情操作', icon: 'none' });
    }
  };

  const handleAppointmentClick = () => {
    if (upcomingAppt) {
      Taro.switchTab({ url: '/pages/appointment/index' });
    }
  };

  const handleMessageClick = () => {
    Taro.switchTab({ url: '/pages/messages/index' });
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      'in-progress': '就诊中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return map[status] || status;
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.welcome}>
          <Text className={styles.greeting}>您好 👋</Text>
          <Text className={styles.subtitle}>今天也要好好照顾毛孩子哦~</Text>
        </View>
        <View className={styles.messageBtn} onClick={handleMessageClick}>
          <Text className={styles.messageIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View className={styles.badge}>
              <Text className={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.content}>
        {todayTodos.length > 0 && (
          <View className={styles.todoSection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>📌 今日待办 ({todayTodos.length})</Text>
            </View>
            <View className={styles.todoList}>
              {todayTodos.map(todo => (
                <View
                  key={`${todo.type}-${todo.id}`}
                  className={styles.todoItem}
                  onClick={() => handleTodoClick(todo)}
                >
                  <View className={styles.todoIcon}>{todo.icon}</View>
                  <View className={styles.todoContent}>
                    <Text className={styles.todoTitle}>{todo.title}</Text>
                    <Text className={styles.todoSubtitle}>{todo.subtitle}</Text>
                  </View>
                  <View
                    className={styles.todoAction}
                    onClick={(e) => handleTodoComplete(todo, e)}
                  >
                    <Text className={styles.todoActionText}>完成</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.banner}>
          <Image
            className={styles.bannerImage}
            src="https://picsum.photos/id/1025/750/400"
            mode="aspectFill"
          />
          <View className={styles.bannerOverlay}>
            <Text className={styles.bannerTitle}>🐶 夏季宠物健康护理</Text>
            <Text className={styles.bannerDesc}>防暑降温、驱虫防疫全攻略，点击了解更多</Text>
          </View>
        </View>

        <View className={styles.quickGrid}>
          {quickActions.map((item, index) => (
            <View
              key={index}
              className={styles.quickItem}
              onClick={() => handleQuickAction(item.path, item.isTab)}
            >
              <View className={styles.quickIcon} style={{ background: item.color }}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.quickText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View className={styles.emergencyCard} onClick={handleEmergency}>
          <View className={styles.emergencyInfo}>
            <Text className={styles.emergencyTitle}>🚨 24小时急诊服务</Text>
            <Text className={styles.emergencyDesc}>突发情况？立即拨打急诊热线</Text>
          </View>
          <View className={styles.emergencyBtn}>
            <Text className={styles.emergencyBtnText}>立即拨打</Text>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>近期预约</Text>
          <Text className={styles.sectionMore} onClick={() => Taro.switchTab({ url: '/pages/appointment/index' })}>查看全部</Text>
        </View>

        {upcomingAppt ? (
          <View className={styles.appointmentCard} onClick={handleAppointmentClick}>
            <View className={styles.apptHeader}>
              <Text className={styles.apptDoctor}>{upcomingAppt.doctorName} · {upcomingAppt.department}</Text>
              <Text className={`${styles.apptStatus} ${upcomingAppt.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending}`}>
                {getStatusText(upcomingAppt.status)}
              </Text>
            </View>
            <View className={styles.apptInfo}>
              <View className={styles.apptInfoItem}>
                <Text className={styles.apptIcon}>🐾</Text>
                <Text>{upcomingAppt.petName}</Text>
              </View>
              <View className={styles.apptInfoItem}>
                <Text className={styles.apptIcon}>📅</Text>
                <Text>{upcomingAppt.date}</Text>
              </View>
              <View className={styles.apptInfoItem}>
                <Text className={styles.apptIcon}>⏰</Text>
                <Text>{upcomingAppt.timeSlot}</Text>
              </View>
            </View>
            {upcomingAppt.queueNumber && (
              <View className={styles.queueBox}>
                <View className={styles.queueInfo}>
                  <Text className={styles.queueNumber}>{upcomingAppt.queueNumber}</Text>
                  <Text className={styles.queueLabel}>号</Text>
                </View>
                <Text className={styles.queueTip}>请提前15分钟到院签到</Text>
              </View>
            )}
          </View>
        ) : (
          <View className={styles.emptyTip}>暂无预约，快去预约吧~</View>
        )}

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>推荐医生</Text>
          <Text className={styles.sectionMore} onClick={() => Taro.switchTab({ url: '/pages/appointment/index' })}>查看全部</Text>
        </View>

        <View className={styles.doctorList}>
          {doctorsData.slice(0, 3).map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
