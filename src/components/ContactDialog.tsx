import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { LogIn, Shield } from 'lucide-react';
import { AgentDisclaimer } from './AgentDisclaimer';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().trim().max(20, 'Phone number must be less than 20 characters').optional().or(z.literal('')),
  message: z.string().trim().max(1000, 'Message must be less than 1000 characters').optional().or(z.literal(''))
});

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  phoneNumber: string;
  listingType?: 'sale' | 'rent';
  propertyType?: string;
}

const ContactDialog = ({ 
  isOpen, 
  onClose, 
  propertyId, 
  propertyTitle, 
  phoneNumber,
  listingType = 'sale',
  propertyType = 'Property'
}: ContactDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const getDefaultMessage = () => {
    const typeText = listingType === 'rent' ? 'rent' : 'purchase';
    return `I am interested in this ${propertyType.toLowerCase()} and would like more details about the ${typeText}.`;
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill email from user if logged in, and set default message
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        email: user?.email || prev.email,
        message: prev.message || getDefaultMessage()
      }));
      setIsSubmitted(false);
    }
  }, [isOpen, user]);

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in Required</DialogTitle>
            <DialogDescription>
              Please sign in to contact property owners and submit inquiries.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              Only registered users can contact property owners. This helps protect both buyers and sellers.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => {
                onClose();
                navigate('/auth');
              }}>
                Sign In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate input data
      const validated = contactSchema.parse(formData);

      // Log the contact request - it will be routed to agents
      const { error } = await supabase.from('contact_requests').insert({
        property_id: propertyId,
        requester_name: validated.name,
        requester_email: validated.email,
        requester_phone: validated.phone || null,
        message: validated.message || null
      });

      if (error) throw error;

      // Notify agents via email (fire and forget - don't block on this)
      supabase.functions.invoke('notify-new-inquiry', {
        body: {
          propertyTitle,
          propertyId,
          requesterName: validated.name,
          requesterEmail: validated.email,
          requesterPhone: validated.phone || null,
          message: validated.message || null
        }
      }).catch(err => console.error('Failed to notify agents:', err));

      setIsSubmitted(true);
      toast({
        title: "Inquiry submitted successfully!",
        description: "A KeyNestHub agent will review your inquiry and contact you to schedule a viewing."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else if (error && typeof error === 'object' && 'message' in error && 
                 typeof error.message === 'string' && error.message.includes('Rate limit exceeded')) {
        toast({
          title: "Too Many Requests",
          description: "You've reached the maximum of 5 contact requests per hour. Please try again later.",
          variant: "destructive"
        });
      } else {
        console.error('Error submitting contact request:', error);
        toast({
          title: "Error",
          description: "Failed to submit contact request. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitted(false);
    onClose();
  };

  const dialogTitle = listingType === 'rent' ? 'Inquire About Rental' : 'Contact Property Owner';
  const dialogDescription = listingType === 'rent' 
    ? 'Submit your details to inquire about renting this property'
    : 'Submit your details to inquire about this property';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {!isSubmitted 
              ? dialogDescription
              : "Your inquiry has been submitted to our agents for review."}
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <div className="space-y-4">
            <AgentDisclaimer />
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Your Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Your Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+254 712 345 678"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="I'm interested in viewing this property..."
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <Shield className="h-12 w-12 text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">Inquiry Submitted!</h3>
                <p className="text-sm text-muted-foreground">
                  A KeyNestHub agent will review your inquiry, verify the property, and contact you to schedule a viewing. 
                  This process helps protect you from fraud.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full sm:w-auto">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
