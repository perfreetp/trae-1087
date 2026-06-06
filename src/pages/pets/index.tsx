import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import PetCard from '@/components/PetCard';
import { petsData } from '@/data/pets';
import { remindersData } from '@/data/bills';
import { recordsData } from '@/data/records';

const PetsPage: React.FC = () => {
  const [pets, setPets] = useState(petsData);

  const handleAddPet = () => {
    Taro.navigateTo({
      url: '/pages/pet-add/index'
    });
  };

  const handleExportSummary = () => {
    Taro.showModal({
      title: '导出健康摘要',
      content: '确定导出所有宠物的健康摘要吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已生成健康摘要', icon: 'success' });
        }
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>我的宠物</Text>
        <View className={styles.addBtn} onClick={handleAddPet}>
          <Text className={styles.addBtnText}>+ 添加宠物</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{pets.length}</Text>
            <Text className={styles.statLabel}>宠物数量</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{recordsData.length}</Text>
            <Text className={styles.statLabel}>就诊记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{remindersData.filter(r => r.enabled).length}</Text>
            <Text className={styles.statLabel}>进行中提醒</Text>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>宠物列表</Text>
          <Text className={styles.sectionMore} onClick={handleExportSummary}>导出健康摘要</Text>
        </View>

        <View className={styles.petList}>
          {pets.map(pet => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </View>

        <View className={styles.addPetCard} onClick={handleAddPet}>
          <Text className={styles.addIcon}>➕</Text>
          <Text className={styles.addText}>添加新宠物</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PetsPage;
