
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DashboardCard({
  title,
  description,
  icon,
  className,
  onClick,
}: DashboardCardProps) {
  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow cursor-pointer h-full",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="p-3 rounded-full bg-medconnect-light text-medconnect-primary mb-4">
          {icon}
        </div>
        <h3 className="font-medium text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}
