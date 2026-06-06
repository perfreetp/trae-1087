import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import DoctorCard from '@/components/DoctorCard';
import { departments, timeSlots } from '@/data/doctors';
import { Appointment } from '@/types';
import { useApp } from '@/store';

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'cancelled', label: '已取消' },
  { value: 'completed', label: '已完成' },
];

const AppointmentPage: React.FC = () => {
  const router = useRouter();
  const { doctors, pets, appointments, addAppointment, cancelAppointment, selectedDoctorForAppointment, setSelectedDoctorForAppointment } = useApp();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const label = i === 0 ? '今天' : i === 1 ? '明天' : weekDays[date.getDay()];
      dates.push({ value: dateStr, label, day: date.getDate() });
    }
    return dates;
  }, []);

  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0].id);
    }
    const doctorToSelect = selectedDoctorForAppointment || router.params.doctorId;
    if (doctorToSelect) {
      setSelectedDoctor(doctorToSelect);
      setActiveTab(1);
      setSelectedDoctorForAppointment(null);
    }
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[1].value);
    }
  }, [pets, selectedDoctorForAppointment, router.params.doctorId, setSelectedDoctorForAppointment, dateOptions]);

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
      cancelled: styles.statusCancelled
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
          cancelAppointment(id);
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      }
    });
  };

  const isTimeSlotBooked = (timeSlot: string) => {
    return appointments.some(
      a => a.doctorId === selectedDoctor &&
           a.date === selectedDate &&
           a.timeSlot === timeSlot &&
           a.status !== 'cancelled'
    );
  };

  const hasDuplicateAppointment = () => {
    return appointments.some(
      a => a.petId === selectedPet &&
           a.date === selectedDate &&
           a.timeSlot === selectedTime &&
           a.status !== 'cancelled'
    );
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
    setSelectedTime('');
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
    if (hasDuplicateAppointment()) {
      Taro.showToast({ title: '该宠物同一时段已有预约', icon: 'none' });
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctor);
    const pet = pets.find(p => p.id === selectedPet);

    if (!doctor || !pet) return;

    const queueNumber = Math.floor(Math.random() * 20) + 1;

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
      queueNumber,
      symptoms: symptoms.trim(),
      createdAt: new Date().toLocaleString('zh-CN')
    };

    Taro.showModal({
      title: '确认预约',
      content: `确认预约 ${doctor.name} ${selectedDate} ${selectedTime} 的门诊吗？\n您的排队号：${queueNumber}号`,
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

  const sortedAppointments = useMemo(() => {
    let result = [...appointments];

    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(a =>
        a.petName.toLowerCase().includes(keyword) ||
        a.doctorName.toLowerCase().includes(keyword)
      );
    }

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [appointments, statusFilter, searchText]);

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
          <View className={styles.filterSection}>
            <View className={styles.filterTabs}>
              {filterOptions.map(opt => (
                <Text
                  key={opt.value}
                  className={`${styles.filterTab} ${statusFilter === opt.value ? styles.filterTabActive : ''}`}
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </Text>
              ))}
            </View>
            <View className={styles.searchBox}>
              <Text className={styles.searchIcon}>🔍</Text>
              <Input
                className={styles.searchInput}
                placeholder="搜索宠物名或医生名"
                value={searchText}
                onInput={(e) => setSearchText(e.detail.value)}
              />
            </View>
          </View>

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
                    {appt.queueNumber && appt.status !== 'cancelled' && (
                      <View className={styles.queueBox}>
                        <Text className={styles.queueNumber}>{appt.queueNumber}</Text>
                        <View className={styles.queueInfo}>
                          <Text className={styles.queueLabel}>排队号</Text>
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
                  onClick={() => { setSelectedDept(dept.id); setSelectedDoctor(''); setSelectedTime(''); }}
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
                <ScrollView scrollX className={styles.dateScroll}>
                  {dateOptions.map(date => (
                    <View
                      key={date.value}
                      className={`${styles.dateItem} ${selectedDate === date.value ? styles.dateItemActive : ''}`}
                      onClick={() => { setSelectedDate(date.value); setSelectedTime(''); }}
                    >
                      <Text className={styles.dateLabel}>{date.label}</Text>
                      <Text className={styles.dateDay}>{date.day}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>选择时段</Text>
                {!selectedDoctor ? (
                  <Text className={styles.tipText}>请先选择医生</Text>
                ) : (
                  <View className={styles.timeGrid}>
                    {timeSlots.map(slot => {
                      const booked = isTimeSlotBooked(slot);
                      return (
                        <Text
                          key={slot}
                          className={`${styles.timeSlot} ${selectedTime === slot ? styles.timeSlotActive : ''} ${booked ? styles.timeSlotDisabled : ''}`}
                          onClick={() => !booked && setSelectedTime(slot)}
                        >
                          {slot}
                          {booked && <Text className={styles.timeSlotTag}>已约满</Text>}
                        </Text>
                      );
                    })}
                  </View>
                )}
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
