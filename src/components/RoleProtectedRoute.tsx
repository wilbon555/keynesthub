import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRoles: AppRole[];
}

export const RoleProtectedRoute = ({ children, requiredRoles }: RoleProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading } = useUserRoles();
  const location = useLocation();

  if (authLoading || rolesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirect}`} replace />;
  }

  const hasRequiredRole = requiredRoles.some(role => roles.includes(role));
  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
