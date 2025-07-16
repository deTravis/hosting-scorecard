import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, RefreshCw, Trash2, Clock, Globe, Circle, Server as ServerIcon, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Website, Server, Host } from "@shared/schema";

interface WebsiteCardProps {
  website: Website;
  server?: Server;
  host?: Host;
  onEdit: (website: Website) => void;
}

const statusConfig = {
  online: {
    color: "bg-success",
    textColor: "text-success",
    label: "Online"
  },
  offline: {
    color: "bg-error",
    textColor: "text-error",
    label: "Offline"
  },
  warning: {
    color: "bg-warning",
    textColor: "text-warning",
    label: "Warning"
  }
};

export function WebsiteCard({ website, server, host, onEdit }: WebsiteCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/websites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Website deleted",
        description: "Website has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete website. Please try again.",
        variant: "destructive",
      });
    }
  });

  const refreshMutation = useMutation({
    mutationFn: async (id: number) => {
      // Simulate status check
      const statuses = ["online", "offline", "warning"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomUptime = `${(Math.random() * 100).toFixed(1)}%`;
      const randomResponseTime = `${Math.floor(Math.random() * 500)}ms`;
      
      await apiRequest("POST", `/api/websites/${id}/status`, {
        status: randomStatus,
        uptime: randomUptime,
        responseTime: randomResponseTime
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Website refreshed",
        description: "Website status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refresh website status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this website?")) {
      deleteMutation.mutate(website.id);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshMutation.mutate(website.id);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatLastCheck = (date: Date | string) => {
    const now = new Date();
    const checkDate = new Date(date);
    const diffMs = now.getTime() - checkDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const config = statusConfig[website.status as keyof typeof statusConfig];

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Globe className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{website.name}</h3>
            <p className="text-sm text-gray-600">{website.url}</p>
          </div>
        </div>
        <span className={`${config.color} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1`}>
          <Circle className="w-2 h-2 fill-current" />
          <span>{config.label}</span>
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Server:</span>
          <span className="text-gray-900 flex items-center space-x-1">
            <ServerIcon className="w-3 h-3" />
            <span>{server?.name || "Unknown"}</span>
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Host:</span>
          <span className="text-gray-900 flex items-center space-x-1">
            <HardDrive className="w-3 h-3" />
            <span>{host?.hostname || "Unknown"}</span>
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Uptime:</span>
          <span className="text-gray-900">{website.uptime || "0%"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last Check:</span>
          <span className="text-gray-900">{formatLastCheck(website.lastCheck)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(website)}
            className="text-primary hover:text-blue-700 p-1"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-600 hover:text-gray-800 p-1"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-error hover:text-red-700 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{website.responseTime || "--"}</span>
        </div>
      </div>
    </div>
  );
}