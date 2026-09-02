export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant/20 bg-surface-container-lowest">
      <div className="max-w-screen-2xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.95fr_1fr] gap-8">
          <section className="rounded-2xl bg-primary text-on-primary p-7 shadow-primary">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance
                </span>
              </div>
              <div>
                <p className="text-xs font-label font-bold uppercase tracking-wider text-white/70">Al-Zaytoonah University of Jordan</p>
                <h2 className="font-headline text-3xl font-bold tracking-tight">ZUJ</h2>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_mall</span>
              <h3 className="font-headline text-2xl font-bold">UniShare</h3>
            </div>
            <p className="text-sm leading-relaxed text-white/85 max-w-md">
              A peer-to-peer rental platform built exclusively for Al-Zaytoonah University students to share, rent, and reuse campus essentials.
            </p>
            <p className="mt-5 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-label font-semibold text-white">
              For ZUJ Students Only
            </p>
          </section>

          <section className="lg:border-l lg:border-outline-variant/30 lg:pl-8">
            <h4 className="font-headline text-lg font-bold text-on-surface mb-5">Contact Us</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">phone</span>
                <span className="font-medium text-on-surface">+962 6 429 1511</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">location_on</span>
                <span>Queen Alia Airport St 594,<br />Amman, Jordan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">language</span>
                <a href="https://www.zuj.edu.jo" target="_blank" rel="noopener noreferrer" className="font-medium text-on-surface hover:text-primary transition-colors">
                  zuj.edu.jo
                </a>
              </li>
            </ul>
          </section>

          <section className="lg:border-l lg:border-outline-variant/30 lg:pl-8">
            <h4 className="font-headline text-lg font-bold text-on-surface mb-5">Built By</h4>
            <div className="flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
              <span className="material-symbols-outlined text-[20px] text-primary">person</span>
              <div>
                <p className="text-sm font-medium text-on-surface">Emran Atrooz</p>
                <p className="text-xs text-on-surface-variant">Full-Stack Developer</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between gap-3 text-sm text-on-surface-variant">
          <p>(c) {new Date().getFullYear()} UniShare - Al-Zaytoonah University of Jordan</p>
          <p>Built for ZUJ students, by a ZUJ student.</p>
        </div>
      </div>
    </footer>
  );
}
