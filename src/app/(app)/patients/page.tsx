
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import type { Patient } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Metadata is typically for server components. For client components, you might set document.title
// export const metadata: Metadata = {
//   title: `Patients - ${siteConfig.name}`,
// };

function PatientCard({ patient }: { patient: Patient }) {
  const getInitials = (name?: string) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person medical" />
          <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">{patient.name}</CardTitle>
          <CardDescription>
            {patient.age} years old, {patient.gender}
            {patient.isCritical && <Badge variant="destructive" className="ml-2">Critical</Badge>}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground truncate">Condition: {patient.currentCondition || 'N/A'}</p>
        <p className="text-sm text-muted-foreground">Next Follow-up: {patient.nextFollowUp ? new Date(patient.nextFollowUp).toLocaleDateString() : 'N/A'}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/patients/${patient.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PatientsPage() {
  const { user, isLoading: authIsLoading } = useFirebaseAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = `Patients - ${siteConfig.name}`;
  }, []);

  useEffect(() => {
    if (authIsLoading) {
      setIsLoading(true);
      return;
    }
    if (!user) {
      setIsLoading(false);
      setPatients([]); // Clear patients if user logs out
      return;
    }

    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedPatients: Patient[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPatients.push({ id: doc.id, ...doc.data() } as Patient);
        });
        setPatients(fetchedPatients);
      } catch (error) {
        console.error("Error fetching patients: ", error);
        // Handle error appropriately, e.g., show a toast message
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [user, authIsLoading]);

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.currentCondition && patient.currentCondition.toLowerCase().includes(searchTerm.toLowerCase())) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Patient Records"
        description="Manage and view patient information."
        actions={
          <Button asChild>
            <Link href="/patients/new"> 
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
            </Link>
          </Button>
        }
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search patients by name, ID, or condition..." 
            className="w-full rounded-lg bg-card pl-10 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading patient records...</p>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium text-foreground">No Patients Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm ? "No patients match your search criteria." : "Start by adding a new patient record for this user."}
          </p>
        </div>
      )}
    </div>
  );
}
