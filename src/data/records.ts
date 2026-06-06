import { MedicalRecord } from '@/types';

export const recordsData: MedicalRecord[] = [
  {
    id: '1',
    petId: '1',
    petName: '豆豆',
    doctorId: '1',
    doctorName: '王医生',
    department: '内科',
    date: '2024-06-01',
    diagnosis: '急性肠胃炎，建议饮食调理配合药物治疗',
    symptoms: '发烧39.5℃，咳嗽，精神萎靡，食欲不振',
    checkResults: [
      { id: 'c1', name: '血常规-白细胞', result: '15.2', referenceRange: '6.0-17.0', status: 'normal' },
      { id: 'c2', name: '血常规-中性粒细胞', result: '82%', referenceRange: '60-77%', status: 'abnormal' },
      { id: 'c3', name: '体温', result: '39.5℃', referenceRange: '38.0-39.0℃', status: 'abnormal' }
    ],
    prescriptions: [
      { id: 'p1', name: '阿莫西林克拉维酸钾', dosage: '0.25g/次', frequency: '每日2次', duration: '7天' },
      { id: 'p2', name: '益生菌', dosage: '1袋/次', frequency: '每日1次', duration: '14天' }
    ],
    rating: 5,
    comment: '王医生很专业，讲解很详细，豆豆恢复得很好！'
  },
  {
    id: '2',
    petId: '3',
    petName: '旺财',
    doctorId: '5',
    doctorName: '陈医生',
    department: '预防保健科',
    date: '2024-05-20',
    diagnosis: '年度体检，各项指标正常，完成疫苗接种',
    symptoms: '年度常规体检，疫苗加强针',
    checkResults: [
      { id: 'c4', name: '体重', result: '11.5kg', referenceRange: '10-14kg', status: 'normal' },
      { id: 'c5', name: '体温', result: '38.6℃', referenceRange: '38.0-39.0℃', status: 'normal' },
      { id: 'c6', name: '心率', result: '110次/分', referenceRange: '70-160次/分', status: 'normal' }
    ],
    prescriptions: [
      { id: 'p3', name: '狂犬疫苗', dosage: '1头份', frequency: '单次', duration: '1年' },
      { id: 'p4', name: '体内外驱虫药', dosage: '1片/支', frequency: '每月1次', duration: '长期' }
    ],
    rating: 4,
    comment: '服务态度好，体检过程很顺利'
  },
  {
    id: '3',
    petId: '2',
    petName: '咪咪',
    doctorId: '3',
    doctorName: '张医生',
    department: '皮肤科',
    date: '2024-04-15',
    diagnosis: '真菌感染引起的皮肤病，建议药浴配合口服药',
    symptoms: '背部脱毛，皮屑增多，频繁抓挠',
    checkResults: [
      { id: 'c7', name: '皮肤刮片', result: '发现真菌孢子', referenceRange: '无', status: 'abnormal' },
      { id: 'c8', name: '伍德氏灯检查', result: '阳性', referenceRange: '阴性', status: 'abnormal' }
    ],
    prescriptions: [
      { id: 'p5', name: '抗真菌药浴', dosage: '1次/周', frequency: '每周1次', duration: '4周' },
      { id: 'p6', name: '伊曲康唑', dosage: '50mg/次', frequency: '每日1次', duration: '4周' }
    ],
    rating: 5,
    comment: '张医生很有耐心，皮肤病已经好了，毛发也长出来了'
  }
];
