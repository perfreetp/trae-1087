import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import DoctorCard from '@/components/DoctorCard';
import { departments, timeSlots } from '@/data/doctors';
import { Appointment } from '@/types';
import { useApp } from '@/store';

const AppointmentPage: React.FC = () => {
  const router = useRouter();
  const { doctors, pets, appointments, addAppointment, setAppointments } = useApp();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');

  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0].id);
    }
    if (router.params.doctorId) {
      setSelectedDoctor(router.params.doctorId);
      setActiveTab(1);
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [pets, router.params.doctorId]);

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
      completed: styles.statusCompleted,
      cancelled: styles.statusCompleted
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
          setAppointments(prev =>
            prev.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a)
          );
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      }
    });
  };

  const filteredDoctors = selectedDept === 'all'
    ? doctors
    : doctors.filter(d => {
        const deptMap: Record<string, string> = {
          internal: '内科',
          surgery: '外科',
          dermatology: '皮肤科',
          ophthalmology: '眼科',
          preventive: '预防保健科'
        };
        return d.department === deptMap[selectedDept];
      });

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
  };

  const handleSubmit = () => {
    if (!selectedPet) {
      Taro.showToast({ title: '请选择宠物', icon: 'none' });
      return;
    }
    if (!selectedDoctor) {
      Taro.showToast({ title: '请选择医生', icon: 'none' });
      return;
    }
    if (!selectedTime) {
      Taro.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    if (!symptoms.trim()) {
      Taro.showToast({ title: '请填写症状描述', icon: 'none' });
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctor);
    const pet = pets.find(p => p.id === selectedPet);

    if (!doctor || !pet) return;

    const newAppt: Appointment = {
      id: Date.now().toString(),
      petId: pet.id,
      petName: pet.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      date: selectedDate,
      timeSlot: selectedTime,
      status: 'pending',
      queueNumber: Math.floor(Math.random() * 20) + 1,
      symptoms: symptoms.trim(),
      createdAt: new Date().toLocaleString('zh-CN')
    };

    Taro.showModal({
      title: '确认预约',
      content: `确认预约 ${doctor.name} ${selectedDate} ${selectedTime} 的门诊吗？`,
      success: (res) => {
        if (res.confirm) {
          addAppointment(newAppt);
          Taro.showToast({ title: '预约成功', icon: 'success' });
          setSelectedTime('');
          setSymptoms('');
          setActiveTab(0);
        }
      }
    });
  };

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
              {sortedAppointments.length > 0 ? (
                sortedAppointments.map(appt => (
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
                      {(appt.status === 'pending' || appt.status === 'confirmed') && (
                        <View
                          className={styles.apptBtn}
                          onClick={(e) => { e.stopPropagation(); handleCancel(appt.id); }}
                        >
                          <Text className={styles.apptBtnText}>取消预约</Text>
                        </View>
                      )}
                      <View className={`${styles.apptBtn} ${styles.apptBtnPrimary}`}>
                        <Text className={styles.apptBtnTextPrimary}>查看详情</Text>
                      </View>
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
              {selectedDoctor && (
                <Text style={{ fontSize: 24, color: '#2196F3' }}>已选中</Text>
              )}
            </View>

            <View className={styles.doctorList}>
              {filteredDoctors.map(doctor => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  showAction={false}
                  selectable
                  selected={selectedDoctor === doctor.id}
                  onSelect={handleDoctorSelect}
                />
              ))}
            </View>

            <View className={styles.bookForm}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>选择宠物</Text>
                <View className={styles.petSelect}>
                  {pets.map(pet => (
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
                <Text className={styles.formLabel}>预约日期</Text>
                <View className={styles.formInput}>
                  <Text>{selectedDate}</Text>
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
