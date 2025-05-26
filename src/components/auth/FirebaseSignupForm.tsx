// src/components/auth/FirebaseSignupForm.tsx
"use client";

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/types';
import { defaultUserRole } from '@/config/site'; // We'll re-add this for signup default role

export function FirebaseSignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(defaultUserRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      toast({ title: "Signup Failed", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create a user document in Firestore with the selected role
      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
        createdAt: new Date().toISOString(),
        // Add other default fields if necessary, like displayName
        displayName: firebaseUser.email?.split('@')[0] || 'New User',
      });

      toast({ title: "Signup Successful", description: "Redirecting to dashboard..." });
      router.push('/dashboard'); // Firebase auth state change will handle redirection via provider
    } catch (err: any) {
      console.error("Firebase signup error:", err);
      setError(err.message || "Failed to sign up. Please try again.");
      toast({ title: "Signup Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>Join PatientCare Central today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (min. 6 characters)</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">I am a:</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline font-medium ml-1">
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
