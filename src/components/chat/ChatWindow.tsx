import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Video, MoreVertical, ArrowLeft, Pin, Search,
  Users, Info, Trash2, LogOut, Bell, ChevronDown
} from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useChats, Chat } from "@/hooks/useChats";
import { useAuth } from "@/contexts/AuthContext";
import { usePresence } from "@/hooks/usePresence";
import { useTypingIndicator } from "@/hooks/useTyping";
import { useUserProfile } from "@/hooks/useUsers";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Message } from "@/hooks/useMessages";
import { cn, formatLastSeen } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
  isMobile: boolean;
}

export default function ChatWindow({ chatId, onBack, isMobile }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, loading, hasMore, loadMore, sendMessage, editMessage, deleteMessage, addReaction, pinMessage, markRead } = useMessages(chatId);
  const { getChatById, markAsRead } = useChats();
  const typingUsers = useTypingIndicator(chatId);

  const [chat, setChat] = useState<Chat | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const otherUid = chat?.type === "direct" ? chat.members.find((m) => m !== user?.uid) : null;
  const { profile: otherProfile } = useUserProfile(otherUid || null);
  const presence = usePresence(otherUid || null);

  useEffect(() => {
    getChatById(chatId).then(setChat);
    markAsRead(chatId);
  }, [chatId]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distFromBottom < 100;
    setShowScrollBtn(distFromBottom > 300);
    if (el.scrollTop < 100 && hasMore) loadMore();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (text: string) => {
    sendMessage(text, "text", replyTo ? {
      replyTo: { id: replyTo.id, text: replyTo.text, senderName: replyTo.senderName }
    } : undefined);
    setReplyTo(null);
  };

  const handleConfirmEdit = (newText: string) => {
    if (editingMessage) {
      editMessage(editingMessage.id, newText);
      setEditingMessage(null);
    }
  };

  const chatName = chat?.type === "group" ? chat.name : (otherProfile?.displayName || "Chat");
  const chatPhoto = chat?.type === "group" ? chat.photoURL : otherProfile?.photoURL;
  const chatUid = chat?.type === "group" ? chatId : (otherUid || "");
  const isOnline = chat?.type === "direct" ? presence.online : false;
  const statusText = chat?.type === "direct"
    ? (presence.online ? "Online" : presence.lastSeen ? `Last seen ${formatLastSeen(presence.lastSeen)}` : "Offline")
    : `${chat?.members?.length || 0} members`;

  const typingCount = Object.keys(typingUsers).length;

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm z-10">
        {isMobile && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        )}

        <div className="flex items-center gap-3 flex-1 min-w-0">
          {chatName && chatUid && (
            <AvatarWithStatus
              photoURL={chatPhoto}
              displayName={chatName}
              uid={chatUid}
              online={isOnline}
              size="sm"
              showStatus={chat?.type === "direct"}
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{chatName}</p>
            <AnimatePresence mode="wait">
              {typingCount > 0 ? (
                <motion.p
                  key="typing"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  className="text-xs text-primary flex items-center gap-1"
                >
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1 h-1 rounded-full bg-primary inline-block"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </span>
                  typing...
                </motion.p>
              ) : (
                <motion.p
                  key="status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn("text-xs", isOnline ? "text-emerald-500" : "text-muted-foreground")}
                >
                  {statusText}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <Search className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <Video className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <Phone className="w-4 h-4" />
          </motion.button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button whileHover={{ scale: 1.1 }} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                <MoreVertical className="w-4 h-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Info className="w-4 h-4 mr-2" /> Chat Info
              </DropdownMenuItem>
              {chat?.type === "group" && (
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" /> View Members
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Pin className="w-4 h-4 mr-2" /> Pinned Messages
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="w-4 h-4 mr-2" /> Mute Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                {chat?.type === "group" ? (
                  <><LogOut className="w-4 h-4 mr-2" /> Leave Group</>
                ) : (
                  <><Trash2 className="w-4 h-4 mr-2" /> Delete Chat</>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 space-y-0.5"
        style={{ backgroundImage: "radial-gradient(circle at 20% 80%, hsl(var(--primary)/0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(258 85% 68%/0.03) 0%, transparent 60%)" }}
      >
        {loading && (
          <div className="space-y-4 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn("flex items-end gap-2", i % 3 === 0 ? "flex-row-reverse" : "flex-row")}>
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
                <div className={cn("h-10 rounded-2xl bg-muted animate-pulse", i % 3 === 0 ? "w-48" : "w-36")} />
              </div>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center py-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={loadMore}
              className="text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-4 py-1.5 transition-colors"
            >
              Load earlier messages
            </motion.button>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-primary/20 flex items-center justify-center mb-4"
            >
              {chatName && chatUid && (
                <AvatarWithStatus photoURL={chatPhoto} displayName={chatName} uid={chatUid} size="lg" showStatus={false} />
              )}
            </motion.div>
            <p className="font-semibold text-lg">{chatName}</p>
            <p className="text-muted-foreground text-sm mt-1">Start your conversation</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showAvatar = !prev || prev.senderId !== msg.senderId;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === user?.uid}
              showAvatar={showAvatar}
              onReply={setReplyTo}
              onEdit={setEditingMessage}
              onDelete={deleteMessage}
              onReact={addReaction}
              onPin={pinMessage}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <ChatInput
        chatId={chatId}
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        onConfirmEdit={handleConfirmEdit}
      />
    </div>
  );
}
