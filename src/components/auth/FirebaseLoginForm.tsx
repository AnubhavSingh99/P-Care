// src/components/auth/FirebaseLoginForm.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, type ConfirmationResult } from 'firebase/auth';
import { auth, db, GoogleAuthProvider, signInWithPopup, PhoneAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2, ChromeIcon, Smartphone } from 'lucide-react'; // Added ChromeIcon for Google, Smartphone for Phone
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { defaultUserRole } from '@/config/site';
import type { UserRole } from '@/types';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function FirebaseLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cleanup reCAPTCHA on unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!recaptchaContainerRef.current) return;
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear(); // Clear previous instance if any
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
      'size': 'invisible', // Can be 'normal' or 'invisible'
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // If using 'invisible', this callback is not usually needed as it resolves automatically.
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        toast({ title: "reCAPTCHA Expired", description: "Please try sending OTP again.", variant: "destructive" });
        setIsPhoneLoading(false);
      }
    });
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful", description: "Redirecting to dashboard..." });
      // router.push('/dashboard'); // Firebase auth state change will handle redirection via provider
    } catch (err: any) {
      console.error("Firebase email login error:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
      toast({ title: "Login Failed", description: err.message || "Please check your credentials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore, if not, create them
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL,
          role: defaultUserRole as UserRole, // Assign a default role
          createdAt: new Date().toISOString(),
        });
      }
      toast({ title: "Google Sign-In Successful", description: "Redirecting to dashboard..." });
      // router.push('/dashboard');
    } catch (err: any) {
      console.error("Firebase Google sign-in error:", err);
      setError(err.message || "Failed to sign in with Google.");
      toast({ title: "Google Sign-In Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPhoneLoading(true);
    setError(null);
    
    if (!window.recaptchaVerifier) {
      setupRecaptcha(); // Ensure reCAPTCHA is set up
    }

    const appVerifier = window.recaptchaVerifier!;
    
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setShowOtpInput(true);
      toast({ title: "OTP Sent", description: "Please check your phone for the OTP." });
    } catch (err: any)      {
      console.error("Firebase phone sign-in error (sending OTP):", err);
      setError(err.message || "Failed to send OTP. Check phone number or try again.");
      toast({ title: "OTP Send Failed", description: err.message || "Please check phone number or try again.", variant: "destructive" });
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          // @ts-ignore
          grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsPhoneLoading(false);
    }
  };
  
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPhoneLoading(true); // Reuse loading state
    setError(null);
    if (!window.confirmationResult) {
      setError("No OTP confirmation context found. Please try sending OTP again.");
      toast({ title: "OTP Error", description: "No OTP confirmation context found. Please try sending OTP again.", variant: "destructive" });
      setIsPhoneLoading(false);
      return;
    }
    try {
      const result = await window.confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      // Check if user exists in Firestore, if not, create them
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber,
          // Phone users might not have displayName or photoURL initially
          displayName: firebaseUser.phoneNumber, // Use phone number as placeholder
          role: defaultUserRole as UserRole, 
          createdAt: new Date().toISOString(),
        });
      }
      toast({ title: "Phone Sign-In Successful", description: "Redirecting to dashboard..." });
      // router.push('/dashboard');
    } catch (err: any) {
      console.error("Firebase OTP confirmation error:", err);
      setError(err.message || "Failed to verify OTP. Please check the code or try again.");
      toast({ title: "OTP Verification Failed", description: err.message || "Please check the code or try again.", variant: "destructive" });
    } finally {
      setIsPhoneLoading(false);
      setShowOtpInput(false); // Hide OTP input after attempt
      setOtp('');
    }
  };


  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
        <CardDescription>Sign in to access PatientCare Central</CardDescription>
      </CardHeader>
      <CardContent>
        {!showOtpInput ? (
          <>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || isPhoneLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In with Email
              </Button>
            </form>

            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-muted"></div>
              <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">Or continue with</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading || isPhoneLoading}>
                {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChromeIcon className="mr-2 h-4 w-4" />}
                Sign In with Google
              </Button>

              <form onSubmit={handlePhoneSignIn} className="space-y-2">
                 <Label htmlFor="phone">Phone Number (e.g. +16505551234)</Label>
                 <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      autoComplete="tel"
                      className="flex-grow"
                    />
                    <Button type="submit" variant="outline" disabled={isLoading || isGoogleLoading || isPhoneLoading || !phoneNumber.trim()}>
                      {isPhoneLoading && !showOtpInput ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                      <span className="ml-2 hidden sm:inline">Send OTP</span>
                    </Button>
                 </div>
              </form>
            </div>
          </>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <CardDescription>Enter the OTP sent to {phoneNumber}</CardDescription>
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoComplete="one-time-code"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPhoneLoading}>
              {isPhoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify OTP & Sign In
            </Button>
            <Button variant="link" className="w-full text-sm" onClick={() => { setShowOtpInput(false); setError(null); }}>
              Back to other sign-in methods
            </Button>
          </form>
        )}
        <div ref={recaptchaContainerRef} id="recaptcha-container" className="my-2"></div>
        {error && <p className="mt-4 text-sm text-destructive text-center">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2 text-sm">
        <Link href="#" className="text-primary hover:underline">
          Forgot password?
        </Link>
        <div>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline font-medium">
            Sign Up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
