'use client';

import { useState } from 'react';
import { CustomerBusinessType, PaymentTerms, PreferredCurrency } from '@/types/customer.types';
import { X, Loader2, Sparkles, Building2, Globe, ShieldCheck, DollarSign } from 'lucide-react';

interface CustomerFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM_STATE = {
  company_name: '',
  customer_code: '',
  primary_country: 'United Arab Emirates',
  destination_port: '',
  business_type: 'DISTRIBUTOR' as CustomerBusinessType,
  tax_vat_number: '',
  sfda_registration_no: '',
  halal_import_permit_no: '',
  credit_limit_usd: 50000,
  payment_terms: 'ADVANCE_100' as PaymentTerms,
  preferred_currency: 'USD' as PreferredCurrency,
  status: 'OUTREACHED',
};

export function CustomerFormModal({ onSuccess, onClose }: CustomerFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const generateCustomerCode = () => {
  const countryRaw = ((formData as any).primary_country || 'United Arab Emirates').trim();
  const countryUpper = countryRaw.toUpperCase();

  // Comprehensive Country Code Map for global trade
  const countryMap: Record<string, string> = {
    // Middle East & GCC
    'UNITED ARAB EMIRATES': 'UAE',
    'UAE': 'UAE',
    'EMIRATES': 'UAE',
    'SAUDI ARABIA': 'KSA',
    'KINGDOM OF SAUDI ARABIA': 'KSA',
    'KSA': 'KSA',
    'QATAR': 'QAT',
    'OMAN': 'OMN',
    'KUWAIT': 'KWT',
    'BAHRAIN': 'BAH',
    'JORDAN': 'JOR',
    'EGYPT': 'EGY',

    // Americas
    'UNITED STATES': 'USA',
    'UNITED STATES OF AMERICA': 'USA',
    'USA': 'USA',
    'US': 'USA',
    'CANADA': 'CAN',
    'BRAZIL': 'BRA',
    'MEXICO': 'MEX',

    // Europe & UK
    'UNITED KINGDOM': 'UK',
    'UK': 'UK',
    'GREAT BRITAIN': 'GBR',
    'ENGLAND': 'GBR',
    'GERMANY': 'DEU',
    'FRANCE': 'FRA',
    'ITALY': 'ITA',
    'SPAIN': 'ESP',
    'NETHERLANDS': 'NLD',
    'TURKEY': 'TUR',
    'TURKIYE': 'TUR',

    // Asia & Pacific
    'CHINA': 'CHN',
    'JAPAN': 'JPN',
    'SOUTH KOREA': 'KOR',
    'KOREA': 'KOR',
    'INDIA': 'IND',
    'PAKISTAN': 'PAK',
    'SINGAPORE': 'SGP',
    'MALAYSIA': 'MYS',
    'AUSTRALIA': 'AUS',
    'NEW ZEALAND': 'NZL',
    'SOUTH AFRICA': 'ZAF',
  };

  let countryTag = '';

  // 1. Direct match check in lookup table
  if (countryMap[countryUpper]) {
    countryTag = countryMap[countryUpper];
  } else {
    // 2. Partial key match check (e.g. "Kingdom of Saudi Arabia" -> KSA)
    const matchedKey = Object.keys(countryMap).find((key) => countryUpper.includes(key));
    
    if (matchedKey) {
      countryTag = countryMap[matchedKey];
    } else {
      // 3. Dynamic Fallback for multi-word countries (e.g. "South Korea" -> SK, "Sri Lanka" -> SL)
      const words = countryRaw.split(/\s+/).filter(Boolean);
      if (words.length >= 2) {
        countryTag = words.map((w) => w[0]).join('').replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 3);
      }

      // 4. Fallback for single unknown word: take first 3 clean letters
      if (!countryTag || countryTag.length < 2) {
        const cleanLetters = countryUpper.replace(/[^A-Z]/g, '');
        countryTag = cleanLetters.slice(0, 3) || 'IMP';
      }
    }
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const code = `SAF-IMP-${countryTag}-${randomSuffix}`;

  setFormData((prev: any) => ({ ...prev, customer_code: code }));
};

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Extract SAF-CR compliance reference
    const complianceRef =
      (formData as any).compliance_reg_no ||
      formData.sfda_registration_no ||
      (formData as any).permit_ref ||
      '';

    const isCleared =
      (formData as any).trade_compliance === 'Compliance Cleared' ||
      (formData as any).compliance_cleared === true ||
      Boolean(complianceRef);

    // 2. Extract Registration / Tax number
    const regNum =
      formData.tax_vat_number ||
      (formData as any).cr_number ||
      (formData as any).vat_number ||
      (formData as any).reg_number ||
      '';

    // 3. Construct strictly valid database payload
    const payload = {
      company_name: formData.company_name || '',
      customer_code: formData.customer_code || '',
      primary_country: formData.primary_country || '',
      destination_port: formData.destination_port || '',
      business_type: (formData as any).business_type || (formData as any).business_category || 'Wholesaler',
      payment_terms: formData.payment_terms || '100% Advance TT',
      credit_limit_usd: Number((formData as any).credit_limit_usd || (formData as any).credit_limit) || 0,
      tax_vat_number: regNum,
      status: (formData as any).status || 'Active',

      // Standardized compliance fields
      compliance_reg_no: isCleared ? complianceRef : null,
      sfda_registration_no: isCleared ? complianceRef : null,
      permit_ref: isCleared ? complianceRef : null,
      trade_compliance: isCleared ? 'Compliance Cleared' : 'Pending Compliance',
      compliance_cleared: isCleared,
    };

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json().catch(() => ({}));

    if (res.ok) {
      if (typeof handleClose === 'function') handleClose();
      if (onSuccess) onSuccess();
    } else {
      const errMsg =
        responseData.message ||
        responseData.error ||
        responseData.details ||
        'Error creating customer record.';
      alert(`Creation Failed: ${errMsg}`);
    }
  } catch (err: any) {
    console.error('Failed to register customer:', err);
    alert(`Error: ${err.message || 'An unexpected network error occurred.'}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-400" />
              Register New Global Importer / Buyer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Onboard commercial buyers, port destinations, credit terms & trade compliance
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Gulf Food Wholesalers LLC"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold block">Customer Code *</label>
                <button
                  type="button"
                  onClick={generateCustomerCode}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" /> Auto Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.customer_code}
                onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                placeholder="e.g. SAF-IMP-UAE-1092"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold mb-1 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-blue-400" /> Primary Country *
              </label>
              <input
                type="text"
                required
                value={formData.primary_country}
                onChange={(e) => setFormData({ ...formData, primary_country: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Saudi Arabia, UAE, Qatar"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Destination Port *</label>
              <input
                type="text"
                required
                value={formData.destination_port}
                onChange={(e) => setFormData({ ...formData, destination_port: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Jebel Ali Port / Jeddah Islamic Port"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Business Category</label>
              <select
                value={formData.business_type}
                onChange={(e) =>
                  setFormData({ ...formData, business_type: e.target.value as CustomerBusinessType })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="WHOLESALER">Wholesaler</option>
                <option value="SUPERMARKET_CHAIN">Supermarket Chain</option>
                <option value="MEAT_PROCESSOR">Meat Processor</option>
                <option value="HOTEL_CATERING">Hotel Catering</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Payment Terms</label>
              <select
                value={formData.payment_terms}
                onChange={(e) =>
                  setFormData({ ...formData, payment_terms: e.target.value as PaymentTerms })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ADVANCE_100">100% Advance TT</option>
                <option value="LC_AT_SIGHT">Irrevocable LC at Sight</option>
                <option value="CAD">Cash Against Documents (CAD)</option>
                <option value="DP_30_DAYS">DP 30 Days</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-bold mb-1 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Credit Limit (USD)
              </label>
              <input
                type="number"
                value={formData.credit_limit_usd}
                onChange={(e) =>
                  setFormData({ ...formData, credit_limit_usd: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* TRADE COMPLIANCE & TAX SECTION */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 pt-3">
  {/* 1. Reg. Number */}
  <div>
    <label className="text-slate-300 font-bold block mb-1">Reg. Number</label>
    <input
      type="text"
      value={
        formData.tax_vat_number ||
        (formData as any).reg_number ||
        (formData as any).cr_number ||
        ''
      }
      onChange={(e) => {
        const val = e.target.value;
        setFormData((prev: any) => ({
          ...prev,
          tax_vat_number: val,
          cr_number: val,
          vat_number: val,
          reg_number: val,
        }));
      }}
      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
      placeholder="e.g. CRN-10029384"
    />
  </div>
           {/* YES / NO TRADE COMPLIANCE OPTION */}
<div>
  <label className="text-slate-300 font-bold mb-1 flex items-center gap-1">
    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Compliance Cleared? *
  </label>
  <select
    value={formData.sfda_registration_no ? 'YES' : 'NO'}
    onChange={(e) => {
      if (e.target.value === 'YES') {
        // Auto-generate company reference if blank (e.g., SAF-CR-5892)
        const randomRef = `SAF-CR-${Math.floor(1000 + Math.random() * 9000)}`;
        setFormData({
          ...formData,
          sfda_registration_no: formData.sfda_registration_no || randomRef,
        });
      } else {
        setFormData({ ...formData, sfda_registration_no: '' });
      }
    }}
    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500"
  >
    <option value="NO">No (Pending Compliance)</option>
    <option value="YES">Yes (Compliance Cleared)</option>
  </select>
</div>

{/* SAFAA AGRO COMPLIANCE REFERENCE NUMBER */}
<div>
  <label className="text-slate-300 font-bold block mb-1">
    Compliance Ref (SAF-CR-xxxx)
  </label>
  <input
    type="text"
    value={formData.sfda_registration_no || ''}
    onChange={(e) =>
      setFormData({ ...formData, sfda_registration_no: e.target.value })
    }
    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
    placeholder="e.g. SAF-CR-1234"
  />
</div> 
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Importer...
                </>
              ) : (
                'Save & Register Buyer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}