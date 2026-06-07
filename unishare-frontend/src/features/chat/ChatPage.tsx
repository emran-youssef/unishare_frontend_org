import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation } from './chatApi';
import { useAuth } from '../../hooks/useAuth';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { sendMessageSchema, type SendMessageFormData } from '../../utils/validators';
import { formatRelativeTime, getInitials } from '../../utils/formatters';

export function ChatPage() {
  // Route: /chat/:listingId/:userId
  const { listingId, userId } = useParams<{ listingId?: string; userId?: string }>();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const listingIdNum = listingId ? Number(listingId) : undefined;
  const userIdNum = userId ? Number(userId) : undefined;

  // Backend returns List<ListingDto> — each item is a listing with an active conversation
  const { data: conversations = [], isLoading: convLoading } = useGetConversationsQuery();

  // Fetch messages only when both listingId and userId are present
  const { data: messages = [], isLoading: msgLoading } = useGetMessagesQuery(
    { listingId: listingIdNum!, userId: userIdNum! },
    { skip: !listingIdNum || !userIdNum },
  );

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSend = async (data: SendMessageFormData) => {
    if (!listingIdNum || !userIdNum) return;
    try {
      await sendMessage({
        listingId: listingIdNum,
        receiverId: userIdNum,
        body: { content: data.content },
      }).unwrap();
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  // Find the active conversation listing
  const activeListing = conversations.find((c) => c.id === listingIdNum);

  // The other person: if I'm the owner → it's someone else; use userId from route
  // We show the listing title in the thread header
  const otherPersonId = userIdNum;

  return (
    <div className="h-[calc(100vh-72px)] flex bg-surface">
      {/* LEFT — conversations list */}
      <div className="w-full md:w-80 lg:w-96 border-r border-surface-container-highest flex flex-col shrink-0">
        <div className="p-5 border-b border-surface-container-highest">
          <h1 className="font-headline text-2xl font-bold text-on-surface">Messages</h1>
        </div>

        <div className="flex-grow overflow-y-auto">
          {convLoading ? (
            <div className="flex items-center justify-center h-32"><PageSpinner /></div>
          ) : conversations.length === 0 ? (
            <EmptyState icon="chat_bubble" title="No conversations" description="Start chatting from a listing page." />
          ) : (
            conversations.map((listing) => {
              // Navigate to /chat/{listingId}/{ownerId}
              const targetUserId = listing.owner.id === user?.id
                ? otherPersonId  // I'm the owner — use route param
                : listing.owner.id; // I'm the renter — other person is the owner

              return (
                <Link
                  key={listing.id}
                  to={`/chat/${listing.id}/${targetUserId ?? listing.owner.id}`}
                  className={`flex items-center gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors border-b border-surface-container-highest
                    ${listing.id === listingIdNum ? 'bg-surface-container-low' : ''}`}
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container font-headline shrink-0">
                    {getInitials(listing.owner.fullName)}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-on-surface text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">
                      with {listing.owner.fullName}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* CENTER — message thread */}
      <div className="flex-grow flex flex-col min-w-0">
        {!listingIdNum || !userIdNum ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState icon="forum" title="Select a conversation" description="Choose a conversation from the left to start messaging." />
          </div>
        ) : (
          <>
            {/* Thread header */}
            {activeListing && (
              <div className="p-5 border-b border-surface-container-highest flex items-center gap-3 bg-surface-container-lowest">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container font-headline text-sm">
                  {getInitials(activeListing.title)}
                </div>
                <div>
                  <p className="font-semibold text-on-surface">{activeListing.title}</p>
                  <p className="text-xs text-on-surface-variant">with {activeListing.owner.fullName}</p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {msgLoading ? (
                <PageSpinner />
              ) : messages.length === 0 ? (
                <EmptyState icon="chat" title="No messages yet" description="Send a message to start the conversation." />
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                      {isMine && (
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container mr-2 shrink-0 self-end">
                          {getInitials(msg.sender.fullName)}
                        </div>
                      )}
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed
                        ${isMine ? 'bg-surface-container text-on-surface rounded-bl-sm' : 'bg-primary text-on-primary rounded-br-sm'}`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-on-surface-variant' : 'text-on-primary/60'}`}>
                          {formatRelativeTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSubmit(onSend)} className="p-4 border-t border-surface-container-highest bg-surface-container-lowest">
              <div className="flex gap-3 items-end">
                <textarea
                  {...register('content')}
                  placeholder="Type a message…"
                  rows={1}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(onSend)(); } }}
                  className="us-input flex-grow resize-none min-h-[44px] max-h-32"
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                >
                  {isSending
                    ? <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-[20px]">send</span>
                  }
                </button>
              </div>
              {errors.content && <p className="text-error text-xs mt-1">{errors.content.message}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
