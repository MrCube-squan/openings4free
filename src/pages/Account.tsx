import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, Mail, Pencil, Check, X, Camera, AlertCircle, Loader2, LogOut, Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Account = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { myProfile, updateUsername, canChangeUsername, refresh } = useFriends();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [uploading, setUploading] = useState(false);

  const usernameStatus = canChangeUsername();

  const getInitial = () => {
    if (myProfile?.username) return myProfile.username[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) return;
    const success = await updateUsername(newUsername.trim());
    if (success) setEditingUsername(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;

      // Remove old avatar if exists
      await supabase.storage.from('avatars').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl } as any)
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated!');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Not authenticated'); return; }
      const res = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.error) throw res.error;
      await supabase.auth.signOut();
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete account');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/auth?mode=login');
    return null;
  }

  const avatarUrl = (myProfile as any)?.avatar_url;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">{getInitial()}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <h1 className="text-2xl font-bold">{myProfile?.username || myProfile?.display_name || user?.email}</h1>
            </div>

            {/* Account Info */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-lg font-bold">{t('auth.email' as any)}</h2>
              
              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('auth.email')}</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              {/* Username */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t('friends.username' as any)}</p>
                  {editingUsername ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        className="h-8"
                        autoFocus
                        maxLength={20}
                        placeholder={t('auth.usernamePlaceholder' as any)}
                      />
                      <Button size="sm" variant="ghost" onClick={handleUsernameUpdate}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{myProfile?.username || myProfile?.display_name || '—'}</p>
                      {usernameStatus.allowed ? (
                        <Button size="sm" variant="ghost" onClick={() => {
                          setNewUsername(myProfile?.username || myProfile?.display_name || '');
                          setEditingUsername(true);
                        }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          <span>{t('friends.usernameCooldown' as any)} {usernameStatus.nextChangeDate?.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{t('friends.usernameHint' as any)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('nav.logout')}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive border-destructive/30">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('nav.deleteAccount')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('nav.deleteAccount')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('nav.deleteConfirm')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('trainer.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t('nav.deleteAccount')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Account;
