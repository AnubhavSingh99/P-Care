import type { LucideIcon } from 'lucide-react';

// This UserRole type is still used for defining access permissions in navMenuItems
// and for casting the role from Clerk's publicMetadata.
export type UserRole = 'doctor' | 'nurse' | 'admin';

// This User interface is primarily for the mockUsers data used in src/data/mock.ts
// (e.g., for the User Management page listing).
// Authenticated user information will come from Clerk's `user` object.
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole; // This role is for the mock data structure.
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
  roles?: UserRole[]; // UserRole[] for controlling access based on Clerk's user.publicMetadata.role
  disabled?: boolean;
}

export interface VisitLog {
  id: string;
  date: string; // ISO date string
  notes: string;
  doctorId: string;
}
