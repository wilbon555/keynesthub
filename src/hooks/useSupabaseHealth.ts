import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type HealthStatus = 'checking' | 'online' | 'offline';

export const useSupabaseHealth = () => {
  const [status, setStatus] = useState<HealthStatus>('checking');

  const check = async () => {
    setStatus('checking');
    try {
      // Lightweight HEAD request — only checks reachability + grants, no rows transferred
      const { error } = await supabase
        .from('properties')
        .select('id', { head: true, count: 'exact' })
        .limit(1);

      setStatus(error ? 'offline' : 'online');
    } catch {
      setStatus('offline');
    }
  };

  useEffect(() => {
    check();
    const onOnline = () => check();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return { status, recheck: check };
};