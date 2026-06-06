import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { billsData } from '@/data/bills';
import { Bill } from '@/types';

const BillsPage: React.FC = () => {
  const [bills] = useState<Bill[]>(billsData);

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);

  const handleDetail = (bill: Bill) => {
    const itemsText = bill.items.map(item => `${item.name} x${item.quantity}  ¥${item.price * item.quantity}`).join('\n');
    Taro.showModal({
      title: '订单详情',
      content: `消费类型：${bill.type}\n日期：${bill.date}\n\n明细：\n${itemsText}\n\n合计：¥${bill.amount}`,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const handleInvoice = (bill: Bill) => {
    if (bill.invoiceAvailable) {
      Taro.showModal({
        title: '申请电子发票',
        content: '确定申请该订单的电子发票吗？发票将发送至您的邮箱。',
        success: (res) => {
          if (res.confirm) {
            Taro.showToast({ title: '已申请，请注意查收', icon: 'success' });
          }
        }
      });
    } else {
      Taro.showToast({ title: '该订单暂不可开发票', icon: 'none' });
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.summaryCard}>
        <Text className={styles.summaryLabel}>累计消费</Text>
        <View className={styles.summaryAmount}>
          <Text className={styles.summaryUnit}>¥</Text>
          <Text>{totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View className={styles.content}>
        {bills.length > 0 ? (
          bills.map(bill => (
            <View key={bill.id} className={styles.billCard}>
              <View className={styles.billHeader}>
                <Text className={styles.billType}>{bill.type}</Text>
                <Text className={`${styles.billStatus} ${bill.status === 'paid' ? styles.statusPaid : styles.statusPending}`}>
                  {bill.status === 'paid' ? '已支付' : '待支付'}
                </Text>
              </View>
              <Text className={styles.billDate}>{bill.date}</Text>
              <View className={styles.billItems}>
                {bill.items.slice(0, 2).map((item, index) => (
                  <View key={index} className={styles.billItem}>
                    <Text className={styles.billItemName}>{item.name} x{item.quantity}</Text>
                    <Text className={styles.billItemPrice}>¥{item.price * item.quantity}</Text>
                  </View>
                ))}
                {bill.items.length > 2 && (
                  <View className={styles.billItem}>
                    <Text className={styles.billItemName}>等{bill.items.length}项</Text>
                    <Text className={styles.billItemPrice}></Text>
                  </View>
                )}
              </View>
              <View className={styles.billFooter}>
                <Text className={styles.billAmount}>¥{bill.amount.toFixed(2)}</Text>
                <View className={styles.billActions}>
                  <View className={styles.billBtn} onClick={() => handleDetail(bill)}>
                    <Text className={styles.billBtnText}>详情</Text>
                  </View>
                  <View className={`${styles.billBtn} ${styles.billBtnPrimary}`} onClick={() => handleInvoice(bill)}>
                    <Text className={styles.billBtnTextPrimary}>开发票</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyTip}>
            <Text className={styles.emptyIcon}>💰</Text>
            <Text className={styles.emptyText}>暂无消费记录</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default BillsPage;
