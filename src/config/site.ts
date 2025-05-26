import type { NavItem, UserRole } from '@/types';
import { LayoutDashboard, Users, Pill, CalendarDays, Settings, ShieldAlert } from 'lucide-react';

export const siteConfig = {
  name: 'PatientCare Central',
  description: 'Streamline patient management for healthcare professionals.',
};

export const navMenuItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['doctor', 'nurse', 'admin'],
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: Users,
    roles: ['doctor', 'nurse', 'admin'],
  },
  {
    label: 'Medications',
    href: '/medications',
    icon: Pill,
    roles: ['doctor', 'nurse'],
  },
  {
    label: 'Appointments',
    href: '/appointments',
    icon: CalendarDays,
    roles: ['doctor', 'nurse', 'admin'],
  },
  {
    label: 'HIPAA Compliance',
    href: '/compliance',
    icon: ShieldAlert,
    roles: ['admin'],
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: Settings,
    roles: ['admin'],
  },
];

// This is used as a default role selection on the Firebase signup form.
export const defaultUserRole: UserRole = 'doctor';
