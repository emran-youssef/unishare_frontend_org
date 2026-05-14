import { useState } from 'react';
import { useGetAdminUsersQuery } from './adminApi';
import { AdminSidebar } from './components/AdminSidebar';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { RoleBadge, VerifiedBadge } from '../../components/ui/Badge';
import { formatDate, getInitials } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isError, refetch } = useGetAdminUsersQuery({
    page,
    size: 15,
  });

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AdminSidebar />
      <main className="flex-grow p-8 bg-surface-container-low/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">User Management</h1>
            <p className="text-on-surface-variant font-body">
              {data ? `${data.totalElements.toLocaleString()} registered users` : 'Loading…'}
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search users…"
              className="us-input pl-12"
            />
          </div>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <ErrorMessage error={null} onRetry={refetch} />
        ) : !data?.content.length ? (
          <EmptyState icon="group_off" title="No users found" />
        ) : (
          <>
            <div className="us-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">User</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant hidden md:table-cell">University Email</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Joined</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Role</th>
                    {/* Deactivate action is pending backend implementation */}
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((user) => (
                    <tr key={user.id} className="border-b border-surface-container-highest last:border-0 hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container font-headline shrink-0">
                            {getInitials(user.fullName)}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface text-sm">{user.fullName}</p>
                            <p className="text-xs text-on-surface-variant">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-on-surface">{user.universityEmail}</span>
                          <VerifiedBadge />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant hidden lg:table-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-surface px-3 py-2 disabled:opacity-40">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-lg text-sm font-label font-semibold ${i === page ? 'bg-primary text-on-primary' : 'btn-surface'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages - 1} className="btn-surface px-3 py-2 disabled:opacity-40">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
