export type SupplierType = 'GENERAL' | 'FARMER' | 'LIVESTOCK' | 'PRODUCE' | 'CONTRACT_GROWER';

export type SupplierStatus = 'OUTREACH' | 'UNDER_KYC' | 'COMPLIANCE_PENDING' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export type SampleStatus = 'DISPATCHED' | 'COLLECTED' | 'UNDER_TESTING' | 'APPROVED' | 'REJECTED';

export interface BankAccountDetails {
  bank_name?: string;
  account_title?: string;
  account_number?: string;
  iban?: string;
  swift_code?: string;
}

export interface Supplier {
  id: string;
  supplier_code: string;
  company_or_farm_name: string;
  supplier_type: SupplierType;
  cnic_or_tax_id?: string;
  primary_contact_name?: string;
  primary_phone?: string;
  email?: string;
  city_region: string;
  address_location?: string;
  status: SupplierStatus;
  is_trade_ready: boolean;
  compliance_cleared: boolean;
  internal_compliance_ref?: string;
  rating: number;
  default_payment_terms?: string;
  bank_account_details?: BankAccountDetails;
  created_at: string;
  updated_at: string;
  // Computed aggregations
  products_count?: number;
  approved_products_count?: number;
}

export interface SupplierContact {
  id: string;
  supplier_id: string;
  contact_name: string;
  designation?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
  created_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_name: string;
  category?: string;
  unit_of_measure: string;
  approval_status: 'UNDER_COMPLIANCE' | 'APPROVED' | 'REJECTED';
  approved_by_safaa: boolean;
  unit_price_estimate: number;
  created_at: string;
}

export interface SupplierSample {
  id: string;
  sample_code: string;
  supplier_id: string;
  item_type: string;
  weight_or_quantity: string;
  dispatched_date?: string;
  collected_by?: string;
  collection_date?: string;
  status: SampleStatus;
  quality_report_notes?: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  order_date: string;
  total_amount_usd: number;
  order_status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  payment_status: 'UNPAID' | 'PARTIAL' | 'PAID';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierPayment {
  id: string;
  payment_ref: string;
  supplier_id: string;
  po_id?: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  transaction_receipt_url?: string;
  created_at: string;
}

export interface SupplierDocument {
  id: string;
  supplier_id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  expiry_date?: string;
  is_expired: boolean;
  uploaded_at: string;
}

export interface SupplierComplaint {
  id: string;
  ticket_number: string;
  supplier_id: string;
  issue_title: string;
  description: string;
  safaa_complaint_date: string;
  supplier_response?: string;
  supplier_response_date?: string;
  status: 'OPEN' | 'WAITING_RESPONSE' | 'RESOLVED' | 'CLOSED';
  created_at: string;
}

export interface SupplierKpiSummary {
  total_vendors: number;
  active_vendors: number;
  inactive_vendors: number;
  blocked_vendors: number;
  farmers_count: number;
  livestock_count: number;
  produce_count: number;
  contract_growers_count: number;
  kyc_pending_count: number;
  total_procurement_usd: number;
  compliance_cleared_count: number;
}

export interface SupplierFilterState {
  search: string;
  category: 'ALL' | SupplierType;
  status: 'ALL' | SupplierStatus;
}