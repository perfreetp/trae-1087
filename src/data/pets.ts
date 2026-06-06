import { Pet } from '@/types';

export const petsData: Pet[] = [
  {
    id: '1',
    name: '豆豆',
    species: 'dog',
    breed: '金毛寻回犬',
    gender: 'male',
    birthday: '2021-03-15',
    weight: 28.5,
    avatar: 'https://picsum.photos/id/237/200/200',
    allergies: ['鸡肉', '花粉'],
    vaccineBook: ['https://picsum.photos/id/237/400/300', 'https://picsum.photos/id/237/400/300'],
    weightRecords: [
      { id: 'w1', date: '2024-01-15', weight: 25.0 },
      { id: 'w2', date: '2024-02-15', weight: 26.2 },
      { id: 'w3', date: '2024-03-15', weight: 27.1 },
      { id: 'w4', date: '2024-04-15', weight: 27.8 },
      { id: 'w5', date: '2024-05-15', weight: 28.5 },
    ]
  },
  {
    id: '2',
    name: '咪咪',
    species: 'cat',
    breed: '英国短毛猫',
    gender: 'female',
    birthday: '2022-08-20',
    weight: 4.2,
    avatar: 'https://picsum.photos/id/659/200/200',
    allergies: ['鱼类'],
    vaccineBook: ['https://picsum.photos/id/659/400/300'],
    weightRecords: [
      { id: 'w6', date: '2024-01-20', weight: 3.8 },
      { id: 'w7', date: '2024-02-20', weight: 3.9 },
      { id: 'w8', date: '2024-03-20', weight: 4.0 },
      { id: 'w9', date: '2024-04-20', weight: 4.1 },
      { id: 'w10', date: '2024-05-20', weight: 4.2 },
    ]
  },
  {
    id: '3',
    name: '旺财',
    species: 'dog',
    breed: '柯基',
    gender: 'male',
    birthday: '2023-01-10',
    weight: 12.0,
    avatar: 'https://picsum.photos/id/718/200/200',
    allergies: [],
    vaccineBook: [],
    weightRecords: [
      { id: 'w11', date: '2024-03-10', weight: 10.0 },
      { id: 'w12', date: '2024-04-10', weight: 11.0 },
      { id: 'w13', date: '2024-05-10', weight: 12.0 },
    ]
  }
];
