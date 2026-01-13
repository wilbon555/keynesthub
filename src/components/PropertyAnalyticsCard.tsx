import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, Calendar, Clock } from "lucide-react";

interface PropertyAnalyticsCardProps {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
}

export const PropertyAnalyticsCard = ({
  totalViews,
  viewsToday,
  viewsThisWeek,
  viewsThisMonth
}: PropertyAnalyticsCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Property Views Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background rounded-lg shadow-sm">
            <Eye className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <div className="text-2xl font-bold text-foreground">{totalViews}</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg shadow-sm">
            <Clock className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <div className="text-2xl font-bold text-foreground">{viewsToday}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg shadow-sm">
            <Calendar className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-foreground">{viewsThisWeek}</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg shadow-sm">
            <TrendingUp className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <div className="text-2xl font-bold text-foreground">{viewsThisMonth}</div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
