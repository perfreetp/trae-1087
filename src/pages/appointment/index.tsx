import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import DoctorCard from '@/components/DoctorCard';
import { doctorsData, departments, timeSlots } from '@/data/doctors';
import { appointmentsData } from '@/data/appointments';
import { petsData } from '@/data/pets';
import { Appointment } from '@/types';

const AppointmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDept, setSelectedDept] = useState('all');
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');

  useEffect(() => {
    setMyAppointments(appointmentsData);
    if (petsData.length > 0) {
      setSelectedPet(petsData[0].id);
    }
  }, []);

  const tabs = ['我的预约', '预约挂号'];

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

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      pending: styles.statusPending,
      confirmed: styles.statusConfirmed,
      completed: styles.statusCompleted
    };
    return map[status] || '';
  };

  const handleAppointmentClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/appointment-detail/index?id=${id}`
    });
  };

  const handleCancel = (id: string) => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          setMyAppointments(prev =>
            prev.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a)
          );
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      }
    });
  };

  const filteredDoctors = selectedDept === 'all'
    ? doctorsData
    : doctorsData.filter(d => {
        const deptMap: Record<string, string> = {
          internal: '内科',
          surgery: '外科',
          dermatology: '皮肤科',
          ophthalmology: '眼科',
          preventive: '预防保健科'
        };
        return d.department === deptMap[selectedDept];
      });

  const handleSubmit = () => {
    if (!selectedPet || !selectedTime || !symptoms || !selectedDoctor) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认预约',
      content: '确认提交预约信息吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '预约成功', icon: 'success' });
          setActiveTab(0);
        }
      }
    });
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        {tabs.map((tab, index) => (
          <Text
            key={index}
            className={`${styles.tab} ${activeTab === index ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </Text>
        ))}
      </View>

      {activeTab === 0 && (
        <ScrollView scrollY>
          <View className={styles.content}>
            <View className={styles.myAppointments}>
              {myAppointments.length > 0 ? (
                myAppointments.map(appt => (
                  <View
                    key={appt.id}
                    className={styles.apptCard}
                    onClick={() => handleAppointmentClick(appt.id)}
                  >
                    <View className={styles.apptHeader}>
                      <Text className={styles.apptPet}>{appt.petName}</Text>
                      <Text className={`${styles.apptStatus} ${getStatusClass(appt.status)}`}>
                        {getStatusText(appt.status)}
                      </Text>
                    </View>
                    <View className={styles.apptInfo}>
                      <View className={styles.apptInfoRow}>
                        <Text className={styles.apptInfoIcon}>👨‍⚕️</Text>
                        <Text className={styles.apptInfoText}>{appt.doctorName} · {appt.department}</Text>
                      </View>
                      <View className={styles.apptInfoRow}>
                        <Text className={styles.apptInfoIcon}>📅</Text>
                        <Text className={styles.apptInfoText}>{appt.date} {appt.timeSlot}</Text>
                      </View>
                    </View>
                    {appt.queueNumber && appt.status === 'confirmed' && (
                      <View className={styles.queueBox}>
                        <Text className={styles.queueNumber}>{appt.queueNumber}</Text>
                        <View className={styles.queueInfo}>
                          <Text className={styles.queueLabel}>当前排队号</Text>
                          <Text className={styles.queueTip}>请提前15分钟到院签到</Text>
                        </View>
                      </View>
                    )}
                    <View className={styles.apptFooter}>
                      {appt.status === 'pending' || appt.status === 'confirmed' ? (
                        <View
                          className={styles.apptBtn}
                          onClick={(e) => { e.stopPropagation(); handleCancel(appt.id); }}
                        >
                          <Text className={styles.apptBtnText}>取消预约</Text>
                        </View>
                      ) : null}
                      {appt.status === 'completed' && (
                        <View className={`${styles.apptBtn} ${styles.apptBtnPrimary}`}>
                          <Text className={styles.apptBtnTextPrimary}>查看详情</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View className={styles.emptyTip}>
                  <Text className={styles.emptyIcon}>📅</Text>
                  <Text className={styles.emptyText}>暂无预约记录</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {activeTab === 1 && (
        <ScrollView scrollY>
          <View className={styles.content}>
            <ScrollView scrollX className={styles.departmentScroll}>
              {departments.map(dept => (
                <Text
                  key={dept.id}
                  className={`${styles.departmentItem} ${selectedDept === dept.id ? styles.departmentActive : ''}`}
                  onClick={() => setSelectedDept(dept.id)}
                >
                  {dept.name}
                </Text>
              ))}
            </ScrollView>

            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>选择医生</Text>
            </View>

            <View className={styles.doctorList}>
              {filteredDoctors.map(doctor => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  showAction={false}
                  onAction={() => handleDoctorSelect(doctor.id)}
                />
              ))}
            </View>

            <View className={styles.bookForm}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>选择宠物</Text>
                <View className={styles.petSelect}>
                  {petsData.map(pet => (
                    <Text
                      key={pet.id}
                      className={`${styles.petOption} ${selectedPet === pet.id ? styles.petOptionActive : ''}`}
                      onClick={() => setSelectedPet(pet.id)}
                    >
                      {pet.name}
                    </Text>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>选择时段</Text>
                <View className={styles.timeGrid}>
                  {timeSlots.map((slot, index) => (
                    <Text
                      key={slot}
                      className={`${styles.timeSlot} ${selectedTime === slot ? styles.timeSlotActive : ''} ${index % 5 === 2 ? styles.timeSlotDisabled : ''}`}
                      onClick={() => index % 5 !== 2 && setSelectedTime(slot)}
                    >
                      {slot}
                    </Text>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>症状描述</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="请详细描述宠物的症状，如：食欲不振、呕吐、精神不佳等"
                  value={symptoms}
                  onInput={(e) => setSymptoms(e.detail.value)}
                  maxlength={200}
                />
              </View>

              <View className={styles.submitBtn} onClick={handleSubmit}>
                <Text className={styles.submitBtnText}>确认预约</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default AppointmentPage;
