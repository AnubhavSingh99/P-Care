import type { LucideIcon } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

// UserRole is still relevant for application logic,
// but will be associated with a Firebase user via Firestore.
export type UserRole = 'doctor' | 'nurse' | 'admin';

// Extended Firebase User
export interface User extends FirebaseUser {
  // You can extend the FirebaseUser type with app-specific properties
  // For example, the role will be fetched from Firestore and added here.
  role?: UserRole; 
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
  doctorId: string; // This might become a reference to a user ID in Firestore
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
  doctorId: string; // This might become a reference to a user ID in Firestore
}
