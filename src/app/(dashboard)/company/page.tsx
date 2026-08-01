'use client';

import { useEffect, useState } from 'react';
import {
  CompanyProfile,
  CompanyRegistration,
  FinancialSummaryView,
  CompanyBankAccount,
} from '@/types/company.types';
import { RegistrationTable } from '@/components/company/registration-table';
import { FinancialMetricsGrid } from '@/components/company/financial-metrics-grid';
import { AddRegistrationModal } from '@/components/company/add-registration-modal';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Landmark,
  Warehouse,
  ShieldCheck,
} from 'lucide-react';

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [summary, setSummary] = useState<FinancialSummaryView | null>(null);
  const [registrations, setRegistrations] = useState<CompanyRegistration[]>([]);
  const [bankAccounts, setBankAccounts] = useState<CompanyBankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Profile & Summary
      const profileRes = await fetch('/api/company/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.profile);
        setSummary(profileData.summary);
      }

      // Fetch Registrations
      const regRes = await fetch('/api/company/registrations');
      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistrations(regData);
      }

      // Fetch Bank Accounts
      const bankRes = await fetch('/api/company/bank-accounts');
      if (bankRes.ok) {
        const bankData = await bankRes.json();
        setBankAccounts(bankData);
      }
    } catch (error) {
      console.error('Failed to fetch company profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-slate-400 text-sm">
        Loading Company Profile & Assets Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Header Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <Building2 className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                {profile?.company_name}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />{' '}
                {profile?.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Financial Year
              </span>
              <span className="text-xs text-white font-mono">
                {profile?.financial_year_start} to {profile?.financial_year_end}
              </span>
            </div>
            <AddRegistrationModal
              companyId={profile?.id || ''}
              onSuccess={fetchData}
            />
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Globe className="h-4 w-4 text-green-500" /> {profile?.website}
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="h-4 w-4 text-green-500" /> {profile?.primary_email}
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="h-4 w-4 text-green-500" /> {profile?.primary_phone}
          </div>
        </div>
      </div>

      {/* Financial Overview Metrics */}
      <FinancialMetricsGrid summary={summary} profile={profile} />

      {/* Operations & Asset Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Warehouses */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <Warehouse className="h-6 w-6 text-green-500" />
          <div>
            <span className="text-xs text-slate-400 font-medium">Warehouses</span>
            <p className="text-lg font-bold text-white">
              {profile?.total_warehouses ?? 0} Facilities
            </p>
          </div>
        </div>

        {/* Cold Storage Units */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <Warehouse className="h-6 w-6 text-blue-500" />
          <div>
            <span className="text-xs text-slate-400 font-medium">
              Cold Storage Units
            </span>
            <p className="text-lg font-bold text-white">
              {profile?.total_cold_storages ?? 0} Units
            </p>
          </div>
        </div>

        {/* Registrations */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          <div>
            <span className="text-xs text-slate-400 font-medium">
              Registrations
            </span>
            <p className="text-lg font-bold text-white">
              {registrations.length} Active
            </p>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <Landmark className="h-6 w-6 text-amber-500" />
          <div>
            <span className="text-xs text-slate-400 font-medium">
              Bank Accounts
            </span>
            <p className="text-lg font-bold text-white">
              {bankAccounts.length} Linked
            </p>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Company Registrations & Licences
        </h2>
        <RegistrationTable registrations={registrations} />
      </div>
    </div>
  );
}
