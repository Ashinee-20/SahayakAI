'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = getAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
    })
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and profile settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal and professional details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={user?.displayName || ''} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="school">Current School</Label>
                    <Input id="school" placeholder="e.g., Delhi Public School" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="e.g., 9876543210" />
                </div>
            </div>
             <div className="space-y-2">
                <Label>Subjects and Grades</Label>
                <p className="text-sm text-muted-foreground">Multi-select for subjects and grades coming soon.</p>
                <div className="p-4 border rounded-md bg-muted/50 text-center">
                    Placeholder for Subject/Grade Selection
                </div>
            </div>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
            <p className="text-sm text-muted-foreground mt-2">This will sign you out of your account on this device.</p>
        </CardContent>
      </Card>
    </div>
  );
}
