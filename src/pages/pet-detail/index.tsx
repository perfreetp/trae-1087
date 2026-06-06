import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { Pet, WeightRecord } from '@/types';
import { recordsData } from '@/data/records';

const tabOptions = [
  { value: 'basic', label: '基本信息' },
  { value: 'weight', label: '体重记录' },
  { value: 'summary', label: '健康摘要' },
  { value: 'vaccine', label: '疫苗本' },
];

const PetDetailPage: React.FC = () => {
  const router = useRouter();
  const { pets, updatePet, reminders, bills, appointments, savedPrescriptions } = useApp();
  const petId = router.params.id;

  const pet = pets.find(p => p.id === petId);
  const [activeTab, setActiveTab] = useState('basic');
  const [newWeight, setNewWeight] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [showReport, setShowReport] = useState(false);

  if (!pet) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text>未找到宠物信息</Text>
        </View>
      </View>
    );
  }

  const getSpeciesText = (species: string) => {
    const map: Record<string, string> = {
      dog: '狗狗',
      cat: '猫咪',
      other: '其他'
    };
    return map[species] || species;
  };

  const getGenderText = (gender: string) => {
    return gender === 'male' ? '♂ 公' : '♀ 母';
  };

  const handleAddWeight = () => {
    if (!newWeight || parseFloat(newWeight) <= 0) {
      Taro.showToast({ title: '请输入有效体重', icon: 'none' });
      return;
    }

    const newRecord: WeightRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newWeight)
    };

    const updatedPet: Pet = {
      ...pet,
      weight: parseFloat(newWeight),
      weightRecords: [...pet.weightRecords, newRecord]
    };

    updatePet(updatedPet);
    setNewWeight('');
    Taro.showToast({ title: '添加成功', icon: 'success' });
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim() && !pet.allergies.includes(allergyInput.trim())) {
      const updatedPet: Pet = {
        ...pet,
        allergies: [...pet.allergies, allergyInput.trim()]
      };
      updatePet(updatedPet);
      setAllergyInput('');
    }
  };

  const handleDeleteAllergy = (item: string) => {
    const updatedPet: Pet = {
      ...pet,
      allergies: pet.allergies.filter(a => a !== item)
    };
    updatePet(updatedPet);
  };

  const handleAddVaccine = () => {
    Taro.chooseImage({
      count: 9 - pet.vaccineBook.length,
      success: (res) => {
        const updatedPet: Pet = {
          ...pet,
          vaccineBook: [...pet.vaccineBook, ...res.tempFilePaths]
        };
        updatePet(updatedPet);
      }
    });
  };

  const handleDeleteVaccine = (index: number) => {
    const updatedPet: Pet = {
      ...pet,
      vaccineBook: pet.vaccineBook.filter((_, i) => i !== index)
    };
    updatePet(updatedPet);
  };

  const petReminders = useMemo(() => {
    return reminders.filter(r => r.petId === pet.id || r.petName === pet.name);
  }, [reminders, pet.id, pet.name]);

  const activeRemindersCount = useMemo(() => {
    return petReminders.filter(r => r.enabled).length;
  }, [petReminders]);

  const petBills = useMemo(() => {
    return bills.filter(b => b.petId === pet.id || b.petName === pet.name);
  }, [bills, pet.id, pet.name]);

  const latestBill = useMemo(() => {
    return petBills.length > 0 ? petBills[0] : null;
  }, [petBills]);

  const totalSpending = useMemo(() => {
    return petBills.reduce((sum, bill) => sum + bill.amount, 0);
  }, [petBills]);

  const petAppointments = useMemo(() => {
    return appointments.filter(a => a.petId === pet.id || a.petName === pet.name);
  }, [appointments, pet.id, pet.name]);

  const latestPrescription = useMemo(() => {
    const petSaved = savedPrescriptions.filter(p => p.petName === pet.name);
    if (petSaved.length > 0) return petSaved[0];

    const petRecords = recordsData.filter(r => r.petId === pet.id && r.prescriptions.length > 0);
    if (petRecords.length > 0) {
      return {
        date: petRecords[0].date,
        prescriptions: petRecords[0].prescriptions,
        doctorName: petRecords[0].doctorName
      };
    }
    return null;
  }, [savedPrescriptions, pet.id, pet.name]);

  const handleExportSummary = (fullReport: boolean = false) => {
    const content = fullReport
      ? `确认导出 ${pet.name} 的完整健康报告吗？将包含：\n• 基本信息\n• 体重记录（${pet.weightRecords.length}条）\n• 过敏史（${pet.allergies.length}项）\n• 疫苗本（${pet.vaccineBook.length}张）\n• 预约记录（${petAppointments.length}条）\n• 就诊处方（${savedPrescriptions.filter(p => p.petName === pet.name).length + recordsData.filter(r => r.petId === pet.id).length}条）\n• 账单明细（${petBills.length}条，累计消费¥${totalSpending.toFixed(2)}）\n• 用药提醒（${petReminders.length}条）`
      : `确认导出 ${pet.name} 的健康摘要吗？将包含基本信息、体重记录、过敏史、疫苗本信息。`;

    Taro.showModal({
      title: fullReport ? '导出完整健康报告' : '导出健康摘要',
      content,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '导出中...' });
          setTimeout(() => {
            Taro.hideLoading();
            if (fullReport) {
              setShowReport(true);
            } else {
              Taro.showToast({
                title: '导出成功！已保存到相册',
                icon: 'success',
                duration: 2000
              });
            }
          }, 1500);
        }
      }
    });
  };

  const sortedWeightRecords = useMemo(() => {
    return [...pet.weightRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [pet.weightRecords]);

  const latestRecord = useMemo(() => {
    const petRecords = recordsData.filter(r => r.petId === pet.id);
    return petRecords.length > 0 ? petRecords[0] : null;
  }, [pet.id]);

  const weightChange = useMemo(() => {
    if (sortedWeightRecords.length < 2) return null;
    const latest = sortedWeightRecords[0].weight;
    const previous = sortedWeightRecords[1].weight;
    return (latest - previous).toFixed(2);
  }, [sortedWeightRecords]);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.avatar}>
          <Image className={styles.avatarImage} src={pet.avatar} mode="aspectFill" />
        </View>
        <View className={styles.petInfo}>
          <Text className={styles.petName}>{pet.name}</Text>
          <Text className={styles.petMeta}>{getSpeciesText(pet.species)} · {pet.breed}</Text>
          <Text className={styles.petMeta}>{getGenderText(pet.gender)} · {pet.birthday}</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabOptions.map(tab => (
          <Text
            key={tab.value}
            className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Text>
        ))}
      </View>

      <ScrollView scrollY className={styles.scrollContent}>
        <View className={styles.content}>
          {activeTab === 'basic' && (
            <View>
              <View className={styles.section}>
                <Text className={styles.sectionTitle}>基本信息</Text>
                <View className={styles.infoGrid}>
                  <View className={styles.infoItem}>
                    <Text className={styles.infoLabel}>当前体重</Text>
                    <Text className={styles.infoValue}>{pet.weight || 0} kg</Text>
                  </View>
                  <View className={styles.infoItem}>
                    <Text className={styles.infoLabel}>体重记录</Text>
                    <Text className={styles.infoValue}>{pet.weightRecords.length} 条</Text>
                  </View>
                  <View className={styles.infoItem}>
                    <Text className={styles.infoLabel}>过敏史</Text>
                    <Text className={styles.infoValue}>{pet.allergies.length} 项</Text>
                  </View>
                  <View className={styles.infoItem}>
                    <Text className={styles.infoLabel}>疫苗本</Text>
                    <Text className={styles.infoValue}>{pet.vaccineBook.length} 张</Text>
                  </View>
                </View>
              </View>

              <View className={styles.section}>
                <Text className={styles.sectionTitle}>过敏史</Text>
                {pet.allergies.length > 0 ? (
                  <View className={styles.allergyTags}>
                    {pet.allergies.map((item, index) => (
                      <View key={index} className={styles.allergyTag}>
                        <Text className={styles.allergyTagText}>{item}</Text>
                        <Text className={styles.allergyTagClose} onClick={() => handleDeleteAllergy(item)}>×</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className={styles.emptyAllergy}>暂无过敏记录</Text>
                )}
                <View className={styles.allergyInputWrap}>
                  <Input
                    className={styles.allergyInput}
                    placeholder="添加过敏原，如：鸡肉、花粉"
                    value={allergyInput}
                    onInput={(e) => setAllergyInput(e.detail.value)}
                    onConfirm={handleAddAllergy}
                  />
                  <View className={styles.allergyAddBtn} onClick={handleAddAllergy}>
                    <Text className={styles.allergyAddBtnText}>添加</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'weight' && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>体重记录</Text>
              <View className={styles.weightList}>
                {sortedWeightRecords.length > 0 ? (
                  sortedWeightRecords.map((record, index) => (
                    <View key={record.id} className={styles.weightItem}>
                      <Text className={styles.weightDate}>{record.date}</Text>
                      <Text className={styles.weightValue}>{record.weight} kg</Text>
                      {index === 0 && weightChange !== null && (
                        <Text className={`${styles.weightChange} ${parseFloat(weightChange) >= 0 ? styles.weightUp : styles.weightDown}`}>
                          {parseFloat(weightChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(weightChange))} kg
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={{ fontSize: 28, color: '#86909C', padding: '20rpx 0' }}>暂无体重记录</Text>
                )}
              </View>
              <View className={styles.weightAdd}>
                <Input
                  className={styles.weightInput}
                  type="digit"
                  placeholder="输入体重 (kg)"
                  value={newWeight}
                  onInput={(e) => setNewWeight(e.detail.value)}
                />
                <View className={styles.weightAddBtn} onClick={handleAddWeight}>
                  <Text className={styles.weightAddBtnText}>记录</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'summary' && (
            <View>
              <View className={styles.summaryCard}>
                <View className={styles.summaryHeader}>
                  <Text className={styles.summaryTitle}>健康摘要</Text>
                  <View className={styles.exportBtnRow}>
                    <View className={styles.exportBtn} onClick={() => handleExportSummary(false)}>
                      <Text className={styles.exportBtnText}>📤 导出摘要</Text>
                    </View>
                    <View className={`${styles.exportBtn} ${styles.exportBtnPrimary}`} onClick={() => handleExportSummary(true)}>
                      <Text className={styles.exportBtnTextPrimary}>📄 完整报告</Text>
                    </View>
                  </View>
                </View>

                <View className={styles.summarySection}>
                  <Text className={styles.summaryLabel}>📊 最近体重变化</Text>
                  {sortedWeightRecords.length > 0 ? (
                    <View className={styles.summaryWeight}>
                      <Text className={styles.summaryWeightValue}>
                        {sortedWeightRecords[0].weight} kg
                      </Text>
                      {weightChange !== null && (
                        <Text className={`${styles.summaryWeightChange} ${parseFloat(weightChange) >= 0 ? styles.weightUp : styles.weightDown}`}>
                          {parseFloat(weightChange) >= 0 ? '较上次 +' : '较上次 '}{weightChange} kg
                        </Text>
                      )}
                      <Text className={styles.summaryWeightDate}>
                        最近记录：{sortedWeightRecords[0].date}
                      </Text>
                    </View>
                  ) : (
                    <Text className={styles.summaryEmpty}>暂无体重记录</Text>
                  )}
                </View>

                <View className={styles.summarySection}>
                  <Text className={styles.summaryLabel}>⚠️ 过敏史</Text>
                  {pet.allergies.length > 0 ? (
                    <View className={styles.summaryTags}>
                      {pet.allergies.map((item, i) => (
                        <Text key={i} className={styles.summaryTag}>{item}</Text>
                      ))}
                    </View>
                  ) : (
                    <Text className={styles.summaryEmpty}>无已知过敏原</Text>
                  )}
                </View>

                <View className={styles.summarySection}>
                  <Text className={styles.summaryLabel}>💉 疫苗本</Text>
                  <Text className={styles.summaryValue}>
                    {pet.vaccineBook.length} 张记录
                  </Text>
                </View>

                <View className={styles.summarySection}>
                  <Text className={styles.summaryLabel}>🏥 最近就诊</Text>
                  {latestRecord ? (
                    <View className={styles.summaryRecord}>
                      <View className={styles.summaryRecordRow}>
                        <Text className={styles.summaryRecordLabel}>日期</Text>
                        <Text className={styles.summaryRecordValue}>{latestRecord.date}</Text>
                      </View>
                      <View className={styles.summaryRecordRow}>
                        <Text className={styles.summaryRecordLabel}>医生</Text>
                        <Text className={styles.summaryRecordValue}>{latestRecord.doctorName} · {latestRecord.department}</Text>
                      </View>
                      <View className={styles.summaryRecordRow}>
                        <Text className={styles.summaryRecordLabel}>诊断</Text>
                        <Text className={styles.summaryRecordValue}>{latestRecord.diagnosis}</Text>
                      </View>
                    </View>
                  ) : (
                    <Text className={styles.summaryEmpty}>暂无就诊记录</Text>
                  )}
                </View>

                <View className={styles.summarySection}>
                  <Text className={styles.summaryLabel}>💊 最近处方用药</Text>
                  {latestPrescription ? (
                    <View className={styles.summaryPrescription}>
                      <Text className={styles.summaryPrescriptionDate}>
                        {latestPrescription.date} · {latestPrescription.doctorName}
                      </Text>
                      <View className={styles.summaryPrescriptionList}>
                        {latestPrescription.prescriptions.slice(0, 2).map((p: any, i: number) => (
                          <Text key={i} className={styles.summaryPrescriptionItem}>
                            • {p.name} ({p.dosage}, {p.frequency})
                          </Text>
                        ))}
                        {latestPrescription.prescriptions.length > 2 && (
                          <Text className={styles.summaryPrescriptionMore}>
                            等 {latestPrescription.prescriptions.length} 种药品
                          </Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <Text className={styles.summaryEmpty}>暂无处方记录</Text>
                  )}
                </View>

                <View className={styles.summarySection}>
                  <Text className={styles.summaryLabel}>🔔 待完成提醒</Text>
                  <View className={styles.summaryStats}>
                    <View className={styles.summaryStat}>
                      <Text className={styles.summaryStatValue}>{activeRemindersCount}</Text>
                      <Text className={styles.summaryStatLabel}>进行中</Text>
                    </View>
                    <View className={styles.summaryStat}>
                      <Text className={styles.summaryStatValue}>{petReminders.length - activeRemindersCount}</Text>
                      <Text className={styles.summaryStatLabel}>已停用</Text>
                    </View>
                    <View className={styles.summaryStat}>
                      <Text className={styles.summaryStatValue}>{petAppointments.length}</Text>
                      <Text className={styles.summaryStatLabel}>预约记录</Text>
                    </View>
                  </View>
                </View>

                <View className={styles.summarySection}>
                  <Text className={styles.summaryLabel}>💰 最近账单</Text>
                  {latestBill ? (
                    <View className={styles.summaryBill}>
                      <View className={styles.summaryBillRow}>
                        <Text className={styles.summaryBillLabel}>最近消费</Text>
                        <Text className={styles.summaryBillValue}>¥{latestBill.amount.toFixed(2)}</Text>
                      </View>
                      <View className={styles.summaryBillRow}>
                        <Text className={styles.summaryBillLabel}>累计消费</Text>
                        <Text className={styles.summaryBillValue}>¥{totalSpending.toFixed(2)}</Text>
                      </View>
                      <View className={styles.summaryBillRow}>
                        <Text className={styles.summaryBillLabel}>账单数量</Text>
                        <Text className={styles.summaryBillValue}>{petBills.length} 笔</Text>
                      </View>
                    </View>
                  ) : (
                    <Text className={styles.summaryEmpty}>暂无账单记录</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {activeTab === 'vaccine' && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>疫苗本</Text>
              <View className={styles.vaccineList}>
                {pet.vaccineBook.map((img, index) => (
                  <View key={index} className={styles.vaccineItem}>
                    <Image className={styles.vaccineImage} src={img} mode="aspectFill" />
                    <View className={styles.vaccineDelete} onClick={() => handleDeleteVaccine(index)}>
                      <Text className={styles.vaccineDeleteText}>×</Text>
                    </View>
                  </View>
                ))}
                {pet.vaccineBook.length < 9 && (
                  <View className={styles.vaccineAdd} onClick={handleAddVaccine}>
                    <Text className={styles.vaccineAddIcon}>+</Text>
                    <Text className={styles.vaccineAddText}>添加图片</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {showReport && (
        <View className={styles.reportOverlay} onClick={() => setShowReport(false)}>
          <View className={styles.reportSheet} onClick={(e) => e.stopPropagation()}>
            <View className={styles.reportHeader}>
              <Text className={styles.reportTitle}>{pet.name} 的完整健康报告</Text>
              <Text className={styles.reportClose} onClick={() => setShowReport(false)}>×</Text>
            </View>

            <ScrollView scrollY className={styles.reportContent}>
              <View className={styles.reportSection}>
                <Text className={styles.reportSectionTitle}>📋 基本信息</Text>
                <View className={styles.reportInfoGrid}>
                  <View className={styles.reportInfoItem}>
                    <Text className={styles.reportInfoLabel}>宠物名</Text>
                    <Text className={styles.reportInfoValue}>{pet.name}</Text>
                  </View>
                  <View className={styles.reportInfoItem}>
                    <Text className={styles.reportInfoLabel}>种类</Text>
                    <Text className={styles.reportInfoValue}>{getSpeciesText(pet.species)}</Text>
                  </View>
                  <View className={styles.reportInfoItem}>
                    <Text className={styles.reportInfoLabel}>品种</Text>
                    <Text className={styles.reportInfoValue}>{pet.breed}</Text>
                  </View>
                  <View className={styles.reportInfoItem}>
                    <Text className={styles.reportInfoLabel}>性别</Text>
                    <Text className={styles.reportInfoValue}>{getGenderText(pet.gender)}</Text>
                  </View>
                  <View className={styles.reportInfoItem}>
                    <Text className={styles.reportInfoLabel}>生日</Text>
                    <Text className={styles.reportInfoValue}>{pet.birthday}</Text>
                  </View>
                  <View className={styles.reportInfoItem}>
                    <Text className={styles.reportInfoLabel}>当前体重</Text>
                    <Text className={styles.reportInfoValue}>{pet.weight || 0} kg</Text>
                  </View>
                </View>
              </View>

              <View className={styles.reportSection}>
                <Text className={styles.reportSectionTitle}>📊 体重记录 ({pet.weightRecords.length}条)</Text>
                {sortedWeightRecords.length > 0 ? (
                  sortedWeightRecords.slice(0, 5).map(record => (
                    <View key={record.id} className={styles.reportListItem}>
                      <Text className={styles.reportListItemText}>{record.date}</Text>
                      <Text className={styles.reportListItemText}>{record.weight} kg</Text>
                    </View>
                  ))
                ) : (
                  <Text className={styles.reportEmpty}>暂无体重记录</Text>
                )}
              </View>

              <View className={styles.reportSection}>
                <Text className={styles.reportSectionTitle}>⚠️ 过敏史 ({pet.allergies.length}项)</Text>
                {pet.allergies.length > 0 ? (
                  <View className={styles.reportTags}>
                    {pet.allergies.map((item, i) => (
                      <Text key={i} className={styles.reportTag}>{item}</Text>
                    ))}
                  </View>
                ) : (
                  <Text className={styles.reportEmpty}>无已知过敏原</Text>
                )}
              </View>

              <View className={styles.reportSection}>
                <Text className={styles.reportSectionTitle}>💉 疫苗本 ({pet.vaccineBook.length}张)</Text>
                <Text className={styles.reportEmpty}>
                  {pet.vaccineBook.length > 0 ? '已上传疫苗本图片' : '暂无疫苗本记录'}
                </Text>
              </View>

              <View className={styles.reportSection}>
                <Text className={styles.reportSectionTitle}>📅 预约记录 ({petAppointments.length}条)</Text>
                {petAppointments.length > 0 ? (
                  petAppointments.slice(0, 3).map(appt => (
                    <View key={appt.id} className={styles.reportListItem}>
                      <Text className={styles.reportListItemText}>{appt.date} {appt.timeSlot}</Text>
                      <Text className={styles.reportListItemText}>{appt.doctorName}</Text>
                    </View>
                  ))
                ) : (
                  <Text className={styles.reportEmpty}>暂无预约记录</Text>
                )}
              </View>

              <View className={styles.reportSection}>
                <Text className={styles.reportSectionTitle}>🏥 就诊记录 ({recordsData.filter(r => r.petId === pet.id).length}条)</Text>
                {recordsData.filter(r => r.petId === pet.id).length > 0 ? (
                  recordsData.filter(r => r.petId === pet.id).slice(0, 3).map(record => (
                    <View key={record.id} className={styles.reportListItem}>
                      <Text className={styles.reportListItemText}>{record.date}</Text>
                      <Text className={styles.reportListItemText}>{record.diagnosis}</Text>
                    </View>
                  ))
                ) : (
                  <Text className={styles.reportEmpty}>暂无就诊记录</Text>
                )}
              </View>

              <View className={styles.reportSection}>
                <Text className={styles.reportSectionTitle}>💊 已保存处方 ({savedPrescriptions.filter(p => p.petName === pet.name).length}条)</Text>
                {savedPrescriptions.filter(p => p.petName === pet.name).length > 0 ? (
                  savedPrescriptions.filter(p => p.petName === pet.name).slice(0, 2).map(presc => (
                    <View key={presc.id} className={styles.reportListItem}>
                      <Text className={styles.reportListItemText}>{presc.date}</Text>
                      <Text className={styles.reportListItemText}>{presc.doctorName}</Text>
                    </View>
                  ))
                ) : (
                  <Text className={styles.reportEmpty}>暂无保存的处方</Text>
                )}
              </View>

              <View className={styles.reportSection}>
                <Text className={styles.reportSectionTitle}>💰 账单明细 ({petBills.length}条)</Text>
                <View className={styles.reportBillSummary}>
                  <Text className={styles.reportBillAmount}>累计消费：¥{totalSpending.toFixed(2)}</Text>
                </View>
                {petBills.length > 0 ? (
                  petBills.slice(0, 3).map(bill => (
                    <View key={bill.id} className={styles.reportListItem}>
                      <Text className={styles.reportListItemText}>{bill.date}</Text>
                      <Text className={styles.reportListItemText}>¥{bill.amount.toFixed(2)}</Text>
                    </View>
                  ))
                ) : (
                  <Text className={styles.reportEmpty}>暂无账单记录</Text>
                )}
              </View>

              <View className={styles.reportSection}>
                <Text className={styles.reportSectionTitle}>🔔 用药提醒 ({petReminders.length}条)</Text>
                <View className={styles.reportBillSummary}>
                  <Text className={styles.reportBillAmount}>进行中：{activeRemindersCount} 条</Text>
                </View>
                {petReminders.length > 0 ? (
                  petReminders.slice(0, 3).map(reminder => (
                    <View key={reminder.id} className={styles.reportListItem}>
                      <Text className={styles.reportListItemText}>{reminder.title}</Text>
                      <Text className={styles.reportListItemText}>{reminder.time}</Text>
                    </View>
                  ))
                ) : (
                  <Text className={styles.reportEmpty}>暂无用药提醒</Text>
                )}
              </View>

              <View className={styles.reportFooter}>
                <Text className={styles.reportFooterText}>
                  报告生成时间：{new Date().toLocaleString('zh-CN')}
                </Text>
                <Text className={styles.reportFooterSuccess}>
                  ✅ 报告已导出成功，已保存到相册
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default PetDetailPage;
