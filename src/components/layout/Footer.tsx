import { storeConfig } from '@/config/store';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-10 pb-20 md:pb-10 mt-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Store Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#F98866] flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="text-white font-bold tracking-tight text-base">{storeConfig.name}</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Your neighborhood provision & kirana store. Committed to pure grains, authentic dals, fresh cooking oils, packaged foods, and instant WhatsApp ordering assistance.
          </p>
          <p className="text-xs text-amber-300 font-semibold mt-2">
            Strict Policy: No eggs or fresh farm produce sold.
          </p>
        </div>

        {/* Store Policies */}
        <div>
          <h4 className="text-sm font-bold text-white mb-3">Store Policies & Timings</h4>
          <ul className="text-xs text-stone-400 space-y-1.5">
            <li>• Minimum Order Value: <strong className="text-white">₹{storeConfig.minimumOrderValue}</strong></li>
            <li>• Target Delivery Window: <strong className="text-white">30 Minutes</strong></li>
            <li>• Payment: UPI (GPay, PhonePe, Paytm) after confirmation</li>
            <li>• Operational Hours: 7:30 AM - 10:00 PM (Everyday)</li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="text-sm font-bold text-white mb-3">Customer Support</h4>
          <p className="text-xs text-stone-400 mb-3">Have custom requirements or need help placing an order?</p>
          <div className="space-y-2">
            <a
              href={`https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(`Hello ${storeConfig.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold w-full justify-center"
            >
              Chat on WhatsApp
            </a>
            <div className="text-[10px] text-stone-500 text-center">
              PWA Enabled • Installable on Mobile Homescreen
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
        <div>© {new Date().getFullYear()} {storeConfig.name}. All rights reserved.</div>
        <div className="flex gap-4">
          <span>Fast Local Kirana Platform</span>
          <span>•</span>
          <span>Designed for Mobile First</span>
        </div>
      </div>
    </footer>
  );
}
