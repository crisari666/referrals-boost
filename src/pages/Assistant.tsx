import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, FileText, Video, Image, FileCheck, Sparkles, ArrowDown } from "lucide-react";
import { projects } from "@/data/mockData";

interface Resource {
  type: "pdf" | "video" | "image" | "contract";
  label: string;
  url: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  resources?: Resource[];
  timestamp: Date;
}

const resourceIcon = {
  pdf: FileText,
  video: Video,
  image: Image,
  contract: FileCheck,
};

const resourceColor = {
  pdf: "bg-red-500/10 text-red-600 border-red-200",
  video: "bg-violet-500/10 text-violet-600 border-violet-200",
  image: "bg-sky-500/10 text-sky-600 border-sky-200",
  contract: "bg-amber-500/10 text-amber-600 border-amber-200",
};

const suggestedQuestions = [
  "¿Cuáles son los proyectos con mayor comisión?",
  "¿Qué financiamiento ofrece Residencial Las Palmas?",
  "¿Cuántos lotes quedan en Costa Esmeralda?",
  "Dame tips para cerrar una venta",
];

// Mock AI responses based on keywords
function getMockResponse(input: string): ChatMessage {
  const lower = input.toLowerCase();
  const id = Date.now().toString();

  if (lower.includes("comisión") || lower.includes("comision")) {
    const sorted = [...projects].sort((a, b) => b.commission - a.commission);
    return {
      id,
      role: "assistant",
      content: `Las comisiones por proyecto son:\n\n${sorted.map((p, i) => `**${i + 1}. ${p.title}** — ${p.commission}${p.commissionType} por venta (precio desde $${p.priceFrom.toLocaleString()})`).join("\n\n")}`,
      resources: [
        { type: "pdf", label: "Tabla de comisiones 2026", url: "#" },
      ],
      timestamp: new Date(),
    };
  }

  if (lower.includes("financiamiento") || lower.includes("crédito") || lower.includes("credito")) {
    return {
      id,
      role: "assistant",
      content: `**Opciones de financiamiento disponibles:**\n\n• **Enganche:** Desde 10% del valor del lote\n• **Plazos:** 12, 24, 36 y hasta 48 meses\n• **Sin intereses** en pagos a 12 meses\n• **Tasa preferencial** del 8% anual en plazos mayores\n\nPara *Residencial Las Palmas*, el enganche mínimo es de **$35,000 MXN** con mensualidades desde **$8,750**.`,
      resources: [
        { type: "pdf", label: "Plan de financiamiento", url: "#" },
        { type: "contract", label: "Contrato modelo", url: "#" },
        { type: "video", label: "Video: Cómo explicar financiamiento", url: "#" },
      ],
      timestamp: new Date(),
    };
  }

  if (lower.includes("lotes") || lower.includes("disponib")) {
    return {
      id,
      role: "assistant",
      content: `**Disponibilidad actual de lotes:**\n\n${projects.map((p) => `• **${p.title}** (${p.location}): **${p.lotsAvailable}** de ${p.totalLots} lotes disponibles ${p.status === "limited" ? "⚠️ *¡Pocos disponibles!*" : p.status === "high-demand" ? "🔥 *Alta demanda*" : ""}`).join("\n\n")}`,
      resources: [
        { type: "image", label: "Mapa de lotes Las Palmas", url: "#" },
        { type: "image", label: "Mapa de lotes Costa Esmeralda", url: "#" },
        { type: "pdf", label: "Plano general Jardines del Valle", url: "#" },
      ],
      timestamp: new Date(),
    };
  }

  if (lower.includes("tip") || lower.includes("cerrar") || lower.includes("venta")) {
    return {
      id,
      role: "assistant",
      content: `**5 Tips para cerrar una venta de lotes:**\n\n1. 🎯 **Genera urgencia real:** Menciona cuántos lotes quedan y la demanda actual\n2. 🤝 **Escucha primero:** Entiende si busca inversión o vivienda antes de ofrecer\n3. 💰 **Habla de plusvalía:** Muestra datos de crecimiento de la zona\n4. 📱 **Seguimiento rápido:** Responde en menos de 2 horas siempre\n5. 🏠 **Invita a visitar:** Un cliente que visita tiene 70% más probabilidad de comprar`,
      resources: [
        { type: "video", label: "Masterclass: Técnicas de cierre", url: "#" },
        { type: "pdf", label: "Script de ventas recomendado", url: "#" },
      ],
      timestamp: new Date(),
    };
  }

  return {
    id,
    role: "assistant",
    content: `Gracias por tu pregunta. Basándome en la información de nuestros proyectos disponibles (${projects.map(p => p.title).join(", ")}), puedo ayudarte con:\n\n• Detalles de precios y financiamiento\n• Disponibilidad de lotes\n• Comisiones por proyecto\n• Tips de ventas y seguimiento\n• Documentación y contratos\n\n¿Sobre qué tema específico te gustaría saber más?`,
    resources: [
      { type: "pdf", label: "Catálogo general de proyectos", url: "#" },
    ],
    timestamp: new Date(),
  };
}

const Assistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! 👋 Soy tu **asistente virtual de LoteLink**. Estoy entrenado con toda la información de nuestros proyectos inmobiliarios.\n\nPuedo ayudarte con:\n• Detalles y precios de proyectos\n• Opciones de financiamiento\n• Tips de ventas\n• Documentos y contratos\n\n¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!atBottom);
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getMockResponse(msg);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[100dvh] md:h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-6 pb-3 md:px-8 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-commission flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Asistente AI</h1>
            <p className="text-xs text-muted-foreground">Información de proyectos, financiamiento y ventas</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            En línea
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-4 relative"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-commission flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "gradient-commission text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                {/* Render content with basic markdown-like bold */}
                <div className={`text-sm leading-relaxed whitespace-pre-line ${msg.role === "assistant" ? "text-foreground" : ""}`}>
                  {msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={i}>{part.slice(2, -2)}</strong>
                    ) : part.startsWith("*") && part.endsWith("*") ? (
                      <em key={i}>{part.slice(1, -1)}</em>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>

                {/* Resources */}
                {msg.resources && msg.resources.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recursos</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.resources.map((res, i) => {
                        const Icon = resourceIcon[res.type];
                        return (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-transform hover:scale-105 ${resourceColor[res.type]}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {res.label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className={`text-[10px] mt-2 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {msg.timestamp.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
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
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-36 right-6 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-10"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="flex-shrink-0 px-4 md:px-8 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-4 md:px-8 py-4 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="h-11 w-11 rounded-xl gradient-commission text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assistant;
