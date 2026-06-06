import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Pet } from '@/types';

interface PetCardProps {
  pet: Pet;
  onClick?: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/pet-detail/index?id=${pet.id}`
      });
    }
  };

  const getSpeciesText = (species: string) => {
    const map: Record<string, string> = {
      dog: '🐕 狗狗',
      cat: '🐱 猫咪',
      other: '🐾 其他'
    };
    return map[species] || species;
  };

  const getGenderText = (gender: string) => {
    return gender === 'male' ? '♂ 公' : '♀ 母';
  };

  return (
    <View className={styles.petCard} onClick={handleClick}>
      <Image className={styles.avatar} src={pet.avatar} mode="aspectFill" />
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{pet.name}</Text>
          <Text className={styles.gender}>{getGenderText(pet.gender)}</Text>
        </View>
        <Text className={styles.breed}>{getSpeciesText(pet.species)} · {pet.breed}</Text>
        <View className={styles.metaRow}>
          <Text className={styles.meta}>{pet.weight}kg</Text>
          <Text className={styles.meta}>{pet.allergies.length > 0 ? `${pet.allergies.length}项过敏` : '暂无过敏'}</Text>
        </View>
      </View>
    </View>
  );
};

export default PetCard;
