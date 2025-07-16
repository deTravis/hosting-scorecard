import { Bell, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-surface shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Server className="text-primary text-2xl mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Server Host Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 bg-error text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <span className="text-sm font-medium text-gray-700">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
