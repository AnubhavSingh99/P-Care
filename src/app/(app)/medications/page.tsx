
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import Link from 'next/link';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Pill, Loader2 } from 'lucide-react';
import type { Medication, Patient } from '@/types';
import { siteConfig } from '@/config/site';

interface DisplayMedication extends Medication {
  patientName: string;
}

export default function MedicationsPage() {
  const { user, isLoading: authIsLoading } = useFirebaseAuth();
  const [medications, setMedications] = useState<DisplayMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = `Medication Tracker - ${siteConfig.name}`;
  }, []);

  useEffect(() => {
    if (authIsLoading) {
      setIsLoading(true);
      return;
    }
    if (!user) {
      setIsLoading(false);
      setMedications([]);
      return;
    }

    const fetchMedications = async () => {
      setIsLoading(true);
      try {
        // Fetch medications for the user
        const medicationsRef = collection(db, 'medications');
        const qMedications = query(medicationsRef, where('userId', '==', user.uid));
        const medSnapshot = await getDocs(qMedications);
        const userMedications = medSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication));

        // Fetch all patients for the user to map patient names
        // This is not the most efficient for very large datasets, but okay for moderate numbers
        const patientIds = Array.from(new Set(userMedications.map(med => med.patientId)));
        let patientsMap: Record<string, Patient> = {};

        if (patientIds.length > 0) {
          // Firestore 'in' query limit is 30 elements per query as of latest update.
          // If more than 30 unique patientIds, batch the queries.
          const MAX_IN_QUERY_SIZE = 30;
          const patientBatches: string[][] = [];
          for (let i = 0; i < patientIds.length; i += MAX_IN_QUERY_SIZE) {
            patientBatches.push(patientIds.slice(i, i + MAX_IN_QUERY_SIZE));
          }

          for (const batch of patientBatches) {
            if (batch.length > 0) {
              const patientsRef = collection(db, 'patients');
              // Ensure that the query correctly targets documents where 'id' field matches.
              // Firestore queries using 'in' operator should be on the document ID itself or an indexed field.
              // If patientId is stored as a field in patients collection:
              // const qPatients = query(patientsRef, where('id', 'in', batch), where('userId', '==', user.uid));

              // For this app, patient document IDs are the patient.id.
              // Firestore 'in' queries on document IDs don't require an index.
              // However, combining 'in' with another 'where' clause (like userId) might.
              // A simpler approach if all patients are under the same user:
              const qPatients = query(patientsRef, where('userId', '==', user.uid));
              const patientSnapshot = await getDocs(qPatients);
              patientSnapshot.forEach(doc => {
                 if (batch.includes(doc.id)) { // Filter client-side if needed, or ensure query is optimal
                    patientsMap[doc.id] = { id: doc.id, ...doc.data() } as Patient;
                 }
              });
            }
          }
        }
        
        const displayMedications = userMedications.map(med => ({
          ...med,
          patientName: patientsMap[med.patientId]?.name || med.patientName || 'Unknown Patient',
        }));

        setMedications(displayMedications);

      } catch (error) {
        console.error("Error fetching medications: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedications();
  }, [user, authIsLoading]);

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Medication Tracker"
        description="Manage and track patient medications."
        actions={
          <Button asChild>
            <Link href="/medications/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Medication Schedule
            </Link>
          </Button>
        }
      />
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search medications by name, patient..." 
            className="w-full rounded-lg bg-card pl-10 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading medications...</p>
        </div>
      ) : filteredMedications.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMedications.map((med) => (
            <Card key={med.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pill className="h-5 w-5 text-primary" /> {med.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm"><strong>Patient:</strong> {med.patientName}</p>
                <p className="text-sm"><strong>Dosage:</strong> {med.dosage}</p>
                <p className="text-sm"><strong>Frequency:</strong> {med.frequency}</p>
                <p className="text-sm"><strong>Start Date:</strong> {new Date(med.startDate).toLocaleDateString()}</p>
                {med.endDate && <p className="text-sm"><strong>End Date:</strong> {new Date(med.endDate).toLocaleDateString()}</p>}
                {med.notes && <p className="text-xs text-muted-foreground italic">Notes: {med.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <div className="text-center py-10">
          <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium text-foreground">No Medications Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm ? "No medications match your search." : "Start by adding a new medication schedule."}
          </p>
        </div>
      )}
    </div>
  );
}
