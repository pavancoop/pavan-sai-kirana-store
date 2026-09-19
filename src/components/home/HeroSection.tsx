import { storeConfig } from '@/config/store';
import { generateWhatsAppLink } from '@/lib/whatsappService';

interface HeroSectionProps {
  onShopNow: () => void;
}

export default function HeroSection({ onShopNow }: HeroSectionProps) {
  const whatsappLink = generateWhatsAppLink(
    storeConfig.whatsappNumber,
    `Hello ${storeConfig.name}, I want to order groceries.`
  );

  return (
    <section className="relative rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#FFF2D7] via-[#FFF8EB] to-[#FFE6BC] p-4 sm:p-6 md:p-10 border border-[#fed7aa] shadow-sm overflow-hidden">
      {/* Decorative watermark */}
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8 hidden sm:block">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="#c24b27">
          <circle cx="100" cy="100" r="80" />
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl space-y-2.5 sm:space-y-4">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-white/80 border border-orange-200 text-[10px] sm:text-xs font-bold text-[#c24b27]">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
          <span>Local Store Delivery • Fresh Daily Stocks</span>
        </div>

        {/* Store Name */}
        <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {storeConfig.name}
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-lg md:text-xl font-medium text-stone-700">
          &ldquo;{storeConfig.tagline}&rdquo;
        </p>

        {/* 4 Key Highlights - horizontal scroll on mobile, grid on larger */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:gap-2.5 pt-1 sm:pt-2">
          {storeConfig.features.map((feature, index) => (
            <div key={index} className="bg-white/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-orange-100/80 shrink-0 w-[120px] sm:w-auto">
              <div className={`text-sm sm:text-base mb-0.5 sm:mb-1 font-bold ${
                index === 0 ? 'text-emerald-700' :
                index === 1 ? 'text-[#c24b27]' :
                index === 2 ? 'text-emerald-700' :
                'text-amber-700'
              }`}>
                {feature.icon} {feature.title}
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-800">{feature.subtitle}</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">{feature.detail}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onShopNow}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#F98866] hover:bg-[#e56b46] text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95 flex items-center gap-2"
          >
            <span>Shop Now</span>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white hover:bg-stone-50 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-emerald-600" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <span>WhatsApp Order</span>
          </a>
        </div>
      </div>
    </section>
  );
}
