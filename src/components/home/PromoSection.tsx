import { storeConfig } from '@/config/store';

interface PromoSectionProps {
  onShopNow: () => void;
}

export default function PromoSection({ onShopNow }: PromoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Demo Data Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
        <span className="text-lg">📢</span>
        <div className="flex-1">
          <span className="font-bold">Excel/CSV Catalog Ready:</span>{' '}
          <span>Currently displaying initial demo items (approx. 441 products import-ready). All prices & stocks shown are representative prototype data. No eggs or fresh produce.</span>
        </div>
      </div>

      {/* WhatsApp Direct Order Section */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-[11px] font-bold text-emerald-200 border border-emerald-600">
            <span>Need items not listed?</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Prefer Ordering on WhatsApp Directly?</h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            You can also take a photo of your handwritten grocery list or message our store assistant directly. We will prepare your basket promptly!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
          <a
            href={`https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(`Hello ${storeConfig.name}, here is my grocery order list:`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href={`tel:${storeConfig.phone}`}
            className="px-5 py-3.5 rounded-full bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Call Store</span>
          </a>
        </div>
      </section>
    </div>
  );
}
