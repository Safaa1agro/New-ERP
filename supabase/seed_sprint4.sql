-- Seed Data for Customers & Export CRM Engine

INSERT INTO public.customers (
    id, company_name, customer_code, primary_country, destination_port, business_type, tax_vat_number, sfda_registration_no, halal_import_permit_no, credit_limit_usd, payment_terms, preferred_currency, status
    ) VALUES
    ('a0112233-4455-6677-8899-aabbccddeeff', 'Al-Maya International Group LLC', 'IMP-UAE-001', 'United Arab Emirates', 'Jebel Ali Port (Dubai)', 'SUPERMARKET_CHAIN', 'TRN-1002930491000', 'SFDA-AE-99201', 'HALAL-UAE-2026-88', 250000.00, 'CAD', 'USD', 'ACTIVE'),
    ('b0112233-4455-6677-8899-aabbccddeeff', 'Lulu Hypermarket KSA Co.', 'IMP-SAU-002', 'Saudi Arabia', 'Jeddah Islamic Port', 'SUPERMARKET_CHAIN', 'VAT-3100293019003', 'SFDA-KSA-771029', 'HALAL-KSA-99201', 500000.00, 'LC_AT_SIGHT', 'SAR', 'ACTIVE'),
    ('c0112233-4455-6677-8899-aabbccddeeff', 'Qatar National Catering Company', 'IMP-QAT-003', 'Qatar', 'Hamad Port (Doha)', 'HOTEL_CATERING', 'QID-90028301', 'SFDA-NOT-REQ', 'HALAL-QAT-33102', 100000.00, 'ADVANCE_100', 'USD', 'ACTIVE');

    INSERT INTO public.customer_contacts (
        customer_id, contact_name, designation, email, phone_whatsapp, is_primary
        ) VALUES
        ('a0112233-4455-6677-8899-aabbccddeeff', 'Tariq Al-Mansoor', 'Head of Fresh Import Procurement', 'tariq.m@almaya.ae', '+971-50-9928102', true),
        ('b0112233-4455-6677-8899-aabbccddeeff', 'Sultan Bin Fahad', 'Category Manager Meat & Poultry', 's.fahad@luluhypermarkets.sa', '+966-55-1102938', true),
        ('c0112233-4455-6677-8899-aabbccddeeff', 'Rashid Al-Kuwari', 'Supply Chain Director', 'r.kuwari@qatar-catering.qa', '+974-66-882019', true);

        INSERT INTO public.crm_opportunities (
            customer_id, title, lead_source, target_commodity, estimated_monthly_volume_mt, estimated_annual_value_usd, stage, expected_closing_date, notes
            ) VALUES
            ('a0112233-4455-6677-8899-aabbccddeeff', 'Weekly Air-Freight Chilled Mutton Supply - Dubai', 'GULF_FOOD_EXPO', 'Fresh Meat', 12.50, 650000.00, 'QUOTATION_SENT', '2026-08-15', 'Client requires 2 flights per week via Pakistan International Airlines / FlyDubai.'),
            ('b0112233-4455-6677-8899-aabbccddeeff', 'Chaunsa Mangoes Sea Reefer Contract - Jeddah', 'EXHIBITION', 'Mangoes', 40.00, 320000.00, 'CONTRACT_SIGNED', '2026-08-01', 'SFDA reefer temperature verification mandatory at +13°C.');

            INSERT INTO public.customer_complaints (
                ticket_number, customer_id, shipment_container_no, complaint_type, severity, description, claim_amount_usd, status
                ) VALUES
                ('CMP-2026-001', 'a0112233-4455-6677-8899-aabbccddeeff', 'HLXU-882910-4', 'TEMPERATURE_ABUSE', 'MEDIUM', '2 cartons of chilled mutton showed surface discoloration due to delay at Dubai airport customs clearing bay.', 1250.00, 'UNDER_INVESTIGATION');