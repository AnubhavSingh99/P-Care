
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import type { Patient, MedicationFormData } from '@/types';

const medicationFormSchema = z.object({
  patientId: z.string().min(1, { message: "Patient selection is required." }),
  name: z.string().min(2, { message: "Medication name must be at least 2 characters." }).max(100),
  dosage: z.string().min(1, { message: "Dosage is required." }).max(50),
  frequency: z.string().min(1, { message: "Frequency is required." }).max(50),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date().optional(),
  notes: z.string().max(500, "Notes are too long.").optional(),
});

export default function AddNewMedicationPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      patientId: '',
      name: '',
      dosage: '',
      frequency: '',
      startDate: new Date(),
      endDate: undefined,
      notes: '',
    },
  });

  useEffect(() => {
    if (user) {
      const fetchPatients = async () => {
        setIsLoadingPatients(true);
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
          toast({ title: "Error", description: "Could not load patient list.", variant: "destructive" });
        } finally {
          setIsLoadingPatients(false);
        }
      };
      fetchPatients();
    }
  }, [user, toast]);

  async function onSubmit(data: MedicationFormData) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedPatient = patients.find(p => p.id === data.patientId);

      await addDoc(collection(db, 'medications'), {
        userId: user.uid,
        patientId: data.patientId,
        patientName: selectedPatient?.name || 'Unknown Patient', // Store for convenience
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate ? data.endDate.toISOString() : null,
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Success", description: `${data.name} has been added to medication records.` });
      router.push('/medications');
    } catch (error) {
      console.error("Error adding medication: ", error);
      toast({ title: "Error", description: "Failed to add medication. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authIsLoading || (user && isLoadingPatients)) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading form data...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Add New Medication Schedule"
        description="Enter details for the new medication."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Medication Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPatients || patients.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.length > 0 ? patients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} (ID: {patient.id.substring(0,6)}...)
                          </SelectItem>
                        )) : <SelectItem value="no-patient" disabled>No patients found</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Amoxicillin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 250mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Twice a day" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || authIsLoading || isLoadingPatients}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Add Medication'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
