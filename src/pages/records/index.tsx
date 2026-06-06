import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { recordsData } from '@/data/records';
import { MedicalRecord } from '@/types';

const RecordsPage: React.FC = () => {
  const [records] = useState<MedicalRecord[]>(recordsData);

  const handleDetail = (record: MedicalRecord) => {
    Taro.showModal({
      title: `${record.petName} - 就诊详情`,
      content: `诊断：${record.diagnosis}\n\n症状：${record.symptoms}\n\n处方：${record.prescriptions.map(p => p.name).join('、')}`,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        {records.length > 0 ? (
          records.map(record => (
            <View key={record.id} className={styles.recordCard}>
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
                      {star <= (record.rating || 0) ? '⭐' : '☆'}
                    </Text>
                  ))}
                  {record.rating && <Text className={styles.ratingText}>{record.reviewCount || 0}条评价</Text>}
                </View>
                <View className={styles.detailBtn} onClick={() => handleDetail(record)}>
                  <Text className={styles.detailBtnText}>查看详情</Text>
                </View>
              </View>
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
  );
};

export default RecordsPage;
