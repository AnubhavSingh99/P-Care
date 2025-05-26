
'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useParams, useRouter } from 'next/navigation'; // useRouter for potential redirect

import { PageHeader } from '@/components/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Patient, Medication, Appointment } from '@/types'; // Keep Medication, Appointment for future
import { ArrowLeft, Edit3, CalendarDays, Pill, FileText, ClipboardList, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

// Helper function to get initials
const getInitials = (name?: string) => {
  if (!name) return 'P';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

export default function PatientProfilePage() {
  const { user, isLoading: authIsLoading } = useFirebaseAuth();
  const params = useParams();
  const router = useRouter(); // For redirecting if access is denied
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for medications and appointments - to be replaced with Firestore fetching later
  const patientMedications: Medication[] = [];
  const patientAppointments: Appointment[] = [];
  
  useEffect(() => {
    if (patient) {
      document.title = `${patient.name} - Profile - ${siteConfig.name}`;
    } else if (error) {
       document.title = `Error - ${siteConfig.name}`;
    } else {
       document.title = `Loading Patient - ${siteConfig.name}`;
    }
  }, [patient, error]);

  useEffect(() => {
    if (authIsLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      // If user is not authenticated, redirect or show error
      // This case should ideally be handled by the AppLayout's auth check
      setError("Authentication required.");
      setIsLoading(false);
      // Optionally redirect: router.replace('/auth/login');
      return;
    }

    if (!patientId) {
      setError("Patient ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchPatient = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const patientDocRef = doc(db, 'patients', patientId);
        const patientDocSnap = await getDoc(patientDocRef);

        if (patientDocSnap.exists()) {
          const patientData = { id: patientDocSnap.id, ...patientDocSnap.data() } as Patient;
          // Security Check: Ensure the logged-in user owns this patient record
          if (patientData.userId === user.uid) {
            setPatient(patientData);
          } else {
            setError("Access Denied. You do not have permission to view this patient's profile.");
            setPatient(null); // Clear any potentially loaded patient data
          }
        } else {
          setError("Patient not found. The profile may not exist or you may not have access.");
          setPatient(null);
        }
      } catch (err) {
        console.error("Error fetching patient: ", err);
        setError("Failed to load patient profile. Please try again.");
        setPatient(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [user, authIsLoading, patientId, router]);

  if (isLoading || authIsLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading patient profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">{error.includes("Access Denied") ? "Access Denied" : "Error"}</h1>
        <p className="text-muted-foreground mt-2">
          {error.includes("Patient not found") ? "The patient profile you are looking for does not exist or could not be loaded." : error}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Patients List
          </Link>
        </Button>
      </div>
    );
  }
  
  if (!patient) {
     // This case should ideally be covered by isLoading or error state, but as a fallback:
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Patient data unavailable</h1>
        <p className="text-muted-foreground">Could not load patient details.</p>
         <Button asChild variant="link" className="mt-4">
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Patients List
          </Link>
        </Button>
      </div>
    );
  }

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
              <Link href={`/patients/${patient.id}/edit`}> 
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
              ) : <p>No medications prescribed for this patient yet. This section will populate once medication data is fetched.</p>}
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
                      <div className="text-sm capitalize"><Badge variant={app.status === 'completed' ? 'default' : app.status === 'cancelled' ? 'destructive' : 'secondary'}>{app.status}</Badge></div>
                    </li>
                  ))}
                </ul>
              ) : <p>No appointments scheduled for this patient yet. This section will populate once appointment data is fetched.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="visits" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Visit Logs</CardTitle></CardHeader>
            <CardContent>
              <p>Visit logs feature will be implemented here. This section will populate once visit log data is fetched.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
