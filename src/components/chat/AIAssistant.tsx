import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles, RefreshCw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Help me write a message",
  "Summarize this conversation",
  "Suggest a funny reply",
  "Translate to Spanish",
  "Make this more professional",
];

const SAMPLE_RESPONSES: Record<string, string> = {
  default: "I'm your AI assistant! I can help you compose messages, suggest replies, translate text, and more. What would you like help with?",
  "help me write a message": "Sure! Tell me who you're writing to and what you'd like to say — I'll help you craft the perfect message.",
  "summarize this conversation": "To summarize a conversation, please paste the messages here and I'll create a concise summary for you.",
  "suggest a funny reply": "How about: 'That's so funny, I almost laughed!' 😄 Or try: 'I'd respond but I'm busy being awesome right now.' Want more options?",
  "translate to spanish": "¡Hola! I can translate text to Spanish. Just paste the text you'd like translated and I'll help you out.",
  "make this more professional": "Please share the text you'd like me to make more professional, and I'll refine it for you.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, value] of Object.entries(SAMPLE_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) return value;
  }
  if (lower.includes("hello") || lower.includes("hi")) return "Hello! How can I assist you today? I can help with message composition, translations, summaries, and more!";
  if (lower.includes("thank")) return "You're welcome! Is there anything else I can help you with?";
  return `I understand you're asking about "${input}". As your AI assistant, I can help with composing messages, suggesting replies, translating text, and summarizing conversations. Could you give me more context?`;
}

interface AIAssistantProps {
  onClose: () => void;
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    { id: "1", role: "assistant", content: SAMPLE_RESPONSES.default, timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: AIMessage = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
    const response = getResponse(text);
    setIsTyping(false);
    setMessages((prev) => [...prev, {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date()
    }]);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearChat = () => {
    setMessages([{ id: "1", role: "assistant", content: SAMPLE_RESPONSES.default, timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Nova AI</p>
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Always ready
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.1 }} onClick={clearChat} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <RefreshCw className="w-4 h-4" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={cn("max-w-[80%] group", msg.role === "user" ? "items-end" : "items-start", "flex flex-col gap-1")}>
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-tr-sm"
                    : "bg-card border border-border text-card-foreground rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
                <button
                  onClick={() => copyMessage(msg.id, msg.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
                >
                  {copied === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === msg.id ? "Copied" : "Copy"}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-muted-foreground"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => sendMessage(s)}
            className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-primary/20 transition-colors flex-shrink-0"
          >
            {s}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 p-3 border-t border-border bg-card/80">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Ask Nova anything..."
            rows={1}
            className="w-full resize-none bg-muted/50 border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
            style={{ height: "42px" }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 text-white flex items-center justify-center shadow-lg disabled:opacity-40 flex-shrink-0 glow-sm"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
