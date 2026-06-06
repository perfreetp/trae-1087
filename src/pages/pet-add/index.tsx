import React, { useState } from 'react';
import { View, Text, ScrollView, Input, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { Pet } from '@/types';

const speciesOptions = [
  { value: 'dog', label: '🐕 狗狗' },
  { value: 'cat', label: '🐱 猫咪' },
  { value: 'other', label: '🐾 其他' },
];

const genderOptions = [
  { value: 'male', label: '♂ 公' },
  { value: 'female', label: '♀ 母' },
];

const PetAddPage: React.FC = () => {
  const { addPet } = useApp();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('male');
  const [birthday, setBirthday] = useState('');
  const [weight, setWeight] = useState('');
  const [avatar, setAvatar] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [vaccineBook, setVaccineBook] = useState<string[]>([]);

  const handleChooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        setAvatar(res.tempFilePaths[0]);
      }
    });
  };

  const handleAddVaccine = () => {
    Taro.chooseImage({
      count: 9 - vaccineBook.length,
      success: (res) => {
        setVaccineBook(prev => [...prev, ...res.tempFilePaths]);
      }
    });
  };

  const handleDeleteVaccine = (index: number) => {
    setVaccineBook(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies(prev => [...prev, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const handleDeleteAllergy = (item: string) => {
    setAllergies(prev => prev.filter(a => a !== item));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入宠物姓名', icon: 'none' });
      return;
    }
    if (!breed.trim()) {
      Taro.showToast({ title: '请输入品种', icon: 'none' });
      return;
    }

    const newPet: Pet = {
      id: Date.now().toString(),
      name: name.trim(),
      species: species as 'dog' | 'cat' | 'other',
      breed: breed.trim(),
      gender: gender as 'male' | 'female',
      birthday: birthday || '未知',
      weight: parseFloat(weight) || 0,
      avatar: avatar || `https://picsum.photos/id/${Math.floor(Math.random() * 100) + 237}/200/200`,
      allergies,
      vaccineBook,
      weightRecords: weight ? [{
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(weight)
      }] : []
    };

    addPet(newPet);
    Taro.showToast({ title: '添加成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <View className={styles.avatarSection}>
          <View className={styles.avatarBox} onClick={handleChooseAvatar}>
            {avatar ? (
              <Image className={styles.avatarImage} src={avatar} mode="aspectFill" />
            ) : (
              <Text className={styles.avatarPlaceholder}>📷</Text>
            )}
          </View>
          <Text className={styles.avatarTip}>点击上传头像</Text>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={`${styles.formLabel} ${styles.formLabelRequired}`}>宠物姓名</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入宠物姓名"
              value={name}
              onInput={(e) => setName(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={`${styles.formLabel} ${styles.formLabelRequired}`}>种类</Text>
            <View className={styles.optionGrid}>
              {speciesOptions.map(opt => (
                <Text
                  key={opt.value}
                  className={`${styles.optionItem} ${species === opt.value ? styles.optionItemActive : ''}`}
                  onClick={() => setSpecies(opt.value)}
                >
                  {opt.label}
                </Text>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={`${styles.formLabel} ${styles.formLabelRequired}`}>品种</Text>
            <Input
              className={styles.formInput}
              placeholder="如：金毛、英短、柯基等"
              value={breed}
              onInput={(e) => setBreed(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={`${styles.formLabel} ${styles.formLabelRequired}`}>性别</Text>
            <View className={styles.optionGrid}>
              {genderOptions.map(opt => (
                <Text
                  key={opt.value}
                  className={`${styles.optionItem} ${gender === opt.value ? styles.optionItemActive : ''}`}
                  onClick={() => setGender(opt.value)}
                >
                  {opt.label}
                </Text>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>生日</Text>
            <Input
              className={styles.formInput}
              placeholder="如：2023-01-01"
              value={birthday}
              onInput={(e) => setBirthday(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>当前体重 (kg)</Text>
            <Input
              className={styles.formInput}
              type="digit"
              placeholder="请输入体重"
              value={weight}
              onInput={(e) => setWeight(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>过敏史</Text>
            {allergies.length > 0 && (
              <View className={styles.allergyTags}>
                {allergies.map((item, index) => (
                  <View key={index} className={styles.allergyTag}>
                    <Text className={styles.allergyTagText}>{item}</Text>
                    <Text className={styles.allergyTagClose} onClick={() => handleDeleteAllergy(item)}>×</Text>
                  </View>
                ))}
              </View>
            )}
            <View className={styles.allergyInputWrap}>
              <Input
                className={styles.allergyInput}
                placeholder="输入过敏原，如：鸡肉、花粉"
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

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>疫苗本</Text>
            <View className={styles.vaccineList}>
              {vaccineBook.map((img, index) => (
                <View key={index} className={styles.vaccineItem}>
                  <Image className={styles.vaccineImage} src={img} mode="aspectFill" />
                  <View className={styles.vaccineDelete} onClick={() => handleDeleteVaccine(index)}>
                    <Text className={styles.vaccineDeleteText}>×</Text>
                  </View>
                </View>
              ))}
              {vaccineBook.length < 9 && (
                <View className={styles.vaccineAdd} onClick={handleAddVaccine}>
                  <Text className={styles.vaccineAddIcon}>+</Text>
                  <Text className={styles.vaccineAddText}>添加图片</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>保存宠物档案</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PetAddPage;
