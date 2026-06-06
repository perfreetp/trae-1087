import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Pet, Appointment, Reminder, Doctor, Bill, Message } from '@/types';
import { petsData } from '@/data/pets';
import { appointmentsData } from '@/data/appointments';
import { remindersData, billsData } from '@/data/bills';
import { doctorsData } from '@/data/doctors';
import { messagesData } from '@/data/messages';

interface AppContextType {
  pets: Pet[];
  setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  doctors: Doctor[];
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedDoctorForAppointment: string | null;
  setSelectedDoctorForAppointment: (id: string | null) => void;
  savedPrescriptions: { id: string; recordId: string; petName: string; doctorName: string; department: string; date: string; diagnosis: string; prescriptions: any[] }[];
  addSavedPrescription: (prescription: any) => void;
  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  addAppointment: (appt: Appointment) => void;
  addReminder: (reminder: Reminder) => void;
  addBill: (bill: Bill) => void;
  addMessage: (msg: Omit<Message, 'id' | 'time' | 'read'>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<Pet[]>(petsData);
  const [appointments, setAppointments] = useState<Appointment[]>(appointmentsData);
  const [reminders, setReminders] = useState<Reminder[]>(remindersData);
  const [doctors] = useState<Doctor[]>(doctorsData);
  const [bills, setBills] = useState<Bill[]>(billsData);
  const [messages, setMessages] = useState<Message[]>(messagesData);
  const [selectedDoctorForAppointment, setSelectedDoctorForAppointment] = useState<string | null>(null);
  const [savedPrescriptions, setSavedPrescriptions] = useState<any[]>([]);

  const addPet = (pet: Pet) => {
    setPets(prev => [...prev, pet]);
  };

  const updatePet = (pet: Pet) => {
    setPets(prev => prev.map(p => p.id === pet.id ? pet : p));
  };

  const addAppointment = (appt: Appointment) => {
    setAppointments(prev => [appt, ...prev]);
    addMessage({
      type: 'appointment',
      title: '预约成功提醒',
      content: `您已成功预约${appt.doctorName} ${appt.date} ${appt.timeSlot}的${appt.department}门诊，请按时就诊。`,
      relatedId: appt.id,
      relatedType: 'appointment'
    });
  };

  const addReminder = (reminder: Reminder) => {
    setReminders(prev => [reminder, ...prev]);
    if (reminder.type === 'recheck') {
      addMessage({
        type: 'system',
        title: '复诊提醒已创建',
        content: `已为${reminder.petName}创建复诊提醒：${reminder.title}`,
        relatedId: reminder.id,
        relatedType: 'reminder'
      });
    }
  };

  const addBill = (bill: Bill) => {
    setBills(prev => [bill, ...prev]);
  };

  const addMessage = (msg: Omit<Message, 'id' | 'time' | 'read'>) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      time: new Date().toLocaleString('zh-CN'),
      read: false,
      ...msg
    };
    setMessages(prev => [newMsg, ...prev]);
  };

  const addSavedPrescription = (prescription: any) => {
    setSavedPrescriptions(prev => {
      const exists = prev.find(p => p.recordId === prescription.recordId);
      if (exists) return prev;
      const newPrescriptions = [...prev, prescription];
      addMessage({
        type: 'result',
        title: '处方保存成功',
        content: `${prescription.petName}的处方已成功保存，可在就诊记录中查看。`,
        relatedId: prescription.recordId,
        relatedType: 'record'
      });
      return newPrescriptions;
    });
  };

  return (
    <AppContext.Provider value={{
      pets, setPets,
      appointments, setAppointments,
      reminders, setReminders,
      doctors,
      bills, setBills,
      messages, setMessages,
      selectedDoctorForAppointment,
      setSelectedDoctorForAppointment,
      savedPrescriptions,
      addSavedPrescription,
      addPet, updatePet,
      addAppointment,
      addReminder,
      addBill,
      addMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
