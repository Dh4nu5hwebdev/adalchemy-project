
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/adalchemy/LoadingSpinner';
import { ArrowRight, LayoutDashboard, Wand2, History, ImageOff, Settings, FileText } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, Timestamp, limit } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GenerationHistoryEntry {
  id: string; // Firestore document ID
  prompt: string;
  imageUrls: string[]; // Array of Firebase Storage download URLs
  timestamp: string; // Formatted date string from Firestore timestamp
  userEmail?: string; // Optional: email of the user
}

const MAX_HISTORY_ITEMS = 20;

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userName, setUserName] = useState("User");
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const loadGenerationHistory = useCallback(async () => {
    if (!currentUser) {
      setGenerationHistory([]);
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    try {
      const q = query(
        collection(db, "generationHistory"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(MAX_HISTORY_ITEMS)
      );

      const querySnapshot = await getDocs(q);
      const historyEntries: GenerationHistoryEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const firestoreTimestamp = data.createdAt as Timestamp;
        historyEntries.push({
          id: doc.id,
          prompt: data.prompt,
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          timestamp: firestoreTimestamp ? new Date(firestoreTimestamp.toDate()).toLocaleDateString() : 'Date unavailable',
          userEmail: data.userEmail || undefined,
        });
      });
      setGenerationHistory(historyEntries);
    } catch (error: any) {
      console.error("Error fetching generation history from Firestore:", error);
      toast({
        title: "Error Loading Generation History",
        description: error.message || "Could not fetch your generation history. Check console for details.",
        variant: "destructive",
      });
      setGenerationHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (user) {
        setUserName(user.displayName || user.email?.split('@')[0] || "User");
      } else {
        setUserName("User");
        setGenerationHistory([]);
        setIsLoadingHistory(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      router.replace('/login?redirect=/dashboard');
    }
  }, [currentUser, isLoadingAuth, router]);

  useEffect(() => {
    if (currentUser) {
      loadGenerationHistory();
    }
  }, [currentUser, loadGenerationHistory]);

  useEffect(() => {
    const handleHistoryUpdatedEvent = () => {
      if (currentUser) loadGenerationHistory();
    };
    window.addEventListener('adalchemyHistoryUpdated', handleHistoryUpdatedEvent);
    return () => {
      window.removeEventListener('adalchemyHistoryUpdated', handleHistoryUpdatedEvent);
    };
  }, [currentUser, loadGenerationHistory]);


  if (isLoadingAuth || (currentUser && isLoadingHistory && generationHistory.length === 0 && !generationHistory)) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <LoadingSpinner size={48} />
        <p className="ml-4 text-lg mt-4 text-foreground/80">Loading dashboard...</p>
      </div>
    );
  }

  if (!currentUser && !isLoadingAuth) {
    return null;
  }


  return (
    <section className="w-full max-w-4xl mx-auto space-y-8 py-8">
      <div className="text-center mb-10">
        <LayoutDashboard className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-foreground">Welcome to AdAlchemy, {userName}!</h1>
        <p className="text-xl text-foreground/80 mt-2">Your creative hub for generating stunning ad banners.</p>
      </div>

      <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Wand2 className="h-7 w-7 text-accent" />
            <CardTitle className="text-2xl font-semibold text-card-foreground">Create New Ad Banners</CardTitle>
          </div>
          <CardDescription className="text-card-foreground/80">
            Unleash your creativity and generate unique ad banners with our AI-powered tool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-6 bg-primary/5 border-primary/20">
            <ArrowRight className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">Generations are Saved!</AlertTitle>
            <AlertDescription className="text-primary/80">
              Your prompts and generated images are saved to your history.
            </AlertDescription>
          </Alert>
          <Link href="/generate">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              Go to Image Generator
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <History className="h-7 w-7 text-accent" />
            <CardTitle className="text-2xl font-semibold text-card-foreground">My Recent Generations</CardTitle>
          </div>
          <CardDescription className="text-card-foreground/80">
            Review your latest prompts and the banners you generated. (Email: {currentUser?.email})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory && (!generationHistory || generationHistory.length === 0) && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size={32} />
            </div>
          )}
          {!isLoadingHistory && generationHistory.length === 0 && (
            <div className="text-center py-8">
              <ImageOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You haven&apos;t generated any banners yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start by creating some in the <Link href="/generate" className="text-primary hover:underline">generator</Link>!
              </p>
            </div>
          )}
          {!isLoadingHistory && generationHistory.length > 0 && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {generationHistory.map((entry) => (
                <Card key={entry.id} className="bg-card/80 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground break-words">
                          &quot;{entry.prompt}&quot;
                        </p>
                        <p className="text-xs text-muted-foreground pt-1">
                          Generated on: {entry.timestamp}
                          {entry.userEmail && ` by ${entry.userEmail}`}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  {entry.imageUrls && entry.imageUrls.length > 0 && (
                    <CardContent className="pt-0 pb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {entry.imageUrls.map((url, index) => (
                          <div key={index} className="aspect-video relative rounded-md overflow-hidden border border-border shadow-sm">
                            <Image
                              src={url}
                              alt={`Generated image ${index + 1} for prompt: ${entry.prompt}`}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" // Example sizes, adjust as needed
                              className="object-cover hover:scale-105 transition-transform duration-200"
                              data-ai-hint="advertisement banner"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card opacity-50">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-card-foreground">Brand Kits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage your brand assets. (Coming Soon)</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-accent" />
              <CardTitle className="text-xl font-semibold text-card-foreground">Account Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-card-foreground/80 mb-4">
              Update your profile, password, and preferences.
            </p>
            <Link href="/account-settings">
              <Button variant="outline" className="w-full sm:w-auto">
                Go to Account Settings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
