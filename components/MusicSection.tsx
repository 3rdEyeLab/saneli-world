const platforms = [
  {
    name: 'Spotify',
    href: 'https://open.spotify.com/artist/5cLZnYlAVXrTnkgtO9HSUf',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    name: 'Apple Music',
    href: 'https://music.apple.com/us/artist/saneli/1742254767',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/', // Replace with your YouTube channel URL
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
];

export default function MusicSection() {
  return (
    <section id="music" className="bg-charcoal py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-heading text-xs tracking-[0.5em] text-gold uppercase mb-4">SANELi</p>
        <h2 className="font-heading text-5xl md:text-7xl tracking-widest text-white uppercase mb-3">
          STREAM NOW
        </h2>
        <div className="w-10 h-px bg-gold mx-auto mb-6" />
        <p className="font-body text-gray-500 text-sm tracking-widest mb-12">Brooklyn, NY</p>

        {/* Platform links */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14">
          {platforms.map(({ name, href, icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 border border-white/15 text-white hover:bg-white hover:text-charcoal transition-all duration-300 group min-w-[180px]"
            >
              <span className="transition-transform duration-200 group-hover:scale-110">{icon}</span>
              <span className="font-heading text-xs tracking-[0.25em] uppercase">{name}</span>
            </a>
          ))}
        </div>

        {/*
          SPOTIFY EMBED — replace the src URL with your own:
          1. Open your Spotify artist/playlist page
          2. Click "..." → Share → Embed → Copy the iframe src
          3. Paste it below replacing the placeholder
        */}
        <div className="overflow-hidden rounded-none opacity-90 hover:opacity-100 transition-opacity">
          <iframe
            src="https://open.spotify.com/embed/artist/5cLZnYlAVXrTnkgtO9HSUf?utm_source=generator&theme=0"
            width="100%"
            height="152"
            style={{ border: 0 }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="SANELi on Spotify"
          />
        </div>
      </div>
    </section>
  );
}
