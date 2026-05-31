import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetListingsQuery } from './listingsApi';
import { ListingCard, ListingCardSkeleton } from './components/ListingCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import type { ListingCategory, ListingDto } from '../../types/api.types';
import { CATEGORY_LABELS } from '../../utils/formatters';

const CATEGORIES = ['', 'TEXTBOOKS', 'ELECTRONICS', 'FURNITURE', 'CLOTHING', 'OTHER'] as const;

// ─── Mock listings (shown when backend is offline) ──────────────────────────
const MOCK_LISTINGS: ListingDto[] = [
  {
    id: 1,
    title: 'Calculus Textbook 10th Edition',
    description: 'Calculus Textbook 10th Edition. Great for university courses.',
    pricePerDay: 5,
    category: 'TEXTBOOKS',
    condition: 'GOOD',
    status: 'AVAILABLE',
    images: ['https://picsum.photos/seed/book1/400/300'],
    averageRating: 4.2,
    totalReviews: 8,
    owner: { id: 101, fullName: 'Sara M.', email: 'sara@example.com', universityEmail: 'sara@example.com', role: 'STUDENT', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'MacBook Pro M2 2023',
    description: 'MacBook Pro M2 2023. Perfect for programming and design.',
    pricePerDay: 15,
    category: 'ELECTRONICS',
    condition: 'LIKE_NEW',
    status: 'AVAILABLE',
    images: ['https://picsum.photos/seed/mac1/400/300'],
    averageRating: 4.8,
    totalReviews: 23,
    owner: { id: 102, fullName: 'Ahmed K.', email: 'ahmed@example.com', universityEmail: 'ahmed@example.com', role: 'STUDENT', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Study Desk & Chair Set',
    description: 'Study Desk & Chair Set. Comfortable for long study sessions.',
    pricePerDay: 8,
    category: 'FURNITURE',
    condition: 'GOOD',
    status: 'AVAILABLE',
    images: ['https://picsum.photos/seed/desk1/400/300'],
    averageRating: 4.0,
    totalReviews: 5,
    owner: { id: 103, fullName: 'Lina R.', email: 'lina@example.com', universityEmail: 'lina@example.com', role: 'STUDENT', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Canon EOS Camera',
    description: 'Canon EOS Camera. Great for photography assignments.',
    pricePerDay: 20,
    category: 'ELECTRONICS',
    condition: 'NEW',
    status: 'AVAILABLE',
    images: ['https://picsum.photos/seed/cam1/400/300'],
    averageRating: 4.9,
    totalReviews: 31,
    owner: { id: 104, fullName: 'Omar H.', email: 'omar@example.com', universityEmail: 'omar@example.com', role: 'STUDENT', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Physics Textbook 3rd Edition',
    description: 'Physics Textbook 3rd Edition. Essential for physics classes.',
    pricePerDay: 3,
    category: 'TEXTBOOKS',
    condition: 'FAIR',
    status: 'AVAILABLE',
    images: ['https://picsum.photos/seed/book2/400/300'],
    averageRating: 3.8,
    totalReviews: 4,
    owner: { id: 105, fullName: 'Rania S.', email: 'rania@example.com', universityEmail: 'rania@example.com', role: 'STUDENT', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    title: 'ASUS Gaming Laptop',
    description: 'ASUS Gaming Laptop. High performance for rendering.',
    pricePerDay: 25,
    category: 'ELECTRONICS',
    condition: 'LIKE_NEW',
    status: 'AVAILABLE',
    images: ['https://picsum.photos/seed/laptop1/400/300'],
    averageRating: 4.7,
    totalReviews: 17,
    owner: { id: 106, fullName: 'Khalid M.', email: 'khalid@example.com', universityEmail: 'khalid@example.com', role: 'STUDENT', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    title: 'Winter Jacket Size M',
    description: 'Winter Jacket Size M. Very warm for the cold weather.',
    pricePerDay: 4,
    category: 'CLOTHING',
    condition: 'LIKE_NEW',
    status: 'AVAILABLE',
    images: ['https://picsum.photos/seed/jacket1/400/300'],
    averageRating: 4.3,
    totalReviews: 9,
    owner: { id: 107, fullName: 'Nour A.', email: 'nour@example.com', universityEmail: 'nour@example.com', role: 'STUDENT', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 8,
    title: 'Sony PlayStation 5',
    description: 'Sony PlayStation 5. Perfect for breaks between classes.',
    pricePerDay: 30,
    category: 'ELECTRONICS',
    condition: 'NEW',
    status: 'AVAILABLE',
    images: ['https://picsum.photos/seed/ps51/400/300'],
    averageRating: 5.0,
    totalReviews: 42,
    owner: { id: 108, fullName: 'Ziad T.', email: 'ziad@example.com', universityEmail: 'ziad@example.com', role: 'STUDENT', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 9,
    title: 'Organic Chemistry Textbook',
    description: 'Organic Chemistry Textbook. Good condition, no highlights.',
    pricePerDay: 6,
    category: 'TEXTBOOKS',
    condition: 'GOOD',
    status: 'AVAILABLE',
    images: ['https://picsum.photos/seed/book3/400/300'],
    averageRating: 4.1,
    totalReviews: 11,
    owner: { id: 109, fullName: 'Hala F.', email: 'hala@example.com', universityEmail: 'hala@example.com', role: 'STUDENT', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(searchInput, 350);
  const category = (searchParams.get('category') ?? '') as ListingCategory | '';
  const page = parseInt(searchParams.get('page') ?? '0', 10);

  const { data, isLoading, isError } = useGetListingsQuery({
    page,
    size: 12,
    search: debouncedSearch || undefined,
    category: category || undefined,
  });

  // Filter mock listings to match current search/category state
  const filteredMock = MOCK_LISTINGS.filter((l) => {
    const matchCat = !category || l.category === category;
    const matchSearch = !debouncedSearch ||
      l.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      l.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Use mock data as fallback when API errors or returns nothing
  const showMock = isError || (!isLoading && !data?.content.length);
  const displayListings = showMock ? filteredMock : (data?.content ?? []);

  const setCategory = (cat: string) => {
    const p = new URLSearchParams(searchParams);
    cat ? p.set('category', cat) : p.delete('category');
    p.delete('page');
    setSearchParams(p);
  };

  const setPage = (pg: number) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', String(pg));
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-3">
          Borrow from ZUJ campus
        </h1>
        <p className="text-on-surface-variant font-body text-lg max-w-2xl">
          Rent textbooks, cameras, calculators, and more — directly from fellow Al-Zaytoonah University students.
        </p>
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search listings…"
            className="us-input pl-12"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat || 'all'}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2.5 rounded-lg text-sm font-label font-medium transition-all duration-200
                ${category === cat
                  ? 'bg-primary text-on-primary shadow-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              {cat ? CATEGORY_LABELS[cat] : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(data || showMock) && (
        <p className="text-sm text-on-surface-variant mb-6 font-body">
          {showMock ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Demo mode
              </span>
              {' '}— {filteredMock.length} sample listing{filteredMock.length !== 1 ? 's' : ''}
              {debouncedSearch && <> for <strong className="text-on-surface">"{debouncedSearch}"</strong></>}
              {category && <> in <strong className="text-on-surface">{CATEGORY_LABELS[category]}</strong></>}
            </>
          ) : (
            <>
              {data!.totalElements} listing{data!.totalElements !== 1 ? 's' : ''} found
              {debouncedSearch && <> for <strong className="text-on-surface">"{debouncedSearch}"</strong></>}
              {category && <> in <strong className="text-on-surface">{CATEGORY_LABELS[category]}</strong></>}
            </>
          )}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : displayListings.length === 0 ? (
        <EmptyState
          icon="search_off"
          title="No listings found"
          description="Try adjusting your search or clearing the category filter."
          action={
            <button onClick={() => { setSearchInput(''); setCategory(''); }} className="btn-surface">
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination — only when real API data has multiple pages */}
          {!showMock && data && data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="btn-surface px-3 py-2 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-10 h-10 rounded-lg text-sm font-label font-semibold transition-all
                    ${i === page ? 'bg-primary text-on-primary' : 'btn-surface'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages - 1}
                className="btn-surface px-3 py-2 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
