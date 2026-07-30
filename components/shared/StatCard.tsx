// components/shared/StatCard.tsx
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  colorClass?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  colorClass = "from-blue-500 to-blue-600",
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className="p-3.5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 sm:w-24" />
              <Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
            </div>
            <Skeleton className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group rounded-2xl">
      <CardContent className="p-3.5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="order-2 sm:order-1">
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold line-clamp-1">{title}</p>
            <p className="text-xl sm:text-3xl font-extrabold mt-0.5 sm:mt-1 tracking-tight text-foreground">
              {typeof value === "number" ? value.toLocaleString("id-ID") : value}
            </p>
            {trend && (
              <p
                className={cn(
                  "text-[10px] sm:text-xs mt-0.5 font-medium",
                  trend.value >= 0 ? "text-emerald-600" : "text-red-500"
                )}
              >
                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div
            className={cn(
              "w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200 shrink-0 order-1 sm:order-2 self-start sm:self-auto",
              colorClass
            )}
          >
            <Icon className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
