import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2, AlertCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  price_changes: boolean;
  new_listings: boolean;
  saved_search_matches: boolean;
}

export const NotificationSettings = () => {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    price_changes: true,
    new_listings: true,
    saved_search_matches: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;

      const { data, error } = await (supabase
        .from('notification_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .single() as any);

      if (data && !error) {
        setPreferences({
          price_changes: data.price_changes ?? true,
          new_listings: data.new_listings ?? true,
          saved_search_matches: data.saved_search_matches ?? true,
        });
      }
    };

    fetchPreferences();
  }, [user]);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!user) return;

    const newValue = !preferences[key];
    setPreferences(prev => ({ ...prev, [key]: newValue }));
    setIsSaving(true);

    try {
      const { error } = await (supabase
        .from('notification_preferences' as any)
        .upsert({
          user_id: user.id,
          [key]: newValue,
        }, {
          onConflict: 'user_id'
        }) as any);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving preference:', err);
      setPreferences(prev => ({ ...prev, [key]: !newValue }));
      toast({
        title: 'Error',
        description: 'Failed to save preference.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Sign in to manage notification preferences
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about price changes and new listings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSupported ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Push notifications are not supported in this browser.</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {permission === 'denied' 
                    ? 'Notifications are blocked. Please enable them in browser settings.'
                    : 'Receive alerts directly in your browser'
                  }
                </p>
              </div>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Button
                  variant={isSubscribed ? 'outline' : 'default'}
                  size="sm"
                  onClick={isSubscribed ? unsubscribe : subscribe}
                  disabled={permission === 'denied'}
                >
                  {isSubscribed ? 'Disable' : 'Enable'}
                </Button>
              )}
            </div>

            {isSubscribed && (
              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm font-medium">Notification Types</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Price Changes</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified when properties in your favorites change price
                    </p>
                  </div>
                  <Switch
                    checked={preferences.price_changes}
                    onCheckedChange={() => handleToggle('price_changes')}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">New Listings</p>
                    <p className="text-xs text-muted-foreground">
                      Be the first to know about new properties
                    </p>
                  </div>
                  <Switch
                    checked={preferences.new_listings}
                    onCheckedChange={() => handleToggle('new_listings')}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Saved Search Matches</p>
                    <p className="text-xs text-muted-foreground">
                      Notifications when properties match your saved searches
                    </p>
                  </div>
                  <Switch
                    checked={preferences.saved_search_matches}
                    onCheckedChange={() => handleToggle('saved_search_matches')}
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
