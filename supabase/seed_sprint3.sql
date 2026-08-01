-- Seed Data for Cold Storage Real-Time Status & Export Shipments Tracker

INSERT INTO public.cold_storage_monitoring (
    facility_name, zone_name, target_temp_c, current_temp_c, humidity_percentage, power_status, door_status, is_alert
    ) VALUES
    ('Raiwind Processing Hub', 'Chilled Meat Room 1', 1.00, 1.20, 85.50, 'GRID_POWER', 'CLOSED', false),
    ('Raiwind Processing Hub', 'Deep Freeze Room 2 (Beef)', -18.00, -17.50, 90.00, 'GRID_POWER', 'CLOSED', false),
    ('Raiwind Processing Hub', 'Mango Ripening Chamber A', 13.00, 15.80, 78.00, 'GENSET_BACKUP', 'OPEN', true),
    ('Karachi Port Terminal Yard', 'Reefer Holding Unit 4', 2.00, 2.10, 82.00, 'GRID_POWER', 'CLOSED', false);

    INSERT INTO public.export_shipments_summary (
        container_number, booking_reference, destination_port, destination_country, vessel_or_flight, departure_date, eta_date, cargo_type, shipment_status, reefer_set_temp_c
        ) VALUES
        ('HLXU-882910-4', 'BKG-2026-9901', 'Jebel Ali Port (Dubai)', 'United Arab Emirates', 'Maersk Seletar V-204', '2026-07-25', '2026-08-01', 'Fresh Chilled Mutton Carcasses', 'IN_TRANSIT', 1.00),
        ('TLLU-441029-0', 'BKG-2026-9905', 'Jeddah Islamic Port', 'Saudi Arabia', 'CMA CGM Titan', '2026-07-27', '2026-08-04', 'Fresh Chaunsa Mangoes', 'IN_TRANSIT', 13.00),
        ('SUDU-110293-8', 'BKG-2026-9912', 'Hamad Port (Doha)', 'Qatar', 'Qatar Airways Freight QR-8701', '2026-07-29', '2026-07-30', 'Prime Cut Chilled Beef', 'LOADING', 0.50),
        ('MSKU-339201-1', 'BKG-2026-8810', 'Port Muscat', 'Oman', 'Ever Given V-102', '2026-07-20', '2026-07-26', 'Frozen Boneless Meat', 'DELIVERED', -18.00);