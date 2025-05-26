
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageGenerator } from '@/components/adalchemy/ImageGenerator';
import { LoadingSpinner } from '@/components/adalchemy/LoadingSpinner';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

export default function GeneratePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      router.replace('/login?redirect=/generate');
    }
  }, [currentUser, isLoadingAuth, router]);

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <LoadingSpinner size={48} />
        <p className="ml-4 text-lg mt-4 text-foreground/80">Checking authentication...</p>
      </div>
    );
  }

  if (!currentUser) {
    // This state should ideally not be visible for long due to the redirect.
    return null; 
  }

  return (
    <section className="w-full max-w-4xl mx-auto">
      <ImageGenerator />
    </section>
  );
}
