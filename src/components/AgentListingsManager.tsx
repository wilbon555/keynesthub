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
  Eye,
  Phone,
  Bed,
  Bath,
  Calendar,
  Ruler,
  Home,
  Info
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
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [notes, setNotes] = useState('');

  const handleViewDetails = (listing: AgentListing) => {
    setSelectedListing(listing);
    setShowDetailsDialog(true);
  };

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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Image */}
            <div className="w-full md:w-40 h-28 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={listing.images?.[0] || listing.image || '/placeholder.svg'} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Main Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <VerificationBadge status={listing.verification_status} />
                  <Badge variant="outline">{listing.type}</Badge>
                  <Badge variant="outline">{listing.listing_type}</Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  <Clock className="inline w-3 h-3 mr-1" />
                  {format(new Date(listing.created_at), 'MMM d, yyyy')}
                </span>
              </div>

              <h4 className="font-semibold text-lg">{listing.title}</h4>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location}
                  {listing.region && `, ${listing.region}`}
                  {listing.country && `, ${listing.country}`}
                </span>
                <span className="font-medium text-primary text-base">{listing.price}</span>
                <span className="flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  {listing.area}
                </span>
              </div>

              {/* Property Specs */}
              <div className="flex items-center gap-4 text-sm flex-wrap">
                {listing.bedrooms && (
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-muted-foreground" />
                    {listing.bedrooms} Beds
                  </span>
                )}
                {listing.bathrooms && (
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-muted-foreground" />
                    {listing.bathrooms} Baths
                  </span>
                )}
                {listing.floors && (
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    {listing.floors} Floors
                  </span>
                )}
                {listing.building_age && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {listing.building_age} yrs old
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:flex-col justify-end">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleViewDetails(listing)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
              {showActions && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Phone Number - Highlighted for verification */}
          {listing.phone && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md border border-primary/20">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Owner Contact:</span>
              <a href={`tel:${listing.phone}`} className="text-primary font-semibold hover:underline">
                {listing.phone}
              </a>
            </div>
          )}

          {/* Description Preview */}
          {listing.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Details
            </DialogTitle>
            <DialogDescription>
              Full details for verification review
            </DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-4">
              {/* Images */}
              {(selectedListing.images?.length || selectedListing.image) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(selectedListing.images || [selectedListing.image]).filter(Boolean).map((img, idx) => (
                    <img 
                      key={idx}
                      src={img || '/placeholder.svg'} 
                      alt={`Property ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2 flex-wrap">
                <VerificationBadge status={selectedListing.verification_status} />
                <Badge variant="outline">{selectedListing.type}</Badge>
                <Badge variant="outline">{selectedListing.listing_type}</Badge>
              </div>

              {/* Title & Price */}
              <div>
                <h3 className="text-xl font-semibold">{selectedListing.title}</h3>
                <p className="text-2xl font-bold text-primary">{selectedListing.price}</p>
              </div>

              {/* Owner Contact - Highlighted */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  Owner Contact Information
                </h4>
                {selectedListing.phone ? (
                  <a href={`tel:${selectedListing.phone}`} className="text-lg font-bold text-primary hover:underline">
                    {selectedListing.phone}
                  </a>
                ) : (
                  <p className="text-muted-foreground italic">No phone number provided</p>
                )}
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{selectedListing.location}</p>
                </div>
                {selectedListing.region && (
                  <div>
                    <Label className="text-muted-foreground">Region</Label>
                    <p className="font-medium">{selectedListing.region}</p>
                  </div>
                )}
                {selectedListing.country && (
                  <div>
                    <Label className="text-muted-foreground">Country</Label>
                    <p className="font-medium">{selectedListing.country}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Area</Label>
                  <p className="font-medium">{selectedListing.area}</p>
                </div>
              </div>

              {/* Property Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedListing.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Bedrooms</Label>
                      <p className="font-medium">{selectedListing.bedrooms}</p>
                    </div>
                  </div>
                )}
                {selectedListing.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Bathrooms</Label>
                      <p className="font-medium">{selectedListing.bathrooms}</p>
                    </div>
                  </div>
                )}
                {selectedListing.floors && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Floors</Label>
                      <p className="font-medium">{selectedListing.floors}</p>
                    </div>
                  </div>
                )}
                {selectedListing.units && (
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Units</Label>
                      <p className="font-medium">{selectedListing.units}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                {selectedListing.building_age && (
                  <div>
                    <Label className="text-muted-foreground">Building Age</Label>
                    <p className="font-medium">{selectedListing.building_age} years</p>
                  </div>
                )}
                {selectedListing.developer && (
                  <div>
                    <Label className="text-muted-foreground">Developer</Label>
                    <p className="font-medium">{selectedListing.developer}</p>
                  </div>
                )}
                {selectedListing.maintenance_quality && (
                  <div>
                    <Label className="text-muted-foreground">Maintenance Quality</Label>
                    <p className="font-medium capitalize">{selectedListing.maintenance_quality}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedListing.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedListing.description}</p>
                </div>
              )}

              {/* Verification Info */}
              {selectedListing.verification_notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-muted-foreground">Verification Notes</Label>
                  <p className="mt-1 text-sm">{selectedListing.verification_notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>Listed: {format(new Date(selectedListing.created_at), 'PPpp')}</p>
                {selectedListing.verified_at && (
                  <p>Verified: {format(new Date(selectedListing.verified_at), 'PPpp')}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
