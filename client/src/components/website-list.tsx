import { ExternalLink, Edit, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Website, Server, Host } from "@shared/schema";

interface WebsiteListProps {
  websites: Website[];
  onEdit: (website: Website) => void;
  getServerById: (serverId: number) => Server | undefined;
  getHostById: (hostId: number) => Host | undefined;
}

export function WebsiteList({ websites, onEdit, getServerById, getHostById }: WebsiteListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-50";
      case "offline":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return "●";
      case "offline":
        return "●";
      case "warning":
        return "●";
      default:
        return "●";
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50 rounded-t-lg">
        <div className="col-span-3">Website</div>
        <div className="col-span-2">Server</div>
        <div className="col-span-2">Host</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Uptime</div>
        <div className="col-span-2">Response Time</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Rows */}
      <div className="bg-white rounded-b-lg border border-gray-200">
        {websites.map((website, index) => {
          const server = getServerById(website.serverId);
          const host = server ? getHostById(server.hostId) : undefined;

          return (
            <div
              key={website.id}
              className={`grid grid-cols-12 gap-4 px-4 py-4 text-sm items-center ${
                index !== websites.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              {/* Website */}
              <div className="col-span-3">
                <div className="font-medium text-gray-900">{website.name}</div>
                <div className="text-gray-500 text-xs">
                  <a 
                    href={website.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 flex items-center"
                  >
                    {website.url}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>

              {/* Server */}
              <div className="col-span-2">
                <div className="font-medium text-gray-900">{server?.name || "Unknown"}</div>
                <div className="text-gray-500 text-xs">
                  {server?.protocol}://{server?.port}
                </div>
              </div>

              {/* Host */}
              <div className="col-span-2">
                <div className="font-medium text-gray-900">{host?.hostname || "Unknown"}</div>
                <div className="text-gray-500 text-xs">{host?.ipAddress}</div>
              </div>

              {/* Status */}
              <div className="col-span-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    website.status
                  )}`}
                >
                  <span className="mr-1">{getStatusIcon(website.status)}</span>
                  {website.status}
                </span>
              </div>

              {/* Uptime */}
              <div className="col-span-1">
                <span className="text-gray-900">{website.uptime || "N/A"}</span>
              </div>

              {/* Response Time */}
              <div className="col-span-2">
                <span className="text-gray-900">
                  {website.responseTime || "N/A"}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(website)}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}