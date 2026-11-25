export type LeadConversationStep =
  | 'initial'
  | 'ask_project'
  | 'ask_lot_range'
  | 'ask_payment'
  | 'ask_schedule'
  | 'ask_call_slot'
  | 'reminder_sent'
  | 'scheduled'
  | 'v2_conversation'
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

export type LeadFlowVersion = 'v1' | 'v2';

export type LeadTemperature = 'hot' | 'warm' | 'cold';

/** V2 score breakdown entry; bar width is proportional to `points`. */
export type LeadScoreSegment = {
  key: string;
  label: string;
  points: number;
  isEarned: boolean;
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
  flowVersion?: LeadFlowVersion;
  temperature?: LeadTemperature;
  stage?: string;
  advisorBrief?: string;
  scoreSegments?: LeadScoreSegment[];
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
