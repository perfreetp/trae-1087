import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { recordsData } from '@/data/records';
import { MedicalRecord } from '@/types';

interface SavedPrescription {
  recordId: string;
  saved: boolean;
}

interface RecordRating {
  recordId: string;
  rating: number;
  comment: string;
  rated: boolean;
}

const RecordsPage: React.FC = () => {
  const [records] = useState<MedicalRecord[]>(recordsData);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedPrescriptions, setSavedPrescriptions] = useState<SavedPrescription[]>([]);
  const [ratings, setRatings] = useState<RecordRating[]>([]);
  const [ratingForm, setRatingForm] = useState<{ recordId: string; rating: number; comment: string } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSavePrescription = (record: MedicalRecord) => {
    const alreadySaved = savedPrescriptions.find(p => p.recordId === record.id);
    if (alreadySaved?.saved) {
      Taro.showToast({ title: '处方已保存过', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '保存处方',
      content: '确定保存该处方吗？保存后可在个人中心查看。',
      success: (res) => {
        if (res.confirm) {
          setSavedPrescriptions(prev => [
            ...prev.filter(p => p.recordId !== record.id),
            { recordId: record.id, saved: true }
          ]);
          Taro.showToast({ title: '处方已保存', icon: 'success' });
        }
      }
    });
  };

  const isPrescriptionSaved = (recordId: string) => {
    return savedPrescriptions.find(p => p.recordId === recordId)?.saved || false;
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
