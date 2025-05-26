import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { mockPatients } from '@/data/mock';
import type { Patient } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: `Patients - ${siteConfig.name}`,
};

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
  // In a real app, patients would be fetched and filtered based on search query
  const patients = mockPatients;

  return (
    <div>
      <PageHeader
        title="Patient Records"
        description="Manage and view patient information."
        actions={
          <Button asChild>
            <Link href="/patients/new"> {/* Assuming /patients/new will be the add patient page */}
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
          />
        </div>
        {/* Add filter options here if needed */}
      </div>

      {patients.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No patients found.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or add a new patient.</p>
        </div>
      )}
    </div>
  );
}
