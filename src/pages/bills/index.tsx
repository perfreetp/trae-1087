import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { Bill } from '@/types';

const BillsPage: React.FC = () => {
  const { bills, setBills, pets } = useApp();
  const [petFilter, setPetFilter] = useState('all');
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  const getInvoiceStatusText = (status?: string) => {
    const map: Record<string, string> = {
      'not_applied': '未申请',
      'applied': '已申请',
      'issued': '已开具'
    };
    return map[status || 'not_applied'] || '未申请';
  };

  const getInvoiceStatusClass = (status?: string) => {
    const map: Record<string, string> = {
      'not_applied': styles.invoiceNotApplied,
      'applied': styles.invoiceApplied,
      'issued': styles.invoiceIssued
    };
    return map[status || 'not_applied'] || '';
  };

  const filteredBills = useMemo(() => {
    if (petFilter === 'all') return bills;
    return bills.filter(b => b.petId === petFilter || b.petName === pets.find(p => p.id === petFilter)?.name);
  }, [bills, petFilter, pets]);

  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);

  const groupItems = (items: Bill['items']) => {
    const groups = {
      registration: 0,
      check: 0,
      medicine: 0,
      other: 0
    };
    items.forEach(item => {
      const total = item.price * item.quantity;
      if (item.name.includes('挂号')) {
        groups.registration += total;
      } else if (item.name.includes('检查') || item.name.includes('检验') || item.name.includes('体检')) {
        groups.check += total;
      } else if (item.name.includes('药') || item.name.includes('益生菌') || item.name.includes('疫苗') || item.name.includes('驱虫')) {
        groups.medicine += total;
      } else {
        groups.other += total;
      }
    });
    return groups;
  };

  const handleDetail = (bill: Bill) => {
    setExpandedBill(expandedBill === bill.id ? null : bill.id);
  };

  const handleInvoice = (bill: Bill) => {
    if (!bill.invoiceAvailable) {
      Taro.showToast({ title: '该订单暂不可开发票', icon: 'none' });
      return;
    }

    if (bill.invoiceStatus === 'issued') {
      Taro.showModal({
        title: '电子发票',
        content: '发票已开具，将发送至您的邮箱。',
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    if (bill.invoiceStatus === 'applied') {
      Taro.showModal({
        title: '发票申请中',
        content: '发票正在开具中，请耐心等待。',
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    Taro.showModal({
      title: '申请电子发票',
      content: '确定申请该订单的电子发票吗？发票将发送至您的邮箱。',
      success: (res) => {
        if (res.confirm) {
          setBills(prev => prev.map(b =>
            b.id === bill.id ? { ...b, invoiceStatus: 'applied' } : b
          ));
          Taro.showToast({ title: '已申请，请注意查收', icon: 'success' });
        }
      }
    });
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

      <View className={styles.filterBar}>
        <ScrollView scrollX className={styles.filterScroll}>
          <Text
            className={`${styles.filterChip} ${petFilter === 'all' ? styles.filterChipActive : ''}`}
            onClick={() => setPetFilter('all')}
          >
            全部
          </Text>
          {pets.map(pet => (
            <Text
              key={pet.id}
              className={`${styles.filterChip} ${petFilter === pet.id ? styles.filterChipActive : ''}`}
              onClick={() => setPetFilter(pet.id)}
            >
              {pet.name}
            </Text>
          ))}
        </ScrollView>
      </View>

      <View className={styles.content}>
        {filteredBills.length > 0 ? (
          filteredBills.map(bill => {
            const groups = groupItems(bill.items);
            return (
              <View key={bill.id} className={styles.billCard}>
                <View className={styles.billHeader}>
                  <View className={styles.billHeaderLeft}>
                    <Text className={styles.billType}>{bill.type}</Text>
                    {bill.petName && (
                      <Text className={styles.billPet}>{bill.petName}</Text>
                    )}
                  </View>
                  <View className={styles.billHeaderRight}>
                    <Text className={`${styles.billStatus} ${bill.status === 'paid' ? styles.statusPaid : styles.statusPending}`}>
                      {bill.status === 'paid' ? '已支付' : '待支付'}
                    </Text>
                  </View>
                </View>
                <Text className={styles.billDate}>{bill.date}</Text>

                <View className={styles.billSummary}>
                  {groups.registration > 0 && (
                    <View className={styles.summaryItem}>
                      <Text className={styles.summaryItemLabel}>挂号费</Text>
                      <Text className={styles.summaryItemValue}>¥{groups.registration.toFixed(2)}</Text>
                    </View>
                  )}
                  {groups.check > 0 && (
                    <View className={styles.summaryItem}>
                      <Text className={styles.summaryItemLabel}>检查费</Text>
                      <Text className={styles.summaryItemValue}>¥{groups.check.toFixed(2)}</Text>
                    </View>
                  )}
                  {groups.medicine > 0 && (
                    <View className={styles.summaryItem}>
                      <Text className={styles.summaryItemLabel}>药品费</Text>
                      <Text className={styles.summaryItemValue}>¥{groups.medicine.toFixed(2)}</Text>
                    </View>
                  )}
                  {groups.other > 0 && (
                    <View className={styles.summaryItem}>
                      <Text className={styles.summaryItemLabel}>其他</Text>
                      <Text className={styles.summaryItemValue}>¥{groups.other.toFixed(2)}</Text>
                    </View>
                  )}
                </View>

                {expandedBill === bill.id && (
                  <View className={styles.billDetail}>
                    <Text className={styles.detailTitle}>消费明细</Text>
                    {bill.items.map((item, index) => (
                      <View key={index} className={styles.detailItem}>
                        <Text className={styles.detailItemName}>{item.name} x{item.quantity}</Text>
                        <Text className={styles.detailItemPrice}>¥{item.price * item.quantity}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {bill.invoiceAvailable && (
                  <View className={styles.invoiceRow}>
                    <Text className={`${styles.invoiceStatus} ${getInvoiceStatusClass(bill.invoiceStatus)}`}>
                      发票：{getInvoiceStatusText(bill.invoiceStatus)}
                    </Text>
                  </View>
                )}

                <View className={styles.billFooter}>
                  <Text className={styles.billAmount}>¥{bill.amount.toFixed(2)}</Text>
                  <View className={styles.billActions}>
                    <View className={styles.billBtn} onClick={() => handleDetail(bill)}>
                      <Text className={styles.billBtnText}>{expandedBill === bill.id ? '收起' : '详情'}</Text>
                    </View>
                    {bill.invoiceAvailable && bill.invoiceStatus !== 'issued' && (
                      <View className={`${styles.billBtn} ${styles.billBtnPrimary}`} onClick={() => handleInvoice(bill)}>
                        <Text className={styles.billBtnTextPrimary}>
                          {bill.invoiceStatus === 'applied' ? '申请中' : '开发票'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
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
