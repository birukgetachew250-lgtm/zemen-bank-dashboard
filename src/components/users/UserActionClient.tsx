
'use client';
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, KeyRound, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CustomerDetails } from "@/components/customers/CustomerDetailsCard";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserDetails {
    id: string;
    name: string;
    email: string;
    employeeId: string;
    role: string;
}

interface UserActionClientProps {
    action: 'ResetPassword';
}

function InfoItem({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className={cn("space-y-1", className)}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div>{value}</div>
        </div>
    )
}

export function UserActionClient({ action }: UserActionClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const { toast } = useToast();

  const pageConfig = {
      'ResetPassword': { title: 'Reset User Password', description: 'Generate a new temporary password for a user.', buttonLabel: 'Reset Password', icon: <KeyRound className="mr-2 h-4 w-4" />, actionName: 'reset-password' },
  }[action];

  const handleSearch = async () => {
    if (!searchTerm) {
        toast({
            variant: "destructive",
            title: "Search term required",
            description: "Please enter an Employee ID or Email to search.",
        });
        return;
    }
    setIsLoading(true);
    setUser(null);
    try {
        const resByEmail = await fetch(`/api/users/by-email/${encodeURIComponent(searchTerm)}`);
        if (resByEmail.ok) {
            const data = await resByEmail.json();
            setUser(data);
        } else {
             const resByEmpId = await fetch(`/api/users/by-employee-id/${encodeURIComponent(searchTerm)}`);
             if (!resByEmpId.ok) {
                const error = await resByEmail.json(); // show email error by default
                throw new Error(error.message || "User not found");
             }
             const data = await resByEmpId.json();
             setUser(data);
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Search Failed",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleAction = async () => {
    if (!user) return;

    setIsActionLoading(true);
     try {
        const response = await fetch('/api/users/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, action: pageConfig.actionName }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to perform action`);
        }
        
        if(action === 'ResetPassword' && result.newPassword) {
            setNewPassword(result.newPassword);
        } else {
             toast({
              title: "Action Successful",
              description: result.message
            });
            setUser(null);
            setSearchTerm("");
        }

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: `Action Failed`,
            description: error.message,
        });
    } finally {
        setIsActionLoading(false);
    }
  };

  const isActionDisabled = !user || isActionLoading;

  return (
    <>
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{pageConfig.title}</CardTitle>
                <CardDescription>{pageConfig.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full items-center space-x-2">
                    <Input
                    type="text"
                    placeholder="Enter Employee ID or Email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        {isLoading && (
            <div className="flex justify-center pt-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}

        {user && (
            <Card className="max-w-2xl mx-auto animate-in fade-in-50">
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <InfoItem label="Name" value={user.name} />
                        <InfoItem label="Employee ID" value={user.employeeId} />
                        <InfoItem label="Email" value={user.email} />
                        <InfoItem label="Role" value={<Badge variant="outline">{user.role}</Badge>} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleAction} disabled={isActionDisabled}>
                        {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : pageConfig.icon}
                        {pageConfig.buttonLabel}
                    </Button>
                </CardFooter>
            </Card>
        )}

        <Dialog open={!!newPassword} onOpenChange={() => setNewPassword(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Password Reset Successful</DialogTitle>
                    <DialogDescription>Please securely provide this temporary password to the user. They will be required to change it upon their next login.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>New Temporary Password</AlertTitle>
                      <AlertDescription className="font-mono text-lg font-bold tracking-widest pt-2">{newPassword}</AlertDescription>
                    </Alert>
                </div>
                 <DialogFooter>
                    <Button onClick={() => {
                        setNewPassword(null);
                        setUser(null);
                        setSearchTerm("");
                    }}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
