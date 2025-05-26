
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
  createdAt: string; // ISO date string, added for sorting/recent activity
}

export interface Medication {
  id: string;
  userId: string; // ID of the user who owns this medication record
  patientId: string; // ID of the patient this medication belongs to
  name: string;
  dosage: string;
  frequency: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  notes?: string;
}

export interface Appointment {
  id:string;
  userId: string; // ID of the user who owns this appointment
  patientId: string;
  patientName?: string; // For easier display
  doctorId: string;
  doctorName?: string; // For easier display
  date: string; // ISO date string e.g., "YYYY-MM-DD"
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
  userId: string; // ID of the user who created/owns this log
  patientId: string;
  date: string; // ISO date string
  notes: string;
  doctorId: string;
}
