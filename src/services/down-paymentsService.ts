import { http } from '@/lib/http';
import {
  customersMsUrl,
  withCustomersMsAuth,
} from '@/services/clientsService';
import type {
  CreateCustomerDownPaymentBody,
  CreateCustomerPaymentFeeBody,
  CustomerDownPaymentItem,
  CustomerPaymentFeeItem,
} from '@/services/down-payments.types';

function appendDownPaymentFields(
  formData: FormData,
  body: CreateCustomerDownPaymentBody,
): void {
  formData.append('customerId', body.customerId);
  formData.append('projectId', body.projectId);
  formData.append('lotNumber', body.lotNumber);
  formData.append('expectedValue', String(body.expectedValue));
  formData.append('firstPaymentValue', String(body.firstPaymentValue));
  formData.append('datePayment', body.datePayment);
  if (body.receiptNumber) formData.append('receiptNumber', body.receiptNumber);
  if (body.paymentMethod) formData.append('paymentMethod', body.paymentMethod);
  if (body.notes) formData.append('notes', body.notes);
  if (body.customerName) formData.append('customerName', body.customerName);
  if (body.projectName) formData.append('projectName', body.projectName);
}

export async function listDownPaymentsByCustomer(
  customerId: string,
): Promise<CustomerDownPaymentItem[]> {
  return http.get('', {
    url: customersMsUrl(
      `customer-down-payment/by-customer/${encodeURIComponent(customerId)}`,
    ),
    ...withCustomersMsAuth(),
  });
}

export async function createDownPayment(
  body: CreateCustomerDownPaymentBody,
  contractFile: File,
  evidenceFile?: File,
): Promise<CustomerDownPaymentItem> {
  const formData = new FormData();
  appendDownPaymentFields(formData, body);
  formData.append('contract', contractFile);
  if (evidenceFile) formData.append('evidence', evidenceFile);
  return http.postMultipart('', formData, {
    url: customersMsUrl('customer-down-payment'),
    ...withCustomersMsAuth(),
  });
}

export async function addPaymentFee(
  downPaymentId: string,
  body: CreateCustomerPaymentFeeBody,
  evidenceFile?: File,
): Promise<CustomerDownPaymentItem> {
  const formData = new FormData();
  formData.append('paymentValue', String(body.paymentValue));
  formData.append('datePayment', body.datePayment);
  if (body.receiptNumber) formData.append('receiptNumber', body.receiptNumber);
  if (body.paymentMethod) formData.append('paymentMethod', body.paymentMethod);
  if (body.notes) formData.append('notes', body.notes);
  if (evidenceFile) formData.append('evidence', evidenceFile);
  return http.postMultipart('', formData, {
    url: customersMsUrl(
      `customer-down-payment/${encodeURIComponent(downPaymentId)}/fees`,
    ),
    ...withCustomersMsAuth(),
  });
}

export async function listFeesByDownPayment(
  downPaymentId: string,
): Promise<CustomerPaymentFeeItem[]> {
  return http.get('', {
    url: customersMsUrl(
      `customer-down-payment/${encodeURIComponent(downPaymentId)}/fees`,
    ),
    ...withCustomersMsAuth(),
  });
}

export async function fetchDownPaymentContractBlob(
  downPaymentId: string,
): Promise<Blob> {
  const buffer = await http.getArrayBuffer('', {
    url: customersMsUrl(
      `customer-down-payment/${encodeURIComponent(downPaymentId)}/contract`,
    ),
    ...withCustomersMsAuth(),
  });
  return new Blob([buffer]);
}

export async function fetchFeeEvidenceBlob(feeId: string): Promise<Blob> {
  const buffer = await http.getArrayBuffer('', {
    url: customersMsUrl(
      `customer-down-payment/fees/${encodeURIComponent(feeId)}/evidence`,
    ),
    ...withCustomersMsAuth(),
  });
  return new Blob([buffer]);
}
