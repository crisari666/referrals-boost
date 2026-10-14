import * as http from '@/lib/http';
import { customersMsUrl, withCustomersMsAuth } from './clientsService';
import type {
  LeadConversationMessagesPage,
  LeadConversationSummary,
} from './leadConversationService.types';

const MESSAGES_PAGE_SIZE = 50;

/** `GET customer/:customerId/lead-conversation` — AI qualification summary + score. */
export async function getLeadConversationSummary(customerId: string): Promise<LeadConversationSummary> {
  return http.get('', {
    url: customersMsUrl(`customer/${encodeURIComponent(customerId)}/lead-conversation`),
    ...withCustomersMsAuth(),
  });
}

/** `GET customer/:customerId/lead-conversation/messages` — bot ↔ customer transcript. */
export async function getLeadConversationMessages(
  customerId: string,
  before?: string,
): Promise<LeadConversationMessagesPage> {
  return http.get('', {
    url: customersMsUrl(`customer/${encodeURIComponent(customerId)}/lead-conversation/messages`),
    ...withCustomersMsAuth({
      params: { limit: MESSAGES_PAGE_SIZE, ...(before ? { before } : {}) },
    }),
  });
}
