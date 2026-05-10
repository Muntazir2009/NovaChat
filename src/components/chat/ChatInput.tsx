import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, X, Mic, MicOff } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTyping } from "@/hooks/useTyping";
import { Message } from "@/hooks/useMessages";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface ChatInputProps {
  chatId: string;
  onSend: (text: string) => void;
  replyTo: Message | null;
  onCancelReply: () => void;
  editingMessage: Message | null;
  onCancelEdit: () => void;
  onConfirmEdit: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  chatId, onSend, replyTo, onCancelReply,
  editingMessage, onCancelEdit, onConfirmEdit, disabled,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { handleTyping } = useTyping(chatId);
  const { theme } = useTheme();

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (editingMessage) {
      onConfirmEdit(trimmed);
    } else {
      onSend(trimmed);
    }
    setText("");
    setShowEmoji(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    handleTyping();
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const addEmoji = (emoji: { native: string }) => {
    setText((prev) => prev + emoji.native);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Reply / Edit indicator */}
      <AnimatePresence>
        {(replyTo || editingMessage) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-start gap-2 px-4 py-2 bg-muted/60 border-t border-border"
          >
            <div className="w-0.5 self-stretch bg-primary rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary mb-0.5">
                {editingMessage ? "Editing message" : `Reply to ${replyTo?.senderName}`}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {editingMessage ? editingMessage.text : replyTo?.text}
              </p>
            </div>
            <button
              onClick={editingMessage ? onCancelEdit : onCancelReply}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 right-0 z-30 rounded-2xl overflow-hidden shadow-2xl"
          >
            <Picker
              data={data}
              onEmojiSelect={addEmoji}
              theme={theme}
              previewPosition="none"
              skinTonePosition="none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex items-end gap-2 p-3 bg-card/80 backdrop-blur border-t border-border">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            data-testid="input-message"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? "Edit message..." : "Type a message..."}
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-muted/50 border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground max-h-[120px] overflow-y-auto"
            style={{ height: "42px" }}
          />
        </div>

        {/* Emoji */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowEmoji(!showEmoji)}
          disabled={disabled}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0",
            showEmoji ? "text-primary bg-primary/15" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          )}
        >
          <Smile className="w-5 h-5" />
        </motion.button>

        {/* Send or mic */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={text.trim() ? handleSend : () => setIsRecording(!isRecording)}
          disabled={disabled}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-lg",
            text.trim()
              ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white glow-sm"
              : isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-muted text-muted-foreground"
          )}
          data-testid="button-send"
        >
          {text.trim() ? (
            <Send className="w-4 h-4" />
          ) : isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
