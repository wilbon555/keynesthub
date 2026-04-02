import { useState, useCallback } from "react";
import { MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, Search, Check, X } from "lucide-react";
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

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-1 animate-fade-in">{message}</p> : null;

const PasswordRule = ({ met, label }: { met: boolean; label: string }) => (
  <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
    {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    {label}
  </div>
);

const INDUSTRY_ROLE_GROUPS = [
  {
    label: "Owner/Landlord",
    roles: ["Principal Investor", "REIT", "Private Investor"],
  },
  {
    label: "Roles",
    roles: ["Lender", "Assessor", "Appraiser", "Tenant", "Property Manager", "Developer", "Economic Developer", "Service Provider", "Prospective Investor"],
  },
  {
    label: "Broker/Agent",
    roles: ["Buyer Rep", "Tenant Rep", "Listing Rep", "Landlord Rep"],
  },
];

const SignUpForm = ({ onSignUp, isLoading, setIsLoading }: SignUpFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [industryRole, setIndustryRole] = useState("Service Provider");
  const [roleSearch, setRoleSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showVerification, setShowVerification] = useState(false);
  const { toast } = useToast();

  const markTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Inline validation
  const errors: Record<string, string | undefined> = {};
  if (touched.firstName && !firstName.trim()) errors.firstName = "First name is required";
  if (touched.lastName && !lastName.trim()) errors.lastName = "Last name is required";
  if (touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email address";
  if (touched.email && !email) errors.email = "Email is required";
  if (touched.phone && !phone.trim()) errors.phone = "Phone number is required";
  if (touched.postalAddress && !postalAddress.trim()) errors.postalAddress = "Postal address is required";

  const pwRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields
    setTouched({ firstName: true, lastName: true, email: true, phone: true, postalAddress: true, password: true });
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
        setShowVerification(true);
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
      {/* First Name / Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <RequiredLabel>First Name</RequiredLabel>
          <Input
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => markTouched("firstName")}
            className={`h-11 border-input bg-card ${errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}`}
            required
          />
          <FieldError message={errors.firstName} />
        </div>
        <div>
          <RequiredLabel>Last Name</RequiredLabel>
          <Input
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => markTouched("lastName")}
            className={`h-11 border-input bg-card ${errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}`}
            required
          />
          <FieldError message={errors.lastName} />
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
          onBlur={() => markTouched("email")}
          className={`h-11 border-input bg-card ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
          required
        />
        <FieldError message={errors.email} />
      </div>

      {/* Password with show/hide + strength rules */}
      <div>
        <RequiredLabel>Password</RequiredLabel>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => markTouched("password")}
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
        {(touched.password || password.length > 0) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <PasswordRule met={pwRules.length} label="8+ characters" />
            <PasswordRule met={pwRules.uppercase} label="Uppercase letter" />
            <PasswordRule met={pwRules.number} label="Number" />
          </div>
        )}
      </div>

      {/* Industry Role searchable dropdown */}
      <div>
        <RequiredLabel>Industry Role</RequiredLabel>
        <Select value={industryRole} onValueChange={setIndustryRole}>
          <SelectTrigger className="h-11 border-input bg-card">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 pb-2 pt-1 sticky top-0 bg-popover">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  placeholder="Search roles..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            {INDUSTRY_ROLE_GROUPS.map((group) => {
              const filtered = group.roles.filter((r) =>
                r.toLowerCase().includes(roleSearch.toLowerCase())
              );
              if (filtered.length === 0) return null;
              return (
                <SelectGroup key={group.label}>
                  <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-2 py-1.5">
                    {group.label}
                  </SelectLabel>
                  {filtered.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectGroup>
              );
            })}
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
          onBlur={() => markTouched("phone")}
          className={`h-11 border-input bg-card ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
          required
        />
        <FieldError message={errors.phone} />
      </div>

      {/* Postal Address */}
      <div>
        <RequiredLabel>Postal Address</RequiredLabel>
        <Input
          placeholder="12345 or 12345-6789"
          value={postalAddress}
          onChange={(e) => setPostalAddress(e.target.value)}
          onBlur={() => markTouched("postalAddress")}
          className={`h-11 border-input bg-card ${errors.postalAddress ? "border-destructive focus-visible:ring-destructive" : ""}`}
          required
        />
        <FieldError message={errors.postalAddress} />
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
