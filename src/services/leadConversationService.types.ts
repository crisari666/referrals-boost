export type LeadConversationStep =
  | 'initial'
  | 'ask_project'
  | 'ask_lot_range'
  | 'ask_payment'
  | 'ask_schedule'
  | 'ask_call_slot'
  | 'reminder_sent'
  | 'scheduled'
  | 'closed';

export type LeadConversationStatus = 'active' | 'scheduled' | 'disqualified' | 'abandoned';

export type LeadConversationAnswers = {
  rangoLote?: string;
  formaPago?: 'financed' | 'cash';
  horarioLlamada?: 'morning' | 'afternoon' | 'night' | 'noon' | 'evening';
  /** ISO start of the booked 30-minute call slot. */
  fechaLlamada?: string;
};

export type LeadConversationSummaryItem = {
  key: string;
  label: string;
  value: string;
};

/** customers-ms `GET customer/:customerId/lead-conversation`. */
export type LeadConversationSummary = {
  customerId: string;
  hasSession: boolean;
  sessionId?: string;
  step?: LeadConversationStep;
  status?: LeadConversationStatus;
  score: number;
  maxScore: number;
  priority: number;
  projectId?: string;
  projectTitle?: string;
  isAllProjects: boolean;
  answers: LeadConversationAnswers;
  items: LeadConversationSummaryItem[];
  assignedVentorId?: string;
  scheduledAt?: string;
  lastInboundAt?: string;
  startedAt?: string;
};

export type LeadConversationMessageItem = {
  id: string;
  direction: 'inbound' | 'outbound';
  kind: string;
  body: string;
  options: string[];
  mediaUrl?: string;
  delivered: boolean;
  timestamp: string;
};

/** customers-ms `GET customer/:customerId/lead-conversation/messages` (oldest → newest). */
export type LeadConversationMessagesPage = {
  items: LeadConversationMessageItem[];
  nextBefore?: string;
};
