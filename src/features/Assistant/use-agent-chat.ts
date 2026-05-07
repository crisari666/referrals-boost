import { useCallback, useEffect, useRef, useState } from 'react';
import i18n from '@/i18n';
import { askAgent } from '@/services/agentChatService';
import {
  getProjectResourceUrl,
  getRagIngestAssetUrl,
  resolveAgentChatLinkHref,
} from '@/services/projectsService';
import type { AgentChatMediaFile, ChatHistoryMessage } from '@/types/agent-chat';
import type { AssistantMessage, Resource, ResourceType } from '@/types/assistant';
import {
  dedupeResources,
  mediaProjectsToResources,
} from '@/features/Assistant/utils/merge-agent-chat-resources';

const buildWelcomeMessage = (): AssistantMessage => ({
  id: 'welcome',
  role: 'assistant',
  content: i18n.t('assistant.welcomeMarkdown'),
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

const LEGAL_RAG_MEDIA_KINDS = new Set<AgentChatMediaFile['kind']>([
  'legalRut',
  'legalBusinessRegistration',
  'legalBankCertificate',
  'legalLibertarianCertificate',
]);

function sourceToResource(src: string): Resource {
  const trimmed = src.trim();
  const label =
    trimmed.split('/').pop()?.split('?')[0]?.trim() || trimmed || i18n.t('assistant.sourceFallback');
  if (/^https?:\/\//i.test(trimmed)) {
    const type = inferResourceType(trimmed);
    return {
      type,
      label,
      openUrl: trimmed,
      previewUrl: type === 'image' ? trimmed : undefined,
    };
  }
  const resolved = resolveAgentChatLinkHref(trimmed);
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

function mediaFileToResource(file: AgentChatMediaFile): Resource {
  const trimmed = file.filename.trim();
  const label =
    trimmed.split('/').pop()?.split('?')[0]?.trim() || trimmed || i18n.t('assistant.sourceFallback');
  if (/^https?:\/\//i.test(trimmed)) {
    const type = inferResourceType(trimmed);
    return {
      type,
      label,
      openUrl: trimmed,
      previewUrl: type === 'image' ? trimmed : undefined,
    };
  }
  const resolved = LEGAL_RAG_MEDIA_KINDS.has(file.kind)
    ? getRagIngestAssetUrl(trimmed)
    : getProjectResourceUrl(trimmed);
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

function extractMarkdownHrefTargets(markdown: string): string[] {
  const re = /\[([^\]]*)\]\(([^)\s]+)\)/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    out.push(m[2]);
  }
  return out;
}

function resolvedUrlsLinkedInMarkdown(markdown: string): Set<string> {
  return new Set(
    extractMarkdownHrefTargets(markdown)
      .map((h) => resolveAgentChatLinkHref(h.trim()))
      .filter((u): u is string => Boolean(u)),
  );
}

function resourcesOmittingInlineLinks(
  items: readonly Resource[],
  inlineLinkedUrls: ReadonlySet<string>,
): Resource[] {
  if (inlineLinkedUrls.size === 0) return [...items];
  return items.filter((r) => !(r.openUrl && inlineLinkedUrls.has(r.openUrl)));
}

function buildHistory(messages: AssistantMessage[]): ChatHistoryMessage[] {
  return messages
    .filter((m): m is AssistantMessage & { role: 'user' | 'assistant' } => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-50);
}

export function useAgentChat() {
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [buildWelcomeMessage()]);
  const [isPending, setIsPending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesRef = useRef(messages);
  const pendingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    const onLanguageChanged = (): void => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === 'welcome' ? { ...m, content: i18n.t('assistant.welcomeMarkdown') } : m,
        ),
      );
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);
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
      const fromSources = data.sources.map((s) => sourceToResource(s));
      const fromMedia = mediaProjectsToResources(data.media, mediaFileToResource);
      const inlineLinked = resolvedUrlsLinkedInMarkdown(data.output);
      const merged = resourcesOmittingInlineLinks(
        dedupeResources([...fromSources, ...fromMedia]),
        inlineLinked,
      );
      const resources = merged.length > 0 ? merged : undefined;
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
          content: i18n.t('assistant.sendError'),
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
