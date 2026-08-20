// Enums & Union Types
export type QuotationStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'SENT' 
  | 'APPROVED' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export type ShippingMode = 'AIR_FREIGHT' | 'SEA_REEFER' | 'AIR' | 'SEA';

export type Incoterm = 'CIF' | 'FOB' | 'CFR' | 'EXW' | 'DDP';

// Database Entity Types
export interface Customer {
  id: string;
  name: string;
  reg_number: string | null;
  country: string;
  destination_port: string | null;
  business_category: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  export_trade_name: string | null;
  hs_code: string | null;
  category: string | null;
  origin_region: string | null;
  storage_type: string | null;
  optimal_temp_c: number | null;
  shelf_life_days: number | null;
  configuration_name: string | null;
  base_uom: string | null;
  unit_net_weight_kg: number | null;
  unit_gross_weight_kg: number | null;
  price_per_uom: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string | null;
  quantity_cartons: number;
  unit_net_weight_kg: number;
  unit_gross_weight_kg: number;
  carton_cbm: number;
  min_temp_c: number;
  max_temp_c: number;
  unit_price_pkr: number;
  created_at?: string;
  updated_at?: string;
  products?: Product | null;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string | null;
  incoterm: Incoterm;
  currency: string;
  shipping_mode: ShippingMode;
  payment_terms: string;
  spot_freight_rate_usd: number;
  insurance_cost_pkr: number;
  spot_local_charges_pkr: number;
  other_costs: number;
  other_cost_details: string | null;
  margin_percentage: number;
  total_volume_cbm: number;
  total_gross_weight_kg: number;
  grand_total_currency: number;
  status: QuotationStatus;
  created_at?: string;
  updated_at?: string;
}

// Joined Query Type (For KYQ Page & Directory Fetching)
export interface QuotationWithRelations extends Quotation {
  customers?: Customer | null;
  quotation_items?: QuotationItem[];
}

// Table Row Representation (For QuotationDirectoryClient Table)
export interface QuotationDirectoryRow {
  id: string;
  quotationNumber: string;
  customerName: string;
  productName: string;
  countryName: string;
  tempSpecs: string;
  cargoType: 'Air' | 'Sea';
  quantityDisplay: string;
  amountCurrency: number;
  currency: string;
  status: QuotationStatus | string;
}

// Multi-Tab Form Input Payload (For QuotationFormModal & POST API)
export interface QuotationFormData {
  customerId: string;
  customerName?: string;
  primaryCountry?: string;
  destinationPort?: string;
  productId: string;
  productName?: string;
  hsCode?: string;
  storageType?: string;
  optimalTempC?: number;
  shelfLifeDays?: number;
  baseUom?: string;
  unitNetWeightKg: number;
  unitGrossWeightKg: number;
  cartonCbm: number;
  totalUnits: number;
  totalCbm: number;
  totalGrossWeightKg: number;
  minTempC: number;
  maxTempC: number;
  cargoType: 'AIR' | 'SEA';
  unitOfMeasure: string;
  unitPricePkr: number;
  incoterm: Incoterm;
  spotFreightRateUsd: number;
  insuranceCostPkr: number;
  spotLocalChargesPkr: number;
  otherCosts: number;
  otherCostDetails: string;
  marginPercentage: number;
  grandTotal: number;
  currency: string;
  paymentTerms: string;
}