import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  MapPin, 
  Check, 
  X, 
  Building,
  Eye
} from "lucide-react";
import { AgentListing, useAgentListings } from "@/hooks/useAgentListings";
import { VerificationBadge } from "./VerificationBadge";
import { toast } from "sonner";
import { format } from "date-fns";

export const AgentListingsManager = () => {
  const { 
    pendingListings, 
    verifiedListings, 
    rejectedListings,
    loading, 
    verifyListing 
  } = useAgentListings();
  
  const [selectedListing, setSelectedListing] = useState<AgentListing | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notes, setNotes] = useState('');

  const handleVerify = (listing: AgentListing) => {
    setSelectedListing(listing);
    setShowVerifyDialog(true);
  };

  const handleReject = (listing: AgentListing) => {
    setSelectedListing(listing);
    setShowRejectDialog(true);
  };

  const confirmVerify = async () => {
    if (!selectedListing) return;

    const success = await verifyListing(selectedListing.id, 'verified', notes);
    
    if (success) {
      toast.success('Listing verified successfully');
    } else {
      toast.error('Failed to verify listing');
    }

    setShowVerifyDialog(false);
    setSelectedListing(null);
    setNotes('');
  };

  const confirmReject = async () => {
    if (!selectedListing) return;

    const success = await verifyListing(selectedListing.id, 'rejected', notes);
    
    if (success) {
      toast.success('Listing rejected');
    } else {
      toast.error('Failed to reject listing');
    }

    setShowRejectDialog(false);
    setSelectedListing(null);
    setNotes('');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading listings...</p>
      </div>
    );
  }

  const renderListingCard = (listing: AgentListing, showActions: boolean = false) => (
    <Card key={listing.id}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Image */}
          <div className="w-full md:w-32 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={listing.images?.[0] || listing.image || '/placeholder.svg'} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VerificationBadge status={listing.verification_status} />
                <Badge variant="outline">{listing.type}</Badge>
                <Badge variant="outline">{listing.listing_type}</Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                <Clock className="inline w-3 h-3 mr-1" />
                {format(new Date(listing.created_at), 'MMM d, yyyy')}
              </span>
            </div>

            <h4 className="font-semibold">{listing.title}</h4>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.location}
              </span>
              <span className="font-medium text-primary">{listing.price}</span>
              <span>{listing.area}</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 md:flex-col">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleVerify(listing)}
              >
                <Check className="w-4 h-4 mr-1" />
                Verify
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleReject(listing)}
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Pending Listings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Pending Verification ({pendingListings.length})
        </h3>
        
        {pendingListings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No listings pending verification</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingListings.map((listing) => renderListingCard(listing, true))}
          </div>
        )}
      </div>

      {/* Verified Listings */}
      {verifiedListings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Verified Listings ({verifiedListings.length})
          </h3>
          <div className="grid gap-4">
            {verifiedListings.slice(0, 5).map((listing) => renderListingCard(listing, false))}
          </div>
          {verifiedListings.length > 5 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              And {verifiedListings.length - 5} more verified listings...
            </p>
          )}
        </div>
      )}

      {/* Rejected Listings */}
      {rejectedListings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Rejected Listings ({rejectedListings.length})
          </h3>
          <div className="grid gap-4">
            {rejectedListings.slice(0, 3).map((listing) => renderListingCard(listing, false))}
          </div>
        </div>
      )}

      {/* Verify Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Listing</DialogTitle>
            <DialogDescription>
              Confirm that you have verified the ownership and legitimacy of "{selectedListing?.title}"
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="verify-notes">Notes (optional)</Label>
            <Textarea
              id="verify-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Verification notes..."
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmVerify}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Confirm Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting "{selectedListing?.title}"
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
