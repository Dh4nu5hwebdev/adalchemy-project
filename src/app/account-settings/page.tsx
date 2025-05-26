
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/adalchemy/LoadingSpinner';
import { Settings, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (user) {
        setUserEmail(user.email || "");
        setUserName(user.displayName || user.email?.split('@')[0] || "User");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      router.replace('/login?redirect=/account-settings');
    }
  }, [currentUser, isLoadingAuth, router]);

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem("current-password") as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem("new-password") as HTMLInputElement).value;
    const confirmNewPassword = (form.elements.namedItem("confirm-new-password") as HTMLInputElement).value;

    // TODO: Implement username/displayName update if desired (e.g., updateProfile(currentUser, {displayName: newUserName}))

    if (newPassword) {
      if (newPassword !== confirmNewPassword) {
        toast({ title: "Password Error", description: "New passwords do not match.", variant: "destructive" });
        setIsSaving(false);
        return;
      }
      if (!currentPassword) {
        toast({ title: "Password Error", description: "Please enter your current password to set a new one.", variant: "destructive" });
        setIsSaving(false);
        return;
      }

      try {
        const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        toast({ title: "Success", description: "Password updated successfully." });
        (form.elements.namedItem("current-password") as HTMLInputElement).value = "";
        (form.elements.namedItem("new-password") as HTMLInputElement).value = "";
        (form.elements.namedItem("confirm-new-password") as HTMLInputElement).value = "";
      } catch (error: any) {
        console.error("Password update error:", error);
        toast({ title: "Password Update Failed", description: error.message || "Could not update password.", variant: "destructive" });
      }
    } else {
       // Placeholder for other profile updates
        toast({ title: "Profile Updated", description: "Your profile information has been saved (placeholder)." });
    }

    setIsSaving(false);
  };

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <LoadingSpinner size={48} />
        <p className="ml-4 text-lg mt-4 text-foreground/80">Loading settings...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null; 
  }

  return (
    <section className="w-full max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center mb-10">
        <Settings className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-foreground">Account Settings</h1>
        <p className="text-xl text-foreground/80 mt-2">Manage your profile and preferences, {userName}.</p>
      </div>

      <Card className="shadow-xl bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-7 w-7 text-accent" />
            <CardTitle className="text-2xl font-semibold text-card-foreground">Profile Information</CardTitle>
          </div>
          <CardDescription className="text-card-foreground/80">
            Update your personal details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveChanges} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-card-foreground/90">Username (Display Name)</Label>
              <Input id="username" name="username" type="text" defaultValue={userName} className="bg-input border-input-border text-foreground placeholder:text-muted-foreground focus:ring-primary" disabled={isSaving} />
               {/* TODO: Add logic to update displayName with updateProfile */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground/90">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={userEmail} disabled className="bg-muted border-input-border text-muted-foreground placeholder:text-muted-foreground" />
               <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
             <div className="space-y-2">
              <Label htmlFor="current-password" className="text-card-foreground/90">Current Password</Label>
              <Input id="current-password" name="current-password" type="password" placeholder="Enter current password to change" className="bg-input border-input-border text-foreground placeholder:text-muted-foreground focus:ring-primary" disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-card-foreground/90">New Password</Label>
              <Input id="new-password" name="new-password" type="password" placeholder="Enter new password (optional)" className="bg-input border-input-border text-foreground placeholder:text-muted-foreground focus:ring-primary" disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password" className="text-card-foreground/90">Confirm New Password</Label>
              <Input id="confirm-new-password" name="confirm-new-password" type="password" placeholder="Confirm new password" className="bg-input border-input-border text-foreground placeholder:text-muted-foreground focus:ring-primary" disabled={isSaving} />
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={isSaving}>
              {isSaving ? <LoadingSpinner size={20} className="mr-2" /> : null}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg bg-card opacity-60">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-card-foreground">Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Theme and notification settings. (Coming Soon)</p>
          </CardContent>
        </Card>

    </section>
  );
}
