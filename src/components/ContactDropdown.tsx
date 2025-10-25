import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, MessageCircle, Mail, Calendar, MessageSquare, Share, UserCheck, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ContactDropdownProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export const ContactDropdown = ({ variant = "ghost", size = "sm", className = "" }: ContactDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const contactInfo = {
    phone: "+254701555240",
    email: "wilbonkipkuruingeno2021@gmail.com",
    whatsapp: "+254701555240"
  };

  const handleCall = () => {
    window.open(`tel:${contactInfo.phone}`, '_self');
    setIsOpen(false);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'm interested in your property listings on KeyNestHub.");
    window.open(`https://wa.me/${contactInfo.whatsapp.replace('+', '')}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Property Inquiry - KeyNestHub");
    const body = encodeURIComponent("Hi,\n\nI'm interested in learning more about your property listings.\n\nBest regards");
    window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_self');
    setIsOpen(false);
  };

  const handleScheduleViewing = () => {
    toast({
      title: "Schedule Viewing",
      description: "Feature coming soon! Please contact us directly for now."
    });
    setIsOpen(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KeyNestHub - Premium Real Estate',
          text: 'Check out this amazing real estate platform!',
          url: window.location.origin
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link Copied",
        description: "Website link copied to clipboard!"
      });
    }
    setIsOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for your inquiry. We'll get back to you within 1 hour."
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
    setShowForm(false);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={`${className}`}>
          <Phone className="w-4 h-4 mr-2" />
          Contact
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {!showForm ? (
          <div className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Get in Touch</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Verified Agent
                </div>
              </div>
              
              {/* Response time */}
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                Replies within 1 hour
              </div>

              {/* Contact Options */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleCall} className="justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleWhatsApp} className="justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleEmail} className="justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleScheduleViewing} className="justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book View
                </Button>
              </div>

              {/* Additional Options */}
              <div className="border-t pt-3 space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowForm(true)} 
                  className="w-full justify-start"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShare} 
                  className="w-full justify-start"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Listing
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Send Message</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowForm(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={user?.email?.split('@')[0] || "Your name"}
                  required
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={user?.email || "your@email.com"}
                  required
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-sm">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+254 7XX XXX XXX"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="text-sm">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="I'm interested in..."
                  required
                  className="text-sm h-20"
                />
              </div>
              
              <Button type="submit" className="w-full" size="sm">
                Send Message
              </Button>
            </form>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};