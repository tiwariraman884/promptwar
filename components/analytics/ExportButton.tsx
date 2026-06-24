"use client";

import { Download, FileText, Table2 } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportPDF?: () => void;
}

export function ExportButton({ onExportCSV, onExportPDF }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const handlePDF = () => {
    setOpen(false);
    if (onExportPDF) {
      onExportPDF();
    } else {
      window.print();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl bg-[#2D6A4F] text-white px-4 py-2.5 text-sm font-bold hover:bg-[#1B4332] transition-colors shadow-sm"
      >
        <Download size={16} />
        Export
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 rounded-xl bg-white dark:bg-[#1A2F2A] border border-[#52B788]/20 shadow-xl overflow-hidden min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => { onExportCSV(); setOpen(false); }}
              className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-[#F8FAF5] dark:hover:bg-black/20 transition-colors"
            >
              <Table2 size={16} className="text-[#52B788]" />
              Export CSV
            </button>
            <button
              onClick={handlePDF}
              className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-[#F8FAF5] dark:hover:bg-black/20 transition-colors border-t border-neutral-100 dark:border-neutral-800"
            >
              <FileText size={16} className="text-[#52B788]" />
              Print / PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
