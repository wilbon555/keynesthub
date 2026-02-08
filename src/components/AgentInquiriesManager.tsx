import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Check, 
  X, 
  CalendarDays,
  MessageSquare,
  User,
  Home
} from "lucide-react";
import { AgentInquiry, useAgentInquiries } from "@/hooks/useAgentInquiries";
import { useViewings } from "@/hooks/useViewings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export const AgentInquiriesManager = () => {
  const { inquiries, loading, updateInquiryStatus } = useAgentInquiries();
  const { scheduleViewing } = useViewings();
  const [selectedInquiry, setSelectedInquiry] = useState<AgentInquiry | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState('10:00');

  const handleApprove = async (inquiry: AgentInquiry) => {
    setSelectedInquiry(inquiry);
    setShowScheduleDialog(true);
  };

  const handleReject = async (inquiry: AgentInquiry) => {
    setSelectedInquiry(inquiry);
    setShowRejectDialog(true);
  };

  const confirmScheduleViewing = async () => {
    if (!selectedInquiry || !scheduledDate || !selectedInquiry.property) return;

    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const viewingDate = new Date(scheduledDate);
    viewingDate.setHours(hours, minutes, 0, 0);

    const success = await scheduleViewing(
      selectedInquiry.id,
      selectedInquiry.property_id,
      selectedInquiry.property.user_id,
      null, // buyer_id - we don't have auth user info for the requester
      viewingDate,
      30,
      notes
    );

    if (success) {
      await updateInquiryStatus(selectedInquiry.id, 'approved', notes);
      
      // Decrement vacant units for rental properties
      if (selectedInquiry.property.listing_type === 'rent') {
        const { data, error } = await supabase.rpc('decrement_vacant_units', {
          property_id: selectedInquiry.property_id
        });
        
        if (error) {
          console.error('Failed to decrement vacant units:', error);
        } else {
          const remainingUnits = data as number;
          if (remainingUnits === 0) {
            toast.info('This property is now fully rented!');
          } else {
            toast.success(`Viewing scheduled. ${remainingUnits} units remaining.`);
          }
        }
      } else {
        toast.success('Viewing scheduled successfully');
      }
    } else {
      toast.error('Failed to schedule viewing');
    }

    setShowScheduleDialog(false);
    setSelectedInquiry(null);
    setNotes('');
    setScheduledDate(undefined);
  };

  const confirmReject = async () => {
    if (!selectedInquiry) return;

    const success = await updateInquiryStatus(selectedInquiry.id, 'rejected', notes);
    
    if (success) {
      toast.success('Inquiry rejected');
    } else {
      toast.error('Failed to reject inquiry');
    }

    setShowRejectDialog(false);
    setSelectedInquiry(null);
    setNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading inquiries...</p>
      </div>
    );
  }

  const pendingInquiries = inquiries.filter(i => i.status === 'pending');
  const processedInquiries = inquiries.filter(i => i.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Inquiries */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Pending Inquiries ({pendingInquiries.length})
        </h3>
        
        {pendingInquiries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pending inquiries</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingInquiries.map((inquiry) => (
              <Card key={inquiry.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(inquiry.status)}
                        <span className="text-sm text-muted-foreground">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {format(new Date(inquiry.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      
                      {inquiry.property && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{inquiry.property.title}</p>
                            {inquiry.property.listing_type === 'rent' && 
                             inquiry.property.vacant_units !== undefined && 
                             inquiry.property.total_units !== undefined && (
                              <Badge 
                                className={`${
                                  inquiry.property.vacant_units === 0 
                                    ? 'bg-destructive text-destructive-foreground' 
                                    : inquiry.property.vacant_units <= 3 
                                      ? 'bg-orange-500 text-white' 
                                      : 'bg-green-600 text-white'
                                } border-0`}
                              >
                                <Home className="w-3 h-3 mr-1" />
                                {inquiry.property.vacant_units}/{inquiry.property.total_units} vacant
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {inquiry.property.location}
                            <span className="mx-2">•</span>
                            {inquiry.property.price}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{inquiry.requester_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{inquiry.requester_email}</span>
                        </div>
                        {inquiry.requester_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{inquiry.requester_phone}</span>
                          </div>
                        )}
                      </div>

                      {inquiry.message && (
                        <p className="text-sm text-muted-foreground bg-muted/30 rounded p-2">
                          "{inquiry.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(inquiry)}
                      >
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Schedule Viewing
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(inquiry)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Inquiries */}
      {processedInquiries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Processed Inquiries ({processedInquiries.length})
          </h3>
          <div className="grid gap-4">
            {processedInquiries.map((inquiry) => (
              <Card key={inquiry.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(inquiry.status)}
                        <span className="font-medium">{inquiry.requester_name}</span>
                        {inquiry.property && (
                          <span className="text-sm text-muted-foreground">
                            - {inquiry.property.title}
                          </span>
                        )}
                      </div>
                      {inquiry.agent_notes && (
                        <p className="text-sm text-muted-foreground">
                          Notes: {inquiry.agent_notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Viewing Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Property Viewing</DialogTitle>
            <DialogDescription>
              Schedule a viewing for {selectedInquiry?.requester_name} at{' '}
              {selectedInquiry?.property?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border mt-2"
              />
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmScheduleViewing}
              disabled={!scheduledDate}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Confirm Viewing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Inquiry</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this inquiry from {selectedInquiry?.requester_name}
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="reject-notes">Reason</Label>
            <Textarea
              id="reject-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for rejection..."
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              <X className="w-4 h-4 mr-1" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
