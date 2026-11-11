import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Building2, CircleAlert, Home, Plus, RefreshCw, Wallet } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { PropertyCard } from "@/components/PropertyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/hooks/useProperties";

const currencyFor = (property: Property) => {
  const country = property.country?.toLowerCase() ?? "";
  const currencies: Array<[string, string]> = [
    ["kenya", "Ksh"],
    ["uganda", "UGX"],
    ["tanzania", "TSh"],
    ["united states", "USD"],
    ["usa", "USD"],
    ["united kingdom", "GBP"],
    ["uk", "GBP"],
    ["canada", "CAD"],
    ["australia", "AUD"],
    ["south africa", "ZAR"],
    ["nigeria", "NGN"],
    ["ghana", "GHS"],
    ["egypt", "EGP"],
    ["morocco", "MAD"],
    ["ethiopia", "ETB"],
  ];
  const match = currencies.find(([name]) => country.includes(name));
  if (match) return match[1];
  return property.price.match(/^[^\d.,\s]+/)?.[0] || "Ksh";
};

const numericPrice = (price: string) => {
  const value = Number(price.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(value) ? value : 0;
};

const formatMoney = (amount: number, currency: string) =>
  `${currency} ${Math.round(amount).toLocaleString("en-KE")}`;

const listingStatus = (property: Property) => {
  if (property.verification_status === "verified") return "Verified";
  if (property.verification_status === "rejected") return "Needs changes";
  return "Under review";
};

const LandlordDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProperties = useCallback(async () => {
    if (!user?.id) {
      setProperties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    const { data, error: queryError } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Unable to load landlord listings:", queryError.message);
      setError(true);
      setProperties([]);
    } else {
      setProperties((data ?? []) as unknown as Property[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    document.title = "Landlord Dashboard | KeyNestHub";
  }, []);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  const monthlyPotential = useMemo(() => {
    const totals = new Map<string, number>();
    properties
      .filter((property) => property.listing_type === "rent" && property.stay_type !== "short-term" && property.status !== "sold")
      .forEach((property) => {
        const amount = numericPrice(property.price);
        if (!amount) return;
        const units = Math.max(1, property.total_units ?? 1);
        const currency = currencyFor(property);
        totals.set(currency, (totals.get(currency) ?? 0) + amount * units);
      });
    return Array.from(totals.entries());
  }, [properties]);

  const rentalCount = properties.filter((property) => property.listing_type === "rent").length;
  const needsReviewCount = properties.filter((property) => property.verification_status !== "verified").length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                  <Building2 className="h-4 w-4" /> Landlord portfolio
                </p>
                <h1 className="text-3xl font-bold text-foreground">Your properties</h1>
                <p className="mt-2 text-muted-foreground">Listings, photos, and rental potential in one place.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => navigate("/rent/list-property")}>
                  <Plus className="h-4 w-4" /> Add rental
                </Button>
                <Button onClick={() => navigate("/sell/list-property")}>
                  <Plus className="h-4 w-4" /> Add property
                </Button>
              </div>
            </div>

            <section aria-label="Portfolio overview" className="grid gap-6 border-b border-border py-7 md:grid-cols-[0.8fr_1.2fr_0.8fr]">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary"><Home className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm text-muted-foreground">Properties listed</p>
                  <p className="text-2xl font-semibold text-foreground">{loading ? "—" : properties.length}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 md:border-x md:border-border md:px-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent/30 text-accent-foreground"><Wallet className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Estimated monthly rent potential</p>
                  {loading ? <p className="mt-2 text-2xl font-semibold">—</p> : monthlyPotential.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                      {monthlyPotential.map(([currency, amount]) => (
                        <p key={currency} className="text-xl font-semibold text-foreground">{formatMoney(amount, currency)}<span className="ml-1 text-sm font-normal text-muted-foreground">/ month</span></p>
                      ))}
                    </div>
                  ) : <p className="mt-1 text-sm text-muted-foreground">Add a long-term rental listing to see its asking-rent estimate.</p>}
                  <p className="mt-1 text-xs text-muted-foreground">Listed monthly rate × units. This is an estimate, not recorded payments.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground"><CircleAlert className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm text-muted-foreground">Rental listings</p>
                  <p className="text-2xl font-semibold text-foreground">{loading ? "—" : rentalCount}</p>
                </div>
              </div>
            </section>

            <section className="pt-7" aria-labelledby="property-list-title">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="property-list-title" className="text-xl font-semibold text-foreground">Your listings</h2>
                  {!loading && properties.length > 0 && <p className="mt-1 text-sm text-muted-foreground">{needsReviewCount} awaiting verification</p>}
                </div>
                {!loading && properties.length > 0 && <Badge variant="outline">{properties.length} total</Badge>}
              </div>

              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map((item) => <div key={item} className="space-y-3"><Skeleton className="aspect-[16/9] w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>)}
                </div>
              ) : error ? (
                <div className="border-y border-border py-12 text-center">
                  <p className="text-foreground">Your listings couldn’t be loaded.</p>
                  <Button className="mt-4" variant="outline" onClick={() => void loadProperties()}><RefreshCw className="h-4 w-4" /> Try again</Button>
                </div>
              ) : properties.length === 0 ? (
                <div className="border-y border-border py-14 text-center">
                  <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No properties yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Your listings and rental details will appear here after you add a property.</p>
                  <Button className="mt-5" onClick={() => navigate("/rent/list-property")}><Plus className="h-4 w-4" /> List a rental property</Button>
                </div>
              ) : (
                <div className="grid items-start gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((property) => {
                    const units = Math.max(1, property.total_units ?? 1);
                    const monthlyAmount = numericPrice(property.price) * units;
                    const isMonthlyRental = property.listing_type === "rent" && property.stay_type !== "short-term";
                    return (
                      <div key={property.id} className="min-w-0">
                        <div className="relative">
                          <PropertyCard {...property} listing_type={property.listing_type} />
                          <Badge className="absolute left-3 top-3 z-20" variant={property.verification_status === "verified" ? "default" : "secondary"}>
                            {listingStatus(property)}
                          </Badge>
                        </div>
                        {property.listing_type === "rent" && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-sm">
                            <span className="text-muted-foreground">
                              {isMonthlyRental ? "Monthly rent potential" : "Nightly asking rate"}
                            </span>
                            <span className="font-semibold text-foreground">
                              {isMonthlyRental ? `${formatMoney(monthlyAmount, currencyFor(property))}/mo` : `${property.price}/night`}
                            </span>
                            {property.total_units !== undefined && property.vacant_units !== undefined && (
                              <span className="w-full text-xs text-muted-foreground">{property.vacant_units} vacant of {property.total_units} units</span>
                            )}
                          </div>
                        )}
                        <Button variant="link" className="mt-1 h-9 px-0" onClick={() => navigate(`/property/${property.id}`)}>
                          View listing <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default LandlordDashboard;