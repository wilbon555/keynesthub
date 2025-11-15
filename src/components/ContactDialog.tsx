import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

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
}

const ContactDialog = ({ isOpen, onClose, propertyId, propertyTitle, phoneNumber }: ContactDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate input data
      const validated = contactSchema.parse(formData);

      // Log the contact request
      const { error } = await supabase.from('contact_requests').insert({
        property_id: propertyId,
        requester_name: validated.name,
        requester_email: validated.email,
        requester_phone: validated.phone || null,
        message: validated.message || null
      });

      if (error) throw error;

      setShowWhatsApp(true);
      toast({
        title: "Contact request submitted",
        description: "Click the WhatsApp button below to continue the conversation"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
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

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in "${propertyTitle}". ${formData.message ? formData.message : ''}`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Reset and close after a short delay
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', message: '' });
      setShowWhatsApp(false);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setShowWhatsApp(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Property Owner</DialogTitle>
          <DialogDescription>
            {!showWhatsApp 
              ? "Fill in your details to contact the property owner via WhatsApp"
              : "Your request has been logged. Click below to continue on WhatsApp"}
          </DialogDescription>
        </DialogHeader>

        {!showWhatsApp ? (
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
                {isSubmitting ? 'Submitting...' : 'Continue to WhatsApp'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center text-sm text-muted-foreground">
                Your contact request has been logged. Click the button below to open WhatsApp and continue your conversation with the property owner.
              </div>
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Open WhatsApp
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
