import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CalendarIcon, Users, Minus, Plus, MapPin,
  CreditCard, Smartphone, Shield, Star
} from "lucide-react";
import type { Property } from "@/hooks/useProperties";

const BookProperty = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();
      setProperty(data as Property);
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  const nightlyRate = useMemo(() => {
    if (!property) return 0;
    return parseInt(property.price.replace(/[^\d]/g, ""), 10) || 0;
  }, [property]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(differenceInCalendarDays(checkOut, checkIn), 0);
  }, [checkIn, checkOut]);

  const subtotal = nights * nightlyRate;
  const serviceFee = Math.round(subtotal * 0.08);
  const total = subtotal + serviceFee;

  const maxGuests = property?.bedrooms ? property.bedrooms * 2 : 4;

  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckIn(date);
    if (date && (!checkOut || checkOut <= date)) {
      setCheckOut(addDays(date, 1));
    }
    setCheckInOpen(false);
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    setCheckOut(date);
    setCheckOutOpen(false);
  };

  const handleBooking = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to complete your booking.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!checkIn || !checkOut || nights < 1) {
      toast({ title: "Select dates", description: "Please select valid check-in and check-out dates.", variant: "destructive" });
      return;
    }
    toast({
      title: "Booking submitted!",
      description: "Payment integration coming soon. A KeyNestHub agent will contact you to confirm."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Property not found</h1>
          <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const heroImage = property.images?.[0] || property.image || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(`/property/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to listing
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Book your stay</h1>
        <p className="text-muted-foreground mb-6">Complete your reservation details below</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Property summary card */}
            <Card className="border-border overflow-hidden">
              <div className="flex gap-4 p-4">
                <img
                  src={heroImage}
                  alt={property.title}
                  className="w-28 h-28 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex flex-col justify-center min-w-0">
                  <Badge variant="secondary" className="w-fit mb-1 text-xs">Short-Term Rental</Badge>
                  <h2 className="font-semibold text-foreground text-lg truncate">{property.title}</h2>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{property.location}{property.region ? `, ${property.region}` : ""}</span>
                  </div>
                  <p className="text-primary font-bold text-lg mt-1">
                    {property.price}<span className="text-sm font-normal text-muted-foreground">/night</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Date Selection */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Select Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Check-in */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Check-in</label>
                    <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !checkIn && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={handleCheckInSelect}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Check-out */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Check-out</label>
                    <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !checkOut && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut ? format(checkOut, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={handleCheckOutSelect}
                          disabled={(date) => date <= (checkIn || new Date())}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {nights > 0 && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {nights} night{nights !== 1 ? "s" : ""} · {checkIn && format(checkIn, "MMM d")} – {checkOut && format(checkOut, "MMM d, yyyy")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Guest Count */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Guests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Number of guests</p>
                    <p className="text-sm text-muted-foreground">Maximum {maxGuests} guests</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      disabled={guests <= 1}
                      onClick={() => setGuests(g => Math.max(1, g - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-semibold text-foreground w-8 text-center">{guests}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      disabled={guests >= maxGuests}
                      onClick={() => setGuests(g => Math.min(maxGuests, g + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full h-14 justify-start gap-3" disabled>
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-foreground">Credit / Debit Card</div>
                    <div className="text-xs text-muted-foreground">Visa, Mastercard via Stripe</div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                </Button>
                <Button variant="outline" className="w-full h-14 justify-start gap-3" disabled>
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-foreground">M-Pesa</div>
                    <div className="text-xs text-muted-foreground">Mobile money payment</div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right — Price Summary (sticky) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Price Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nights > 0 ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {property.price} × {nights} night{nights !== 1 ? "s" : ""}
                        </span>
                        <span className="text-foreground font-medium">Ksh {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service fee (8%)</span>
                        <span className="text-foreground font-medium">Ksh {serviceFee.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">Ksh {total.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Select dates to see the total price</p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!checkIn || !checkOut || nights < 1}
                    onClick={handleBooking}
                  >
                    {nights > 0 ? `Reserve · Ksh ${total.toLocaleString()}` : "Select dates to book"}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3.5 h-3.5" />
                    <span>You won't be charged yet — agent confirmation required</span>
                  </div>
                </CardContent>
              </Card>

              {/* Trust signals */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-primary" />
                  <span>Verified by KeyNestHub agents</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Secure booking with fraud protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookProperty;
