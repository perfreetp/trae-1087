import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { Reminder } from '@/types';

const typeOptions = [
  { value: 'medicine', label: '💊 用药提醒' },
  { value: 'recheck', label: '📅 复诊提醒' },
  { value: 'vaccine', label: '💉 疫苗提醒' },
];

const repeatOptions = [
  { value: '单次', label: '仅一次' },
  { value: '每日1次', label: '每日1次' },
  { value: '每日2次', label: '每日2次' },
  { value: '每日3次', label: '每日3次' },
  { value: '每周1次', label: '每周1次' },
  { value: '每月1次', label: '每月1次' },
  { value: '每年1次', label: '每年1次' },
];

const timeOptions = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

const RemindersPage: React.FC = () => {
  const { reminders, setReminders, addReminder, pets } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('medicine');
  const [formPet, setFormPet] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formRepeat, setFormRepeat] = useState('每日1次');

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
    if (pets.length > 0) {
      setFormPet(pets[0].id);
    }
    setFormType('medicine');
    setFormTitle('');
    setFormTime('08:00');
    setFormRepeat('每日1次');
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formPet) {
      Taro.showToast({ title: '请选择宠物', icon: 'none' });
      return;
    }
    if (!formTitle.trim()) {
      Taro.showToast({ title: '请输入提醒内容', icon: 'none' });
      return;
    }
    if (!formTime) {
      Taro.showToast({ title: '请选择提醒时间', icon: 'none' });
      return;
    }

    const pet = pets.find(p => p.id === formPet);
    if (!pet) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      type: formType as 'medicine' | 'recheck' | 'vaccine',
      title: formTitle.trim(),
      petName: pet.name,
      time: formTime,
      repeat: formRepeat,
      enabled: true
    };

    addReminder(newReminder);
    setShowForm(false);
    Taro.showToast({ title: '添加成功', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
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

      {showForm && (
        <View className={styles.formOverlay} onClick={() => setShowForm(false)}>
          <View className={styles.formSheet} onClick={(e) => e.stopPropagation()}>
            <View className={styles.formHeader}>
              <Text className={styles.formTitleText}>添加提醒</Text>
              <Text className={styles.formClose} onClick={() => setShowForm(false)}>×</Text>
            </View>

            <ScrollView scrollY className={styles.formContent}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>提醒类型</Text>
                <View className={styles.optionGrid}>
                  {typeOptions.map(opt => (
                    <Text
                      key={opt.value}
                      className={`${styles.optionItem} ${formType === opt.value ? styles.optionItemActive : ''}`}
                      onClick={() => setFormType(opt.value)}
                    >
                      {opt.label}
                    </Text>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>选择宠物</Text>
                <View className={styles.optionGrid}>
                  {pets.map(pet => (
                    <Text
                      key={pet.id}
                      className={`${styles.optionItem} ${formPet === pet.id ? styles.optionItemActive : ''}`}
                      onClick={() => setFormPet(pet.id)}
                    >
                      {pet.name}
                    </Text>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>
                  {formType === 'medicine' ? '药品名称' : formType === 'recheck' ? '复诊事项' : '疫苗名称'}
                </Text>
                <Input
                  className={styles.formInput}
                  placeholder={formType === 'medicine' ? '如：阿莫西林' : formType === 'recheck' ? '如：皮肤复查' : '如：狂犬疫苗'}
                  value={formTitle}
                  onInput={(e) => setFormTitle(e.detail.value)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>提醒时间</Text>
                <View className={styles.timeGrid}>
                  {timeOptions.map(time => (
                    <Text
                      key={time}
                      className={`${styles.timeSlot} ${formTime === time ? styles.timeSlotActive : ''}`}
                      onClick={() => setFormTime(time)}
                    >
                      {time}
                    </Text>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>重复规则</Text>
                <View className={styles.optionGrid}>
                  {repeatOptions.map(opt => (
                    <Text
                      key={opt.value}
                      className={`${styles.optionItem} ${formRepeat === opt.value ? styles.optionItemActive : ''}`}
                      onClick={() => setFormRepeat(opt.value)}
                    >
                      {opt.label}
                    </Text>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View className={styles.formFooter}>
              <View className={styles.formBtnCancel} onClick={() => setShowForm(false)}>
                <Text className={styles.formBtnText}>取消</Text>
              </View>
              <View className={styles.formBtnSubmit} onClick={handleSubmit}>
                <Text className={styles.formBtnTextPrimary}>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RemindersPage;
