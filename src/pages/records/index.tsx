import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { recordsData } from '@/data/records';
import { MedicalRecord, Reminder } from '@/types';
import { useApp } from '@/store';

interface RecordRating {
  recordId: string;
  rating: number;
  comment: string;
  rated: boolean;
}

interface FollowUpPlan {
  recordId: string;
  recheckDate: string;
  notes: string;
  checkItems: string[];
}

const RecordsPage: React.FC = () => {
  const { savedPrescriptions, addSavedPrescription, addReminder, pets } = useApp();
  const [records] = useState<MedicalRecord[]>(recordsData);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSavedPrescriptions, setShowSavedPrescriptions] = useState(false);
  const [ratings, setRatings] = useState<RecordRating[]>([]);
  const [ratingForm, setRatingForm] = useState<{ recordId: string; rating: number; comment: string } | null>(null);
  const [followUpForm, setFollowUpForm] = useState<FollowUpPlan | null>(null);
  const [followUpPlans, setFollowUpPlans] = useState<FollowUpPlan[]>([]);

  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const defaultCheckItems = ['血常规', '生化检查', '皮肤检查', '影像学检查', '体重监测'];

  const toggleCheckItem = (item: string) => {
    if (!followUpForm) return;
    const currentItems = followUpForm.checkItems || [];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    setFollowUpForm({ ...followUpForm, checkItems: newItems });
  };

  const openFollowUpForm = (record: MedicalRecord) => {
    setFollowUpForm({
      recordId: record.id,
      recheckDate: dateOptions[6],
      notes: '',
      checkItems: []
    });
  };

  const handleCreateFollowUp = (record: MedicalRecord) => {
    if (!followUpForm) return;
    if (!followUpForm.recheckDate) {
      Taro.showToast({ title: '请选择复诊日期', icon: 'none' });
      return;
    }

    const pet = pets.find(p => p.id === record.petId);

    const reminder: Reminder = {
      id: Date.now().toString(),
      type: 'recheck',
      title: `复诊：${record.diagnosis}`,
      petName: record.petName,
      petId: record.petId,
      time: `${followUpForm.recheckDate} 10:00`,
      repeat: '单次',
      enabled: true,
      relatedType: 'record',
      relatedId: record.id,
      relatedInfo: `关联就诊：${record.date} ${record.doctorName}${followUpForm.checkItems.length > 0 ? ` | 复查项目：${followUpForm.checkItems.join('、')}` : ''}${followUpForm.notes ? ` | 注意事项：${followUpForm.notes}` : ''}`
    };

    addReminder(reminder);
    setFollowUpPlans(prev => [...prev, followUpForm]);
    setFollowUpForm(null);
    Taro.showToast({ title: '随访计划已生成', icon: 'success' });
  };

  const hasFollowUpPlan = (recordId: string) => {
    return followUpPlans.some(p => p.recordId === recordId);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSavePrescription = (record: MedicalRecord) => {
    const alreadySaved = savedPrescriptions.find(p => p.recordId === record.id);
    if (alreadySaved) {
      Taro.showToast({ title: '处方已保存过', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '保存处方',
      content: '确定保存该处方吗？保存后可在"已保存处方"列表中查看。',
      success: (res) => {
        if (res.confirm) {
          addSavedPrescription({
            id: Date.now().toString(),
            recordId: record.id,
            petName: record.petName,
            doctorName: record.doctorName,
            department: record.department,
            date: record.date,
            diagnosis: record.diagnosis,
            prescriptions: record.prescriptions
          });
          Taro.showToast({ title: '处方已保存', icon: 'success' });
        }
      }
    });
  };

  const isPrescriptionSaved = (recordId: string) => {
    return savedPrescriptions.some(p => p.recordId === recordId);
  };

  const openRatingForm = (recordId: string) => {
    setRatingForm({ recordId, rating: 5, comment: '' });
  };

  const handleSubmitRating = () => {
    if (!ratingForm) return;
    if (!ratingForm.comment.trim()) {
      Taro.showToast({ title: '请填写评价内容', icon: 'none' });
      return;
    }

    setRatings(prev => [
      ...prev.filter(r => r.recordId !== ratingForm.recordId),
      { recordId: ratingForm.recordId, rating: ratingForm.rating, comment: ratingForm.comment, rated: true }
    ]);
    setRatingForm(null);
    Taro.showToast({ title: '评价提交成功', icon: 'success' });
  };

  const isRecordRated = (recordId: string) => {
    return ratings.find(r => r.recordId === recordId)?.rated || false;
  };

  const getRecordRating = (recordId: string, originalRating?: number) => {
    const rated = ratings.find(r => r.recordId === recordId);
    return rated?.rating || originalRating || 0;
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.header}>
          <Text className={styles.headerTitle}>就诊记录</Text>
          <View
            className={styles.savedPrescriptionBtn}
            onClick={() => setShowSavedPrescriptions(!showSavedPrescriptions)}
          >
            <Text className={styles.savedPrescriptionBtnText}>
              📋 已保存处方 ({savedPrescriptions.length})
            </Text>
          </View>
        </View>

        {showSavedPrescriptions && (
          <View className={styles.savedPrescriptionsPanel}>
            <View className={styles.panelHeader}>
              <Text className={styles.panelTitle}>已保存处方</Text>
              <Text className={styles.panelClose} onClick={() => setShowSavedPrescriptions(false)}>收起 ▲</Text>
            </View>
            {savedPrescriptions.length > 0 ? (
              savedPrescriptions.map(saved => (
                <View key={saved.id} className={styles.savedCard}>
                  <View className={styles.savedHeader}>
                    <Text className={styles.savedPet}>{saved.petName}</Text>
                    <Text className={styles.savedDate}>{saved.date}</Text>
                  </View>
                  <Text className={styles.savedDoctor}>{saved.doctorName} · {saved.department}</Text>
                  <Text className={styles.savedDiagnosis}>诊断：{saved.diagnosis}</Text>
                  <View className={styles.savedPrescriptionList}>
                    {saved.prescriptions.map((p: any) => (
                      <View key={p.id} className={styles.savedPrescriptionItem}>
                        <Text className={styles.savedPrescriptionName}>{p.name}</Text>
                        <View className={styles.savedPrescriptionInfo}>
                          <Text>用量：{p.dosage}</Text>
                          <Text>频次：{p.frequency}</Text>
                          <Text>疗程：{p.duration}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyPanel}>
                <Text className={styles.emptyPanelText}>暂无保存的处方</Text>
              </View>
            )}
          </View>
        )}

        <View className={styles.content}>
          {records.length > 0 ? (
            records.map(record => (
              <View key={record.id} className={styles.recordCard}>
                <View onClick={() => toggleExpand(record.id)}>
                  <View className={styles.recordHeader}>
                    <Text className={styles.recordPet}>{record.petName}</Text>
                    <Text className={styles.recordDate}>{record.date}</Text>
                  </View>
                  <Text className={styles.recordDoctor}>{record.doctorName} · {record.department}</Text>
                  <Text className={styles.recordDiagnosis}>诊断：{record.diagnosis}</Text>
                  <View className={styles.recordFooter}>
                    <View className={styles.rating}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Text key={star} className={styles.star}>
                          {star <= getRecordRating(record.id, record.rating) ? '⭐' : '☆'}
                        </Text>
                      ))}
                      {(getRecordRating(record.id, record.rating) > 0 || isRecordRated(record.id)) && (
                        <Text className={styles.ratingText}>{isRecordRated(record.id) ? '已评价' : `${record.reviewCount || 0}条评价`}</Text>
                      )}
                    </View>
                    <Text className={styles.expandText}>
                      {expandedId === record.id ? '收起详情 ▲' : '查看详情 ▼'}
                    </Text>
                  </View>
                </View>

                {expandedId === record.id && (
                  <View className={styles.recordDetail}>
                    <View className={styles.detailSection}>
                      <Text className={styles.detailTitle}>症状描述</Text>
                      <Text className={styles.detailContent}>{record.symptoms}</Text>
                    </View>

                    <View className={styles.detailSection}>
                      <Text className={styles.detailTitle}>检查结果</Text>
                      {record.checkResults.map(result => (
                        <View key={result.id} className={styles.checkItem}>
                          <View className={styles.checkName}>
                            <Text>{result.name}</Text>
                            <Text
                              className={`${styles.checkStatus} ${result.status === 'abnormal' ? styles.statusAbnormal : styles.statusNormal}`}
                            >
                              {result.status === 'abnormal' ? '异常' : '正常'}
                            </Text>
                          </View>
                          <View className={styles.checkResultRow}>
                            <Text className={styles.checkResult}>结果：{result.result}</Text>
                            <Text className={styles.checkRef}>参考：{result.referenceRange}</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View className={styles.detailSection}>
                      <View className={styles.detailTitleRow}>
                        <Text className={styles.detailTitle}>处方详情</Text>
                        {isPrescriptionSaved(record.id) ? (
                          <Text className={styles.savedTag}>✓ 已保存</Text>
                        ) : (
                          <Text className={styles.saveBtn} onClick={() => handleSavePrescription(record)}>
                            保存处方
                          </Text>
                        )}
                      </View>
                      {record.prescriptions.map(prescription => (
                        <View key={prescription.id} className={styles.prescriptionItem}>
                          <Text className={styles.prescriptionName}>{prescription.name}</Text>
                          <View className={styles.prescriptionInfo}>
                            <Text className={styles.prescriptionInfoItem}>用量：{prescription.dosage}</Text>
                            <Text className={styles.prescriptionInfoItem}>频次：{prescription.frequency}</Text>
                            <Text className={styles.prescriptionInfoItem}>疗程：{prescription.duration}</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {!isRecordRated(record.id) && !record.rating && (
                      <View className={styles.rateSection}>
                        <Text className={styles.detailTitle}>评价医生</Text>
                        <View className={styles.rateStars}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Text
                              key={star}
                              className={styles.rateStar}
                              onClick={() => ratingForm && setRatingForm({ ...ratingForm, rating: star })}
                            >
                              {ratingForm?.recordId === record.id && star <= ratingForm.rating ? '⭐' : '☆'}
                            </Text>
                          ))}
                        </View>
                        {ratingForm?.recordId === record.id && (
                          <View>
                            <Input
                              className={styles.rateInput}
                              placeholder="请输入您的评价..."
                              value={ratingForm.comment}
                              onInput={(e) => setRatingForm({ ...ratingForm, comment: e.detail.value })}
                            />
                            <View className={styles.rateActions}>
                              <Text className={styles.rateCancel} onClick={() => setRatingForm(null)}>取消</Text>
                              <Text className={styles.rateSubmit} onClick={handleSubmitRating}>提交评价</Text>
                            </View>
                          </View>
                        )}
                        {!ratingForm && (
                          <Text className={styles.rateBtn} onClick={() => openRatingForm(record.id)}>
                            点击评价
                          </Text>
                        )}
                      </View>
                    )}

                    {(record.rating || isRecordRated(record.id)) && (
                      <View className={styles.ratedSection}>
                        <Text className={styles.detailTitle}>我的评价</Text>
                        <View className={styles.rating}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Text key={star} className={styles.star}>
                              {star <= getRecordRating(record.id, record.rating) ? '⭐' : '☆'}
                            </Text>
                          ))}
                        </View>
                        <Text className={styles.ratedComment}>
                          {ratings.find(r => r.recordId === record.id)?.comment || record.comment || '用户好评'}
                        </Text>
                      </View>
                    )}

                    <View className={styles.followUpSection}>
                      <View className={styles.detailTitleRow}>
                        <Text className={styles.detailTitle}>随访计划</Text>
                        {hasFollowUpPlan(record.id) ? (
                          <Text className={styles.savedTag}>✓ 已生成</Text>
                        ) : !followUpForm && (
                          <Text className={styles.saveBtn} onClick={() => openFollowUpForm(record)}>
                            + 生成随访计划
                          </Text>
                        )}
                      </View>

                      {followUpForm?.recordId === record.id && (
                        <View className={styles.followUpForm}>
                          <View className={styles.formItem}>
                            <Text className={styles.formLabel}>复诊日期</Text>
                            <ScrollView scrollX className={styles.dateScroll}>
                              {dateOptions.map(date => (
                                <Text
                                  key={date}
                                  className={`${styles.dateChip} ${followUpForm.recheckDate === date ? styles.dateChipActive : ''}`}
                                  onClick={() => setFollowUpForm({ ...followUpForm, recheckDate: date })}
                                >
                                  {date.slice(5)}
                                </Text>
                              ))}
                            </ScrollView>
                          </View>

                          <View className={styles.formItem}>
                            <Text className={styles.formLabel}>复查项目（可多选）</Text>
                            <View className={styles.checkGrid}>
                              {defaultCheckItems.map(item => (
                                <Text
                                  key={item}
                                  className={`${styles.checkChip} ${followUpForm.checkItems.includes(item) ? styles.checkChipActive : ''}`}
                                  onClick={() => toggleCheckItem(item)}
                                >
                                  {followUpForm.checkItems.includes(item) ? '✓ ' : ''}{item}
                                </Text>
                              ))}
                            </View>
                          </View>

                          <View className={styles.formItem}>
                            <Text className={styles.formLabel}>注意事项</Text>
                            <Input
                              className={styles.formInput}
                              placeholder="如：注意饮食、避免剧烈运动等"
                              value={followUpForm.notes}
                              onInput={(e) => setFollowUpForm({ ...followUpForm, notes: e.detail.value })}
                            />
                          </View>

                          <View className={styles.formActions}>
                            <Text className={styles.formCancel} onClick={() => setFollowUpForm(null)}>取消</Text>
                            <Text className={styles.formSubmit} onClick={() => handleCreateFollowUp(record)}>生成提醒</Text>
                          </View>
                        </View>
                      )}

                      {hasFollowUpPlan(record.id) && !followUpForm && (
                        <View className={styles.followUpInfo}>
                          <Text className={styles.followUpInfoText}>
                            📅 复诊提醒已创建，可在用药提醒中查看和管理
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className={styles.emptyTip}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无就诊记录</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default RecordsPage;
