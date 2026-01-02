import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Inquiry {
  id: string;
  property_id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  message: string | null;
  created_at: string;
  property_title?: string;
  property_type?: string;
  property_location?: string;
}

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setInquiries([]);
      setLoading(false);
      return;
    }

    const fetchInquiries = async () => {
      setLoading(true);
      try {
        // Fetch contact requests for properties owned by the current user
        const { data: userProperties, error: propError } = await supabase
          .from('properties')
          .select('id, title, type, location')
          .eq('user_id', user.id);

        if (propError) throw propError;

        if (!userProperties || userProperties.length === 0) {
          setInquiries([]);
          setLoading(false);
          return;
        }

        const propertyIds = userProperties.map(p => p.id);
        const propertyMap = new Map(userProperties.map(p => [p.id, p]));

        const { data: requests, error: reqError } = await supabase
          .from('contact_requests')
          .select('*')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false });

        if (reqError) throw reqError;

        const enrichedInquiries: Inquiry[] = (requests || []).map(req => {
          const property = propertyMap.get(req.property_id);
          return {
            ...req,
            property_title: property?.title || 'Unknown Property',
            property_type: property?.type || 'Property',
            property_location: property?.location || 'Unknown Location',
          };
        });

        setInquiries(enrichedInquiries);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();

    // Set up real-time subscription for new inquiries
    const channel = supabase
      .channel('inquiries-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_requests'
        },
        () => {
          fetchInquiries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { inquiries, loading };
};
