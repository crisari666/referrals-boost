import { get, getArrayBuffer, postMultipart } from '@/lib/http';

export interface AgentContractSignPayload {
  userId: string;
  signed: boolean;
  pdfLink: string;
  signedPdfLink?: string;
  fullName: string;
  documentNumber: string;
  city: string;
  email: string;
  phone: string;
}

export interface MarkSignedDocumentResponse {
  signed: true;
  signedAt: string;
  signedPdfFileId?: string;
  signedPdfLink?: string;
}

export function drivePdfLinkToPreviewUrl(pdfLink: string): string {
  return pdfLink.replace(/\/view(?=\?|#|$)/i, '/preview');
}

export function getAgentContractSignQueryParam(): string {
  return (
    import.meta.env.VITE_CONTRACT_SIGN_QUERY_PARAM?.trim() || 'contractSign'
  );
}

export function getAgentContractByToken(token: string) {
  return get<AgentContractSignPayload>(
    `/agent-contract-sign/by-token/${encodeURIComponent(token)}`
  );
}

export function getContractPdfArrayBuffer(token: string) {
  return getArrayBuffer(
    `/agent-contract-sign/by-token/${encodeURIComponent(token)}/pdf`
  );
}

export function postSignedContractPdf(token: string, pdfBlob: Blob) {
  const fd = new FormData();
  fd.append('file', pdfBlob, 'signed-contract.pdf');
  return postMultipart<MarkSignedDocumentResponse>(
    `/agent-contract-sign/by-token/${encodeURIComponent(token)}/signed-document`,
    fd
  );
}
