import type { CreateCustomerEventPayload } from "@/services/clientsService.types";

export type AddCustomerNoteArgs = {
  customerId: string;
  note: string;
};

export type AddCustomerEventArgs = {
  customerId: string;
  payload: CreateCustomerEventPayload;
};
