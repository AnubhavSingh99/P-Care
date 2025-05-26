
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import type { Patient, Appointment, Medication } from '@/types';

import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Added for potential actions
import { Users, Pill, CalendarCheck, AlertTriangle, Activity, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  className?: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, description, className, isLoading }: StatCardProps) {
  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && !isLoading && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface DashboardStats {
  activePatients: number;
  upcomingAppointments: number;
  medicationsToReview: number;
  criticalAlerts: number;
}

interface RecentActivityItem {
  id: string;
  text: string;
  timestamp?: string; // ISO string
}

export default function DashboardPage() {
  const { user, isLoading: authIsLoading } = useFirebaseAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activePatients: 0,
    upcomingAppointments: 0,
    medicationsToReview: 0,
    criticalAlerts: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    document.title = `Dashboard - ${siteConfig.name}`;
  }, []);

  useEffect(() => {
    if (authIsLoading) {
      setIsLoadingStats(true);
      return;
    }
    if (!user) {
      setIsLoadingStats(false);
      // Clear stats if user logs out or is not present
      setStats({ activePatients: 0, upcomingAppointments: 0, medicationsToReview: 0, criticalAlerts: 0 });
      setRecentActivities([]);
      return;
    }

    const fetchData = async () => {
      setIsLoadingStats(true);
      try {
        // Fetch Active Patients
        const patientsRef = collection(db, 'patients');
        const qPatients = query(patientsRef, where('userId', '==', user.uid));
        const patientSnap = await getDocs(qPatients);
        const activePatientsCount = patientSnap.size;

        // Fetch Upcoming Appointments
        const appointmentsRef = collection(db, 'appointments');
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        // Firestore requires dates to be stored and queried in a consistent format.
        // Assuming 'date' is stored as 'YYYY-MM-DD' string.
        const qAppointments = query(
          appointmentsRef,
          where('userId', '==', user.uid),
          where('date', '>=', today.toISOString().split('T')[0]),
          where('status', '==', 'scheduled')
        );
        const appointmentSnap = await getDocs(qAppointments);
        const upcomingAppointmentsCount = appointmentSnap.size;

        // Fetch Medications to Review (simplified: count all user's medications)
        const medicationsRef = collection(db, 'medications');
        const qMedications = query(medicationsRef, where('userId', '==', user.uid));
        const medicationSnap = await getDocs(qMedications);
        const medicationsToReviewCount = medicationSnap.size;


        // Fetch Critical Alerts
        const qCritical = query(patientsRef, where('userId', '==', user.uid), where('isCritical', '==', true));
        const criticalSnap = await getDocs(qCritical);
        const criticalAlertsCount = criticalSnap.size;

        setStats({
          activePatients: activePatientsCount,
          upcomingAppointments: upcomingAppointmentsCount,
          medicationsToReview: medicationsToReviewCount,
          criticalAlerts: criticalAlertsCount,
        });

        // Fetch Recent Activities (e.g., 5 most recently added patients)
        const recentPatientsQuery = query(
          patientsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentPatientsSnap = await getDocs(recentPatientsQuery);
        const activities: RecentActivityItem[] = recentPatientsSnap.docs.map(doc => {
          const data = doc.data() as Patient;
          return {
            id: doc.id,
            text: `New patient: ${data.name}`,
            timestamp: data.createdAt
          };
        });
        setRecentActivities(activities);

      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
        // Potentially set an error state and display a message
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchData();
  }, [user, authIsLoading]);

  if (authIsLoading && isLoadingStats) { // Show full page loader only if auth is loading initially
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Dashboard"
        description="Overview of your current patient activities and alerts."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Patients"
          value={stats.activePatients}
          icon={Users}
          description="Total registered patients."
          className="bg-card"
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          icon={CalendarCheck}
          description="Scheduled for today or later."
          className="bg-card"
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Medications Logged"
          value={stats.medicationsToReview}
          icon={Pill}
          description="Total medication entries."
          className="bg-card"
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          icon={AlertTriangle}
          description="Patients marked as critical."
          className="border-destructive bg-destructive/10 text-destructive-foreground"
          isLoading={isLoadingStats}
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats && recentActivities.length === 0 ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading activity...</span>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <ul className="space-y-3">
                {recentActivities.map((activity) => (
                   <li key={activity.id} className="text-sm flex justify-between items-center">
                     <span>{activity.text}</span>
                     {activity.timestamp && <span className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleDateString()}</span>}
                   </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No recent patient activity to display.</p>
                <p className="text-xs text-muted-foreground">New patient additions will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button variant="link" asChild className="p-0 justify-start text-primary hover:underline">
              <Link href="/patients?filter=critical">View Critical Patients</Link>
            </Button>
             <Button variant="link" asChild className="p-0 justify-start text-primary hover:underline">
              <Link href="/appointments?date=today">Today&apos;s Appointments</Link>
            </Button>
             <Button variant="link" asChild className="p-0 justify-start text-primary hover:underline">
              <Link href="/patients/new">Add New Patient</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
