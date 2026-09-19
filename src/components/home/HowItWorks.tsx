export default function HowItWorks() {
  const steps = [
    { num: '1', title: 'Add to Cart', description: 'Pick dals, rice, oils with clear weights (Min ₹200)' },
    { num: '2', title: 'Address Details', description: 'Quick name, phone number, street & PIN code' },
    { num: '3', title: 'WhatsApp Confirmation', description: 'Store verifies item packing & sends confirmation' },
    { num: '4', title: 'Pay via UPI & Delivery', description: 'Pay via GPay/PhonePe upon packing, delivered in 30m' },
  ];

  return (
    <section className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-7 space-y-4 shadow-sm">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
          How Ordering Works at Pavan Sai Kirana
        </h3>
        <p className="text-xs text-slate-500">
          Simple 4-step process designed for fast delivery and zero hassle
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
        {steps.map((step) => (
          <div key={step.num} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-3 rounded-xl bg-orange-50/50">
            <div className="w-10 h-10 rounded-full bg-[#FFF2D7] text-[#F98866] font-extrabold flex items-center justify-center shrink-0 text-sm border border-orange-200">
              {step.num}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">{step.title}</div>
              <div className="text-[11px] text-slate-500">{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
