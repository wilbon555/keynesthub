import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground mb-4 overflow-x-auto scrollbar-hide">
    <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0">
      <Home className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Home</span>
    </Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1 shrink-0">
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
        {item.href ? (
          <Link to={item.href} className="hover:text-foreground transition-colors">
            {item.label}
          </Link>
        ) : (
          <span className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);
