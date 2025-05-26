
import type { LucideIcon } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'doctor' | 'nurse' | 'admin';

// This extends the FirebaseUser type to include our custom 'role'
export interface User extends FirebaseUser {
  role?: UserRole; // Role might be undefined until fetched from Firestore
}

export interface Patient {
  id: string;
  userId: string; // ID of the user who owns this patient record
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
  createdAt: string; // ISO date string
}

export interface Medication {
  id: string;
  userId: string; // ID of the user who owns this medication record
  patientId: string; // ID of the patient this medication belongs to
  patientName?: string; // For display convenience
  name: string;
  dosage: string;
  frequency: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  notes?: string;
  createdAt: string; // ISO date string
}

export interface Appointment {
  id:string;
  userId: string; // ID of the user who created/owns this appointment (acting as doctor)
  patientId: string;
  patientName?: string; // For display convenience
  doctorId: string; // Effectively the same as userId in current setup
  doctorName?: string; // Logged-in user's name
  date: string; // ISO date string e.g., "YYYY-MM-DD"
  time: string; // e.g., "10:00 AM"
  reason: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string; // ISO date string
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
  userId: string; // ID of the user who created/owns this log
  patientId: string;
  date: string; // ISO date string
  notes: string;
  doctorId: string;
}

// For form data, patientId will be a string, not potentially an object
export interface MedicationFormData {
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface AppointmentFormData {
  patientId: string;
  doctorName: string; // Pre-filled from logged-in user
  date: Date;
  time: string; // e.g., HH:mm
  reason: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
