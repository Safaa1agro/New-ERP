'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { downloadQuotationPDF } from '@/lib/pdf/quotation-pdf';

interface Props {
  quotation: any;
}

export default function DownloadPDFButton({ quotation }: Props) {
  return (
    <button
      onClick={() => downloadQuotationPDF(quotation)}
      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/10"
    >
      <Printer className="w-4 h-4 stroke-[2.5]" /> Download Commercial PDF
    </button>
  );
}