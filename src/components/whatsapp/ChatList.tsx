import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchChats, setActiveChat, disconnect } from "@/store/whatsappSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ChatList = () => {
  const dispatch = useAppDispatch();
  const { chats, chatsLoading, activeChat } = useAppSelector((s) => s.whatsapp);
  const phone = useAppSelector((s) => s.auth.user?.phone);

  useEffect(() => {
    if (!phone) return;
    dispatch(fetchChats(phone));
  }, [dispatch, phone]);

  const handleSelectChat = (chatId: string) => {
    dispatch(setActiveChat(chatId));
  };

  const handleDisconnect = () => {
    if (!phone) return;
    dispatch(disconnect(phone));
  };

  if (chatsLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-foreground">Cargando chats...</h3>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Chats</h3>
          <Badge variant="secondary" className="text-xs">{chats.length}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          disabled={!phone}
          className="text-destructive hover:text-destructive disabled:opacity-50"
          title="Eliminar sesión"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => handleSelectChat(chat.id)}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50 border-b border-border/50 ${
              activeChat === chat.id ? "bg-secondary" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {chat.contactName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground truncate">{chat.contactName}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(chat.lastMessageTime), "HH:mm", { locale: es })}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0 ml-2 shrink-0">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ChatList;
