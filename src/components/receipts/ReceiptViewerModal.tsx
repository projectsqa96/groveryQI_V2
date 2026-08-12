import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ExternalLink } from 'lucide-react';

export const ReceiptViewerModal: React.FC = () => {
  const { selectedReceiptForModal, setSelectedReceiptForModal } = useApp();

  if (!selectedReceiptForModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
        <button
          onClick={() => setSelectedReceiptForModal(null)}
          className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-2 overflow-hidden shadow-2xl flex items-center justify-center max-h-[80vh] w-full">
          <img
            src={selectedReceiptForModal}
            alt="Receipt Document Full View"
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
          />
        </div>

        <div className="mt-3 flex items-center gap-4">
          <a
            href={selectedReceiptForModal}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Original File</span>
          </a>
        </div>
      </div>
    </div>
  );
};
