-- Safaa Agro Farms ERP - Database Migration
-- Sprint 06: Product Master, Cold Chain Specs, Packaging Configurations, and Dynamic Pricing Architecture

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE product_category AS ENUM (
        'FRESH_FRUIT',
        'FRESH_VEGETABLE',
        'FRESH_MEAT',
        'FROZEN_MEAT'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE storage_temp_type AS ENUM (
        'CHILLED',
        'FROZEN',
        'AMBIENT',
        'CONTROLLED_ATMOSPHERE'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ethylene_sensitivity_level AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE incoterm_type AS ENUM (
        'FOB',
        'CIF',
        'C_AND_F',
        'EXW'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE export_currency AS ENUM (
        'USD',
        'AED',
        'SAR',
        'PKR',
        'EUR'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE image_type_enum AS ENUM (
        'MAIN',
        'SPEC_SHEET',
        'PACKAGING',
        'INSPECTION'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- TABLE: PRODUCTS (Master Product Catalog)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    trade_name VARCHAR(255) NOT NULL,
    hs_code VARCHAR(20) NOT NULL, -- Pakistan WebOC Compliant HS Code (e.g., 0804.50.20)
    category product_category NOT NULL,
    base_uom VARCHAR(20) NOT NULL DEFAULT 'KG', -- KG, TON, CARTON, CARCASS
    description TEXT,
    origin_region VARCHAR(100) NOT NULL DEFAULT 'Punjab, Pakistan',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- TABLE: PRODUCT_COLD_CHAIN_SPECS (Thermal Profile Rules)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_cold_chain_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    storage_type storage_temp_type NOT NULL DEFAULT 'CHILLED',
    min_temp_c NUMERIC(4,2) NOT NULL,
    max_temp_c NUMERIC(4,2) NOT NULL,
    optimal_temp_c NUMERIC(4,2) NOT NULL,
    min_humidity_pct NUMERIC(5,2) NOT NULL DEFAULT 85.00,
    max_humidity_pct NUMERIC(5,2) NOT NULL DEFAULT 95.00,
    ventilation_cbm_hr NUMERIC(6,2) NOT NULL DEFAULT 25.00, -- Air ventilation rate for reefers
    ethylene_sensitivity ethylene_sensitivity_level NOT NULL DEFAULT 'LOW',
    shelf_life_days INT NOT NULL,
    reefer_precooling_required BOOLEAN NOT NULL DEFAULT true,
    ca_oxygen_pct NUMERIC(4,2), -- Controlled Atmosphere Oxygen %
    ca_co2_pct NUMERIC(4,2),    -- Controlled Atmosphere CO2 %
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: PRODUCT_PACKAGING_CONFIGS (Container & Pallet Configurations)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_packaging_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    config_name VARCHAR(100) NOT NULL, -- e.g., '10kg Telescopic Corrugated Box', '4kg Super Extra Box'
    gross_weight_kg NUMERIC(8,3) NOT NULL,
    net_weight_kg NUMERIC(8,3) NOT NULL,
    tare_weight_kg NUMERIC(8,3) NOT NULL,
    box_length_cm NUMERIC(6,2) NOT NULL,
    box_width_cm NUMERIC(6,2) NOT NULL,
    box_height_cm NUMERIC(6,2) NOT NULL,
    boxes_per_pallet INT NOT NULL DEFAULT 80,
    pallets_per_40ft_reefer INT NOT NULL DEFAULT 20,
    total_net_weight_per_40ft_kg NUMERIC(10,2) GENERATED ALWAYS AS (net_weight_kg * boxes_per_pallet * pallets_per_40ft_reefer) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: PRODUCT_PRICING_TIERS (Dynamic Export Matrix)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    packaging_config_id UUID REFERENCES public.product_packaging_configs(id) ON DELETE SET NULL,
    destination_port VARCHAR(100) NOT NULL, -- e.g., 'JEBEL_ALI', 'DAMMAM', 'JEDDAH', 'KARACHI_FOB'
    incoterm incoterm_type NOT NULL DEFAULT 'CIF',
    currency export_currency NOT NULL DEFAULT 'USD',
    min_order_qty INT NOT NULL DEFAULT 1, -- In terms of 40ft Reefers or Metric Tons
    price_per_uom NUMERIC(10,2) NOT NULL,
    seasonal_surcharge_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: PRODUCT_IMAGES (Supabase Storage References)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    image_type image_type_enum NOT NULL DEFAULT 'MAIN',
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_hs_code ON public.products(hs_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_cold_chain_product_id ON public.product_cold_chain_specs(product_id);
CREATE INDEX IF NOT EXISTS idx_packaging_product_id ON public.product_packaging_configs(product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_product_dest ON public.product_pricing_tiers(product_id, destination_port);

-- -----------------------------------------------------------------------------
-- UPDATED_AT TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

CREATE TRIGGER update_cold_chain_updated_at
    BEFORE UPDATE ON public.product_cold_chain_specs
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_cold_chain_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_packaging_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Read Access: Authenticated users can view all active product master records
CREATE POLICY "Allow authenticated read products" ON public.products
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read cold_chain" ON public.product_cold_chain_specs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read packaging" ON public.product_packaging_configs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read pricing" ON public.product_pricing_tiers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read images" ON public.product_images
    FOR SELECT TO authenticated USING (true);

-- Write Access: ROLE_ADMIN, ROLE_PROC, and ROLE_WH_COLD can insert/update products
CREATE POLICY "Allow authorized roles write products" ON public.products
    FOR ALL TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ROLE_ADMIN', 'ROLE_PROC', 'ROLE_WH_COLD')
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ROLE_ADMIN', 'ROLE_PROC', 'ROLE_WH_COLD')
    );

CREATE POLICY "Allow authorized roles write cold_chain" ON public.product_cold_chain_specs
    FOR ALL TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ROLE_ADMIN', 'ROLE_PROC', 'ROLE_WH_COLD')
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ROLE_ADMIN', 'ROLE_PROC', 'ROLE_WH_COLD')
    );

CREATE POLICY "Allow authorized roles write packaging" ON public.product_packaging_configs
    FOR ALL TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ROLE_ADMIN', 'ROLE_PROC', 'ROLE_WH_COLD')
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ROLE_ADMIN', 'ROLE_PROC', 'ROLE_WH_COLD')
    );

CREATE POLICY "Allow authorized roles write pricing" ON public.product_pricing_tiers
    FOR ALL TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_FIN')
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_FIN')
    );

-- -----------------------------------------------------------------------------
-- SEED DATA: PAKISTAN B2B EXPORT PRODUCTS
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    v_prod_1 UUID := gen_random_uuid();
    v_prod_2 UUID := gen_random_uuid();
    v_prod_3 UUID := gen_random_uuid();
    v_prod_4 UUID := gen_random_uuid();
    v_pack_1 UUID := gen_random_uuid();
    v_pack_2 UUID := gen_random_uuid();
BEGIN
    -- Product 1: Fresh Chaunsa Mangoes
    INSERT INTO public.products (id, sku, name, scientific_name, trade_name, hs_code, category, base_uom, description, origin_region)
    VALUES (
        v_prod_1,
        'MNG-CHN-001',
        'Chaunsa Mangoes (Premium Export Grade)',
        'Mangifera indica',
        'Pakistani Yellow Chaunsa Mango',
        '0804.50.20',
        'FRESH_FRUIT',
        'CARTON',
        'Hand-picked, hot water treated, high-sugar export grade Chaunsa mangoes grown in Multan & Khanewal.',
        'Multan, Punjab, Pakistan'
    );

    INSERT INTO public.product_cold_chain_specs (product_id, storage_type, min_temp_c, max_temp_c, optimal_temp_c, min_humidity_pct, max_humidity_pct, ventilation_cbm_hr, ethylene_sensitivity, shelf_life_days, reefer_precooling_required, ca_oxygen_pct, ca_co2_pct)
    VALUES (
        v_prod_1,
        'CONTROLLED_ATMOSPHERE',
        12.00,
        14.00,
        13.00,
        85.00,
        90.00,
        25.00,
        'HIGH',
        21,
        true,
        4.50,
        5.00
    );

    INSERT INTO public.product_packaging_configs (id, product_id, config_name, gross_weight_kg, net_weight_kg, tare_weight_kg, box_length_cm, box_width_cm, box_height_cm, boxes_per_pallet, pallets_per_40ft_reefer)
    VALUES (
        v_pack_1,
        v_prod_1,
        '4.5kg Corrugated Export Box',
        4.850,
        4.500,
        0.350,
        40.00,
        30.00,
        12.00,
        180,
        20
    );

    INSERT INTO public.product_pricing_tiers (product_id, packaging_config_id, destination_port, incoterm, currency, min_order_qty, price_per_uom, seasonal_surcharge_pct)
    VALUES 
        (v_prod_1, v_pack_1, 'JEBEL_ALI', 'CIF', 'USD', 1, 14.50, 5.00),
        (v_prod_1, v_pack_1, 'DAMMAM', 'CIF', 'USD', 1, 15.20, 5.00),
        (v_prod_1, v_pack_1, 'KARACHI_FOB', 'FOB', 'USD', 1, 11.80, 0.00);

    -- Product 2: Kinnow Mandarins
    INSERT INTO public.products (id, sku, name, scientific_name, trade_name, hs_code, category, base_uom, description, origin_region)
    VALUES (
        v_prod_2,
        'CIT-KIN-001',
        'Kinnow Mandarins (Grade A Waxed)',
        'Citrus reticulata',
        'Fresh Pakistani Kinnow Mandarin',
        '0805.10.00',
        'FRESH_FRUIT',
        'CARTON',
        'Fungicide washed, food-grade waxed Kinnow mandarins sorted by caliper 48/54/60/72.',
        'Sargodha, Punjab, Pakistan'
    );

    INSERT INTO public.product_cold_chain_specs (product_id, storage_type, min_temp_c, max_temp_c, optimal_temp_c, min_humidity_pct, max_humidity_pct, ventilation_cbm_hr, ethylene_sensitivity, shelf_life_days, reefer_precooling_required)
    VALUES (
        v_prod_2,
        'CHILLED',
        4.00,
        6.00,
        5.00,
        85.00,
        90.00,
        15.00,
        'MEDIUM',
        45,
        true
    );

    INSERT INTO public.product_packaging_configs (id, product_id, config_name, gross_weight_kg, net_weight_kg, tare_weight_kg, box_length_cm, box_width_cm, box_height_cm, boxes_per_pallet, pallets_per_40ft_reefer)
    VALUES (
        v_pack_2,
        v_prod_2,
        '10kg Telescopic Export Box',
        10.700,
        10.000,
        0.700,
        50.00,
        30.00,
        24.00,
        80,
        20
    );

    INSERT INTO public.product_pricing_tiers (product_id, packaging_config_id, destination_port, incoterm, currency, min_order_qty, price_per_uom, seasonal_surcharge_pct)
    VALUES 
        (v_prod_2, v_pack_2, 'JEBEL_ALI', 'CIF', 'USD', 1, 9.80, 0.00),
        (v_prod_2, v_pack_2, 'JEDDAH', 'CIF', 'USD', 1, 10.40, 0.00);

    -- Product 3: Fresh Chilled Mutton Carcass
    INSERT INTO public.products (id, sku, name, scientific_name, trade_name, hs_code, category, base_uom, description, origin_region)
    VALUES (
        v_prod_3,
        'MEA-MUT-001',
        'Fresh Chilled Mutton Full Carcass',
        'Ovis aries',
        'Pakistani Chilled Goat & Sheep Meat',
        '0204.10.00',
        'FRESH_MEAT',
        'KG',
        'SFDA & Halal Certified vacuum-wrapped fresh chilled whole mutton carcasses (10kg - 14kg weight class).',
        'Kasur Slaughterhouse, Punjab, Pakistan'
    );

    INSERT INTO public.product_cold_chain_specs (product_id, storage_type, min_temp_c, max_temp_c, optimal_temp_c, min_humidity_pct, max_humidity_pct, ventilation_cbm_hr, ethylene_sensitivity, shelf_life_days, reefer_precooling_required)
    VALUES (
        v_prod_3,
        'CHILLED',
        0.00,
        2.00,
        1.00,
        85.00,
        90.00,
        0.00,
        'LOW',
        18,
        true
    );

    -- Product 4: Frozen Boneless Beef Cuts
    INSERT INTO public.products (id, sku, name, scientific_name, trade_name, hs_code, category, base_uom, description, origin_region)
    VALUES (
        v_prod_4,
        'MEA-BEEF-002',
        'Frozen Boneless Beef Compensated Quarters',
        'Bos taurus',
        'Frozen Boneless Beef Cuts',
        '0202.30.00',
        'FROZEN_MEAT',
        'KG',
        'Blast frozen at -40°C, master polybag packed boneless beef cuts for GCC wholesale food service.',
        'Lahore Plant, Punjab, Pakistan'
    );

    INSERT INTO public.product_cold_chain_specs (product_id, storage_type, min_temp_c, max_temp_c, optimal_temp_c, min_humidity_pct, max_humidity_pct, ventilation_cbm_hr, ethylene_sensitivity, shelf_life_days, reefer_precooling_required)
    VALUES (
        v_prod_4,
        'FROZEN',
        -22.00,
        -18.00,
        -20.00,
        90.00,
        95.00,
        0.00,
        'LOW',
        365,
        true
    );
END $$;