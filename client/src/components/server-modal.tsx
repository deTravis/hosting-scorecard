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
import { insertServerSchema, type Server, type InsertServer } from "@shared/schema";
import { z } from "zod";

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server?: Server | null;
}

const formSchema = insertServerSchema.extend({
  hostname: z.string().min(1, "Hostname is required"),
  ipAddress: z.string().min(1, "IP Address is required").regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    "Invalid IP address format"
  ),
  location: z.string().min(1, "Location is required"),
});

type FormData = z.infer<typeof formSchema>;

export function ServerModal({ isOpen, onClose, server }: ServerModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hostname: "",
      ipAddress: "",
      location: "",
      description: "",
    },
  });

  useEffect(() => {
    if (server) {
      form.reset({
        hostname: server.hostname,
        ipAddress: server.ipAddress,
        location: server.location,
        description: server.description || "",
      });
    } else {
      form.reset({
        hostname: "",
        ipAddress: "",
        location: "",
        description: "",
      });
    }
  }, [server, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertServer) => {
      await apiRequest("POST", "/api/servers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/servers/stats"] });
      toast({
        title: "Server added",
        description: "Server has been successfully added.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add server. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertServer) => {
      await apiRequest("PUT", `/api/servers/${server!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/servers/stats"] });
      toast({
        title: "Server updated",
        description: "Server has been successfully updated.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update server. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormData) => {
    if (server) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {server ? "Edit Server" : "Add New Server"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostname</FormLabel>
                  <FormControl>
                    <Input placeholder="web-server-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Address</FormLabel>
                  <FormControl>
                    <Input placeholder="192.168.1.10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="us-east">US East</SelectItem>
                      <SelectItem value="us-west">US West</SelectItem>
                      <SelectItem value="eu-west">EU West</SelectItem>
                      <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
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
                {isLoading ? "Saving..." : server ? "Update Server" : "Add Server"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
