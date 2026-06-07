import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetListingsQuery } from './listingsApi';
import { ListingCard, ListingCardSkeleton } from './components/ListingCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import type { ListingCategory } from '../../types/api.types';
import { CATEGORY_LABELS } from '../../utils/formatters';

const CATEGORIES = ['', 'TEXTBOOKS', 'ELECTRONICS', 'FURNITURE', 'CLOTHING', 'OTHER'] as const;

export function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(searchInput, 350);
  const category = (searchParams.get('category') ?? '') as ListingCategory | '';
  const page = parseInt(searchParams.get('page') ?? '0', 10);

  //automaticlly update each 30 sec
  const { data, isLoading, isError } = useGetListingsQuery({
    page,
    size: 12,
    search: debouncedSearch || undefined,
    category: category || undefined,
  }, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  });

  const displayListings = data?.content ?? [];

  const setCategory = (cat: string) => {
    const p = new URLSearchParams(searchParams);
    if (cat) {
      p.set('category', cat);
    } else {
      p.delete('category');
    }
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
      {data && (
        <p className="text-sm text-on-surface-variant mb-6 font-body">
          {data.totalElements} listing{data.totalElements !== 1 ? 's' : ''} found
          {debouncedSearch && <> for <strong className="text-on-surface">"{debouncedSearch}"</strong></>}
          {category && <> in <strong className="text-on-surface">{CATEGORY_LABELS[category]}</strong></>}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState
          icon="error_outline"
          title="Could not load listings"
          description="Please check your connection or try again."
          action={
            <button onClick={() => window.location.reload()} className="btn-surface">
              Retry
            </button>
          }
        />
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
              <ListingCard key={listing.id} listing={listing} showStatus />
            ))}
          </div>

          {data && data.totalPages > 1 && (
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