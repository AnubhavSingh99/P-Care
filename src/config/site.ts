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
    roles: ['admin'], // Assuming this is an admin-only section
  },
  {
    label: 'User Management',
    href: '/admin/users', // This page lists mock users, not directly tied to Clerk roles for display
    icon: Settings,
    roles: ['admin'],
  },
];

// defaultUserRole is no longer needed as Clerk handles user sessions and roles.
// export const defaultUserRole: UserRole = 'doctor'; 
// Roles for navigation are now derived from Clerk user's publicMetadata.
// Ensure your Clerk user publicMetadata is set, e.g., { "role": "doctor" }
