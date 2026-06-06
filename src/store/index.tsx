import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Pet, Appointment, Reminder, Doctor } from '@/types';
import { petsData } from '@/data/pets';
import { appointmentsData } from '@/data/appointments';
import { remindersData } from '@/data/bills';
import { doctorsData } from '@/data/doctors';

interface AppContextType {
  pets: Pet[];
  setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  doctors: Doctor[];
  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  addAppointment: (appt: Appointment) => void;
  addReminder: (reminder: Reminder) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<Pet[]>(petsData);
  const [appointments, setAppointments] = useState<Appointment[]>(appointmentsData);
  const [reminders, setReminders] = useState<Reminder[]>(remindersData);
  const [doctors] = useState<Doctor[]>(doctorsData);

  const addPet = (pet: Pet) => {
    setPets(prev => [...prev, pet]);
  };

  const updatePet = (pet: Pet) => {
    setPets(prev => prev.map(p => p.id === pet.id ? pet : p));
  };

  const addAppointment = (appt: Appointment) => {
    setAppointments(prev => [appt, ...prev]);
  };

  const addReminder = (reminder: Reminder) => {
    setReminders(prev => [reminder, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      pets, setPets,
      appointments, setAppointments,
      reminders, setReminders,
      doctors,
      addPet, updatePet,
      addAppointment,
      addReminder
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
