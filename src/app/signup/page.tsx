
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/adalchemy/LoadingSpinner";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const emailInput = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
    const passwordInput = e.currentTarget.elements.namedItem("password") as HTMLInputElement;
    const confirmPasswordInput = e.currentTarget.elements.namedItem("confirm-password") as HTMLInputElement;

    if (passwordInput.value !== confirmPasswordInput.value) {
      toast({
        title: "Signup Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <Card className="w-full max-w-md shadow-2xl bg-card">
        <CardHeader className="text-center space-y-2">
          <UserPlus className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold text-card-foreground">Create Account</CardTitle>
          <CardDescription className="text-card-foreground/80">Join AdAlchemy and start creating</CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-8">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground/90">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="bg-input border-input-border text-foreground placeholder:text-muted-foreground focus:ring-primary" disabled={isLoading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground/90">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Choose a strong password (min. 6 characters)" required className="bg-input border-input-border text-foreground placeholder:text-muted-foreground focus:ring-primary" disabled={isLoading}/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-card-foreground/90">Confirm Password</Label>
              <Input id="confirm-password" name="confirm-password" type="password" placeholder="Confirm your password" required className="bg-input border-input-border text-foreground placeholder:text-muted-foreground focus:ring-primary" disabled={isLoading}/>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 mt-2 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size={20} className="mr-2" /> : null}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6 pb-8">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
