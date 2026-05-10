import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Settings, Moon, Sun, LogOut, MessageSquare,
  Users, Bot, Bell, ChevronDown, Hash, X, UserPlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useChats, Chat } from "@/hooks/useChats";
import { useUsers } from "@/hooks/useUsers";
import { useMultiPresence } from "@/hooks/usePresence";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatChatTime, debounce } from "@/lib/utils";
import { UserProfile } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import NewChatModal from "./NewChatModal";

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenSettings: () => void;
  onOpenAI: () => void;
}

export default function ChatSidebar({ selectedChatId, onSelectChat, onOpenSettings, onOpenAI }: ChatSidebarProps) {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { chats, loading, createDirectChat } = useChats();
  const { searchUsers } = useUsers();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"chats" | "groups">("chats");

  const memberUids = [...new Set(chats.flatMap((c) => c.members))];
  const presences = useMultiPresence(memberUids);

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) { setSearchResults([]); setSearching(false); return; }
      setSearching(true);
      const results = await searchUsers(q);
      setSearchResults(results.filter((u) => u.uid !== user?.uid));
      setSearching(false);
    }, 400) as (q: string) => void,
    [searchUsers, user]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const handleStartChat = async (uid: string) => {
    const chatId = await createDirectChat(uid);
    if (chatId) {
      onSelectChat(chatId);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const filteredChats = chats.filter((c) => {
    if (activeTab === "groups") return c.type === "group";
    return c.type === "direct";
  });

  const getChatDisplay = (chat: Chat) => {
    if (chat.type === "group") return { name: chat.name || "Group", photoURL: chat.photoURL, uid: chat.id };
    const otherUid = chat.members.find((m) => m !== user?.uid) || "";
    return { name: chat.name || otherUid, photoURL: chat.photoURL, uid: otherUid };
  };

  return (
    <div className="flex h-full">
      {/* Icon rail */}
      <div className="w-16 flex flex-col items-center py-4 gap-3 border-r border-border bg-sidebar/80">
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg mb-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquare className="w-5 h-5 text-white" />
        </motion.div>

        <div className="flex flex-col gap-2 flex-1">
          {[
            { icon: MessageSquare, tab: "chats", label: "Chats" },
            { icon: Users, tab: "groups", label: "Groups" },
          ].map(({ icon: Icon, tab, label }) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab as "chats" | "groups")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={label}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-lg glow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
            </motion.button>
          ))}

          <motion.button
            onClick={onOpenAI}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="AI Assistant"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          >
            <Bot className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent transition-all"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
          <motion.button
            onClick={onOpenSettings}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent transition-all"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          {profile && (
            <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={onOpenSettings}>
              <AvatarWithStatus
                photoURL={profile.photoURL}
                displayName={profile.displayName}
                uid={profile.uid}
                online={true}
                size="sm"
                showStatus={true}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Chat list panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg capitalize">{activeTab}</h2>
            <motion.button
              onClick={() => setShowNewChat(true)}
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search chats or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-muted/50 border-transparent focus:border-primary h-9 rounded-xl text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Search results */}
        <AnimatePresence>
          {searchQuery && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-b border-border"
            >
              <p className="text-xs text-muted-foreground px-4 py-2 font-medium uppercase tracking-wider">Users</p>
              {searchResults.map((u) => (
                <motion.button
                  key={u.uid}
                  onClick={() => handleStartChat(u.uid)}
                  whileHover={{ backgroundColor: "hsl(var(--accent))" }}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                >
                  <AvatarWithStatus
                    photoURL={u.photoURL}
                    displayName={u.displayName}
                    uid={u.uid}
                    online={presences[u.uid]?.online}
                    size="sm"
                  />
                  <div className="text-left min-w-0">
                    <p className="font-medium text-sm truncate">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                  </div>
                  <UserPlus className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                {activeTab === "groups" ? <Hash className="w-8 h-8 text-muted-foreground" /> : <MessageSquare className="w-8 h-8 text-muted-foreground" />}
              </div>
              <p className="font-medium text-sm">No {activeTab} yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === "groups" ? "Create a group to get started" : "Search for users to start chatting"}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {filteredChats.map((chat, i) => {
                const display = getChatDisplay(chat);
                const isOnline = chat.type === "direct" ? presences[display.uid]?.online : false;
                const unread = (chat.unreadCounts?.[user?.uid || ""] || 0);
                const isSelected = selectedChatId === chat.id;

                return (
                  <motion.button
                    key={chat.id}
                    data-testid={`chat-item-${chat.id}`}
                    onClick={() => onSelectChat(chat.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ x: 2 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 cursor-pointer group",
                      isSelected
                        ? "bg-primary/15 border border-primary/20"
                        : "hover:bg-accent/60"
                    )}
                  >
                    <AvatarWithStatus
                      photoURL={display.photoURL}
                      displayName={display.name}
                      uid={display.uid}
                      online={isOnline}
                      size="md"
                      showStatus={chat.type === "direct"}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className={cn("font-medium text-sm truncate", isSelected && "text-primary")}>{display.name}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatChatTime(chat.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {chat.lastMessage?.text || "Start chatting"}
                        </p>
                        {unread > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-2 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 px-1"
                          >
                            {unread > 99 ? "99+" : unread}
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <NewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} onSelectChat={onSelectChat} />
    </div>
  );
}
