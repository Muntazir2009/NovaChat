import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import AIAssistant from "@/components/chat/AIAssistant";
import SettingsPage from "./SettingsPage";
import { MessageSquare, Sparkles } from "lucide-react";

type RightPanel = "chat" | "ai" | "settings" | null;

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setRightPanel("chat");
    if (isMobile) setShowSidebar(false);
  };

  const handleBack = () => {
    if (isMobile) setShowSidebar(true);
    setSelectedChatId(null);
    setRightPanel(null);
  };

  const handleOpenSettings = () => {
    setRightPanel("settings");
    if (isMobile) setShowSidebar(false);
  };

  const handleOpenAI = () => {
    setRightPanel("ai");
    if (isMobile) setShowSidebar(false);
  };

  const showMain = !isMobile || !showSidebar;
  const showSidebarPanel = !isMobile || showSidebar;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebarPanel && (
          <motion.div
            initial={isMobile ? { x: -320 } : { opacity: 1 }}
            animate={isMobile ? { x: 0 } : { opacity: 1 }}
            exit={isMobile ? { x: -320 } : { opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-border h-full"
          >
            <ChatSidebar
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              onOpenSettings={handleOpenSettings}
              onOpenAI={handleOpenAI}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      {showMain && (
        <div className="flex-1 min-w-0 h-full">
          <AnimatePresence mode="wait">
            {rightPanel === "chat" && selectedChatId ? (
              <motion.div
                key={`chat-${selectedChatId}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ChatWindow chatId={selectedChatId} onBack={handleBack} isMobile={isMobile} />
              </motion.div>
            ) : rightPanel === "ai" ? (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <AIAssistant onClose={handleBack} />
              </motion.div>
            ) : rightPanel === "settings" ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SettingsPage onClose={handleBack} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-primary/20 flex items-center justify-center mb-6 mx-auto animate-float">
                    <MessageSquare className="w-10 h-10 text-primary/60" />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent mb-2"
                >
                  Welcome to NovaChat
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-sm max-w-xs leading-relaxed"
                >
                  Select a conversation from the sidebar or start a new one to begin messaging
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-3 justify-center mt-8"
                >
                  {["End-to-end sync", "Realtime presence", "AI Assistant", "Rich media"].map((feature, i) => (
                    <span key={feature} className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1.5 border border-border">
                      {feature}
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
