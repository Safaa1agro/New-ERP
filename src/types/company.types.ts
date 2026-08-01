export type RegistrationType =
  | 'NTN'
    | 'SALES_TAX'
      | 'WEBOC'
        | 'CHAMBER_OF_COMMERCE'
          | 'TDAP'
            | 'HALAL'
              | 'PHYTOSANITARY'
                | 'ANIMAL_QUARANTINE_DEPARTMENT'
                  | 'OTHER';

                  export type AssetCategory =
                    | 'WAREHOUSE'
                      | 'COLD_STORAGE'
                        | 'VEHICLE'
                          | 'MACHINERY'
                            | 'LAND_PLOT'
                              | 'OFFICE_EQUIPMENT';

                              export interface CompanyProfile {
                                id: string;
                                  company_name: string;
                                    logo_url: string;
                                      website: string;
                                        primary_email: string;
                                          primary_phone: string;
                                            address: string;
                                              financial_year_start: string;
                                                financial_year_end: string;
                                                  total_tax_paid: number;
                                                    yearly_budget: number;
                                                      yearly_profit_loss: number;
                                                        total_products: number;
                                                          total_warehouses: number;
                                                            total_cold_storages: number;
                                                              total_vehicles: number;
                                                                updated_at: string;
                                                                }

                                                                export interface CompanyRegistration {
                                                                  id: string;
                                                                    company_id: string;
                                                                      registration_type: RegistrationType;
                                                                        registration_number: string;
                                                                          issuing_authority: string;
                                                                            issue_date: string;
                                                                              expiry_date: string;
                                                                                document_url: string | null;
                                                                                  is_active: boolean;
                                                                                  }

                                                                                  export interface CompanyAsset {
                                                                                    id: string;
                                                                                      company_id: string;
                                                                                        asset_name: string;
                                                                                          category: AssetCategory;
                                                                                            valuation: number;
                                                                                              acquisition_date: string;
                                                                                                location: string;
                                                                                                  status: string;
                                                                                                  }

                                                                                                  export interface CompanyInvestment {
                                                                                                    id: string;
                                                                                                      company_id: string;
                                                                                                        investor_name: string;
                                                                                                          investment_amount: number;
                                                                                                            investment_date: string;
                                                                                                              equity_percentage: number;
                                                                                                                description: string;
                                                                                                                }

                                                                                                                export interface CompanyBankAccount {
                                                                                                                  id: string;
                                                                                                                    company_id: string;
                                                                                                                      bank_name: string;
                                                                                                                        account_title: string;
                                                                                                                          account_number: string;
                                                                                                                            iban: string;
                                                                                                                              swift_code: string;
                                                                                                                                branch_code: string | null;
                                                                                                                                  current_balance: number;
                                                                                                                                    currency: string;
                                                                                                                                    }

                                                                                                                                    export interface FinancialSummaryView {
                                                                                                                                      company_id: string;
                                                                                                                                        company_name: string;
                                                                                                                                          total_investment: number;
                                                                                                                                            total_assets: number;
                                                                                                                                              total_liabilities: number;
                                                                                                                                                total_cash_in_banks: number;
                                                                                                                                                  net_company_worth: number;
                                                                                                                                                  }