import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, Upload, FileImage } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
interface PhotoUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PhotoUpload = ({ open, onOpenChange }: PhotoUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"select" | "details">("select");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { addProperty } = useProperties();
  const { user } = useAuth();
  const { tier, limits, canUploadMore } = useSubscription();

  const detailsSchema = z
    .object({
      region: z.string().min(2, "Region is required"),
      country: z.string().min(2, "Country is required"),
      location: z.string().min(2, "Location is required"),
      propertyType: z.string().min(1, "Property type is required"),
      listingType: z.enum(['sale', 'rent'], { required_error: "Please select listing type" }),
      bedrooms: z.coerce.number().min(0, "Bedrooms must be 0 or more").optional(),
      bathrooms: z.coerce.number().min(0, "Bathrooms must be 0 or more").optional(),
      area: z.string().min(1, "Area/Square footage is required"),
      // Apartment-specific fields
      units: z.coerce.number().min(1, "Units must be at least 1").optional(),
      floors: z.coerce.number().min(1, "Floors must be at least 1").optional(),
      buildingAge: z.coerce.number().min(0, "Building age must be 0 or more").optional(),
      developer: z.string().optional(),
      maintenanceQuality: z.string().optional(),
      // Vacancy tracking for rentals
      totalUnits: z.coerce.number().min(1, "Total units must be at least 1").optional(),
      vacantUnits: z.coerce.number().min(0, "Vacant units cannot be negative").optional(),
      stayType: z.enum(['long-term', 'short-term']).optional(),
      priceMin: z.coerce.number().min(1, "Min price must be at least 1").max(1000000000, "Max price cannot exceed 1,000,000,000"),
      priceMax: z.coerce.number().min(1, "Max price must be at least 1").max(1000000000, "Max price cannot exceed 1,000,000,000"),
      phone: z
        .string()
        .min(7, "Phone is required")
        .regex(/^[+0-9()\-\s]+$/, "Invalid phone number"),
      description: z.string().min(10, "Please add a brief description"),
    })
    .refine((data) => data.priceMax >= data.priceMin, {
      message: "Max price must be greater than or equal to Min price",
      path: ["priceMax"],
    })
    .refine((data) => {
      if (data.listingType === 'rent' && data.totalUnits && data.vacantUnits) {
        return data.vacantUnits <= data.totalUnits;
      }
      return true;
    }, {
      message: "Vacant units cannot exceed total units",
      path: ["vacantUnits"],
    });

  type DetailsForm = z.infer<typeof detailsSchema>;

  const form = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      region: "",
      country: "",
      location: "",
      propertyType: "",
      listingType: "sale",
      bedrooms: undefined,
      bathrooms: undefined,
      area: "",
      units: undefined,
      floors: undefined,
      buildingAge: undefined,
      developer: "",
      maintenanceQuality: "",
      totalUnits: undefined,
      vacantUnits: undefined,
      stayType: 'long-term' as const,
      priceMin: 1,
      priceMax: 1,
      phone: "",
      description: "",
    },
  });

  // Currency mapping based on country
  const getCurrencyInfo = (country: string) => {
    const countryLower = country.toLowerCase();
    const currencyMap: { [key: string]: { symbol: string; code: string } } = {
      kenya: { symbol: "Ksh", code: "KES" },
      uganda: { symbol: "UGX", code: "UGX" },
      tanzania: { symbol: "TSh", code: "TZS" },
      "united states": { symbol: "$", code: "USD" },
      usa: { symbol: "$", code: "USD" },
      "united kingdom": { symbol: "£", code: "GBP" },
      uk: { symbol: "£", code: "GBP" },
      canada: { symbol: "C$", code: "CAD" },
      australia: { symbol: "A$", code: "AUD" },
      "south africa": { symbol: "R", code: "ZAR" },
      nigeria: { symbol: "₦", code: "NGN" },
      ghana: { symbol: "₵", code: "GHS" },
      egypt: { symbol: "E£", code: "EGP" },
      morocco: { symbol: "MAD", code: "MAD" },
      ethiopia: { symbol: "Br", code: "ETB" },
    };

    // Try to find exact match or partial match
    for (const [key, value] of Object.entries(currencyMap)) {
      if (countryLower.includes(key) || key.includes(countryLower)) {
        return value;
      }
    }
    
    // Default to USD if no match found
    return { symbol: "$", code: "USD" };
  };

  const handleFormError = (errors: any) => {
    console.error('Form validation errors:', errors);
    const errorMessages = Object.entries(errors).map(([field, error]: [string, any]) => 
      `${field}: ${error?.message || 'Invalid'}`
    ).join(', ');
    toast.error(`Please fix: ${errorMessages}`);
  };

  const onSubmit = async (values: DetailsForm) => {
    if (!user) {
      toast.error("Please log in to list a property");
      return;
    }

    console.log('Submitting property form with values:', { ...values, uploadedFiles: selectedFiles.length });
    console.log('Current user:', user?.id);
    console.log('User auth state:', user);

    try {
      const currency = getCurrencyInfo(values.country);
      
      // Create property from form data (without images first)
      const newProperty = {
        title: values.description.split('.')[0] || "New Property Listing",
        price: `${currency.symbol}${values.priceMin.toLocaleString()} - ${currency.symbol}${values.priceMax.toLocaleString()}`,
        location: `${values.location}, ${values.region}`,
        area: values.area || "TBD",
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        type: values.propertyType,
        featured: true,
        region: values.region,
        country: values.country,
        phone: values.phone,
        description: values.description,
        status: 'available' as const,
        listing_type: values.listingType,
        // Apartment-specific fields
        units: values.units,
        floors: values.floors,
        building_age: values.buildingAge,
        developer: values.developer,
        maintenance_quality: values.maintenanceQuality,
        // Vacancy tracking for rentals
        total_units: values.listingType === 'rent' ? (values.totalUnits || 1) : undefined,
        vacant_units: values.listingType === 'rent' ? (values.vacantUnits ?? values.totalUnits ?? 1) : undefined,
        stay_type: values.listingType === 'rent' ? (values.stayType || 'long-term') : undefined,
        uploadedFiles: selectedFiles // Pass files to be uploaded
      };

      console.log('Calling addProperty with data:', newProperty);

      // Add to database (this will handle storage upload)
      const result = await addProperty(newProperty);
      
      if (result) {
        console.log('Property added successfully, resetting form');
        // Reset and close on success
        onOpenChange(false);
        setSelectedFiles([]);
        setStep("select");
        form.reset();
      } else {
        console.error('addProperty returned null - property was not created');
        toast.error('Failed to upload property. Please check console for details.');
      }
    } catch (error) {
      console.error('Unexpected error in onSubmit:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const totalAfterAdd = selectedFiles.length + files.length;
      if (totalAfterAdd > limits.maxPhotos) {
        const allowed = limits.maxPhotos - selectedFiles.length;
        if (allowed <= 0) {
          setShowUpgrade(true);
          toast.error(`You've reached the ${limits.maxPhotos} photo limit for your ${tier} plan.`);
          return;
        }
        const trimmed = files.slice(0, allowed);
        setSelectedFiles(prev => [...prev, ...trimmed]);
        toast.warning(`Only ${allowed} more photo(s) allowed on your ${tier} plan. ${files.length - allowed} file(s) were skipped.`);
        setShowUpgrade(true);
        return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} file(s) ready to upload`);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      if (!canUploadMore(selectedFiles.length)) {
        setShowUpgrade(true);
        toast.error(`Photo limit reached for your ${tier} plan.`);
        return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
      toast.success("Photo captured and ready to upload");
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Add Property Photos</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(80vh-5rem)] pr-6">
          <div className="flex flex-col gap-4 pt-6">
            {/* Upload Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm">Take Photo</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Upload Photos</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "*/*";
                    fileInputRef.current.click();
                  }
                }}
              >
                <FileImage className="w-6 h-6" />
                <span className="text-sm">Upload Files</span>
              </Button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleCameraCapture}
            />
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Selected Files Preview + Flow */}
            {step === "select" && (
              <div className="space-y-4">
                {selectedFiles.length > 0 ? (
                  <>
                    <h3 className="font-medium">Selected Files ({selectedFiles.length}/{limits.maxPhotos})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-24 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-full h-24 bg-muted rounded border flex items-center justify-center">
                              <FileImage className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <p className="text-xs mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        disabled={selectedFiles.length === 0}
                        onClick={() => setStep("details")}
                      >
                        Continue
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedFiles([])}>
                        Clear All
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No files selected yet.</p>
                )}
              </div>
            )}

            {step === "details" && (
              <div className="space-y-4">
                <h3 className="font-medium">Property Details</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit, handleFormError)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Nairobi County" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Kenya" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, neighborhood or address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="House">House</SelectItem>
                                <SelectItem value="Apartment">Apartment</SelectItem>
                                <SelectItem value="Commercial">Commercial</SelectItem>
                                <SelectItem value="Land">Land</SelectItem>
                                <SelectItem value="Condo">Condo</SelectItem>
                                <SelectItem value="Villa">Villa</SelectItem>
                                <SelectItem value="Office">Office Space</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="listingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Listing Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="For Sale or Rent" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sale">For Sale</SelectItem>
                                <SelectItem value="rent">For Rent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Vacancy tracking fields for rentals */}
                    {form.watch("listingType") === "rent" && (
                      <div className="space-y-4">
                        {/* Stay Type selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="stayType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stay Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || 'long-term'}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select stay type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="long-term">Long-term (Monthly/Semester)</SelectItem>
                                    <SelectItem value="short-term">Short-term (Airbnb / Nightly)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Vacancy tracking */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-foreground mb-2">📊 Vacancy Tracking</p>
                            <p className="text-xs text-muted-foreground">Track available units to show real-time availability to potential tenants.</p>
                          </div>
                          <FormField
                            control={form.control}
                            name="totalUnits"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Units/Rooms</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min={1} 
                                    placeholder="e.g., 30" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="vacantUnits"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currently Vacant</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min={0}
                                    max={form.watch("totalUnits") || 999}
                                    placeholder="e.g., 15" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Bedrooms, Bathrooms, Area fields for applicable property types */}
                    {["House", "Apartment", "Condo", "Villa"].includes(form.watch("propertyType")) && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch("listingType") === "rent" ? "Bedroom Type" : "Bedrooms"}
                              </FormLabel>
                              {form.watch("listingType") === "rent" ? (
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  value={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select bedroom type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="0">Bedsitter</SelectItem>
                                    <SelectItem value="1">1 Bedroom</SelectItem>
                                    <SelectItem value="2">2 Bedroom</SelectItem>
                                    <SelectItem value="3">3 Bedroom</SelectItem>
                                    <SelectItem value="4">4 Bedroom</SelectItem>
                                    <SelectItem value="5">5+ Bedroom</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min={0} 
                                    placeholder="e.g., 3" 
                                    {...field} 
                                  />
                                </FormControl>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bathrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bathrooms</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={0} 
                                  placeholder="e.g., 2" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area (sq ft)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 2500 sq ft" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Apartment-specific fields */}
                    {form.watch("propertyType") === "Apartment" && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="units"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Number of Units</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min={1} 
                                    placeholder="e.g., 12" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="floors"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Number of Floors</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min={1} 
                                    placeholder="e.g., 5" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="buildingAge"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Building Age (years)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min={0} 
                                    placeholder="e.g., 3" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="developer"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Developer/Builder</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., ABC Developers Ltd" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="maintenanceQuality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maintenance Quality</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select quality" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="fair">Fair</SelectItem>
                                    <SelectItem value="needs_work">Needs Work</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    {/* Area field for other property types */}
                    {!["House", "Apartment", "Condo", "Villa"].includes(form.watch("propertyType")) && (
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area/Size</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 1 acre, 5000 sq ft" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="priceMin"
                        render={({ field }) => {
                          const country = form.watch("country");
                          const currency = getCurrencyInfo(country);
                          return (
                            <FormItem>
                              <FormLabel>
                                {form.watch("listingType") === "rent" 
                                  ? form.watch("stayType") === "short-term" 
                                    ? `Nightly Rate Min (${currency.symbol})` 
                                    : `Price Min /mo (${currency.symbol})`
                                  : `Price Min (${currency.symbol})`}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  max={1000000000}
                                  step={1} 
                                  placeholder={`1 ${currency.code}`} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="priceMax"
                        render={({ field }) => {
                          const country = form.watch("country");
                          const currency = getCurrencyInfo(country);
                          return (
                            <FormItem>
                              <FormLabel>
                                {form.watch("listingType") === "rent" 
                                  ? form.watch("stayType") === "short-term" 
                                    ? `Nightly Rate Max (${currency.symbol})` 
                                    : `Price Max /mo (${currency.symbol})`
                                  : `Price Max (${currency.symbol})`}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  max={1000000000}
                                  step={1} 
                                  placeholder={`1000000 ${currency.code}`} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., +254 700 000 000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea rows={4} placeholder="Describe the property, amenities, size, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep("select")}>Back</Button>
                      <Button type="submit" className="flex-1">Upload the Property</Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>

    <UpgradePrompt
      open={showUpgrade}
      onOpenChange={setShowUpgrade}
      currentTier={tier}
      reason={`Your ${tier} plan allows up to ${limits.maxPhotos} photos per listing. Upgrade to upload more photos and unlock premium features.`}
    />
    </>
  );
};