import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3"
  >
    <div className="w-8 h-8 rounded-lg gradient-commission flex items-center justify-center">
      <Bot className="w-4 h-4 text-primary-foreground" />
    </div>
    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </motion.div>
);

export default TypingIndicator;
