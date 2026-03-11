import type { AssistantMessage } from "@/types/assistant";
import { projects } from "@/data/mockData";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * SEND_PROMPT
 * POST /api/assistant/chat
 * Body: { message: string }
 * Response: AssistantMessage
 */
export async function sendPrompt(input: string): Promise<AssistantMessage> {
  await delay(1200);
  const lower = input.toLowerCase();
  const id = Date.now().toString();
  const timestamp = new Date().toISOString();

  if (lower.includes("comisión") || lower.includes("comision")) {
    const sorted = [...projects].sort((a, b) => b.commission - a.commission);
    return {
      id, role: "assistant", timestamp,
      content: `Las comisiones por proyecto son:\n\n${sorted.map((p, i) => `**${i + 1}. ${p.title}** — ${p.commission}${p.commissionType} por venta (precio desde $${p.priceFrom.toLocaleString()})`).join("\n\n")}`,
      resources: [{ type: "pdf", label: "Tabla de comisiones 2026", url: "#" }],
    };
  }

  if (lower.includes("financiamiento") || lower.includes("crédito") || lower.includes("credito")) {
    return {
      id, role: "assistant", timestamp,
      content: `**Opciones de financiamiento disponibles:**\n\n• **Enganche:** Desde 10% del valor del lote\n• **Plazos:** 12, 24, 36 y hasta 48 meses\n• **Sin intereses** en pagos a 12 meses\n• **Tasa preferencial** del 8% anual en plazos mayores\n\nPara *Residencial Las Palmas*, el enganche mínimo es de **$35,000 MXN** con mensualidades desde **$8,750**.`,
      resources: [
        { type: "pdf", label: "Plan de financiamiento", url: "#" },
        { type: "contract", label: "Contrato modelo", url: "#" },
        { type: "video", label: "Video: Cómo explicar financiamiento", url: "#" },
      ],
    };
  }

  if (lower.includes("lotes") || lower.includes("disponib")) {
    return {
      id, role: "assistant", timestamp,
      content: `**Disponibilidad actual de lotes:**\n\n${projects.map((p) => `• **${p.title}** (${p.location}): **${p.lotsAvailable}** de ${p.totalLots} lotes disponibles ${p.status === "limited" ? "⚠️ *¡Pocos disponibles!*" : p.status === "high-demand" ? "🔥 *Alta demanda*" : ""}`).join("\n\n")}`,
      resources: [
        { type: "image", label: "Mapa de lotes Las Palmas", url: "#" },
        { type: "image", label: "Mapa de lotes Costa Esmeralda", url: "#" },
        { type: "pdf", label: "Plano general Jardines del Valle", url: "#" },
      ],
    };
  }

  if (lower.includes("tip") || lower.includes("cerrar") || lower.includes("venta")) {
    return {
      id, role: "assistant", timestamp,
      content: `**5 Tips para cerrar una venta de lotes:**\n\n1. 🎯 **Genera urgencia real:** Menciona cuántos lotes quedan y la demanda actual\n2. 🤝 **Escucha primero:** Entiende si busca inversión o vivienda antes de ofrecer\n3. 💰 **Habla de plusvalía:** Muestra datos de crecimiento de la zona\n4. 📱 **Seguimiento rápido:** Responde en menos de 2 horas siempre\n5. 🏠 **Invita a visitar:** Un cliente que visita tiene 70% más probabilidad de comprar`,
      resources: [
        { type: "video", label: "Masterclass: Técnicas de cierre", url: "#" },
        { type: "pdf", label: "Script de ventas recomendado", url: "#" },
        { type: "link", label: "Blog: Estrategias de venta inmobiliaria", url: "#" },
      ],
    };
  }

  return {
    id, role: "assistant", timestamp,
    content: `Gracias por tu pregunta. Basándome en la información de nuestros proyectos disponibles (${projects.map(p => p.title).join(", ")}), puedo ayudarte con:\n\n• Detalles de precios y financiamiento\n• Disponibilidad de lotes\n• Comisiones por proyecto\n• Tips de ventas y seguimiento\n• Documentación y contratos\n\n¿Sobre qué tema específico te gustaría saber más?`,
    resources: [{ type: "pdf", label: "Catálogo general de proyectos", url: "#" }],
  };
}
