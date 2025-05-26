import type { Patient, Medication, Appointment, User, UserRole } from '@/types';

export const mockUsers: User[] = [
  { id: 'user1', name: 'Dr. Emily Carter', email: 'emily.carter@example.com', role: 'doctor', avatarUrl: 'https://placehold.co/100x100' },
  { id: 'user2', name: 'Nurse John Davis', email: 'john.davis@example.com', role: 'nurse', avatarUrl: 'https://placehold.co/100x100' },
  { id: 'user3', name: 'Admin Sarah Miller', email: 'sarah.miller@example.com', role: 'admin', avatarUrl: 'https://placehold.co/100x100' },
];

export const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Alice Wonderland',
    age: 30,
    gender: 'female',
    contact: 'alice@example.com',
    avatarUrl: 'https://placehold.co/150x150',
    allergies: ['Peanuts', 'Pollen'],
    medicalHistory: ['Asthma (childhood)', 'Broken arm (2015)'],
    currentCondition: 'Seasonal allergies',
    ongoingTreatments: ['Antihistamines as needed'],
    lastVisit: new Date(2023, 10, 15).toISOString(),
    nextFollowUp: new Date(2024, 4, 20).toISOString(),
    isCritical: false,
  },
  {
    id: 'p2',
    name: 'Bob The Builder',
    age: 45,
    gender: 'male',
    contact: 'bob@example.com',
    avatarUrl: 'https://placehold.co/150x150',
    medicalHistory: ['Hypertension'],
    currentCondition: 'Stable',
    ongoingTreatments: ['Lisinopril 10mg daily'],
    lastVisit: new Date(2024, 0, 10).toISOString(),
    nextFollowUp: new Date(2024, 6, 10).toISOString(),
    isCritical: false,
  },
  {
    id: 'p3',
    name: 'Charlie Brown',
    age: 8,
    gender: 'male',
    contact: 'charlie@example.com',
    avatarUrl: 'https://placehold.co/150x150',
    allergies: ['None known'],
    medicalHistory: ['Frequent colds'],
    currentCondition: 'Recovering from flu',
    ongoingTreatments: ['Rest and fluids'],
    lastVisit: new Date(2024, 2, 1).toISOString(),
    isCritical: true,
  },
];

export const mockMedications: Medication[] = [
  {
    id: 'm1',
    patientId: 'p2',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: new Date(2023, 0, 1).toISOString(),
    notes: 'For hypertension control.',
  },
  {
    id: 'm2',
    patientId: 'p1',
    name: 'Cetirizine',
    dosage: '10mg',
    frequency: 'As needed for allergies',
    startDate: new Date(2023, 3, 1).toISOString(),
    notes: 'Max once per day.',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    patientName: 'Alice Wonderland',
    doctorId: 'user1',
    doctorName: 'Dr. Emily Carter',
    date: new Date(2024, 4, 20).toISOString(),
    time: '10:00 AM',
    reason: 'Allergy follow-up',
    status: 'scheduled',
  },
  {
    id: 'a2',
    patientId: 'p2',
    patientName: 'Bob The Builder',
    doctorId: 'user1',
    doctorName: 'Dr. Emily Carter',
    date: new Date(2024, 3, 15).toISOString(), // Past appointment
    time: '02:30 PM',
    reason: 'Blood pressure check',
    status: 'completed',
    notes: 'BP 130/80. Continue current medication.',
  },
  {
    id: 'a3',
    patientId: 'p3',
    patientName: 'Charlie Brown',
    doctorId: 'user1',
    doctorName: 'Dr. Emily Carter',
    date: new Date(2024, 4, 25).toISOString(),
    time: '11:00 AM',
    reason: 'Post-flu checkup',
    status: 'scheduled',
  },
];

export function getMockUserByRole(role: UserRole): User {
  return mockUsers.find(user => user.role === role) || mockUsers[0];
}
