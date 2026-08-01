// --- Customer Enums & Core Types ---
export type CustomerBusinessType = 
  | 'SUPERMARKET_CHAIN' 
  | 'WHOLESALER' 
  | 'DISTRIBUTOR' 
  | 'MEAT_PROCESSOR' 
  | 'HOTEL_CATERING';

export type PaymentTerms = 'ADVANCE_100' | 'LC_AT_SIGHT' | 'CAD' | 'DP_30_DAYS';
export type PreferredCurrency = 'USD' | 'AED' | 'SAR' | 'EUR';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Customer {
  id: string;
  company_name: string;
  customer_code: string;
  primary_country: string;
  destination_port: string;
  business_type: CustomerBusinessType;
  tax_vat_number?: string;
  sfda_registration_no?: string;
  halal_import_permit_no?: string;
  credit_limit_usd: number;
  payment_terms: PaymentTerms;
  preferred_currency: PreferredCurrency;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

// --- Customer Contacts ---
export interface CustomerContact {
  id: string;
  customer_id: string;
  contact_name: string;
  designation?: string;
  email: string;
  phone_whatsapp: string;
  is_primary: boolean;
  created_at: string;
}

// --- Customer Compliance Documents ---
export interface CustomerDocument {
  id: string;
  customer_id: string;
  document_title: string;
  document_type: string;
  file_url: string;
  issue_date?: string;
  expiry_date?: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'EXPIRED';
  created_at: string;
}

// --- CRM Pipeline & Opportunities ---
export type CRMStage = 
  | 'NEW_LEAD'
  | 'LEAD' 
  | 'QUALIFIED' 
  | 'RFQ_RECEIVED' 
  | 'QUOTATION_SENT' 
  | 'SAMPLE_SENT' 
  | 'CONTRACT_SIGNED' 
  | 'CLOSED_LOST';

export interface CRMOpportunity {
  id: string;
  customer_id?: string;
  customers?: { company_name: string; primary_country?: string }; // primary_country made optional to prevent UI errors
  title: string;
  lead_source?: string; // Made optional
  target_commodity?: string; // Made optional
  commodity?: string; // ADDED: Required for the UI Opportunity Modal
  estimated_monthly_volume_mt?: number; // Made optional
  estimated_annual_value_usd?: number; // Made optional
  estimated_value_usd?: number; // ADDED: Required for the UI Kanban Board
  stage: string; // CHANGED to string to avoid strict type mapping errors
  assigned_sales_rep_id?: string;
  expected_closing_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// --- Customer Complaints Log ---
export interface CustomerComplaint {
  id: string;
  ticket_number?: string; // Made optional
  complaint_code?: string; // ADDED: Required by UI mapping
  customer_id: string;
  customers?: { company_name: string };
  shipment_container_no?: string; // Made optional
  container_no?: string; // ADDED: Required by UI mapping
  complaint_type?: string; // Made optional
  issue_type?: string; // ADDED: Required by UI mapping
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  claim_amount_usd?: number;
  status: string; // CHANGED to string to accept 'LOGGED', 'CLAIM_APPROVED', etc. from UI without errors
  resolution_summary?: string;
  created_at: string;
  resolved_at?: string;
}

// --- API Helper Input Types ---
export type CreateCustomerInput = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;