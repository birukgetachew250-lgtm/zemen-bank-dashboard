
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export interface MiniApp {
  id: string;
  name: string;
  url: string;
  logo_url: string;
  username: string;
  password?: string;
  encryption_key?: string;
}

interface MiniAppManagementClientProps {
  initialMiniApps: MiniApp[];
}

export function MiniAppManagementClient({
  initialMiniApps,
}: MiniAppManagementClientProps) {
  const [miniApps, setMiniApps] = useState(initialMiniApps);
  const [appToDelete, setAppToDelete] = useState<MiniApp | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const router = useRouter();

  const toggleSecrets = (id: string) => {
    setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async () => {
    if (!appToDelete) return;

    const res = await fetch("/api/mini-apps", {
      method: "DELETE",
      body: JSON.stringify({ id: appToDelete.id }),
      headers: { "Content-Type": "application/json" },
    });
    
    if (res.ok) {
      setMiniApps((prev) => prev.filter((app) => app.id !== appToDelete.id));
      toast({ title: "Success", description: "Mini App deleted." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete mini app." });
    }
    setAppToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Manage Mini Apps</CardTitle>
          <Button onClick={() => router.push('/mini-apps/create')}>
            <PlusCircle className="mr-2"/>Add New Mini App
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Credentials</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {miniApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image 
                          src={app.logo_url || `https://picsum.photos/seed/${app.id}/40/40`} 
                          alt={`${app.name} logo`}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                        <span>{app.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><a href={app.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{app.url}</a></TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>User: {app.username}</span>
                        <span>Pass: {visibleSecrets[app.id] ? app.password : '••••••••'}</span>
                        <span className="truncate max-w-xs">Key: {visibleSecrets[app.id] ? app.encryption_key : '••••••••••••••••••••••••••••••••'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => toggleSecrets(app.id)}>
                        {visibleSecrets[app.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/mini-apps/create?id=${app.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setAppToDelete(app)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!appToDelete} onOpenChange={(open) => !open && setAppToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the mini app <span className="font-semibold">{appToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
