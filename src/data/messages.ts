import { Message } from '@/types';

export const messagesData: Message[] = [
  {
    id: '1',
    type: 'appointment',
    title: '预约成功提醒',
    content: '您已成功预约王医生 6月8日 10:00-10:30 的内科门诊，请按时就诊。',
    time: '2024-06-05 14:30',
    read: false
  },
  {
    id: '2',
    type: 'result',
    title: '检查结果已出',
    content: '豆豆的血常规检查结果已出，请在就诊记录中查看详情。',
    time: '2024-06-01 11:20',
    read: true
  },
  {
    id: '3',
    type: 'notice',
    title: '端午节门诊安排',
    content: '6月10日-6月12日端午节期间，本诊所正常营业，欢迎预约。',
    time: '2024-06-04 09:00',
    read: true
  },
  {
    id: '4',
    type: 'system',
    title: '疫苗接种提醒',
    content: '旺财的狂犬疫苗接种时间已到，建议尽快预约接种。',
    time: '2024-06-03 10:15',
    read: false
  },
  {
    id: '5',
    type: 'appointment',
    title: '预约确认提醒',
    content: '您预约的张医生 6月10日 14:30-15:00 的皮肤科门诊已确认。',
    time: '2024-06-06 09:15',
    read: false
  },
  {
    id: '6',
    type: 'notice',
    title: '新增24小时急诊服务',
    content: '为更好地服务客户，本诊所即日起开通24小时急诊服务，紧急情况可随时联系。',
    time: '2024-05-28 16:00',
    read: true
  }
];
