import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  industryRole: z.string().min(1, "Please select an industry role"),
  phone: z.string().trim().min(1, "Phone number is required").max(20),
  postalAddress: z.string().trim().min(1, "Postal address is required").max(20),
});

interface SignUpFormProps {
  onSignUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: any }>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-semibold text-foreground mb-1.5">
    {children} <span className="text-destructive">*</span>
  </label>
);

const INDUSTRY_ROLES = [
  "Buyer",
  "Seller / Owner",
  "Real Estate Agent",
  "Property Developer",
  "Investor",
  "Property Manager",
  "Mortgage Broker",
  "Other",
];

const SignUpForm = ({ onSignUp, isLoading, setIsLoading }: SignUpFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [industryRole, setIndustryRole] = useState("");
  const [phone, setPhone] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signUpSchema.parse({
        firstName, lastName, email, password, industryRole, phone, postalAddress,
      });

      const { error } = await onSignUp(validated.email, validated.password, {
        first_name: validated.firstName,
        last_name: validated.lastName,
        industry_role: validated.industryRole,
        phone: validated.phone,
        postal_address: validated.postalAddress,
      });

      if (error) {
        toast({ variant: "destructive", title: "Sign Up Failed", description: error.message });
      } else {
        toast({ title: "Account Created!", description: "Please check your email to verify your account." });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ variant: "destructive", title: "Validation Error", description: error.errors[0].message });
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* First Name / Last Name - two columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <RequiredLabel>First Name</RequiredLabel>
          <Input
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-11 border-input bg-card"
            required
          />
        </div>
        <div>
          <RequiredLabel>Last Name</RequiredLabel>
          <Input
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-11 border-input bg-card"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <RequiredLabel>Email Address</RequiredLabel>
        <Input
          type="email"
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 border-input bg-card"
          required
        />
      </div>

      {/* Password with show/hide */}
      <div>
        <RequiredLabel>Password</RequiredLabel>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pr-10 border-input bg-card"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Industry Role dropdown */}
      <div>
        <RequiredLabel>Industry Role</RequiredLabel>
        <Select value={industryRole} onValueChange={setIndustryRole}>
          <SelectTrigger className="h-11 border-input bg-card">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_ROLES.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Phone */}
      <div>
        <RequiredLabel>Phone Number</RequiredLabel>
        <Input
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11 border-input bg-card"
          required
        />
      </div>

      {/* Postal Address */}
      <div>
        <RequiredLabel>Postal Address</RequiredLabel>
        <Input
          placeholder="12345 or 12345-6789"
          value={postalAddress}
          onChange={(e) => setPostalAddress(e.target.value)}
          className="h-11 border-input bg-card"
          required
        />
      </div>

      <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
};

export default SignUpForm;
