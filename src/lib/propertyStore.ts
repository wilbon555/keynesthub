// Simple property store to manage newly listed properties
export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  type: string;
  image: string;
  featured: boolean;
  isNewListing?: boolean;
  listedAt?: string;
  region?: string;
  country?: string;
  phone?: string;
  description?: string;
}

class PropertyStore {
  private properties: Property[] = [];
  private listeners: (() => void)[] = [];

  addProperty(property: Omit<Property, 'id' | 'isNewListing' | 'listedAt'>) {
    const newProperty: Property = {
      ...property,
      id: `new-${Date.now()}`,
      isNewListing: true,
      listedAt: new Date().toISOString(),
      featured: true // New listings are always featured
    };
    
    this.properties.unshift(newProperty); // Add to beginning of array
    this.notifyListeners();
    return newProperty;
  }

  getProperties(): Property[] {
    return [...this.properties];
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const propertyStore = new PropertyStore();