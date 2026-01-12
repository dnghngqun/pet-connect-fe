"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Loader2, Search, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";

interface TransferPetDialogProps {
  petId: string;
  petName: string;
}

export function TransferPetDialog({ petId, petName }: TransferPetDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  // Mock search for now
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
       setIsSearching(false);
       // Mock result
       if (searchQuery.toLowerCase() === "error") {
          setSearchResults([]);
       } else {
           setSearchResults([
               { id: "101", name: "Nguyen Van B", email: "userb@example.com", avatar: "https://i.pravatar.cc/150?u=101" },
               { id: "102", name: "Tran Thi C", email: "userc@example.com", avatar: "https://i.pravatar.cc/150?u=102" }
           ]);
       }
    }, 1000);
  };

  const handleTransfer = async () => {
    if (!selectedUser) return;
    
    setIsTransferring(true);
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(`Transfer request sent to ${selectedUser.name}`);
        setOpen(false);
    } catch (error) {
        toast.error("Failed to transfer pet");
    } finally {
        setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700">
           <span className="material-symbols-outlined mr-2">move_item</span>
           Transfer Ownership
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer {petName}</DialogTitle>
          <DialogDescription>
            Transfer ownership of this pet to another user. This action cannot be undone immediately.
          </DialogDescription>
        </DialogHeader>
        
        {!selectedUser ? (
            <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Search User by Email or Name</Label>
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter email or name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {searchResults.length > 0 && (
                <div className="space-y-2 border rounded-md p-2 max-h-48 overflow-y-auto">
                    {searchResults.map(user => (
                        <div 
                            key={user.id} 
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                            onClick={() => setSelectedUser(user)}
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        ) : (
            <div className="py-4 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900">
                        <p className="font-semibold mb-1">Warning</p>
                        <p>You are about to transfer <strong>{petName}</strong> to <strong>{selectedUser.name}</strong>.</p>
                        <p className="mt-1">They must accept the transfer request to complete the process.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-xl bg-muted/20">
                     <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedUser.avatar} />
                        <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-bold">{selectedUser.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Change</Button>
                </div>
            </div>
        )}

        <DialogFooter className="flex-row sm:justify-end gap-2">
          {!selectedUser ? (
             <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          ) : (
             <>
                <Button variant="ghost" onClick={() => setOpen(false)} disabled={isTransferring}>Cancel</Button>
                <Button onClick={handleTransfer} disabled={isTransferring} className="bg-amber-600 hover:bg-amber-700 text-white">
                    {isTransferring && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirm Transfer
                </Button>
             </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
