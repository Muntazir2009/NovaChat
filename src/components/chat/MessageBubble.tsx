import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, Edit2, Trash2, Pin, Smile, Check, CheckCheck } from "lucide-react";
import { Message } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { cn, formatMessageTime } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onPin: (id: string, pin: boolean) => void;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function MessageBubble({
  message, isOwn, showAvatar, onReply, onEdit, onDelete, onReact, onPin,
}: MessageBubbleProps) {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isDeleted = message.deleted;
  const isRead = message.readBy && message.readBy.length > 1;
  const isDelivered = message.deliveredTo && message.deliveredTo.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex items-end gap-2 group px-4 py-0.5", isOwn ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
    >
      {/* Avatar */}
      <div className="w-8 flex-shrink-0">
        {showAvatar && !isOwn && (
          <AvatarWithStatus
            photoURL={message.senderPhoto}
            displayName={message.senderName}
            uid={message.senderId}
            size="xs"
            showStatus={false}
          />
        )}
      </div>

      <div className={cn("max-w-[70%] flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        {/* Sender name */}
        {showAvatar && !isOwn && (
          <span className="text-xs font-medium text-primary px-1">{message.senderName}</span>
        )}

        {/* Reply quote */}
        {message.replyTo && !isDeleted && (
          <div className={cn(
            "flex items-start gap-2 px-3 py-2 rounded-xl text-xs border-l-2 border-primary max-w-full mb-0.5",
            isOwn ? "bg-primary/10 text-primary-foreground/70" : "bg-muted text-muted-foreground"
          )}>
            <div className="min-w-0">
              <p className="font-semibold text-primary text-[10px] mb-0.5">{message.replyTo.senderName}</p>
              <p className="truncate opacity-80">{message.replyTo.text}</p>
            </div>
          </div>
        )}

        {/* Pinned indicator */}
        {message.pinned && (
          <div className="flex items-center gap-1 text-[10px] text-amber-500 px-1">
            <Pin className="w-2.5 h-2.5" />
            <span>Pinned</span>
          </div>
        )}

        <div className="relative flex items-end gap-1.5">
          {/* Action buttons (hover) */}
          <AnimatePresence>
            {showActions && !isDeleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  "flex items-center gap-1 absolute bottom-0 z-10",
                  isOwn ? "right-full mr-2" : "left-full ml-2"
                )}
              >
                <div className="flex items-center gap-0.5 bg-card/90 backdrop-blur border border-border rounded-full px-1.5 py-1 shadow-lg">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  >
                    <Smile className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onReply(message)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {isOwn && (
                    <button
                      onClick={() => onEdit(message)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    onClick={() => onPin(message.id, !message.pinned)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {isOwn && (
                    <button
                      onClick={() => onDelete(message.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick emoji picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                className={cn(
                  "absolute bottom-full mb-2 z-20 bg-card/95 backdrop-blur border border-border rounded-2xl p-2 shadow-xl flex gap-1",
                  isOwn ? "right-0" : "left-0"
                )}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => { onReact(message.id, emoji); setShowEmojiPicker(false); }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-xl transition-all hover:scale-125 text-base"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bubble */}
          <div className={cn(
            "px-4 py-2.5 rounded-2xl relative max-w-full",
            isOwn
              ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-tr-sm shadow-lg"
              : "bg-card text-card-foreground rounded-tl-sm border border-border shadow-sm",
            isDeleted && "opacity-50 italic"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>

            {/* Timestamp + read status */}
            <div className={cn("flex items-center gap-1 mt-1 justify-end", isOwn ? "text-white/60" : "text-muted-foreground")}>
              <span className="text-[10px]">{formatMessageTime(message.timestamp)}</span>
              {message.edited && <span className="text-[10px]">• edited</span>}
              {isOwn && (
                isRead
                  ? <CheckCheck className="w-3 h-3 text-blue-300" />
                  : isDelivered
                  ? <CheckCheck className="w-3 h-3" />
                  : <Check className="w-3 h-3" />
              )}
            </div>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {Object.entries(message.reactions).map(([emoji, reaction]) => (
              <motion.button
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => onReact(message.id, emoji)}
                className={cn(
                  "flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border transition-all hover:scale-105",
                  reaction.users.includes(user?.uid || "")
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-muted border-border text-muted-foreground hover:bg-accent"
                )}
              >
                <span>{emoji}</span>
                <span className="font-medium">{reaction.users.length}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
