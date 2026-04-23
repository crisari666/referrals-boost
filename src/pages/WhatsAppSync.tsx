import { useAppSelector } from "@/store";
import QrCodeView from "@/components/whatsapp/QrCodeView";
import ChatList from "@/components/whatsapp/ChatList";
import ChatView from "@/components/whatsapp/ChatView";
import WhatsappSocketListener from "@/components/whatsapp/WhatsappSocketListener";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const WhatsAppSync = () => {
  const { connectionStatus, activeChat } = useAppSelector((s) => s.whatsapp);
  const phone = useAppSelector((s) => s.auth.user?.phone);
  const isConnected = connectionStatus === "connected";

  return (
    <div className="h-screen flex flex-col">
      <WhatsappSocketListener sessionId={phone ?? null} />
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.214l-.252-.149-2.737.813.813-2.737-.164-.262A7.963 7.963 0 014 12a8 8 0 1116 0 8 8 0 01-8 8z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">WhatsApp</h1>
          <p className="text-xs text-muted-foreground">
            {isConnected ? (
              <span className="flex items-center gap-1 text-accent">
                <CheckCircle2 className="w-3 h-3" /> Conectado
              </span>
            ) : (
              "Sincroniza tu cuenta"
            )}
          </p>
        </div>
      </div>

      {/* Content */}
      {!isConnected ? (
        <QrCodeView />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Chat list - hide on mobile when chat is active */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
            <ChatList />
          </div>
          {/* Chat view */}
          <div className={`flex-1 flex flex-col ${!activeChat ? "hidden md:flex" : "flex"}`}>
            <ChatView />
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSync;
