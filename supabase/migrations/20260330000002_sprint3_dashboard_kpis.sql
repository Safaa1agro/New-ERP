-- Safaa Agro Farms ERP - Sprint 3 Database Schema (Dashboard & Operational KPI Aggregations)

-- Operational Cold Storage Real-Time Log Table
CREATE TABLE public.cold_storage_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_name TEXT NOT NULL,
            zone_name TEXT NOT NULL,
                target_temp_c NUMERIC(4, 2) NOT NULL,
                    current_temp_c NUMERIC(4, 2) NOT NULL,
                        humidity_percentage NUMERIC(5, 2) NOT NULL,
                            power_status TEXT NOT NULL DEFAULT 'GRID_POWER',
                                door_status TEXT NOT NULL DEFAULT 'CLOSED',
                                    is_alert BOOLEAN NOT NULL DEFAULT false,
                                        recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                                        );

                                        -- Operational Shipments Real-Time Tracker Table
                                        CREATE TABLE public.export_shipments_summary (
                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                container_number TEXT NOT NULL UNIQUE,
                                                    booking_reference TEXT NOT NULL,
                                                        destination_port TEXT NOT NULL,
                                                            destination_country TEXT NOT NULL,
                                                                vessel_or_flight TEXT NOT NULL,
                                                                    departure_date DATE NOT NULL,
                                                                        eta_date DATE NOT NULL,
                                                                            cargo_type TEXT NOT NULL, -- e.g., 'Fresh Mangoes (Chilled)', 'Frozen Boneless Beef'
                                                                                shipment_status TEXT NOT NULL DEFAULT 'IN_TRANSIT', -- 'BOOKED', 'LOADING', 'IN_TRANSIT', 'CUSTOMS_CLEARANCE', 'DELIVERED'
                                                                                    reefer_set_temp_c NUMERIC(4, 2) NOT NULL,
                                                                                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                                                                                        );

                                                                                        -- Live Aggregate View for Executive Dashboard KPIs
                                                                                        CREATE OR REPLACE VIEW public.vw_dashboard_kpis AS
                                                                                        SELECT
                                                                                            (SELECT COALESCE(SUM(yearly_profit_loss), 0) FROM public.company_profile) AS total_revenue_ytd,
                                                                                                (SELECT COALESCE(COUNT(*), 0) FROM public.export_shipments_summary WHERE shipment_status IN ('BOOKED', 'LOADING', 'IN_TRANSIT')) AS active_shipments_count,
                                                                                                    (SELECT COALESCE(SUM(valuation), 0) FROM public.company_assets WHERE category IN ('WAREHOUSE', 'COLD_STORAGE')) AS total_inventory_value,
                                                                                                        (SELECT COALESCE(COUNT(*), 0) FROM public.cold_storage_monitoring WHERE is_alert = true) AS active_cold_storage_alerts,
                                                                                                            (SELECT COALESCE(SUM(current_balance), 0) FROM public.company_bank_accounts) AS liquid_cash_pkr,
                                                                                                                (SELECT COALESCE(SUM(amount), 0) FROM public.company_liabilities WHERE status = 'PENDING') AS pending_payables_pkr;

                                                                                                                -- Indexes for Dashboard Analytics Processing
                                                                                                                CREATE INDEX idx_cold_storage_alerts ON public.cold_storage_monitoring(is_alert);
                                                                                                                CREATE INDEX idx_export_shipments_status ON public.export_shipments_summary(shipment_status);

                                                                                                                -- Row Level Security
                                                                                                                ALTER TABLE public.cold_storage_monitoring ENABLE ROW LEVEL SECURITY;
                                                                                                                ALTER TABLE public.export_shipments_summary ENABLE ROW LEVEL SECURITY;

                                                                                                                CREATE POLICY "Authenticated users can view cold storage logs"
                                                                                                                    ON public.cold_storage_monitoring FOR SELECT TO authenticated USING (true);

                                                                                                                    CREATE POLICY "Authenticated users can view shipment summaries"
                                                                                                                        ON public.export_shipments_summary FOR SELECT TO authenticated USING (true);

                                                                                                                        CREATE POLICY "Cold Storage Operator and Admin can manage logs"
                                                                                                                            ON public.cold_storage_monitoring FOR ALL
                                                                                                                                USING (
                                                                                                                                        EXISTS (
                                                                                                                                                    SELECT 1 FROM public.user_profiles
                                                                                                                                                                WHERE id = auth.uid() AND role IN ('ROLE_ADMIN', 'ROLE_WH_COLD')
                                                                                                                                                                        )
                                                                                                                                                                            );

                                                                                                                                                                            CREATE POLICY "Docs and Logistics can manage shipments"
                                                                                                                                                                                ON public.export_shipments_summary FOR ALL
                                                                                                                                                                                    USING (
                                                                                                                                                                                            EXISTS (
                                                                                                                                                                                                        SELECT 1 FROM public.user_profiles
                                                                                                                                                                                                                    WHERE id = auth.uid() AND role IN ('ROLE_ADMIN', 'ROLE_DOCS', 'ROLE_SALES')
                                                                                                                                                                                                                            )
                                                                                                                                                                                                                                );