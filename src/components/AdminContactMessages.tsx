import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, Inbox, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

export const AdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel('contact-messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, (payload) => {
        setMessages((prev) => [payload.new as ContactMessage, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Contact Messages Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Messages submitted through the About Us page will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Contact Messages</h2>
          <p className="text-muted-foreground text-sm">
            {messages.length} message{messages.length !== 1 ? 's' : ''} from the About Us page
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {messages.map((msg) => (
          <Card key={msg.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {msg.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {msg.email}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(msg.created_at), 'MMM d, yyyy HH:mm')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {msg.subject && (
                <p className="text-sm font-medium text-foreground">
                  Subject: {msg.subject}
                </p>
              )}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject || 'Your message to KeyNestHub'}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
