import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import { WebsiteCard } from "@/components/website-card";
import { WebsiteModal } from "@/components/website-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import type { Website, Server, Host } from "@shared/schema";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("websites");

  const { data: websites = [], isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
  });

  const { data: servers = [], isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const { data: hosts = [], isLoading: hostsLoading } = useQuery<Host[]>({
    queryKey: ["/api/hosts"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || website.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddWebsite = () => {
    setEditingWebsite(null);
    setIsModalOpen(true);
  };

  const handleEditWebsite = (website: Website) => {
    setEditingWebsite(website);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWebsite(null);
  };

  const getServerById = (serverId: number) => {
    return servers.find(s => s.id === serverId);
  };

  const getHostById = (hostId: number) => {
    return hosts.find(h => h.id === hostId);
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Online Websites"
              value={stats?.websites?.onlineCount || 0}
              icon="check-circle"
              color="success"
            />
            <StatsCard
              title="Offline Websites"
              value={stats?.websites?.offlineCount || 0}
              icon="times-circle"
              color="error"
            />
            <StatsCard
              title="Warning"
              value={stats?.websites?.warningCount || 0}
              icon="exclamation-triangle"
              color="warning"
            />
            <StatsCard
              title="Total Websites"
              value={stats?.websites?.totalCount || 0}
              icon="server"
              color="primary"
            />
          </div>
        </div>

        {/* Infrastructure Management */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="websites">Websites</TabsTrigger>
              <TabsTrigger value="servers">Servers</TabsTrigger>
              <TabsTrigger value="hosts">Hosts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="websites" className="mt-0">
              {/* Website Toolbar */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">Websites</h2>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
                      {filteredWebsites.length} websites
                    </span>
                  </div>
                  <Button onClick={handleAddWebsite} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Website</span>
                  </Button>
                </div>

                {/* Search and Filters */}
                <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search websites..."
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
                  </div>
                </div>
              </div>

              {/* Website Grid */}
              <div className="p-6">
                {websitesLoading ? (
                  <div className="text-center py-8">Loading websites...</div>
                ) : filteredWebsites.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== "all" 
                      ? "No websites match your filters" 
                      : "No websites found. Add your first website to get started."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWebsites.map((website) => (
                      <WebsiteCard
                        key={website.id}
                        website={website}
                        server={getServerById(website.serverId)}
                        host={getHostById(getServerById(website.serverId)?.hostId || 0)}
                        onEdit={handleEditWebsite}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="servers" className="mt-0">
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  Server management coming soon...
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hosts" className="mt-0">
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  Host management coming soon...
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <WebsiteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        website={editingWebsite}
        servers={servers}
        hosts={hosts}
      />
    </div>
  );
}
