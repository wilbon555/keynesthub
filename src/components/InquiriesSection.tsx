import { useInquiries } from '@/hooks/useInquiries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageSquare, Calendar, MapPin, Home, Inbox } from 'lucide-react';
import { format } from 'date-fns';

export const InquiriesSection = () => {
  const { inquiries, loading } = useInquiries();

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading inquiries...</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Inquiries Yet</h3>
        <p className="text-muted-foreground">
          When potential buyers or renters contact you about your properties, their inquiries will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Property Inquiries</h2>
          <p className="text-muted-foreground text-sm">
            {inquiries.length} inquiry{inquiries.length !== 1 ? 'ies' : ''} received
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{inquiry.requester_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Home className="h-4 w-4" />
                    {inquiry.property_title}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {inquiry.property_location}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <a 
                  href={`mailto:${inquiry.requester_email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {inquiry.requester_email}
                </a>
                {inquiry.requester_phone && (
                  <a 
                    href={`tel:${inquiry.requester_phone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {inquiry.requester_phone}
                  </a>
                )}
              </div>

              {inquiry.message && (
                <div className="bg-muted/50 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <p className="text-sm">{inquiry.message}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.href = `mailto:${inquiry.requester_email}?subject=Re: ${inquiry.property_title}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reply via Email
                </Button>
                {inquiry.requester_phone && (
                  <Button 
                    size="sm" 
                    className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                    onClick={() => {
                      const message = encodeURIComponent(`Hi ${inquiry.requester_name}, thank you for your interest in "${inquiry.property_title}".`);
                      window.open(`https://wa.me/${inquiry.requester_phone?.replace(/\D/g, '')}?text=${message}`, '_blank');
                    }}
                  >
                    Reply via WhatsApp
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
