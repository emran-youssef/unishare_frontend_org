import { Link } from 'react-router-dom';
import { useGetConversationsQuery } from './chatApi';
import { useChatWidget } from './useChatWidget';
import { resolveConversationTarget } from './resolveConversationTarget';
import { useGetIncomingBookingsQuery } from '../bookings/bookingsApi';
import { useAuth } from '../../hooks/useAuth';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { getInitials } from '../../utils/formatters';

// Top-bar chat entry point. On mobile it's a plain link to the full /chat
// page (floating windows don't fit a phone screen); on desktop it opens a
// small Messenger-style conversation-list dropdown.
export function ChatDropdown() {
  const { user } = useAuth();
  const { listOpen, toggleList, closeList, openChat } = useChatWidget();
  const { data: conversations = [], isLoading } = useGetConversationsQuery();
  const { data: incomingBookings = [] } = useGetIncomingBookingsQuery();

  return (
    <>
      <Link
        to="/chat"
        aria-label="Messages"
        className="md:hidden grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary"
      >
        <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
      </Link>

      <div className="relative hidden md:block">
        <button
          type="button"
          aria-label="Messages"
          aria-expanded={listOpen}
          onClick={toggleList}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary"
        >
          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
        </button>

        {listOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeList} />
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-card-lg">
              <div className="px-4 py-3 border-b border-surface-container-highest flex items-center justify-between">
                <p className="font-headline text-lg font-bold text-on-surface">Messages</p>
                <Link
                  to="/chat"
                  onClick={closeList}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  See all
                </Link>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-24"><PageSpinner /></div>
                ) : conversations.length === 0 ? (
                  <EmptyState icon="chat_bubble" title="No conversations" description="Start chatting from a listing page." />
                ) : (
                  conversations.map((listing) => {
                    const target = resolveConversationTarget(listing, user?.id, incomingBookings);

                    const rowContent = (
                      <>
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container font-headline shrink-0">
                          {getInitials(target?.fullName ?? listing.title)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-semibold text-on-surface text-sm truncate">{target?.fullName ?? 'Unknown user'}</p>
                          <p className="text-xs text-on-surface-variant truncate mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">sell</span>
                            <span className="truncate">{listing.title}</span>
                          </p>
                        </div>
                      </>
                    );

                    const rowClass = 'w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-surface-container-highest last:border-b-0 text-left';

                    return target ? (
                      <button key={listing.id} type="button" onClick={() => openChat(listing.id, target.userId)} className={rowClass}>
                        {rowContent}
                      </button>
                    ) : (
                      <Link key={listing.id} to="/chat" onClick={closeList} className={rowClass}>
                        {rowContent}
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
