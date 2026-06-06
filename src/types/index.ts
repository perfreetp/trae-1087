export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  gender: 'male' | 'female';
  birthday: string;
  weight: number;
  avatar: string;
  allergies: string[];
  vaccineBook: string[];
  weightRecords: WeightRecord[];
}

export interface WeightRecord {
  id: string;
  date: string;
  weight: number;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  specialty: string[];
  intro: string;
  price: number;
}

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  queueNumber?: number;
  symptoms: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  petName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  checkResults: CheckResult[];
  prescriptions: Prescription[];
  rating?: number;
  comment?: string;
}

export interface CheckResult {
  id: string;
  name: string;
  result: string;
  referenceRange: string;
  status: 'normal' | 'abnormal';
}

export interface Prescription {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Reminder {
  id: string;
  type: 'medicine' | 'recheck' | 'vaccine';
  title: string;
  petName: string;
  time: string;
  repeat: string;
  enabled: boolean;
}

export interface Bill {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: 'paid' | 'pending';
  items: BillItem[];
  invoiceAvailable: boolean;
}

export interface BillItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Message {
  id: string;
  type: 'system' | 'appointment' | 'result' | 'notice';
  title: string;
  content: string;
  time: string;
  read: boolean;
}
