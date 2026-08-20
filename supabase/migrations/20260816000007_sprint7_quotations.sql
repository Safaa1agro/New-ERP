-- Enable Extension for UUID Generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOMERS TABLE (Guarantees foreign key target existence)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    reg_number TEXT,
    country TEXT NOT NULL DEFAULT 'Pakistan',
    destination_port TEXT,
    business_category TEXT DEFAULT 'Wholesale Importer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE (Guarantees foreign key target existence)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    export_trade_name TEXT,
    hs_code TEXT,
    category TEXT,
    origin_region TEXT DEFAULT 'Punjab, Pakistan',
    storage_type TEXT DEFAULT 'Chilled Cold Chain',
    optimal_temp_c NUMERIC(4, 1) DEFAULT 2.0,
    shelf_life_days INT DEFAULT 30,
    configuration_name TEXT,
    base_uom TEXT DEFAULT 'Carton',
    unit_net_weight_kg NUMERIC(10, 2) DEFAULT 0.00,
    unit_gross_weight_kg NUMERIC(10, 2) DEFAULT 0.00,
    price_per_uom NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MAIN QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    incoterm TEXT NOT NULL DEFAULT 'CIF',
    currency TEXT NOT NULL DEFAULT 'USD',
    shipping_mode TEXT NOT NULL DEFAULT 'AIR_FREIGHT',
    payment_terms TEXT DEFAULT '100% Advance TT',
    
    -- Commercial & Financial Fields
    spot_freight_rate_usd NUMERIC(12, 2) DEFAULT 0.00,
    insurance_cost_pkr NUMERIC(12, 2) DEFAULT 0.00,
    spot_local_charges_pkr NUMERIC(12, 2) DEFAULT 0.00,
    other_costs NUMERIC(12, 2) DEFAULT 0.00,
    other_cost_details TEXT,
    margin_percentage NUMERIC(5, 2) DEFAULT 10.00,
    
    -- Calculated Totals
    total_volume_cbm NUMERIC(10, 3) DEFAULT 0.000,
    total_gross_weight_kg NUMERIC(10, 2) DEFAULT 0.00,
    grand_total_currency NUMERIC(14, 2) DEFAULT 0.00,
    
    -- Status Workflow
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (
      status IN ('DRAFT', 'PENDING', 'SENT', 'APPROVED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUOTATION LINE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity_cartons INT DEFAULT 0,
    unit_net_weight_kg NUMERIC(8, 2) DEFAULT 0.00,
    unit_gross_weight_kg NUMERIC(8, 2) DEFAULT 0.00,
    carton_cbm NUMERIC(8, 4) DEFAULT 0.0000,
    min_temp_c NUMERIC(4, 1) DEFAULT 0.0,
    max_temp_c NUMERIC(4, 1) DEFAULT 2.0,
    unit_price_pkr NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_quotation_number ON public.quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON public.quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON public.quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_product_id ON public.quotation_items(product_id);

-- 6. AUTOMATED TIMESTAMP UPDATE TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_quotations_updated_at ON public.quotations;
CREATE TRIGGER trigger_update_quotations_updated_at
    BEFORE UPDATE ON public.quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_quotation_items_updated_at ON public.quotation_items;
CREATE TRIGGER trigger_update_quotation_items_updated_at
    BEFORE UPDATE ON public.quotation_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Full CRUD Access for Authenticated Users / Service Role
CREATE POLICY "Allow authenticated read quotations" ON public.quotations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert quotations" ON public.quotations
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update quotations" ON public.quotations
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete quotations" ON public.quotations
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read quotation_items" ON public.quotation_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert quotation_items" ON public.quotation_items
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update quotation_items" ON public.quotation_items
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete quotation_items" ON public.quotation_items
    FOR DELETE TO authenticated USING (true);