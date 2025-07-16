import { CheckCircle, XCircle, AlertTriangle, Server } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: "check-circle" | "times-circle" | "exclamation-triangle" | "server";
  color: "success" | "error" | "warning" | "primary";
}

const iconMap = {
  "check-circle": CheckCircle,
  "times-circle": XCircle,
  "exclamation-triangle": AlertTriangle,
  "server": Server
};

const colorMap = {
  success: "text-success bg-success",
  error: "text-error bg-error",
  warning: "text-warning bg-warning",
  primary: "text-primary bg-primary"
};

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const Icon = iconMap[icon];
  
  return (
    <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 ${colorMap[color]} bg-opacity-10 rounded-lg`}>
          <Icon className={`${colorMap[color].split(' ')[0]} text-xl`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
