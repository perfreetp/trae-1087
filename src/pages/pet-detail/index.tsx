import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { Pet, WeightRecord } from '@/types';

const PetDetailPage: React.FC = () => {
  const router = useRouter();
  const { pets, updatePet } = useApp();
  const petId = router.params.id;

  const pet = pets.find(p => p.id === petId);

  const [newWeight, setNewWeight] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

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

  const sortedWeightRecords = [...pet.weightRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ScrollView scrollY className={styles.page}>
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

      <View className={styles.content}>
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
          <Text className={styles.sectionTitle}>体重记录</Text>
          <View className={styles.weightList}>
            {sortedWeightRecords.length > 0 ? (
              sortedWeightRecords.slice(0, 5).map(record => (
                <View key={record.id} className={styles.weightItem}>
                  <Text className={styles.weightDate}>{record.date}</Text>
                  <Text className={styles.weightValue}>{record.weight} kg</Text>
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
      </View>
    </ScrollView>
  );
};

export default PetDetailPage;
