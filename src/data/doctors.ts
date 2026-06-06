import { Doctor } from '@/types';

export const doctorsData: Doctor[] = [
  {
    id: '1',
    name: '王医生',
    title: '主任医师',
    department: '内科',
    avatar: 'https://picsum.photos/id/64/200/200',
    rating: 4.9,
    reviewCount: 328,
    specialty: ['犬猫内科疾病', '消化系统疾病', '内分泌疾病'],
    intro: '从事小动物临床工作15年，擅长犬猫内科常见病、疑难杂症的诊断与治疗。',
    price: 50
  },
  {
    id: '2',
    name: '李医生',
    title: '副主任医师',
    department: '外科',
    avatar: 'https://picsum.photos/id/91/200/200',
    rating: 4.8,
    reviewCount: 256,
    specialty: ['软组织外科手术', '骨科手术', '创伤急救'],
    intro: '外科专家，擅长各类软组织手术和骨科手术，临床经验丰富。',
    price: 60
  },
  {
    id: '3',
    name: '张医生',
    title: '主治医师',
    department: '皮肤科',
    avatar: 'https://picsum.photos/id/177/200/200',
    rating: 4.7,
    reviewCount: 189,
    specialty: ['皮肤真菌病', '过敏性皮炎', '寄生虫皮肤病'],
    intro: '专注于小动物皮肤病诊断与治疗，在皮肤病领域有深入研究。',
    price: 40
  },
  {
    id: '4',
    name: '刘医生',
    title: '主治医师',
    department: '眼科',
    avatar: 'https://picsum.photos/id/338/200/200',
    rating: 4.9,
    reviewCount: 145,
    specialty: ['白内障手术', '角膜疾病', '眼表疾病'],
    intro: '眼科专科医生，擅长各类眼科疾病的诊断和手术治疗。',
    price: 55
  },
  {
    id: '5',
    name: '陈医生',
    title: '执业兽医师',
    department: '预防保健科',
    avatar: 'https://picsum.photos/id/1027/200/200',
    rating: 4.6,
    reviewCount: 312,
    specialty: ['疫苗接种', '健康体检', '驱虫保健'],
    intro: '预防保健专家，专注于宠物健康管理和疾病预防工作。',
    price: 30
  }
];

export const departments = [
  { id: 'all', name: '全部科室' },
  { id: 'internal', name: '内科' },
  { id: 'surgery', name: '外科' },
  { id: 'dermatology', name: '皮肤科' },
  { id: 'ophthalmology', name: '眼科' },
  { id: 'preventive', name: '预防保健科' }
];

export const timeSlots = [
  '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
  '11:00-11:30', '14:00-14:30', '14:30-15:00', '15:00-15:30',
  '15:30-16:00', '16:00-16:30', '16:30-17:00', '17:00-17:30'
];
