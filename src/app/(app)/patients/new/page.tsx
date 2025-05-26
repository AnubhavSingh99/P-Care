
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/types'; 

const patientFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  age: z.coerce.number().min(0, { message: "Age must be a positive number or zero." }).max(150),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Gender is required." }),
  contact: z.string().min(5, { message: "Contact information is too short." }).max(100),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentCondition: z.string().max(1000, "Condition description is too long.").optional(),
  ongoingTreatments: z.string().optional(),
  lastVisit: z.date().optional(),
  nextFollowUp: z.date().optional(),
  isCritical: z.boolean().default(false).optional(),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

export default function AddNewPatientPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: '',
      age: undefined, 
      gender: undefined,
      contact: '',
      allergies: '',
      medicalHistory: '',
      currentCondition: '',
      ongoingTreatments: '',
      lastVisit: undefined,
      nextFollowUp: undefined,
      isCritical: false,
    },
  });

  const processCsvToArray = (csvString?: string): string[] => {
    if (!csvString || csvString.trim() === "") return [];
    return csvString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  async function onSubmit(data: PatientFormData) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to add a patient.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const patientDataToSave: Omit<Patient, 'id'> = {
        userId: user.uid,
        name: data.name,
        age: data.age,
        gender: data.gender,
        contact: data.contact,
        allergies: processCsvToArray(data.allergies),
        medicalHistory: processCsvToArray(data.medicalHistory),
        currentCondition: data.currentCondition || undefined,
        ongoingTreatments: processCsvToArray(data.ongoingTreatments),
        lastVisit: data.lastVisit ? data.lastVisit.toISOString() : undefined,
        nextFollowUp: data.nextFollowUp ? data.nextFollowUp.toISOString() : undefined,
        isCritical: data.isCritical || false,
        // avatarUrl can be added later if an upload feature is implemented
      };

      const docRef = await addDoc(collection(db, 'patients'), patientDataToSave);
      toast({ title: "Success", description: `${data.name} has been added to patient records.` });
      router.push(`/patients/${docRef.id}`);
    } catch (error) {
      console.error("Error adding patient: ", error);
      toast({ title: "Error", description: "Failed to add patient. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authIsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Add New Patient"
        description="Enter the details for the new patient."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 35" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact (Phone or Email)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., (555) 123-4567 or john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currentCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Condition</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the patient's current condition..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Penicillin, Peanuts (comma-separated)" {...field} />
                    </FormControl>
                    <FormDescription>Enter allergies separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Hypertension, Asthma (comma-separated)" {...field} />
                    </FormControl>
                    <FormDescription>Enter past conditions or surgeries separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ongoingTreatments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ongoing Treatments</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Physical Therapy, Medication X (comma-separated)" {...field} />
                    </FormControl>
                    <FormDescription>Enter current treatments separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="lastVisit"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Last Visit Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextFollowUp"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Next Follow-up Date</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                             disabled={(date) =>
                              date < new Date() 
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isCritical"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mark as Critical Patient
                      </FormLabel>
                      <FormDescription>
                        Check this if the patient requires immediate or priority attention.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || authIsLoading}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Patient'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
