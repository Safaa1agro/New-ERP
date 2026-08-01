-- Safaa Agro Farms ERP - Sprint 4 Database Schema (Customer Master & Export CRM)

-- 1. Customer Master Table (Importers & Global B2B Buyers)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    customer_code TEXT NOT NULL UNIQUE, -- e.g. IMP-UAE-001
    primary_country TEXT NOT NULL,
    destination_port TEXT NOT NULL,
    business_type TEXT NOT NULL DEFAULT 'DISTRIBUTOR', -- 'SUPERMARKET_CHAIN', 'WHOLESALER', 'DISTRIBUTOR', 'MEAT_PROCESSOR', 'HOTEL_CATERING'
    tax_vat_number TEXT,
    sfda_registration_no TEXT, -- Mandatory for Saudi Arabia imports
    halal_import_permit_no TEXT,
    credit_limit_usd NUMERIC(12, 2) DEFAULT 0.00,
    payment_terms TEXT NOT NULL DEFAULT 'ADVANCE_100', -- 'ADVANCE_100', 'LC_AT_SIGHT', 'CAD', 'DP_30_DAYS'
    preferred_currency TEXT NOT NULL DEFAULT 'USD', -- 'USD', 'AED', 'SAR', 'EUR'
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'BLOCKED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Customer Contact Directory
CREATE TABLE public.customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    designation TEXT,
    email TEXT NOT NULL,
    phone_whatsapp TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Customer Compliance & Statutory Documents Repository
CREATE TABLE public.customer_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    document_title TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'IMPORT_LICENSE', 'SFDA_CERTIFICATE', 'TAX_REGISTRATION', 'PASSPORT_COPY', 'COMMERCIAL_REGISTRATION'
    file_url TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED', -- 'PENDING', 'VERIFIED', 'EXPIRED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Export CRM - Leads & Pipeline Opportunities
CREATE TABLE public.crm_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    lead_source TEXT NOT NULL DEFAULT 'GULF_FOOD_EXPO', -- 'EXHIBITION', 'WEBSITE', 'DIRECT_REFERRAL', 'TRADE_AGENT'
    target_commodity TEXT NOT NULL, -- 'Fresh Meat', 'Mangoes', 'Citrus Kinnow', 'Frozen Meat'
    estimated_monthly_volume_mt NUMERIC(8, 2) DEFAULT 0.00,
    estimated_annual_value_usd NUMERIC(12, 2) DEFAULT 0.00,
    stage TEXT NOT NULL DEFAULT 'LEAD', -- 'LEAD', 'QUALIFIED', 'RFQ_RECEIVED', 'QUOTATION_SENT', 'SAMPLE_SENT', 'CONTRACT_SIGNED', 'CLOSED_LOST'
    assigned_sales_rep_id UUID REFERENCES public.user_profiles(id),
    expected_closing_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Customer Communications Log
CREATE TABLE public.customer_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'WHATSAPP', -- 'EMAIL', 'WHATSAPP', 'CALL', 'IN_PERSON'
    subject TEXT NOT NULL,
    summary TEXT NOT NULL,
    logged_by UUID NOT NULL REFERENCES public.user_profiles(id),
    communication_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Customer Complaints & Non-Conformance Log
CREATE TABLE public.customer_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE, -- e.g. CMP-2026-001
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    shipment_container_no TEXT,
    complaint_type TEXT NOT NULL, -- 'TEMPERATURE_ABUSE', 'WEIGHT_SHORTAGE', 'PACKAGING_DAMAGE', 'QUALITY_DETERIORATION', 'CUSTOMS_DELAY'
    severity TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    description TEXT NOT NULL,
    claim_amount_usd NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'UNDER_INVESTIGATION', 'RESOLVED_REIMBURSED', 'REJECTED'
    resolution_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_opportunities_updated_at
    BEFORE UPDATE ON public.crm_opportunities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_customers_country ON public.customers(primary_country);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_crm_opportunities_stage ON public.crm_opportunities(stage);
CREATE INDEX idx_customer_complaints_status ON public.customer_complaints(status);

-- Foreign Key Indexes for faster relational joins
CREATE INDEX idx_customer_contacts_customer_id ON public.customer_contacts(customer_id);
CREATE INDEX idx_customer_documents_customer_id ON public.customer_documents(customer_id);
CREATE INDEX idx_crm_opportunities_customer_id ON public.crm_opportunities(customer_id);
CREATE INDEX idx_crm_opportunities_sales_rep ON public.crm_opportunities(assigned_sales_rep_id);
CREATE INDEX idx_customer_communications_customer_id ON public.customer_communications(customer_id);
CREATE INDEX idx_customer_complaints_customer_id ON public.customer_complaints(customer_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_complaints ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- 1. Customers Policies
CREATE POLICY "Authenticated users can read customers" 
    ON public.customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sales, Finance, Docs, and Admin can manage customers" 
    ON public.customers FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_FIN', 'ROLE_DOCS')
        )
    );

-- 2. Customer Contacts Policies
CREATE POLICY "Authenticated users can read customer contacts" 
    ON public.customer_contacts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sales and Admin can manage contacts" 
    ON public.customer_contacts FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('ROLE_ADMIN', 'ROLE_SALES')
        )
    );

-- 3. Customer Documents Policies
CREATE POLICY "Authenticated users can read documents" 
    ON public.customer_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sales, Docs, and Admin can manage documents" 
    ON public.customer_documents FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_DOCS')
        )
    );

-- 4. CRM Opportunities Policies
CREATE POLICY "Authenticated users can read CRM opportunities" 
    ON public.crm_opportunities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sales and Admin can manage CRM opportunities" 
    ON public.crm_opportunities FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('ROLE_ADMIN', 'ROLE_SALES')
        )
    );

-- 5. Customer Communications Policies
CREATE POLICY "Authenticated users can read customer communications" 
    ON public.customer_communications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sales and Admin can manage customer communications" 
    ON public.customer_communications FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('ROLE_ADMIN', 'ROLE_SALES')
        )
    );

-- 6. Customer Complaints Policies
CREATE POLICY "Authenticated users can read customer complaints" 
    ON public.customer_complaints FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sales, Quality Control, and Admin can manage customer complaints" 
    ON public.customer_complaints FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_QC')
        )
    );
    