import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import zujCampus from '../../assets/zuj-campus.jpg';
import zujTower from '../../assets/zuj-tower.jpg';
import zujEng from '../../assets/zuj-eng-2.png';
import emranAvatar from '../../assets/emran-avatar.jpg';

const CAMPUS_PHOTOS = [
  { src: zujCampus, alt: 'Al-Zaytoonah University of Jordan — Faculty of Science and Information Technology' },
  { src: zujEng, alt: 'Al-Zaytoonah University of Jordan — Faculty of Engineering and Technology' },
  { src: zujTower, alt: 'Al-Zaytoonah University of Jordan — clock tower' },
];

export function Footer() {
  const { isAuthenticated } = useAuth();
  const [activePhoto, setActivePhoto] = useState(0);

  const quickLinks = [
    { to: '/', icon: 'storefront', label: 'Browse Listings' },
    ...(isAuthenticated
      ? [
          { to: '/listings/create', icon: 'add_circle', label: 'Post a Listing' },
          { to: '/my-listings', icon: 'inventory_2', label: 'My Listings' },
          { to: '/bookings', icon: 'event_available', label: 'My Bookings' },
        ]
      : [
          { to: '/login', icon: 'login', label: 'Sign in' },
          { to: '/register', icon: 'person_add', label: 'Get Started' },
        ]),
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setActivePhoto((i) => (i + 1) % CAMPUS_PHOTOS.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-outline-variant/20">
      {/* Section 1 — Campus photos */}
      <div className="relative h-64 w-full bg-surface-container-highest sm:h-80 md:h-[32rem]">
        {CAMPUS_PHOTOS.map((photo, i) => (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            className={`absolute inset-0 h-full w-full object-fill transition-opacity duration-1000 ${
              i === activePhoto ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Section 2 — Contact Us */}
      <div className="bg-gradient-to-br from-primary via-primary to-on-primary-fixed-variant text-on-primary">
        <div className="max-w-screen-2xl mx-auto px-6 py-14 text-center">
          <h4 className="mb-8 font-headline text-2xl font-bold">Contact Us</h4>
          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-14">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
                <span className="material-symbols-outlined text-[20px]">phone</span>
              </span>
              <span className="font-medium text-white">+962 6 429 1511</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </span>
              <span className="text-left text-white/85">Queen Alia Airport St 594,<br />Amman, Jordan</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
                <span className="material-symbols-outlined text-[20px]">language</span>
              </span>
              <a
                href="https://www.zuj.edu.jo"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white transition-colors hover:underline"
              >
                zuj.edu.jo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 — Quick Links, Built By & copyright */}
      <div className="bg-surface-container-lowest">
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <h4 className="mb-5 font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                Quick Links
              </h4>
              <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-card-lg">
                {quickLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm font-label font-semibold text-on-surface-variant shadow-card transition-all hover:border-primary/30 hover:bg-primary hover:text-on-primary hover:shadow-primary"
                  >
                    <span className="material-symbols-outlined text-[18px]">{l.icon}</span>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-5 font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                Built By
              </h4>
              <div className="flex items-center gap-5 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-card-lg">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-primary/15">
                  <img
                    src={emranAvatar}
                    alt="Emran Al-khaleel"
                    className="h-full w-full scale-[1.15] object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-headline text-lg font-bold leading-tight text-on-surface">
                    Emran Al-khaleel <span className="mx-1 font-normal text-outline-variant">|</span>{' '}
                    <span className="text-base font-semibold text-secondary">Backend Developer</span>
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href="https://www.linkedin.com/in/emran-al-khaleel-1b86b0343/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-label font-semibold text-on-primary shadow-primary transition-transform hover:scale-105 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[14px]">link</span>
                      LinkedIn profile
                    </a>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-label font-semibold text-on-primary shadow-primary">
                      <span className="material-symbols-outlined text-[14px]">mail</span>
                      emrankhaleel03@gmail.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
