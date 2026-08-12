export type ProjectStatus = 'available' | 'high-demand' | 'limited';

export type ProjectLegalDocumentId =
  | 'legalRut'
  | 'legalBusinessRegistration'
  | 'legalBankCertificate'
  | 'legalLibertarianCertificate';

export type ProjectLegalDocumentEntry = {
  id: ProjectLegalDocumentId;
  labelKey: string;
  fileName: string;
};

export type Project = {
  id: string;
  title: string;
  location: string;
  priceFrom: number;
  commission: number;
  commissionType: '%' | '$';
  lotsAvailable: number;
  totalLots: number;
  image: string;
  status: ProjectStatus;
  description: string;
  amenities: string[];
  amenitiesGroups?: { icon?: string; title: string; amenities: string[] }[];
  images?: string[];
  cardProject?: string;
  reelVideos?: string[];
  brochure?: string;
  plane?: string;
  legalDocuments?: ProjectLegalDocumentEntry[];
  /** Suggested down-payment / separation amount from RAG (editable on create). */
  separation?: number;
};
