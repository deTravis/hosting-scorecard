import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertWebsiteSchema, type Website, type InsertWebsite, type Server, type Host } from "@shared/schema";
import { z } from "zod";

interface WebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  website?: Website | null;
  servers: Server[];
  hosts: Host[];
}

const formSchema = insertWebsiteSchema.extend({
  name: z.string().min(1, "Name is required"),
  url: z.string().min(1, "URL is required").url("Invalid URL format"),
  serverId: z.number().min(1, "Server is required"),
});

type FormData = z.infer<typeof formSchema>;

export function WebsiteModal({ isOpen, onClose, website, servers, hosts }: WebsiteModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      serverId: 0,
      description: "",
    },
  });

  useEffect(() => {
    if (website) {
      form.reset({
        name: website.name,
        url: website.url,
        serverId: website.serverId,
        description: website.description || "",
      });
    } else {
      form.reset({
        name: "",
        url: "",
        serverId: 0,
        description: "",
      });
    }
  }, [website, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertWebsite) => {
      await apiRequest("POST", "/api/websites", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Website added",
        description: "Website has been successfully added.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add website. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertWebsite) => {
      await apiRequest("PUT", `/api/websites/${website!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Website updated",
        description: "Website has been successfully updated.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update website. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormData) => {
    if (website) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const getHostForServer = (serverId: number) => {
    const server = servers.find(s => s.id === serverId);
    return server ? hosts.find(h => h.id === server.hostId) : undefined;
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {website ? "Edit Website" : "Add New Website"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Website" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="serverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Server" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {servers.map((server) => {
                        const host = getHostForServer(server.id);
                        return (
                          <SelectItem key={server.id} value={server.id.toString()}>
                            {server.name} ({host?.hostname || "Unknown Host"})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : website ? "Update Website" : "Add Website"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}