import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-primary/20 flex items-center justify-center mb-6 mx-auto">
          <MessageSquare className="w-10 h-10 text-primary/60" />
        </div>
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">Page not found</p>
        <a href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
          Back home
        </a>
      </motion.div>
    </div>
  );
}
