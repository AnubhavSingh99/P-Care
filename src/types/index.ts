import type { LucideIcon } from 'lucide-react';

export type UserRole = 'doctor' | 'nurse' | 'admin';

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  avatarUrl?: string;
  allergies?: string[];
  medicalHistory?: string[];
  currentCondition?: string;
  ongoingTreatments?: string[];
  lastVisit?: string; // ISO date string
  nextFollowUp?: string; // ISO date string
  isCritical?: boolean;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  notes?: string;
}

export interface Appointment {
  id:string;
  patientId: string;
  patientName?: string; // For easier display
  doctorId: string;
  doctorName?: string; // For easier display
  date: string; // ISO date string
  time: string; // e.g., "10:00 AM"
  reason: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
  disabled?: boolean;
}

export interface VisitLog {
  id: string;
  date: string; // ISO date string
  notes: string;
  doctorId: string;
}
