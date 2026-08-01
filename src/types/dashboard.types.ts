export interface ExecutiveKPIs {
      total_revenue_ytd: number;
        active_shipments_count: number;
          total_inventory_value: number;
            active_cold_storage_alerts: number;
              liquid_cash_pkr: number;
                pending_payables_pkr: number;
                }

                export interface ColdStorageLog {
                  id: string;
                    facility_name: string;
                      zone_name: string;
                        target_temp_c: number;
                          current_temp_c: number;
                            humidity_percentage: number;
                              power_status: string;
                                door_status: string;
                                  is_alert: boolean;
                                    recorded_at: string;
                                    }

                                    export interface ExportShipmentSummary {
                                      id: string;
                                        container_number: string;
                                          booking_reference: string;
                                            destination_port: string;
                                              destination_country: string;
                                                vessel_or_flight: string;
                                                  departure_date: string;
                                                    eta_date: string;
                                                      cargo_type: string;
                                                        shipment_status: 'BOOKED' | 'LOADING' | 'IN_TRANSIT' | 'CUSTOMS_CLEARANCE' | 'DELIVERED';
                                                          reefer_set_temp_c: number;
                                                          }
