
"use client";

import Link from 'next/link';
import { Sparkles, LogIn, LogOut, LayoutDashboard, Wand2, UserPlus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggleButton } from './ThemeToggleButton';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export function Header() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login'); 
    } catch (error) {
      console.error("Logout error:", error);
      // Optionally, show a toast message for logout failure
    }
  };

  return (
    <header className="bg-card backdrop-blur-md sticky top-0 z-50 shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Sparkles className="h-7 w-7 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            AdAlchemy
          </h1>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {isLoadingAuth ? (
             <Button variant="ghost" size="sm" disabled className="px-2 sm:px-3">Loading...</Button>
          ) : currentUser ? (
            <>
              <Button variant="ghost" asChild className="text-foreground/80 hover:text-primary hover:bg-primary/10 px-2 sm:px-3">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-1 sm:mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild className="text-foreground/80 hover:text-primary hover:bg-primary/10 px-2 sm:px-3">
                <Link href="/generate">
                  <Wand2 className="mr-1 sm:mr-2 h-4 w-4" />
                  Generate
                </Link>
              </Button>
              <Button variant="ghost" asChild className="text-foreground/80 hover:text-primary hover:bg-primary/10 px-2 sm:px-3">
                <Link href="/account-settings">
                  <Settings className="mr-1 sm:mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-primary/50 text-primary hover:bg-primary/10 px-2 sm:px-3">
                <LogOut className="mr-1 sm:mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-foreground/80 hover:text-primary hover:bg-primary/10 px-2 sm:px-3">
                <Link href="/login">
                  <LogIn className="mr-1 sm:mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button variant="default" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 sm:px-3">
                <Link href="/signup">
                  <UserPlus className="mr-1 sm:mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
          <div className="ml-2">
            <ThemeToggleButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
