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

// Parse human-friendly price strings: "1B", "1.5 m", "100k", "2,500,000", "10 billion".
// Returns a number or NaN if unparseable.
const parsePriceInput = (raw: unknown): number => {
  if (typeof raw === "number") return raw;
  if (raw === null || raw === undefined) return NaN;
  const s = String(raw).trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, " ");
  if (!s) return NaN;
  // pure number
  const pure = Number(s);
  if (!Number.isNaN(pure)) return pure;
  const match = s.match(/^([0-9]*\.?[0-9]+)\s*(k|thousand|m|mn|million|b|bn|billion)?$/i);
  if (!match) return NaN;
  const n = parseFloat(match[1]);
  const unit = (match[2] || "").toLowerCase();
  const mult =
    unit.startsWith("b") ? 1_000_000_000 :
    unit.startsWith("m") ? 1_000_000 :
    (unit.startsWith("k") || unit === "thousand") ? 1_000 : 1;
  return n * mult;
};

const MAX_SALE_PRICE = 10_000_000_000; // 10 Billion

const priceField = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => (v === undefined || v === "" ? undefined : parsePriceInput(v)))
  .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 1), { message: "Enter a valid amount (e.g. 1.5M, 1B, 250000)" })
  .refine((v) => v === undefined || v <= MAX_SALE_PRICE, { message: "Price cannot exceed 10,000,000,000 (10B)" });
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      area: z.string().optional(),
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
      price: priceField,
      priceMin: priceField,
      priceMax: priceField,
      phone: z
        .string()
        .min(7, "Phone is required")
        .regex(/^[+0-9()\-\s]+$/, "Invalid phone number"),
      description: z.string().min(10, "Please add a brief description").max(20000, "Description is too long"),
    })
    .refine((data) => {
      if (data.listingType === 'rent') {
        return data.price && data.price >= 1;
      }
      return data.priceMin && data.priceMin >= 1;
    }, {
      message: "Price is required",
      path: ["price"],
    })
    .refine((data) => {
      if (data.listingType === 'sale') {
        return data.priceMax && data.priceMax >= (data.priceMin || 0);
      }
      return true;
    }, {
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
      priceMin: undefined,
      priceMax: undefined,
      price: undefined,
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
    setIsSubmitting(true);

    console.log('Submitting property form with values:', { ...values, uploadedFiles: selectedFiles.length });
    console.log('Current user:', user?.id);
    console.log('User auth state:', user);

    try {
      const currency = getCurrencyInfo(values.country);
      
      // Create property from form data (without images first)
      const newProperty = {
        title: values.description.split('.')[0] || "New Property Listing",
        price: values.listingType === 'rent'
          ? `${currency.symbol}${(values.price || 0).toLocaleString()}`
          : `${currency.symbol}${(values.priceMin || 0).toLocaleString()} - ${currency.symbol}${(values.priceMax || 0).toLocaleString()}`,
        location: `${values.location}, ${values.region}`,
        area: values.area || (values.listingType === 'rent' ? 'N/A' : 'TBD'),
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
        // Apartment-specific fields (only for sale)
        units: values.listingType === 'sale' ? values.units : undefined,
        floors: values.listingType === 'sale' ? values.floors : undefined,
        building_age: values.listingType === 'sale' ? values.buildingAge : undefined,
        developer: values.listingType === 'sale' ? values.developer : undefined,
        maintenance_quality: values.listingType === 'sale' ? values.maintenanceQuality : undefined,
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
    } finally {
      setIsSubmitting(false);
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
    <>
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

                    {/* Bedrooms, Bathrooms fields for applicable property types */}
                    {["House", "Apartment", "Condo", "Villa"].includes(form.watch("propertyType")) && (
                      <div className={`grid grid-cols-1 gap-4 ${form.watch("listingType") === "rent" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
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
                                  onValueChange={(value) => {
                                    const num = parseInt(value);
                                    field.onChange(num);
                                    form.setValue("bathrooms", num);
                                  }} 
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
                                    onChange={(e) => {
                                      field.onChange(e);
                                      const num = parseInt(e.target.value) || 0;
                                      form.setValue("bathrooms", num);
                                    }}
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
                              <FormLabel>
                                Bathrooms
                                {form.watch("bedrooms") !== undefined && form.watch("bathrooms") === form.watch("bedrooms") && (
                                  <span className="ml-1 text-xs text-primary font-normal">(All Ensuite)</span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value !== undefined ? String(field.value) : ""}
                                  onValueChange={(val) => {
                                    if (val === "ensuite") {
                                      const bedrooms = form.getValues("bedrooms");
                                      field.onChange(bedrooms ?? 0);
                                    } else {
                                      field.onChange(Number(val));
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select bathrooms" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ensuite">All Ensuite</SelectItem>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                "All Ensuite" matches bedroom count. Or pick a number.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Area field only for sale listings */}
                        {form.watch("listingType") !== "rent" && (
                          <FormField
                            control={form.control}
                            name="area"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Area (sq ft)</FormLabel>
                                <FormControl>
                                <Input
                                  placeholder="e.g., 2500 sq ft, 0.25 acre, 5 points"
                                  {...field}
                                />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}

                    {/* Apartment-specific fields - only for sale listings */}
                    {form.watch("propertyType") === "Apartment" && form.watch("listingType") !== "rent" && (
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

                    {/* Area field for other property types - only for sale listings */}
                    {form.watch("listingType") !== "rent" && !["House", "Apartment", "Condo", "Villa"].includes(form.watch("propertyType")) && (
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area/Size</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 0.5 acre, 1/2 acre, half an acre, 3 points, 5000 sq ft"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch("listingType") === "rent" ? (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => {
                          const country = form.watch("country");
                          const currency = getCurrencyInfo(country);
                          return (
                            <FormItem>
                              <FormLabel>
                                {form.watch("stayType") === "short-term" 
                                  ? `Nightly Rate (${currency.symbol})` 
                                  : `Monthly Rent (${currency.symbol})`}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder={`e.g. 25K, 1.2M (${currency.code})`}
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="priceMin"
                          render={({ field }) => {
                            const country = form.watch("country");
                            const currency = getCurrencyInfo(country);
                            return (
                              <FormItem>
                                <FormLabel>Price Min ({currency.symbol})</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder={`e.g. 500K, 1M, 1B`}
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Up to 10B. Use K, M, B or full figures.</p>
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
                                <FormLabel>Price Max ({currency.symbol})</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder={`e.g. 10M, 2.5B`}
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Up to 10B. Use K, M, B or full figures.</p>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                    )}

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
                            <Textarea
                              rows={8}
                              maxLength={20000}
                              placeholder="Describe the property, amenities, size, etc. (up to 20,000 characters)"
                              className="min-h-[180px] max-h-[60vh] resize-y whitespace-pre-wrap break-words"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep("select")} disabled={isSubmitting}>Back</Button>
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? "Uploading..." : "Upload the Property"}
                      </Button>
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