import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Users, User, Plus, Check } from "lucide-react";
import { useChats } from "@/hooks/useChats";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/contexts/AuthContext";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, debounce } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
}

type Tab = "direct" | "group";

export default function NewChatModal({ open, onClose, onSelectChat }: NewChatModalProps) {
  const { user } = useAuth();
  const { createDirectChat, createGroupChat } = useChats();
  const { searchUsers } = useUsers();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("direct");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<UserProfile[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) { setResults([]); return; }
      const res = await searchUsers(q);
      setResults(res.filter((u) => u.uid !== user?.uid));
    }, 400) as (q: string) => void,
    [searchUsers, user]
  );

  useEffect(() => { debouncedSearch(query); }, [query]);

  const handleCreateDirect = async (u: UserProfile) => {
    setLoading(true);
    const chatId = await createDirectChat(u.uid);
    if (chatId) { onSelectChat(chatId); onClose(); }
    setLoading(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selected.length < 1) {
      toast({ title: "Need a name and at least 1 member", variant: "destructive" }); return;
    }
    setLoading(true);
    const chatId = await createGroupChat(groupName, selected.map((u) => u.uid));
    if (chatId) { onSelectChat(chatId); onClose(); }
    setLoading(false);
  };

  const toggleSelect = (u: UserProfile) => {
    setSelected((prev) =>
      prev.find((p) => p.uid === u.uid) ? prev.filter((p) => p.uid !== u.uid) : [...prev, u]
    );
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-lg">New Conversation</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex border-b border-border">
            {([["direct", User, "Direct"], ["group", Users, "Group"]] as const).map(([t, Icon, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2",
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === "group" && (
              <Input
                placeholder="Group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mb-3 bg-muted/50 border-border rounded-xl h-10"
              />
            )}

            {tab === "group" && selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selected.map((u) => (
                  <motion.span
                    key={u.uid}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 bg-primary/15 text-primary text-xs rounded-full px-2 py-1"
                  >
                    {u.displayName}
                    <button onClick={() => toggleSelect(u)}>
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-border rounded-xl h-10"
              />
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto">
              {results.map((u) => {
                const isSelected = selected.some((s) => s.uid === u.uid);
                return (
                  <motion.button
                    key={u.uid}
                    onClick={() => tab === "direct" ? handleCreateDirect(u) : toggleSelect(u)}
                    whileHover={{ backgroundColor: "hsl(var(--accent))" }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                  >
                    <AvatarWithStatus photoURL={u.photoURL} displayName={u.displayName} uid={u.uid} size="sm" showStatus={false} />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{u.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                    {tab === "group" && (
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all", isSelected ? "bg-primary border-primary" : "border-muted-foreground")}>
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    )}
                  </motion.button>
                );
              })}
              {query && results.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">No users found</p>
              )}
              {!query && (
                <p className="text-center text-sm text-muted-foreground py-6">Type to search for users</p>
              )}
            </div>
          </div>

          {tab === "group" && (
            <div className="p-4 border-t border-border">
              <Button
                onClick={handleCreateGroup}
                disabled={loading || !groupName.trim() || selected.length === 0}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group ({selected.length} members)
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
