import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import { ServerCard } from "@/components/server-card";
import { ServerModal } from "@/components/server-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import type { Server } from "@shared/schema";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: servers = [], isLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/servers/stats"],
  });

  const filteredServers = servers.filter(server => {
    const matchesSearch = server.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.ipAddress.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || server.status === statusFilter;
    const matchesLocation = locationFilter === "all" || server.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleAddServer = () => {
    setEditingServer(null);
    setIsModalOpen(true);
  };

  const handleEditServer = (server: Server) => {
    setEditingServer(server);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingServer(null);
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Online Servers"
              value={stats?.onlineCount || 0}
              icon="check-circle"
              color="success"
            />
            <StatsCard
              title="Offline Servers"
              value={stats?.offlineCount || 0}
              icon="times-circle"
              color="error"
            />
            <StatsCard
              title="Warning"
              value={stats?.warningCount || 0}
              icon="exclamation-triangle"
              color="warning"
            />
            <StatsCard
              title="Total Servers"
              value={stats?.totalCount || 0}
              icon="server"
              color="primary"
            />
          </div>
        </div>

        {/* Server Management */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200">
          {/* Server Toolbar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">Server Hosts</h2>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
                  {filteredServers.length} servers
                </span>
              </div>
              <Button onClick={handleAddServer} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Server</span>
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search servers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="us-east">US East</SelectItem>
                    <SelectItem value="us-west">US West</SelectItem>
                    <SelectItem value="eu-west">EU West</SelectItem>
                    <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Server Grid */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading servers...</div>
            ) : filteredServers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== "all" || locationFilter !== "all" 
                  ? "No servers match your filters" 
                  : "No servers found. Add your first server to get started."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServers.map((server) => (
                  <ServerCard
                    key={server.id}
                    server={server}
                    onEdit={handleEditServer}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ServerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        server={editingServer}
      />
    </div>
  );
}
