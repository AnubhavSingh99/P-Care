import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Shadcn calendar
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, CalendarDays, ListFilter } from 'lucide-react';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import React from 'react';
import { mockAppointments, mockPatients } from '@/data/mock'; 
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: `Appointment Scheduling - ${siteConfig.name}`,
};

// Client component to handle calendar state
function AppointmentCalendarClient() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  // mockAppointments and mockPatients will be empty arrays
  const selectedDateAppointments = mockAppointments.filter(app => 
    new Date(app.date).toDateString() === (date ? date.toDateString() : new Date().toDateString())
  ).map(app => {
    const patient = mockPatients.find(p => p.id === app.patientId);
    return { ...app, patientName: patient ? patient.name : 'Unknown Patient' };
  });

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
          {selectedDateAppointments.length > 0 ? (
            <ul className="space-y-3">
              {selectedDateAppointments.map(app => (
                <li key={app.id} className="rounded-md border p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{app.time} - {app.patientName}</p>
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
  return (
    <div>
      <PageHeader
        title="Appointment Scheduling"
        description="Manage patient appointments and view schedules."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" /> Filters
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule Appointment
            </Button>
          </div>
        }
      />
      <AppointmentCalendarClient />
       <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>Visit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Visit log recording feature will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
