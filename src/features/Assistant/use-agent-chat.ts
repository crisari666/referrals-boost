import { useCallback, useEffect, useRef, useState } from 'react';
import { askAgent } from '@/services/agentChatService';
import { getProjectResourceUrl } from '@/services/projectsService';
import type { ChatHistoryMessage } from '@/types/agent-chat';
import type { AssistantMessage, Resource, ResourceType } from '@/types/assistant';

const welcomeMessage = (): AssistantMessage => ({
  id: 'welcome',
  role: 'assistant',
  content:
    '¡Hola! 👋 Soy tu **asistente virtual de LoteLink**. Estoy entrenado con toda la información de nuestros proyectos inmobiliarios.\n\nPuedo ayudarte con:\n• Detalles y precios de proyectos\n• Opciones de financiamiento\n• Tips de ventas\n• Documentos y contratos\n\n¿En qué puedo ayudarte hoy?',
  timestamp: new Date().toISOString(),
});

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg)(\?|#|$)/i;

function inferResourceType(ref: string): ResourceType {
  const lower = ref.toLowerCase();
  if (/\.pdf(\?|#|$)/i.test(lower)) return 'pdf';
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(lower)) return 'video';
  if (IMAGE_EXT.test(lower)) return 'image';
  if (/contrato|contract/i.test(lower)) return 'contract';
  return 'link';
}

function sourceToResource(src: string): Resource {
  const trimmed = src.trim();
  const label =
    trimmed.split('/').pop()?.split('?')[0]?.trim() || trimmed || 'Fuente';

  if (/^https?:\/\//i.test(trimmed)) {
    const type = inferResourceType(trimmed);
    return {
      type,
      label,
      openUrl: trimmed,
      previewUrl: type === 'image' ? trimmed : undefined,
    };
  }

  const resolved = getProjectResourceUrl(trimmed);
  if (resolved) {
    const type = inferResourceType(resolved);
    return {
      type,
      label,
      openUrl: resolved,
      previewUrl: type === 'image' ? resolved : undefined,
    };
  }

  return {
    type: inferResourceType(trimmed),
    label,
    copyText: trimmed,
  };
}

function buildHistory(messages: AssistantMessage[]): ChatHistoryMessage[] {
  return messages
    .filter((m): m is AssistantMessage & { role: 'user' | 'assistant' } => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-50);
}

export function useAgentChat() {
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [welcomeMessage()]);
  const [isPending, setIsPending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesRef = useRef(messages);
  const pendingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending, scrollToBottom]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pendingRef.current) return;

    const chatHistory = buildHistory(messagesRef.current);
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    pendingRef.current = true;
    setIsPending(true);
    setMessages((prev) => [...prev, userMessage]);

    try {
      const data = await askAgent({ question: trimmed, chatHistory });
      const resources =
        data.sources.length > 0 ? data.sources.map((s) => sourceToResource(s)) : undefined;

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.output,
          ...(resources && { resources }),
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }, []);

  return {
    messages,
    isPending,
    showScrollBtn,
    scrollRef,
    messagesEndRef,
    onScroll,
    scrollToBottom,
    send,
  };
}
