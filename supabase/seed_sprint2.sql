-- Seed Data for Safaa Agro Farms (Pvt.) Ltd. Core Profile & Initial Credentials

INSERT INTO public.company_profile (
    id, company_name, logo_url, website, primary_email, primary_phone, address, 
        financial_year_start, financial_year_end, total_tax_paid, yearly_budget, 
            yearly_profit_loss, total_products, total_warehouses, total_cold_storages, total_vehicles
            ) VALUES (
                'c0000000-0000-0000-0000-000000000001',
                    'Safaa Agro Farms (Pvt.) Ltd.',
                        'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=150',
                            'https://www.safaaagro.com',
                                'export@safaaagro.com',
                                    '+92 42 35780000',
                                        'Plot 45-B, Industrial Zone, Raiwind Road, Lahore, Punjab, Pakistan',
                                            '2025-07-01',
                                                '2026-06-30',
                                                    4500000.00,
                                                        120000000.00,
                                                            18500000.00,
                                                                24,
                                                                    3,
                                                                        2,
                                                                            8
                                                                            ) ON CONFLICT (id) DO NOTHING;

                                                                            -- Initial Mandatory Statutory Export Registrations
                                                                            INSERT INTO public.company_registrations (
                                                                                company_id, registration_type, registration_number, issuing_authority, issue_date, expiry_date
                                                                                ) VALUES 
                                                                                ('c0000000-0000-0000-0000-000000000001', 'NTN', '7482910-3', 'Federal Board of Revenue (FBR)', '2020-01-15', '2027-12-31'),
                                                                                ('c0000000-0000-0000-0000-000000000001', 'SALES_TAX', '3277876112984', 'FBR Sales Tax Department', '2020-02-01', '2027-12-31'),
                                                                                ('c0000000-0000-0000-0000-000000000001', 'WEBOC', 'WEBOC-PK-884920', 'Pakistan Customs', '2020-03-10', '2026-12-31'),
                                                                                ('c0000000-0000-0000-0000-000000000001', 'CHAMBER_OF_COMMERCE', 'LCCI-2025-9921', 'Lahore Chamber of Commerce & Industry', '2025-04-01', '2026-03-31'),
                                                                                ('c0000000-0000-0000-0000-000000000001', 'TDAP', 'TDAP-EXP-2024-0012', 'Trade Development Authority of Pakistan', '2024-01-01', '2026-08-15'),
                                                                                ('c0000000-0000-0000-0000-000000000001', 'HALAL', 'HALAL-PK-99120', 'Pakistan Halal Authority', '2025-05-10', '2026-05-09'),
                                                                                ('c0000000-0000-0000-0000-000000000001', 'PHYTOSANITARY', 'DPPO-PHYTO-2026-44', 'Department of Plant Protection', '2026-01-01', '2026-12-31'),
                                                                                ('c0000000-0000-0000-0000-000000000001', 'ANIMAL_QUARANTINE_DEPARTMENT', 'AQD-MEAT-PK-331', 'Animal Quarantine Department Govt of Pakistan', '2025-09-01', '2026-08-31');

                                                                                -- Company Bank Accounts
                                                                                INSERT INTO public.company_bank_accounts (
                                                                                    company_id, bank_name, account_title, account_number, iban, swift_code, current_balance, currency
                                                                                    ) VALUES
                                                                                    ('c0000000-0000-0000-0000-000000000001', 'Meezan Bank Limited', 'Safaa Agro Farms Export Account', '01020304050607', 'PK36MEZN0001020304050607', 'MEZNPKKA', 42500000.00, 'PKR'),
                                                                                    ('c0000000-0000-0000-0000-000000000001', 'Habib Bank Limited (HBL)', 'Safaa Agro Foreign Currency USD', '99887766554433', 'PK92HABB0099887766554433', 'HABBPKKA', 185000.00, 'USD');

                                                                                    -- Seed Assets
                                                                                    INSERT INTO public.company_assets (
                                                                                        company_id, asset_name, category, valuation, acquisition_date, location
                                                                                        ) VALUES
                                                                                        ('c0000000-0000-0000-0000-000000000001', 'Raiwind Cold Storage Unit 1 & 2', 'COLD_STORAGE', 65000000.00, '2021-06-15', 'Lahore'),
                                                                                        ('c0000000-0000-0000-0000-000000000001', 'Isuzu Multi-Temperature Reefer Trucks (x4)', 'VEHICLE', 32000000.00, '2022-03-20', 'Lahore Fleet Yard');

                                                                                        -- Seed Investments
                                                                                        INSERT INTO public.company_investments (
                                                                                            company_id, investor_name, investment_amount, investment_date, equity_percentage, description
                                                                                            ) VALUES
                                                                                            ('c0000000-0000-0000-0000-000000000001', 'Safaa Holding Group', 80000000.00, '2020-01-10', 70.00, 'Initial Core Equity Funding'),
                                                                                            ('c0000000-0000-0000-0000-000000000001', 'Agri-Tech Growth Partners', 30000000.00, '2022-11-05', 30.00, 'Cold Chain Infrastructure Expansion');

                                                                                            -- Seed Liabilities
                                                                                            INSERT INTO public.company_liabilities (
                                                                                                company_id, lender_or_creditor, amount, due_date, status, description
                                                                                                ) VALUES
                                                                                                ('c0000000-0000-0000-0000-000000000001', 'Meezan Bank SBP Export Refinance', 15000000.00, '2026-11-30', 'PENDING', 'Low Interest Export Financing Facility');