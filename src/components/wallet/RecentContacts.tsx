import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWalletContacts } from "@/hooks/useWalletContacts";
import { Clock, Edit2, Trash2, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RecentContactsProps {
  onSelectAddress: (address: string) => void;
}

export function RecentContacts({ onSelectAddress }: RecentContactsProps) {
  const { contacts, isLoading, updateName, deleteContact } = useWalletContacts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSaveName = (contactId: string) => {
    updateName({ contactId, name: editName });
    setEditingId(null);
    setEditName('');
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (!contacts.length) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Recent Contacts</span>
        <Badge variant="secondary" className="ml-auto">
          {contacts.length}
        </Badge>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="group"
            >
              <Card className="p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => onSelectAddress(contact.address)}
                  >
                    {editingId === contact.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Contact name"
                          className="h-7"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveName(contact.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditName('');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-sm truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {contact.address.slice(0, 10)}...{contact.address.slice(-8)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {contact.chain} • {' '}
                          {contact.last_transaction_at ? formatDistanceToNow(new Date(contact.last_transaction_at), { addSuffix: true }) : 'No transactions'}
                        </p>
                      </>
                    )}
                  </div>

                  {editingId !== contact.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(contact.id);
                          setEditName(contact.name);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteContact(contact.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}