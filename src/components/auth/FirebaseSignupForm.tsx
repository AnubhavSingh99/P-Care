// src/components/auth/FirebaseSignupForm.tsx
"use client";

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, GoogleAuthProvider, signInWithPopup } from '@/lib/firebase'; // Added Google
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { Loader2, ChromeIcon } from 'lucide-react'; // Added ChromeIcon
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/types';
import { defaultUserRole } from '@/config/site';

export function FirebaseSignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(defaultUserRole);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
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

      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.email?.split('@')[0] || 'New User',
        photoURL: firebaseUser.photoURL,
        role: role,
        createdAt: new Date().toISOString(),
      });

      toast({ title: "Signup Successful", description: "Redirecting to dashboard..." });
      // router.push('/dashboard'); // Auth provider handles redirect
    } catch (err: any) {
      console.error("Firebase email signup error:", err);
      setError(err.message || "Failed to sign up. Please try again.");
      toast({ title: "Signup Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL,
          role: role, // Use selected role on signup form, or defaultUserRole if not selected
          createdAt: new Date().toISOString(),
        });
      } else {
        // User already exists, perhaps they signed up via Google on login page
        // Or this is a re-authentication. Update role if different or ensure consistency.
        // For simplicity, we'll assume login flow will handle this.
        // If you want to update role here:
        // await updateDoc(userDocRef, { role: role });
      }

      toast({ title: "Google Sign-Up Successful", description: "Redirecting to dashboard..." });
      // router.push('/dashboard');
    } catch (err: any) {
      console.error("Firebase Google sign-up error:", err);
      setError(err.message || "Failed to sign up with Google.");
      toast({ title: "Google Sign-Up Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>Join PatientCare Central today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up with Email
          </Button>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-muted"></div>
          <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">Or sign up with</span>
          <div className="flex-grow border-t border-muted"></div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading || isGoogleLoading}>
          {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChromeIcon className="mr-2 h-4 w-4" />}
          Sign Up with Google
        </Button>
        {/* Phone sign-up is typically handled via the phone sign-in flow on the login page */}
        {/* You could add a button here that links/redirects to the login page's phone auth section if desired */}

        {error && <p className="mt-4 text-sm text-destructive text-center">{error}</p>}
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
