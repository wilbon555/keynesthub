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
interface PhotoUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PhotoUpload = ({ open, onOpenChange }: PhotoUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"select" | "details">("select");
  const { addProperty } = useProperties();
  const { user } = useAuth();

  const detailsSchema = z
    .object({
      region: z.string().min(2, "Region is required"),
      country: z.string().min(2, "Country is required"),
      location: z.string().min(2, "Location is required"),
      propertyType: z.string().min(1, "Property type is required"),
      listingType: z.enum(['sale', 'rent'], { required_error: "Please select listing type" }),
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

  const onSubmit = async (values: DetailsForm) => {
    if (!user) {
      toast.error("Please log in to list a property");
      return;
    }

    const currency = getCurrencyInfo(values.country);
    
    // Create property from form data (without images first)
    const newProperty = {
      title: values.description.split('.')[0] || "New Property Listing",
      price: `${currency.symbol}${values.priceMin.toLocaleString()} - ${currency.symbol}${values.priceMax.toLocaleString()}`,
      location: `${values.location}, ${values.region}`,
      area: "TBD", // Can be enhanced later
      type: values.propertyType,
      featured: true,
      region: values.region,
      country: values.country,
      phone: values.phone,
      description: values.description,
      status: 'available' as const,
      listing_type: values.listingType,
      uploadedFiles: selectedFiles // Pass files to be uploaded
    };

    // Add to database (this will handle storage upload)
    const result = await addProperty(newProperty);
    
    if (result) {
      // Reset and close on success
      onOpenChange(false);
      setSelectedFiles([]);
      setStep("select");
      form.reset();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} file(s) ready to upload`);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
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
                    <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                              <FormLabel>Price Max ({currency.symbol})</FormLabel>
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
                      <Button type="submit" className="flex-1">Save Details</Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};