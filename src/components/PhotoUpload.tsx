import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Camera, Upload, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyStore } from "@/lib/propertyStore";
interface PhotoUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PhotoUpload = ({ open, onOpenChange }: PhotoUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [step, setStep] = useState<"select" | "details">("select");

  const detailsSchema = z
    .object({
      region: z.string().min(2, "Region is required"),
      country: z.string().min(2, "Country is required"),
      location: z.string().min(2, "Location is required"),
      priceMin: z.coerce.number().min(0, "Min price must be >= 0"),
      priceMax: z.coerce.number().min(0, "Max price must be >= 0"),
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
      priceMin: 0,
      priceMax: 0,
      phone: "",
      description: "",
    },
  });

  const onSubmit = (values: DetailsForm) => {
    // Create property from form data
    const newProperty = {
      title: values.description.split('.')[0] || "New Property Listing",
      price: `$${values.priceMin.toLocaleString()} - $${values.priceMax.toLocaleString()}`,
      location: `${values.location}, ${values.region}`,
      area: "TBD", // Can be enhanced later
      type: "House", // Default type, can be enhanced with form field
      image: selectedFiles.length > 0 ? URL.createObjectURL(selectedFiles[0]) : "/placeholder.svg",
      featured: true,
      region: values.region,
      country: values.country,
      phone: values.phone,
      description: values.description
    };

    // Add to property store
    propertyStore.addProperty(newProperty);

    toast({
      title: "Property listed successfully!",
      description: `Your property in ${values.location}, ${values.region} is now featured at the top of our listings.`,
    });
    
    onOpenChange(false);
    setSelectedFiles([]);
    setStep("select");
    form.reset();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      toast({
        title: "Files selected",
        description: `${files.length} file(s) ready to upload`,
      });
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      toast({
        title: "Photo captured",
        description: "Photo ready to upload",
      });
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
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, neighborhood or address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Min</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} step={1} placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priceMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Max</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} step={1} placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
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
      </SheetContent>
    </Sheet>
  );
};