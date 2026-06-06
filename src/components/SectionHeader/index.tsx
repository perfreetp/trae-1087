import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  extra?: string;
  onExtraClick?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, extra, onExtraClick }) => {
  return (
    <View className={styles.sectionHeader}>
      <Text className={styles.title}>{title}</Text>
      {extra && (
        <Text className={styles.extra} onClick={onExtraClick}>{extra}</Text>
      )}
    </View>
  );
};

export default SectionHeader;
