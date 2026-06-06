import { Bill, Reminder } from '@/types';

export const billsData: Bill[] = [
  {
    id: '1',
    date: '2024-06-01',
    type: '内科门诊',
    amount: 328.00,
    status: 'paid',
    items: [
      { name: '挂号费', price: 50, quantity: 1 },
      { name: '血常规检查', price: 80, quantity: 1 },
      { name: '阿莫西林克拉维酸钾', price: 68, quantity: 2 },
      { name: '益生菌', price: 62, quantity: 2 }
    ],
    invoiceAvailable: true,
    invoiceStatus: 'applied',
    petId: '1',
    petName: '豆豆'
  },
  {
    id: '2',
    date: '2024-05-20',
    type: '预防保健',
    amount: 268.00,
    status: 'paid',
    items: [
      { name: '体检套餐', price: 120, quantity: 1 },
      { name: '狂犬疫苗', price: 80, quantity: 1 },
      { name: '体内外驱虫药', price: 68, quantity: 1 }
    ],
    invoiceAvailable: true,
    invoiceStatus: 'issued',
    petId: '2',
    petName: '咪咪'
  },
  {
    id: '3',
    date: '2024-04-15',
    type: '皮肤科门诊',
    amount: 456.00,
    status: 'paid',
    items: [
      { name: '挂号费', price: 40, quantity: 1 },
      { name: '皮肤刮片检查', price: 60, quantity: 1 },
      { name: '伍德氏灯检查', price: 30, quantity: 1 },
      { name: '抗真菌药浴', price: 120, quantity: 2 },
      { name: '伊曲康唑', price: 86, quantity: 1 }
    ],
    invoiceAvailable: false,
    invoiceStatus: 'not_applied',
    petId: '3',
    petName: '旺财'
  }
];

export const remindersData: Reminder[] = [
  {
    id: '1',
    type: 'medicine',
    title: '阿莫西林克拉维酸钾',
    petName: '豆豆',
    time: '08:00',
    repeat: '每日2次',
    enabled: true
  },
  {
    id: '2',
    type: 'medicine',
    title: '益生菌',
    petName: '豆豆',
    time: '12:00',
    repeat: '每日1次',
    enabled: true
  },
  {
    id: '3',
    type: 'recheck',
    title: '复诊复查',
    petName: '咪咪',
    time: '2024-06-15 14:30',
    repeat: '单次',
    enabled: true
  },
  {
    id: '4',
    type: 'vaccine',
    title: '狂犬疫苗接种',
    petName: '旺财',
    time: '2024-06-20 10:00',
    repeat: '每年1次',
    enabled: true
  },
  {
    id: '5',
    type: 'medicine',
    title: '伊曲康唑',
    petName: '咪咪',
    time: '19:00',
    repeat: '每日1次',
    enabled: false
  }
];
