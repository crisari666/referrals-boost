import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

export const currentSeller = {
  id: "v1",
  name: "Carlos Mendoza",
  level: "Plata" as const,
  levelProgress: 72,
  totalCommissions: 8350000,
  monthCommissions: 5600000,
  monthGoal: 7000000,
  clientsTracking: 14,
  clientsConverted: 6,
  referralLink: "https://milote.link/carlos-m",
  achievements: [
    { id: "a1", title: "Primera Venta", icon: "🏆", unlocked: true },
    { id: "a2", title: "10 Referidos", icon: "🚀", unlocked: true },
    { id: "a3", title: "Vendedor Estrella", icon: "⭐", unlocked: false },
    { id: "a4", title: "Meta Mensual", icon: "🎯", unlocked: false },
  ],
  ranking: 3,
};

export const motivationalPhrases = [
  "¡Cada cliente es una oportunidad de oro! 🌟",
  "Tu éxito está a una llamada de distancia 📞",
  "Los grandes vendedores crean relaciones, no solo ventas 🤝",
  "¡Hoy es un gran día para cerrar! 💪",
];

export type ProjectStatus = "available" | "high-demand" | "limited";

export interface Project {
  id: string;
  title: string;
  location: string;
  priceFrom: number;
  commission: number;
  commissionType: "%" | "$";
  lotsAvailable: number;
  totalLots: number;
  image: string;
  status: ProjectStatus;
  description: string;
  amenities: string[];
  amenitiesGroups?: { icon?: string; title: string; amenities: string[] }[];
  images?: string[];
  cardProject?: string;
  reelVideo?: string;
  brochure?: string;
  plane?: string;
}

export const projects: Project[] = [
  {
    id: "p1",
    title: "Residencial Las Palmas",
    location: "Mérida, Yucatán",
    priceFrom: 350000,
    commission: 3,
    commissionType: "%",
    lotsAvailable: 42,
    totalLots: 120,
    image: project1,
    status: "high-demand",
    description: "Desarrollo residencial premium con amenidades de primer nivel. Lotes desde 200m² con acceso a áreas verdes y seguridad 24/7.",
    amenities: ["Alberca", "Gym", "Área verde", "Seguridad 24/7", "Club house"],
  },
  {
    id: "p2",
    title: "Costa Esmeralda",
    location: "Cancún, Quintana Roo",
    priceFrom: 25000000
    ,
    commission: 4,
    commissionType: "%",
    lotsAvailable: 18,
    totalLots: 80,
    image: project2,
    status: "limited",
    description: "Exclusivos lotes residenciales a solo 10 minutos de la playa. Inversión con alta plusvalía garantizada.",
    amenities: ["Playa cercana", "Marina", "Campo de golf", "Spa"],
  },
  {
    id: "p3",
    title: "Jardines del Valle",
    location: "Guadalajara, Jalisco",
    priceFrom: 280000,
    commission: 2.5,
    commissionType: "%",
    lotsAvailable: 65,
    totalLots: 150,
    image: project3,
    status: "available",
    description: "El proyecto más accesible con financiamiento directo. Ideal para familias jóvenes buscando su primer hogar.",
    amenities: ["Parque infantil", "Ciclovía", "Área comercial", "Escuelas cercanas"],
  },
];

export type ClientStatus = "nuevo" | "interesado" | "agendo_cita" | "pago_reserva" | "cerrado";

export type DocumentType = "INE" | "Pasaporte" | "CURP" | "RFC" | "Otro";

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp: string;
  documentType?: DocumentType;
  document?: string;
  projectInterest: string;
  status: ClientStatus;
  createdAt: string;
  notes: string[];
  interactions: { date: string; type: string; detail: string }[];
}

export const clients: Client[] = [
  {
    id: "c1",
    name: "María García López",
    phone: "+52 999 123 4567",
    whatsapp: "+52 999 123 4567",
    projectInterest: "p1",
    status: "agendo_cita",
    createdAt: "2026-02-15",
    notes: ["Interesada en lotes de esquina", "Tiene presupuesto aprobado"],
    interactions: [
      { date: "2026-02-15", type: "WhatsApp", detail: "Envío de información del proyecto" },
      { date: "2026-02-18", type: "Llamada", detail: "Confirmó interés, quiere visitar" },
      { date: "2026-02-22", type: "WhatsApp", detail: "Agendó cita para el sábado" },
    ],
  },
  {
    id: "c2",
    name: "Roberto Sánchez",
    phone: "+52 999 987 6543",
    whatsapp: "+52 999 987 6543",
    projectInterest: "p2",
    status: "interesado",
    createdAt: "2026-02-20",
    notes: ["Busca inversión a largo plazo"],
    interactions: [
      { date: "2026-02-20", type: "WhatsApp", detail: "Primer contacto vía enlace de referido" },
      { date: "2026-02-25", type: "WhatsApp", detail: "Pidió más fotos y planos" },
    ],
  },
  {
    id: "c3",
    name: "Ana Martínez Ruiz",
    phone: "+52 333 456 7890",
    whatsapp: "+52 333 456 7890",
    projectInterest: "p3",
    status: "pago_reserva",
    createdAt: "2026-01-10",
    notes: ["Pagó reserva el 28/01", "Quiere lote cerca del parque"],
    interactions: [
      { date: "2026-01-10", type: "WhatsApp", detail: "Contacto inicial" },
      { date: "2026-01-15", type: "Llamada", detail: "Explicación de financiamiento" },
      { date: "2026-01-20", type: "Visita", detail: "Visitó la oficina de ventas" },
      { date: "2026-01-28", type: "Pago", detail: "Pagó reserva - $5,000" },
    ],
  },
  {
    id: "c4",
    name: "José Hernández",
    phone: "+52 999 111 2233",
    whatsapp: "+52 999 111 2233",
    projectInterest: "p1",
    status: "nuevo",
    createdAt: "2026-03-01",
    notes: [],
    interactions: [
      { date: "2026-03-01", type: "WhatsApp", detail: "Llegó por enlace de referido" },
    ],
  },
  {
    id: "c5",
    name: "Laura Díaz Pérez",
    phone: "+52 333 222 3344",
    whatsapp: "+52 333 222 3344",
    projectInterest: "p3",
    status: "cerrado",
    createdAt: "2025-12-05",
    notes: ["¡Venta cerrada!", "Lote A-15 Jardines del Valle"],
    interactions: [
      { date: "2025-12-05", type: "WhatsApp", detail: "Primer contacto" },
      { date: "2025-12-15", type: "Visita", detail: "Visitó el desarrollo" },
      { date: "2025-12-28", type: "Pago", detail: "Firmó contrato" },
      { date: "2026-01-05", type: "Cierre", detail: "Venta cerrada - Comisión $7,000" },
    ],
  },
];

export const statusLabels: Record<ClientStatus, string> = {
  nuevo: "Nuevo",
  interesado: "Interesado",
  agendo_cita: "Agendó Cita",
  pago_reserva: "Pagó Reserva",
  cerrado: "Cerrado",
};

export const statusColors: Record<ClientStatus, string> = {
  nuevo: "bg-info text-info-foreground",
  interesado: "bg-warning text-warning-foreground",
  agendo_cita: "bg-primary text-primary-foreground",
  pago_reserva: "bg-accent text-accent-foreground",
  cerrado: "bg-success text-success-foreground",
};

export const topSellers = [
  { name: "Ana Torres", commissions: 25000000, level: "Oro" },
  { name: "Miguel Ruiz", commissions: 20000000, level: "Oro" },
  { name: "Carlos Mendoza", commissions: 18000000, level: "Plata" },
];
