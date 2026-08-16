import { z } from 'zod';

export const productCategoryEnum = z.enum([
  'FRESH_FRUIT',
  'FRESH_VEGETABLE',
  'FRESH_MEAT',
  'FROZEN_MEAT',
  'OTHER',
]);

export const productStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);
export const complianceStatusEnum = z.enum([
  'PENDING_COMPLIANCE', 
  'COMPLIANCE_READY', 
  'CLEARED', 
  'COMPLIANCE_CLEARED', 
  'APPROVED'
]);
export const coldChainSchema = z.object({
  storage_type: z.enum(['CHILLED', 'FROZEN', 'AMBIENT', 'CONTROLLED_ATMOSPHERE']),
  min_temp_c: z.number().optional(),
  max_temp_c: z.number().optional(),
  optimal_temp_c: z.number(),
  min_humidity_pct: z.number().optional(),
  max_humidity_pct: z.number().optional(),
  ventilation_cbm_hr: z.number().optional(),
  ethylene_sensitivity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  shelf_life_days: z.number(),
  reefer_precooling_required: z.boolean().default(true),
});

export const packagingSchema = z.object({
  config_name: z.string().min(1, 'Configuration name is required'),
  gross_weight_kg: z.number().positive(),
  net_weight_kg: z.number().positive(),
  tare_weight_kg: z.number().optional(),
  box_length_cm: z.number().optional(),
  box_width_cm: z.number().optional(),
  box_height_cm: z.number().optional(),
  boxes_per_pallet: z.number().positive(),
  pallets_per_20ft_reefer: z.number().optional(),
  pallets_per_40ft_reefer: z.number().optional(),
  air_cargo_payload_tons: z.number().optional(),
});

export const pricingSchema = z.object({
  destination_port: z.string().min(1, 'Destination port is required'),
  incoterm: z.enum(['CIF', 'CPT', 'FOB', 'C_AND_F', 'EXW']),
  currency: z.enum(['USD', 'AED', 'SAR', 'PKR', 'EUR']),
  min_order_qty: z.number().positive(),
  price_per_uom: z.number().positive(),
  seasonal_surcharge_pct: z.number().optional(),
  valid_from: z.string(),
  valid_to: z.string(),
});

export const productMasterSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Internal name is required'),
  trade_name: z.string().min(1, 'Trade name is required'),
  scientific_name: z.string().optional(),
  hs_code: z.string().min(1, 'HS Code is required'),
  category: productCategoryEnum,
  base_uom: z.enum(['CARTON', 'KG', 'TON', 'CARCASS']),
  origin_region: z.string().min(1, 'Origin region is required'),
  is_active: z.boolean().default(true),
  status: productStatusEnum.default('ACTIVE'),
  compliance_status: complianceStatusEnum.default('PENDING_COMPLIANCE'),
  description: z.string().optional(),
  cold_chain: coldChainSchema,
  packaging: packagingSchema,
  pricing: pricingSchema,
});

export type ProductMasterFormValues = z.infer<typeof productMasterSchema>;

export interface Product extends ProductMasterFormValues {
  id: string;
  created_at?: string;
  updated_at?: string;
}