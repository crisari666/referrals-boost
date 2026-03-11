import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMessages, sendMessage, setActiveChat } from "@/store/whatsappSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import MessageBubble from "./MessageBubble";
import { ArrowLeft, Image, FileText, Mic, Paperclip, Send, X } from "lucide-react";

const ChatView = () => {
  const dispatch = useAppDispatch();
  const { activeChat, messages, messagesLoading, sendingMessage, chats } = useAppSelector((s) => s.whatsapp);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const chat = chats.find((c) => c.id === activeChat);
  const chatMessages = activeChat ? messages[activeChat] || [] : [];

  useEffect(() => {
    if (activeChat && !messages[activeChat]) {
      dispatch(fetchMessages(activeChat));
    }
  }, [dispatch, activeChat, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || !activeChat) return;

    if (attachments.length > 0) {
      attachments.forEach((file) => {
        const type = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("audio/")
          ? "audio"
          : "document";
        dispatch(sendMessage({ chatId: activeChat, content: file.name, type, mediaFile: file }));
      });
      setAttachments([]);
    }

    if (text.trim()) {
      dispatch(sendMessage({ chatId: activeChat, content: text, type: "text" }));
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceNote = () => {
    setIsRecording(!isRecording);
    if (isRecording && activeChat) {
      // Mock: send a voice note
      dispatch(sendMessage({ chatId: activeChat, content: "Nota de voz", type: "voice" }));
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "media" | "document") => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    setShowAttachMenu(false);
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleBack = () => {
    dispatch(setActiveChat(null));
  };

  if (!activeChat || !chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Selecciona un chat para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="sm" onClick={handleBack} className="md:hidden">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {chat.contactName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{chat.contactName}</p>
          <p className="text-xs text-muted-foreground">{chat.contactPhone}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-secondary/30 py-4" ref={scrollRef}>
        {messagesLoading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Skeleton className="w-8 h-8 rounded-full" />
            <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
            <div className="space-y-3 w-full px-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-56"}`} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-4 py-2 border-t border-border bg-card overflow-x-auto">
          {attachments.map((file, idx) => (
            <div key={idx} className="relative bg-secondary rounded-lg p-2 flex items-center gap-2 text-xs shrink-0">
              {file.type.startsWith("image/") ? (
                <Image className="w-4 h-4 text-primary" />
              ) : (
                <FileText className="w-4 h-4 text-primary" />
              )}
              <span className="max-w-[100px] truncate">{file.name}</span>
              <button onClick={() => removeAttachment(idx)} className="text-muted-foreground hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-border bg-card">
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowAttachMenu(!showAttachMenu)}>
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </Button>
          {showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-lg shadow-lg p-2 space-y-1 z-10">
              <button
                onClick={() => mediaInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary w-full"
              >
                <Image className="w-4 h-4 text-primary" />
                Foto / Video
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary w-full"
              >
                <FileText className="w-4 h-4 text-primary" />
                Documento
              </button>
            </div>
          )}
        </div>

        <input ref={mediaInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => handleFileSelect(e, "media")} />
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" multiple hidden onChange={(e) => handleFileSelect(e, "document")} />

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-secondary border-none"
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleVoiceNote}
          className={isRecording ? "text-destructive animate-pulse" : "text-muted-foreground"}
        >
          <Mic className="w-4 h-4" />
        </Button>

        <Button size="sm" onClick={handleSend} disabled={sendingMessage || (!text.trim() && attachments.length === 0)}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatView;
