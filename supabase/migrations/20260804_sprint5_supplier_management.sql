-- Migration: Sprint 5 - Supplier Management & Agri-Procurement Engine
-- Company: Safaa Agro Farms (Pvt.) Ltd.

-- 1. ENUMS FOR SUPPLIER TYPES & STATUSES
CREATE TYPE supplier_type_enum AS ENUM (
  'GENERAL', 'FARMER', 'LIVESTOCK', 'PRODUCE', 'CONTRACT_GROWER'
);

CREATE TYPE supplier_status_enum AS ENUM (
  'OUTREACH', 'UNDER_KYC', 'COMPLIANCE_PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED'
);

CREATE TYPE sample_status_enum AS ENUM (
  'DISPATCHED', 'COLLECTED', 'UNDER_TESTING', 'APPROVED', 'REJECTED'
);

-- 2. MAIN SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code VARCHAR(30) UNIQUE NOT NULL,
  company_or_farm_name VARCHAR(255) NOT NULL,
  supplier_type supplier_type_enum NOT NULL,
  cnic_or_tax_id VARCHAR(100),
  primary_contact_name VARCHAR(150),
  primary_phone VARCHAR(50),
  email VARCHAR(150),
  city_region VARCHAR(100) NOT NULL,
  address_location TEXT,
  
  -- Readiness & Compliance
  status supplier_status_enum DEFAULT 'UNDER_KYC',
  is_trade_ready BOOLEAN DEFAULT FALSE,
  compliance_cleared BOOLEAN DEFAULT FALSE,
  internal_compliance_ref VARCHAR(100),
  rating NUMERIC(2,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  
  -- Commercial Terms
  default_payment_terms VARCHAR(100),
  bank_account_details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUPPLIER CONTACTS TABLE
CREATE TABLE IF NOT EXISTS supplier_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  contact_name VARCHAR(150) NOT NULL,
  designation VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(150),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUPPLIER REGISTERED & APPROVED PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  unit_of_measure VARCHAR(20) DEFAULT 'KG',
  approval_status VARCHAR(50) DEFAULT 'UNDER_COMPLIANCE',
  approved_by_safaa BOOLEAN DEFAULT FALSE,
  unit_price_estimate NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SAMPLE DISPATCH & COLLECTION TRACKING TABLE
CREATE TABLE IF NOT EXISTS supplier_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_code VARCHAR(30) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL,
  weight_or_quantity VARCHAR(50) NOT NULL,
  dispatched_date DATE,
  collected_by VARCHAR(150),
  collection_date DATE,
  status sample_status_enum DEFAULT 'DISPATCHED',
  quality_report_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(30) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  order_date DATE DEFAULT CURRENT_DATE,
  total_amount_usd NUMERIC(12,2) DEFAULT 0.00,
  order_status VARCHAR(50) DEFAULT 'DRAFT',
  payment_status VARCHAR(50) DEFAULT 'UNPAID',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUPPLIER PAYMENT HISTORY TABLE
CREATE TABLE IF NOT EXISTS supplier_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_ref VARCHAR(30) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  amount_paid NUMERIC(12,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50) DEFAULT 'BANK_TRANSFER',
  transaction_receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DOCUMENTS & KYC COMPLIANCE TABLE
CREATE TABLE IF NOT EXISTS supplier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  document_name VARCHAR(200) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  expiry_date DATE,
  is_expired BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMPLAINTS & NON-CONFORMANCE TICKETS TABLE
CREATE TABLE IF NOT EXISTS supplier_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(30) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  issue_title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  safaa_complaint_date DATE DEFAULT CURRENT_DATE,
  supplier_response TEXT,
  supplier_response_date DATE,
  status VARCHAR(50) DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEQUENCES FOR AUTO-GENERATED CODES
CREATE SEQUENCE IF NOT EXISTS supplier_code_gen_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS sample_code_seq START 8000;
CREATE SEQUENCE IF NOT EXISTS po_code_seq START 3000;
CREATE SEQUENCE IF NOT EXISTS payment_code_seq START 4000;
CREATE SEQUENCE IF NOT EXISTS complaint_code_seq START 100;

-- TRIGGER FUNCTION FOR SUPPLIER CODE GENERATION
CREATE OR REPLACE FUNCTION generate_supplier_code()
RETURNS TRIGGER AS $$
DECLARE
  type_prefix VARCHAR(10);
  next_val INT;
BEGIN
  IF NEW.supplier_code IS NULL OR NEW.supplier_code = '' THEN
    CASE NEW.supplier_type
      WHEN 'LIVESTOCK' THEN type_prefix := 'LVS';
      WHEN 'FARMER' THEN type_prefix := 'FAR';
      WHEN 'PRODUCE' THEN type_prefix := 'PRD';
      WHEN 'CONTRACT_GROWER' THEN type_prefix := 'CTR';
      ELSE type_prefix := 'GEN';
    END CASE;
    next_val := nextval('supplier_code_gen_seq');
    NEW.supplier_code := 'SAF-SUP-' || type_prefix || '-' || next_val::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_supplier_code
BEFORE INSERT ON suppliers
FOR EACH ROW EXECUTE FUNCTION generate_supplier_code();

-- AUTO UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INDEXES FOR OPTIMIZED QUERYING
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier_id ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_samples_supplier_id ON supplier_samples(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier_id ON supplier_payments(supplier_id);

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update suppliers" ON suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete suppliers" ON suppliers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read contacts" ON supplier_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert contacts" ON supplier_contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update contacts" ON supplier_contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete contacts" ON supplier_contacts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read products" ON supplier_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert products" ON supplier_products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update products" ON supplier_products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read samples" ON supplier_samples FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert samples" ON supplier_samples FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update samples" ON supplier_samples FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read purchase_orders" ON purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert purchase_orders" ON purchase_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update purchase_orders" ON purchase_orders FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read payments" ON supplier_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert payments" ON supplier_payments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read documents" ON supplier_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert documents" ON supplier_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update documents" ON supplier_documents FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read complaints" ON supplier_complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert complaints" ON supplier_complaints FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update complaints" ON supplier_complaints FOR UPDATE TO authenticated USING (true);