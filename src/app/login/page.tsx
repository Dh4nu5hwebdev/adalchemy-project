
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/adalchemy/LoadingSpinner";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const emailInput = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
    const passwordInput = e.currentTarget.elements.namedItem("password") as HTMLInputElement;

    try {
      await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
      // onAuthStateChanged in Header will handle redirect logic or global state
      // Forcing a navigation event to trigger Header's auth check if needed, or rely on onAuthStateChanged
      router.push("/dashboard"); 
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
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
          <LogIn className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold text-card-foreground">Welcome Back!</CardTitle>
          <CardDescription className="text-card-foreground/80">Log in to continue to AdAlchemy</CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground/90">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="bg-input border-input-border text-foreground placeholder:text-muted-foreground focus:ring-primary" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground/90">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="bg-input border-input-border text-foreground placeholder:text-muted-foreground focus:ring-primary" disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 mt-2 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size={20} className="mr-2" /> : null}
              Log In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6 pb-8">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
