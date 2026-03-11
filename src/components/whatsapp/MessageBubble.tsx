import { useState } from "react";
import type { WhatsAppMessage } from "@/store/whatsappSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, CheckCheck, Clock, Pencil, Trash2, Eye, Image, FileText, Mic } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

const StatusIcon = ({ status }: { status: WhatsAppMessage["status"] }) => {
  switch (status) {
    case "sending":
      return <Clock className="w-3 h-3 text-muted-foreground" />;
    case "sent":
      return <Check className="w-3 h-3 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="w-3 h-3 text-info" />;
  }
};

const MediaContent = ({ message }: { message: WhatsAppMessage }) => {
  switch (message.type) {
    case "image":
      return (
        <div className="mb-1">
          <img src={message.mediaUrl} alt={message.content} className="rounded-lg max-w-[240px] w-full" />
        </div>
      );
    case "video":
      return (
        <div className="mb-1 flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
          <Image className="w-5 h-5 text-primary" />
          <span className="text-sm">Video</span>
        </div>
      );
    case "document":
      return (
        <div className="mb-1 flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-sm truncate">{message.mediaName || "Documento"}</span>
        </div>
      );
    case "voice":
    case "audio":
      return (
        <div className="mb-1 flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
          <Mic className="w-5 h-5 text-primary" />
          <div className="flex-1 h-1 bg-muted rounded-full">
            <div className="h-1 bg-primary rounded-full w-2/3" />
          </div>
          <span className="text-xs text-muted-foreground">0:12</span>
        </div>
      );
    default:
      return null;
  }
};

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2 px-4`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          message.isDeleted
            ? "bg-destructive/10 border border-destructive/20"
            : isMe
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border"
        }`}
      >
        {/* Deleted message indicator */}
        {message.isDeleted && (
          <div className="flex items-center gap-1.5 mb-1">
            <Trash2 className="w-3 h-3 text-destructive" />
            <span className="text-xs font-medium text-destructive">Mensaje eliminado</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs text-destructive hover:text-destructive">
                  <Eye className="w-3 h-3 mr-1" />
                  Ver original
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-destructive" />
                    Mensaje eliminado
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contenido original:</p>
                    <p className="bg-secondary p-3 rounded-lg text-sm">{message.originalContent}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Eliminado el {format(new Date(message.deletedAt!), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Media */}
        <MediaContent message={message} />

        {/* Content */}
        <p className={`text-sm ${message.isDeleted ? "italic text-muted-foreground" : ""}`}>
          {showOriginal && message.editHistory.length > 0
            ? message.editHistory[message.editHistory.length - 1].content
            : message.content}
        </p>

        {/* Footer */}
        <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "justify-end" : ""}`}>
          {/* Edited indicator */}
          {message.isEdited && !message.isDeleted && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-0.5 hover:opacity-80">
                  <Pencil className={`w-2.5 h-2.5 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    editado
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-primary" />
                    Historial de ediciones
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {message.editHistory.map((edit, i) => (
                    <div key={i} className="bg-secondary p-3 rounded-lg">
                      <p className="text-sm">{edit.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(edit.editedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    </div>
                  ))}
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">Versión actual</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <span className={`text-[10px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {format(new Date(message.timestamp), "HH:mm")}
          </span>
          {isMe && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
