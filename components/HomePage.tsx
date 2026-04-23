import Navbar from './Navbar';
import ProductGallery from './ProductGallery';
import NewsletterSection from './NewsletterSection';
import MusicSection from './MusicSection';
import CartDrawer from './CartDrawer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="bg-charcoal py-2.5">
        <p className="font-heading text-[11px] tracking-[0.45em] text-white/50 uppercase text-center">
          SANELi &nbsp;·&nbsp; Brooklyn NY &nbsp;·&nbsp; Music &amp; Merch
        </p>
      </div>

      <main>
        <ProductGallery />
        <NewsletterSection />
        <MusicSection />
      </main>

      <footer id="about" className="bg-white border-t border-gray-100 py-14 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src="/mainpagelogo.png" alt="SANELi" className="h-10 w-auto object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div>
              <p className="font-heading text-lg tracking-[0.2em] uppercase">SANELi</p>
              <p className="font-body text-xs text-gray-400">Brooklyn, NY</p>
            </div>
          </div>

          <div className="flex gap-8">
            {[
              { label: 'Instagram', href: 'https://instagram.com/' },   // ← update
              { label: 'Spotify',   href: 'https://open.spotify.com/' }, // ← update
              { label: 'Contact',   href: 'mailto:your@email.com' },     // ← update
            ].map(({ label, href }) => (
              <a key={label} href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="font-heading text-[11px] tracking-[0.3em] text-gray-400 hover:text-black transition-colors uppercase">
                {label}
              </a>
            ))}
          </div>

          <p className="font-body text-xs text-gray-300">
            © {new Date().getFullYear()} SANELi. All rights reserved.
          </p>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
