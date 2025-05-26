
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import type { Patient, AppointmentFormData } from '@/types';

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, { message: "Patient selection is required." }),
  doctorName: z.string(), // Will be pre-filled
  date: z.date({ required_error: "Appointment date is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format. Use HH:MM (24-hour)." }),
  reason: z.string().min(2, { message: "Reason must be at least 2 characters." }).max(200),
  notes: z.string().max(500, "Notes are too long.").optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
});

export default function AddNewAppointmentPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: '',
      doctorName: user?.displayName || 'N/A',
      date: new Date(),
      time: '09:00',
      reason: '',
      notes: '',
      status: 'scheduled',
    },
  });
  
  useEffect(() => {
    if (user?.displayName) {
      form.setValue('doctorName', user.displayName);
    }
  }, [user, form]);

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

  async function onSubmit(data: AppointmentFormData) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedPatient = patients.find(p => p.id === data.patientId);

      await addDoc(collection(db, 'appointments'), {
        userId: user.uid,
        patientId: data.patientId,
        patientName: selectedPatient?.name || 'Unknown Patient',
        doctorId: user.uid, // Logged-in user is the doctor
        doctorName: user.displayName || 'N/A',
        date: format(data.date, "yyyy-MM-dd"), // Store date as YYYY-MM-DD string
        time: data.time,
        reason: data.reason,
        notes: data.notes || '',
        status: data.status,
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Success", description: `Appointment for ${selectedPatient?.name || 'patient'} has been scheduled.` });
      router.push('/appointments');
    } catch (error) {
      console.error("Error scheduling appointment: ", error);
      toast({ title: "Error", description: "Failed to schedule appointment. Please try again.", variant: "destructive" });
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
        title="Schedule New Appointment"
        description="Enter details for the new appointment."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Appointment Information</CardTitle>
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
                name="doctorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Appointment Date</FormLabel>
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
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus 
                           disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Visit</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Routine checkup, Consultation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes for the appointment..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || authIsLoading || isLoadingPatients}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scheduling...</> : 'Schedule Appointment'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

