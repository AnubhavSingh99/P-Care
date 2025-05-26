import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Search, Pill } from 'lucide-react';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Input } from '@/components/ui/input';
import { mockMedications, mockPatients } from '@/data/mock'; 

export const metadata: Metadata = {
  title: `Medication Tracker - ${siteConfig.name}`,
};

export default function MedicationsPage() {
  // mockMedications and mockPatients will be empty arrays
  const medicationsWithPatientNames = mockMedications.map(med => {
    const patient = mockPatients.find(p => p.id === med.patientId);
    return { ...med, patientName: patient ? patient.name : 'Unknown Patient' };
  });


  return (
    <div>
      <PageHeader
        title="Medication Tracker"
        description="Manage and track patient medications."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Medication Schedule
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
          />
        </div>
      </div>

      {medicationsWithPatientNames.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {medicationsWithPatientNames.map((med) => (
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
            Start by adding a new medication schedule.
          </p>
        </div>
      )}
    </div>
  );
}
