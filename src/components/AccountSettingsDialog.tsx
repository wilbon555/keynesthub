import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Mail, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentEmail: string;
}

export const AccountSettingsDialog = ({ open, onOpenChange, currentEmail }: Props) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }
    setSavingPwd(true);
    // Re-authenticate to verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });
    if (signInError) {
      setSavingPwd(false);
      toast.error("Current password is incorrect");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPwd(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onOpenChange(false);
  };

  const handleEmailChange = async () => {
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (newEmail === currentEmail) {
      toast.error("New email must be different from current email");
      return;
    }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${window.location.origin}/dashboard` }
    );
    setSavingEmail(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Confirmation link sent. Check both your old and new inboxes to confirm the change.");
    setNewEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>Update your password or email address.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password" className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> Password
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={savingPwd} className="w-full">
              {savingPwd && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Update Password
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Current email</Label>
              <Input value={currentEmail} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">New email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send a confirmation link to your new address. Your email won't change until you confirm it.
            </p>
            <Button onClick={handleEmailChange} disabled={savingEmail} className="w-full">
              {savingEmail && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Send Confirmation Link
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
