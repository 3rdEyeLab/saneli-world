import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <img
          src="/mainpagelogo.png"
          alt="SANELi"
          className="h-16 w-auto object-contain mx-auto mb-8"
        />

        <div className="w-12 h-12 rounded-full bg-charcoal flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-heading text-4xl tracking-widest uppercase mb-3">Order Confirmed</h1>
        <div className="w-8 h-px bg-gold mx-auto mb-6" />

        <p className="font-body text-gray-500 text-sm mb-2">
          Thank you for your order. A confirmation email is on its way.
        </p>
        <p className="font-body text-gray-400 text-xs mb-10">
          We'll send tracking info once your order ships.
        </p>

        <Link
          href="/"
          className="inline-block bg-charcoal text-white font-heading text-xs tracking-[0.3em] uppercase px-10 py-4 hover:bg-gold transition-colors duration-300"
        >
          BACK TO SANELi WORLD
        </Link>
      </div>
    </div>
  );
}
