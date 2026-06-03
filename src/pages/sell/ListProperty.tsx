import { Navigation } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PageHead } from "@/components/seo/PageHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Eye, DollarSign, Clock } from "lucide-react";
import { useState } from "react";

const ListProperty = () => {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <PageHead
        title="List Your Property on KeyNestHub — Reach Thousands of Buyers"
        description="Create a verified property listing on KeyNestHub in minutes and reach thousands of qualified buyers and renters across Kenya."
        canonical="https://www.keynesthub.com/sell/list-property"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">List Your Property</h1>
            <p className="text-lg text-muted-foreground">
              Reach thousands of potential buyers and renters. Create your listing in minutes with our easy-to-use form.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Easy Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simple step-by-step form with photo upload and property details.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Maximum Exposure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your property will be visible to thousands of active buyers and renters.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Competitive Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get market insights and pricing recommendations for your area.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Quick Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Start receiving inquiries within hours of publishing your listing.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Create Your Property Listing</h2>
            <p className="text-muted-foreground mb-4">
              Fill out the form below to list your property. Our team will review and publish your listing within 24 hours.
            </p>
            <div 
              className="text-center py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">Upload Property Photos</p>
              <p className="text-muted-foreground text-sm">Drag and drop your photos here, or click to browse</p>
            </div>
          </div>
        </div>
      </main>

      <PhotoUpload open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
};

export default ListProperty;