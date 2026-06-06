import { Appointment } from '@/types';

export const appointmentsData: Appointment[] = [
  {
    id: '1',
    petId: '1',
    petName: '豆豆',
    doctorId: '1',
    doctorName: '王医生',
    department: '内科',
    date: '2024-06-08',
    timeSlot: '10:00-10:30',
    status: 'confirmed',
    queueNumber: 5,
    symptoms: '最近食欲不振，偶尔呕吐，精神不佳',
    createdAt: '2024-06-05 14:30'
  },
  {
    id: '2',
    petId: '2',
    petName: '咪咪',
    doctorId: '3',
    doctorName: '张医生',
    department: '皮肤科',
    date: '2024-06-10',
    timeSlot: '14:30-15:00',
    status: 'pending',
    symptoms: '皮肤瘙痒，频繁抓挠，有脱毛现象',
    createdAt: '2024-06-06 09:15'
  },
  {
    id: '3',
    petId: '1',
    petName: '豆豆',
    doctorId: '1',
    doctorName: '王医生',
    department: '内科',
    date: '2024-06-01',
    timeSlot: '09:30-10:00',
    status: 'completed',
    symptoms: '发烧，咳嗽',
    createdAt: '2024-05-30 10:00'
  },
  {
    id: '4',
    petId: '3',
    petName: '旺财',
    doctorId: '5',
    doctorName: '陈医生',
    department: '预防保健科',
    date: '2024-05-20',
    timeSlot: '16:00-16:30',
    status: 'completed',
    symptoms: '年度体检，疫苗接种',
    createdAt: '2024-05-18 15:30'
  }
];
