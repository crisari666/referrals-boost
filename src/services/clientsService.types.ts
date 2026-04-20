export type InterestProyectItem = { proyect: string; date: string };

export type CreateVendorCustomerPayload = {
  name: string;
  email: string;
  whatsapp: string;
  phone: string;
  documentType?: string;
  document?: string;
  interestProyect?: InterestProyectItem[];
  notes?: string[];
};

export type CreateCustomerPayload = {
  name: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  document: string;
};

export type Customer = {
  _id: string;
  name: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  document: string;
};

export type CustomerByCreator = {
  _id: string;
  name: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  status: number;
  userCreator: string;
  userAssigned: string | null;
  createdAt: string;
  updatedAt: string;
  customerStepId?: string | null;
};

export type ApiResponse<T> = {
  error: string | null;
  result: T;
  message: string;
};

export type CustomersByCreatorResponse = ApiResponse<CustomerByCreator[]>;

export type CustomerByIdResponse = ApiResponse<CustomerByCreator>;

export type CreationDetailPopulatedUser = {
  name?: string;
  lastName?: string;
  email?: string;
};

export type CreationDetailCustomer = {
  name: string;
  lastName?: string;
  email?: string;
  whatsapp?: string;
  phone?: string;
  document?: string;
  documentType?: string;
  interestProyect?: InterestProyectItem[];
  createdAt?: string;
  userCreator?: string;
  address?: string;
  status: number;
  customerStepId?: string;
};

export type CreationDetailNote = {
  _id: string;
  customerId: string;
  note: string;
  user: string | CreationDetailPopulatedUser;
  createdAt: string;
  updatedAt: string;
};

export type CreationDetailSituationMeta = {
  _id?: string;
  description?: string;
  title?: string;
};

export type CreationDetailLogSituation = {
  _id: string;
  user: string | CreationDetailPopulatedUser;
  customer: string;
  note: string;
  image?: string;
  confirmed: boolean;
  situation: CreationDetailSituationMeta | string;
  date: string;
  status: number;
  checked: boolean;
  dateChecked: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerCreationDetailPayload = {
  customer: CreationDetailCustomer | null;
  notes: CreationDetailNote[];
  customerLogSituations: CreationDetailLogSituation[];
};

export type CustomerCreationDetailResponse = ApiResponse<CustomerCreationDetailPayload | null>;

export type CreateCustomerResponse = ApiResponse<Customer>;

export type VendorCustomer = {
  _id: string;
  name: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  document?: string;
  documentType?: string;
};

export type CreateVendorCustomerResponse = ApiResponse<VendorCustomer>;

export type CreateCustomerLogPayload = {
  customer: string;
  note: string;
};

export type Situation = {
  _id: string;
  description: string;
};

export type CustomerLog = {
  _id: string;
  name: string;
  user: string;
  customer: string;
  note: string;
  confirmed: boolean;
  situation: Situation;
  date: string;
  status: number;
  checked: boolean;
  dateChecked: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerLogResponse = ApiResponse<CustomerLog>;

/** Customers MS create response document (mongoose shape). */
export type MsCustomerDocument = {
  _id: string;
  name: string;
  lastName?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  document?: string;
  documentType?: string;
};

/** One row in `description` when customers MS returns populated description docs. */
export type MsCustomerDescriptionEntry = {
  _id: string;
  customerId: string;
  user: string;
  date: string;
  description: string;
  __v?: number;
};

/** One row from `GET customer/mine` or `GET customer/:id` (customers MS). */
export type MsCustomerMineRow = MsCustomerDocument & {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  customerStepId?: string;
  description?: (string | MsCustomerDescriptionEntry)[];
  interestedProjects?: {
    _id?: string;
    projectId: string;
    date?: string | Date;
    addedBy?: string;
  }[];
};

/** Row from `GET customer-steps` (catalog). */
export type VendorCustomerStep = {
  id: string;
  name: string;
  description?: string;
  order: number;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateMsCustomerPayload = {
  name?: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  document?: string;
  documentType?: "cc" | "passport";
  interestedProjects?: { projectId: string; date?: string }[];
};
