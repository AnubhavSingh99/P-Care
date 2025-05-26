// src/components/auth/FirebaseLoginForm.tsx
"use client";

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function FirebaseLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful", description: "Redirecting to dashboard..." });
      router.push('/dashboard'); // Firebase auth state change will handle redirection via provider
    } catch (err: any) {
      console.error("Firebase login error:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
      toast({ title: "Login Failed", description: err.message || "Please check your credentials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
        <CardDescription>Sign in to access PatientCare Central</CardDescription>
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </form>
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
