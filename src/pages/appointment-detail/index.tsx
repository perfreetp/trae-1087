import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { Bill } from '@/types';

const AppointmentDetailPage: React.FC = () => {
  const router = useRouter();
  const { appointments, cancelAppointment, bills, addBill, doctors } = useApp();
  const apptId = router.params.id;

  const appointment = appointments.find(a => a.id === apptId);

  if (!appointment) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text>未找到预约信息</Text>
        </View>
      </View>
    );
  }

  const getStatusInfo = (status: string) => {
    const map: Record<string, { text: string; desc: string }> = {
      pending: { text: '待确认', desc: '诊所正在确认您的预约，请稍候' },
      confirmed: { text: '已确认', desc: '预约已确认，请按时就诊' },
      'in-progress': { text: '就诊中', desc: '当前正在就诊中' },
      completed: { text: '已完成', desc: '本次就诊已完成' },
      cancelled: { text: '已取消', desc: '预约已取消' }
    };
    return map[status] || { text: status, desc: '' };
  };

  const statusInfo = getStatusInfo(appointment.status);

  const handleCancel = () => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？取消后不可恢复。',
      success: (res) => {
        if (res.confirm) {
          cancelAppointment(apptId);
          Taro.showToast({ title: '已取消预约', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        }
      }
    });
  };

  const hasBill = bills.some(b => b.appointmentId === apptId);

  const handleGenerateBill = () => {
    if (hasBill) {
      const existingBill = bills.find(b => b.appointmentId === apptId);
      Taro.showModal({
        title: '账单已存在',
        content: '该预约已生成过账单，是否跳转到账单页面查看？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/bills/index' });
          }
        }
      });
      return;
    }

    const doctor = doctors.find(d => d.id === appointment?.doctorId);
    const registrationFee = doctor?.price || 50;

    const newBill: Bill = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: appointment?.department || '门诊',
      amount: registrationFee,
      status: 'pending',
      items: [
        { name: '挂号费', price: registrationFee, quantity: 1 }
      ],
      invoiceAvailable: true,
      invoiceStatus: 'not_applied',
      petId: appointment?.petId,
      petName: appointment?.petName,
      appointmentId: apptId
    };

    Taro.showModal({
      title: '生成账单',
      content: `确认生成 ${appointment?.petName} 的账单吗？\n挂号费：¥${registrationFee}`,
      success: (res) => {
        if (res.confirm) {
          addBill(newBill);
          Taro.showToast({ title: '账单生成成功', icon: 'success' });
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/bills/index' });
          }, 1000);
        }
      }
    });
  };

  const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed';
  const canGenerateBill = appointment.status === 'completed';

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.statusBar}>
        <Text className={styles.statusText}>{statusInfo.text}</Text>
        <Text className={styles.statusDesc}>{statusInfo.desc}</Text>
      </View>

      <View className={styles.content}>
        {appointment.queueNumber && canCancel && (
          <View className={styles.card}>
            <View className={styles.queueBox}>
              <Text className={styles.queueNumber}>{appointment.queueNumber}</Text>
              <View className={styles.queueInfo}>
                <Text className={styles.queueTitle}>当前排队号</Text>
                <Text className={styles.queueTip}>请提前15分钟到院签到，过号作废</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.card}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>🐾</Text>
            宠物信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>宠物姓名</Text>
            <Text className={styles.infoValue}>{appointment.petName}</Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>👨‍⚕️</Text>
            就诊信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>医生</Text>
            <Text className={styles.infoValue}>{appointment.doctorName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>科室</Text>
            <Text className={styles.infoValue}>{appointment.department}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>就诊日期</Text>
            <Text className={styles.infoValue}>{appointment.date}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>就诊时段</Text>
            <Text className={styles.infoValue}>{appointment.timeSlot}</Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>📝</Text>
            症状描述
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoValue} style={{ width: '100%' }}>
              {appointment.symptoms || '暂无'}
            </Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>ℹ️</Text>
            预约信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>预约编号</Text>
            <Text className={styles.infoValue}>APT{appointment.id}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>创建时间</Text>
            <Text className={styles.infoValue}>{appointment.createdAt}</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnOutline}`} onClick={() => Taro.navigateBack()}>
          <Text className={styles.btnText}>返回</Text>
        </View>
        {canCancel && (
          <View className={`${styles.btn} ${styles.btnDanger}`} onClick={handleCancel}>
            <Text className={styles.btnTextPrimary}>取消预约</Text>
          </View>
        )}
        {canGenerateBill && (
          <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleGenerateBill}>
            <Text className={styles.btnTextPrimary}>{hasBill ? '查看账单' : '生成账单'}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default AppointmentDetailPage;
