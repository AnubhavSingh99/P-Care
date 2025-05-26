
"use client"; 

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import Link from 'next/link';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ListFilter, Loader2 } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Badge } from '@/components/ui/badge';
import type { Appointment, Patient } from '@/types'; 
import { format } from 'date-fns';

interface DisplayAppointment extends Appointment {
  patientName: string; // Ensure patientName is part of the type used for display
}

// Client component to handle calendar state and display appointments
function AppointmentCalendarClient({ appointments, isLoadingAppointments }: { appointments: DisplayAppointment[], isLoadingAppointments: boolean}) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const displayedAppointments = useMemo(() => {
    if (!date) return [];
    const targetDateString = format(date, "yyyy-MM-dd");
    return appointments.filter(app => app.date === targetDateString);
  }, [date, appointments]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1 shadow-lg">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle>
            Appointments for {date ? date.toLocaleDateString() : new Date().toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAppointments ? (
             <div className="flex items-center justify-center py-6">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <span>Loading appointments...</span>
            </div>
          ) : displayedAppointments.length > 0 ? (
            <ul className="space-y-3">
              {displayedAppointments.map(app => (
                <li key={app.id} className="rounded-md border p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{app.time} - {app.patientName}</p>
                      <p className="text-sm text-muted-foreground">Doctor: {app.doctorName}</p>
                      <p className="text-sm text-muted-foreground">Reason: {app.reason}</p>
                    </div>
                    <Badge variant={app.status === 'completed' ? 'default' : app.status === 'cancelled' ? 'destructive' : 'secondary'} className="capitalize text-xs">
                      {app.status}
                    </Badge>
                  </div>
                  {app.notes && <p className="text-xs text-muted-foreground italic mt-1">Notes: {app.notes}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No appointments scheduled for this date.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function AppointmentsPage() {
  const { user, isLoading: authIsLoading } = useFirebaseAuth();
  const [appointments, setAppointments] = useState<DisplayAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Appointment Scheduling - ${siteConfig.name}`;
  }, []);

  useEffect(() => {
    if (authIsLoading) {
      setIsLoading(true);
      return;
    }
    if (!user) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const appointmentsRef = collection(db, 'appointments');
        // Fetch appointments where the current user is either the main userId (creator/doctor)
        // or listed as the doctorId (if different fields are used in future)
        const qAppointments = query(appointmentsRef, where('userId', '==', user.uid));
        const appSnapshot = await getDocs(qAppointments);
        const userAppointments = appSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        
        // For simplicity, patientName is already stored on appointment during creation.
        // If not, we'd fetch patients here similar to MedicationsPage.
        // Assuming patientName is on Appointment object from Firestore.
        const displayAppointments = userAppointments.map(app => ({
            ...app,
            patientName: app.patientName || 'Unknown Patient', // Fallback
        }));

        setAppointments(displayAppointments as DisplayAppointment[]);
      } catch (error) {
        console.error("Error fetching appointments: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user, authIsLoading]);


  return (
    <div>
      <PageHeader
        title="Appointment Scheduling"
        description="Manage patient appointments and view schedules."
        actions={
          <div className="flex gap-2">
            {/* <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" /> Filters
            </Button> */}
            <Button asChild>
              <Link href="/appointments/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Schedule Appointment
              </Link>
            </Button>
          </div>
        }
      />
      <AppointmentCalendarClient appointments={appointments} isLoadingAppointments={isLoading || authIsLoading} />
       <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>Visit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Visit log recording feature will be implemented here.</p>
          {/* This section can later be populated with VisitLog data */}
        </CardContent>
      </Card>
    </div>
  );
}
