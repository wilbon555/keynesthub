import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Home } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<string | undefined>(undefined);
  const [bedrooms, setBedrooms] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const price = searchParams.get('price') || '';
    const beds = searchParams.get('bedrooms') || '';
    if (q) setSearchQuery(q);
    if (type) setPropertyType(type);
    if (price) setPriceRange(price);
    if (beds) setBedrooms(beds);
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (propertyType) params.set('type', propertyType);
    if (priceRange) params.set('price', priceRange);
    if (bedrooms) params.set('bedrooms', bedrooms);
    navigate(`/?${params.toString()}`);
  };

  const showBedrooms = propertyType === 'house' || propertyType === 'apartment';
  // Reset bedrooms if type changes to non-residential
  useEffect(() => {
    if (!showBedrooms && bedrooms) setBedrooms(undefined);
  }, [showBedrooms]);

  return (
    <div className="bg-card/90 backdrop-blur-sm p-6 rounded-lg shadow-card border">
      <div className={`grid grid-cols-1 gap-4 ${showBedrooms ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Location or Postal Address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        
        <Select value={propertyType} onValueChange={(v) => { setPropertyType(v); setBedrooms(undefined); }}>
          <SelectTrigger>
            <Home className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
          </SelectContent>
        </Select>

        {showBedrooms && (
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger>
              <SelectValue placeholder={propertyType === 'apartment' ? 'Room Type' : 'Bedrooms'} />
            </SelectTrigger>
            <SelectContent>
              {propertyType === 'apartment' && (
                <SelectItem value="studio">Studio</SelectItem>
              )}
              <SelectItem value="single-room">Single Room (Not Self-contained)</SelectItem>
              <SelectItem value="bedsitter">Bedsitter (Self-contained)</SelectItem>
              <SelectItem value="1">1 Bedroom</SelectItem>
              <SelectItem value="2">2 Bedroom</SelectItem>
              <SelectItem value="3">3 Bedroom</SelectItem>
              <SelectItem value="4">4 Bedroom</SelectItem>
              <SelectItem value="5">5+ Bedroom</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-4k">Under Ksh 4K</SelectItem>
            <SelectItem value="4k-20k">Ksh 4K - 20K</SelectItem>
            <SelectItem value="20k-50k">Ksh 20K - 50K</SelectItem>
            <SelectItem value="50k-100k">Ksh 50K - 100K</SelectItem>
            <SelectItem value="100k-300k">Ksh 100K - 300K</SelectItem>
            <SelectItem value="300k-500k">Ksh 300K - 500K</SelectItem>
            <SelectItem value="500k-1m">Ksh 500K - 1M</SelectItem>
            <SelectItem value="1m+">Ksh 1M+</SelectItem>
          </SelectContent>
        </Select>
        
        <Button className="bg-gradient-primary hover:opacity-90 transition-smooth" onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search Properties
        </Button>
      </div>
    </div>
  );
};