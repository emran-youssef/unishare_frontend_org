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

      {/* Section 2 — Contact Us, Quick Links & Built By, merged */}
      <div className="bg-gradient-to-br from-primary via-primary to-on-primary-fixed-variant text-on-primary">
        <div className="max-w-screen-2xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-10">
            {/* Contact */}
            <div>
              <h4 className="mb-6 font-headline text-sm font-bold uppercase tracking-wider text-white/70">
                Contact Us
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10">
                    <span className="material-symbols-outlined text-[18px]">phone</span>
                  </span>
                  <span className="font-medium text-white">+962 6 429 1511</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </span>
                  <span className="text-white/85">Queen Alia Airport St 594, Amman, Jordan</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10">
                    <span className="material-symbols-outlined text-[18px]">language</span>
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

            {/* Quick Links */}
            <div>
              <h4 className="mb-6 font-headline text-sm font-bold uppercase tracking-wider text-white/70">
                Quick Links
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {quickLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-label font-semibold text-white/90 backdrop-blur-sm transition-all hover:bg-white hover:text-primary hover:border-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">{l.icon}</span>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Built By */}
            <div>
              <h4 className="mb-6 font-headline text-sm font-bold uppercase tracking-wider text-white/70">
                Built By
              </h4>
              <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-4 ring-white/20">
                  <img
                    src={emranAvatar}
                    alt="Emran Al-khaleel"
                    className="h-full w-full scale-[1.15] object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-headline text-base font-bold leading-tight text-white">Emran Al-khaleel</p>
                  <p className="text-sm font-semibold text-white/70">Backend Developer</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <a
                      href="https://www.linkedin.com/in/emran-al-khaleel-1b86b0343/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-label font-semibold text-primary shadow-card transition-transform hover:scale-105 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[13px]">link</span>
                      LinkedIn
                    </a>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-label font-semibold text-white">
                      <span className="material-symbols-outlined text-[13px]">mail</span>
                      emrankhaleel03@gmail.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 text-sm text-white/70 sm:flex-row">
            <p>© {new Date().getFullYear()} Unishare. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">school</span>
              Al-Zaytoonah University of Jordan
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
