// src/app/(app)/patients/[id]/page.tsx
import { PageHeader } from '@/components/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPatients, mockMedications, mockAppointments } from '@/data/mock';
import type { Patient } from '@/types';
import { ArrowLeft, Edit3, CalendarDays, Pill, FileText, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

// Function to generate metadata dynamically based on patient name
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const patient = mockPatients.find(p => p.id === params.id);
  const patientName = patient ? patient.name : 'Patient';
  return {
    title: `${patientName} - Profile - ${siteConfig.name}`,
  };
}


// Helper function to get initials
const getInitials = (name?: string) => {
  if (!name) return 'P';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

// Mock data - in a real app, this would be fetched from an API
const getPatientData = async (id: string): Promise<Patient | undefined> => {
  return mockPatients.find(p => p.id === id);
};


export default async function PatientProfilePage({ params }: { params: { id: string } }) {
  const patient = await getPatientData(params.id);

  if (!patient) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Patient not found</h1>
        <p className="text-muted-foreground">The patient profile you are looking for does not exist.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Patients List
          </Link>
        </Button>
      </div>
    );
  }
  
  const patientMedications = mockMedications.filter(med => med.patientId === patient.id);
  const patientAppointments = mockAppointments.filter(app => app.patientId === patient.id);

  return (
    <div>
      <PageHeader
        title={patient.name}
        description={`Patient ID: ${patient.id}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/patients`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/patients/${patient.id}/edit`}> {/* Assuming edit page exists */}
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="mb-6 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person medical" />
            <AvatarFallback className="text-3xl">{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{patient.name} {patient.isCritical && <Badge variant="destructive" className="ml-2 align-middle">Critical</Badge>}</CardTitle>
            <CardDescription className="text-base">
              {patient.age} years old, {patient.gender}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">Contact: {patient.contact}</p>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="overview"><ClipboardList className="mr-1 h-4 w-4 sm:mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="history"><FileText className="mr-1 h-4 w-4 sm:mr-2" />Medical History</TabsTrigger>
          <TabsTrigger value="medications"><Pill className="mr-1 h-4 w-4 sm:mr-2" />Medications</TabsTrigger>
          <TabsTrigger value="appointments"><CalendarDays className="mr-1 h-4 w-4 sm:mr-2" />Appointments</TabsTrigger>
          <TabsTrigger value="visits">Visit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Patient Overview</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Current Condition:</strong> {patient.currentCondition || 'N/A'}</p>
              <p><strong>Ongoing Treatments:</strong> {patient.ongoingTreatments?.join(', ') || 'N/A'}</p>
              <p><strong>Allergies:</strong> {patient.allergies?.join(', ') || 'None reported'}</p>
              <p><strong>Last Visit:</strong> {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Next Follow-up:</strong> {patient.nextFollowUp ? new Date(patient.nextFollowUp).toLocaleDateString() : 'N/A'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Medical History</CardTitle></CardHeader>
            <CardContent>
              {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5">
                  {patient.medicalHistory.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              ) : <p>No medical history recorded.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Medications</CardTitle></CardHeader>
            <CardContent>
              {patientMedications.length > 0 ? (
                <ul className="space-y-2">
                  {patientMedications.map(med => (
                    <li key={med.id} className="rounded-md border p-3">
                      <p className="font-semibold">{med.name} ({med.dosage})</p>
                      <p className="text-sm text-muted-foreground">{med.frequency}</p>
                      {med.notes && <p className="text-xs text-muted-foreground italic">Notes: {med.notes}</p>}
                    </li>
                  ))}
                </ul>
              ) : <p>No medications prescribed for this patient.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
            <CardContent>
              {patientAppointments.length > 0 ? (
                 <ul className="space-y-2">
                  {patientAppointments.map(app => (
                    <li key={app.id} className="rounded-md border p-3">
                      <p className="font-semibold">{new Date(app.date).toLocaleDateString()} at {app.time} with {app.doctorName}</p>
                      <p className="text-sm text-muted-foreground">Reason: {app.reason}</p>
                      <p className="text-sm capitalize"><Badge variant={app.status === 'completed' ? 'default' : app.status === 'cancelled' ? 'destructive' : 'secondary'}>{app.status}</Badge></p>
                    </li>
                  ))}
                </ul>
              ) : <p>No appointments scheduled for this patient.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="visits" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Visit Logs</CardTitle></CardHeader>
            <CardContent>
              <p>Visit logs feature coming soon.</p>
              {/* Placeholder for visit logs */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
