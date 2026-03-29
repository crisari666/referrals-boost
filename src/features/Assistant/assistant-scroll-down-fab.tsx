import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface AssistantScrollDownFabProps {
  visible: boolean;
  onClick: () => void;
}

const AssistantScrollDownFab = ({ visible, onClick }: AssistantScrollDownFabProps) => (
  <AnimatePresence>
    {visible && (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        onClick={onClick}
        className="absolute bottom-36 right-6 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-10"
      >
        <ArrowDown className="w-4 h-4" />
      </motion.button>
    )}
  </AnimatePresence>
);

export default AssistantScrollDownFab;
