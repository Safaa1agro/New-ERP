'use client';

import React from 'react';
import { SupplierDocument } from '@/types/supplier.types';
import { FileText, Download, ShieldAlert, CheckCircle, Upload } from 'lucide-react';

interface SupplierDocumentsTabProps {
  documents: SupplierDocument[];
  onRefresh: () => void;
}

export function SupplierDocumentsTab({ documents }: SupplierDocumentsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-100">KYC & Legal Documentation Repository</h3>
          <p className="text-xs text-slate-400">Land titles, CNIC copies, NTN certificates, and Veterinary Health Cards</p>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg text-xs font-semibold transition-colors">
          <Upload className="w-4 h-4" />
          Upload New Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 text-emerald-400 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm truncate max-w-[180px]">{doc.document_name}</h4>
                <p className="text-[11px] text-slate-400">{doc.document_type}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <div>
                {doc.is_expired ? (
                  <span className="text-rose-400 flex items-center gap-1 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" /> Expired ({doc.expiry_date})
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Valid till {doc.expiry_date || 'N/A'}
                  </span>
                )}
              </div>

              <a
                href={doc.file_url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                title="Download / View"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}