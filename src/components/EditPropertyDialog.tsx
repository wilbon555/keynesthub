import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/hooks/useProperties";
import { X, Home, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";

interface EditPropertyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onSave: (updatedProperty: Partial<Property> & { uploadedFiles?: File[]; images?: string[] }) => Promise<void>;
}

export const EditPropertyDialog = ({ isOpen, onClose, property, onSave }: EditPropertyDialogProps) => {
  const [formData, setFormData] = useState({
    title: property.title,
    price: property.price,
    location: property.location,
    bedrooms: property.bedrooms?.toString() || "",
    bathrooms: property.bathrooms?.toString() || "",
    area: property.area,
    type: property.type,
    region: property.region || "",
    country: property.country || "",
    phone: property.phone || "",
    description: property.description || "",
    listing_type: property.listing_type,
    total_units: property.total_units?.toString() || "1",
    vacant_units: property.vacant_units?.toString() || "1",
    stay_type: (property as any).stay_type || "long-term",
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    (property.images || []).filter(img => img && img !== "/placeholder.svg")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { tier, limits } = useSubscription();

  const totalPhotoCount = existingImages.length + uploadedFiles.length;

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    toast.success("Image marked for removal");
  };

  const handleRemoveNewFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newTotal = totalPhotoCount + files.length;
    if (newTotal > limits.maxPhotos) {
      const allowed = limits.maxPhotos - totalPhotoCount;
      if (allowed <= 0) {
        toast.error(`Photo limit reached (${limits.maxPhotos}) for your ${tier} plan.`);
        return;
      }
      setUploadedFiles(prev => [...prev, ...files.slice(0, allowed)]);
      toast.warning(`Only ${allowed} more photo(s) allowed on your ${tier} plan.`);
    } else {
      setUploadedFiles(prev => [...prev, ...files]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalUnits = parseInt(formData.total_units) || 1;
      const vacantUnits = parseInt(formData.vacant_units) || 0;

      if (vacantUnits > totalUnits) {
        throw new Error("Vacant units cannot exceed total units");
      }

      await onSave({
        ...formData,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        total_units: formData.listing_type === 'rent' ? totalUnits : undefined,
        vacant_units: formData.listing_type === 'rent' ? vacantUnits : undefined,
        stay_type: formData.listing_type === 'rent' ? formData.stay_type : undefined,
        uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        images: existingImages,
      });
      onClose();
    } catch (error: any) {
      console.error("Error updating property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">
                {formData.listing_type === 'rent'
                  ? formData.stay_type === 'short-term' ? 'Nightly Rate *' : 'Monthly Rate *'
                  : 'Price *'}
              </Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder={formData.stay_type === 'short-term' ? "e.g., Ksh500/night" : "e.g., $250,000"}
                required
              />
            </div>
            <div>
              <Label htmlFor="listing_type">Listing Type *</Label>
              <Select
                value={formData.listing_type}
                onValueChange={(value) => setFormData({ ...formData, listing_type: value as 'sale' | 'rent' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.listing_type === 'rent' && (
            <div>
              <Label htmlFor="stay_type">Stay Type</Label>
              <Select
                value={formData.stay_type}
                onValueChange={(value) => setFormData({ ...formData, stay_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long-term">Long-term (Monthly/Semester)</SelectItem>
                  <SelectItem value="short-term">Short-term (Airbnb / Nightly)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.listing_type === 'rent' && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Vacancy Tracking</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Track available units in real-time.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_units">Total Units/Rooms</Label>
                  <Input
                    id="total_units"
                    type="number"
                    min={1}
                    value={formData.total_units}
                    onChange={(e) => setFormData({ ...formData, total_units: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vacant_units">Currently Vacant</Label>
                  <Input
                    id="vacant_units"
                    type="number"
                    min={0}
                    max={parseInt(formData.total_units) || 999}
                    value={formData.vacant_units}
                    onChange={(e) => setFormData({ ...formData, vacant_units: e.target.value })}
                  />
                </div>
              </div>
              {parseInt(formData.vacant_units) === 0 && (
                <p className="text-xs text-destructive font-medium">
                  ⚠️ No vacant units - property will show as fully rented
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="area">Area *</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g., 1,200 sqft"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Property Type *</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="e.g., House, Apartment, Land"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Contact Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* Photo Management Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Property Photos ({totalPhotoCount}/{limits.maxPhotos})</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={totalPhotoCount >= limits.maxPhotos}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Photos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAddFiles}
              />
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Current photos</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {existingImages.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative group">
                      <img
                        src={url}
                        alt={`Property ${idx + 1}`}
                        className="w-full h-20 object-cover rounded border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newly Added Files */}
            {uploadedFiles.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">New photos to add</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${idx + 1}`}
                        className="w-full h-20 object-cover rounded border border-primary/50"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalPhotoCount === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                No photos. Click "Add Photos" to upload.
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
