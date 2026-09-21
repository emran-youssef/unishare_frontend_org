import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation } from './chatApi';
import { useGetPublicProfileQuery } from '../user/userApi';
import { useAuth } from '../../hooks/useAuth';
import { sendMessageSchema, type SendMessageFormData } from '../../utils/validators';
import { formatRelativeTime, getInitials } from '../../utils/formatters';

interface FloatingChatWindowProps {
  listingId: number;
  userId: number;
  minimized: boolean;
  offset: number;
  onClose: () => void;
  onToggleMinimize: () => void;
}

export function FloatingChatWindow({ listingId, userId, minimized, offset, onClose, onToggleMinimize }: FloatingChatWindowProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useGetConversationsQuery();
  const { data: otherUser } = useGetPublicProfileQuery(userId);
  const { data: messages = [], isLoading } = useGetMessagesQuery(
    { listingId, userId },
    { pollingInterval: minimized ? undefined : 5000 },
  );
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
  });

  useEffect(() => {
    if (!minimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, minimized]);

  const onSend = async (data: SendMessageFormData) => {
    try {
      await sendMessage({ listingId, receiverId: userId, body: { content: data.content } }).unwrap();
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const listing = conversations.find((c) => c.id === listingId);
  const personName = otherUser?.fullName ?? 'Conversation';
  const listingTitle = listing?.title ?? '';

  return (
    <div
      className="fixed bottom-0 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-t-xl border border-b-0 border-surface-container-highest bg-surface-container-lowest shadow-card-lg flex flex-col overflow-hidden"
      style={{ right: offset, height: minimized ? undefined : 420 }}
    >
      {/* Header — click to minimize/restore */}
      <button
        type="button"
        onClick={onToggleMinimize}
        className="flex items-center gap-2 px-3 py-2.5 bg-primary text-on-primary shrink-0"
      >
        <div className="w-7 h-7 rounded-full bg-on-primary/20 flex items-center justify-center text-[10px] font-bold shrink-0">
          {getInitials(personName)}
        </div>
        <div className="flex-grow min-w-0 text-left">
          <p className="text-sm font-semibold truncate">{personName}</p>
          {listingTitle && (
            <p className="text-[10px] text-on-primary/70 truncate flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">sell</span>
              <span className="truncate">{listingTitle}</span>
            </p>
          )}
        </div>
        <span
          role="button"
          aria-label="Close chat"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="grid h-6 w-6 place-items-center rounded-full hover:bg-on-primary/10 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </span>
      </button>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-3 space-y-2 bg-surface">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-xs text-on-surface-variant">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-on-surface-variant text-center px-4">
                Say hi 👋
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender.id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                    {isMine && (
                      <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-[8px] font-bold text-on-primary-container mr-1.5 shrink-0 self-end">
                        {getInitials(msg.sender.fullName)}
                      </div>
                    )}
                    <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                      ${isMine ? 'bg-surface-container text-on-surface rounded-bl-sm' : 'bg-primary text-on-primary rounded-br-sm'}`}>
                      <p>{msg.content}</p>
                      <p className={`text-[9px] mt-0.5 ${isMine ? 'text-on-surface-variant' : 'text-on-primary/60'}`}>
                        {formatRelativeTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit(onSend)} className="p-2 border-t border-surface-container-highest bg-surface-container-lowest shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                {...register('content')}
                placeholder="Aa"
                rows={1}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(onSend)(); } }}
                className="us-input flex-grow resize-none min-h-[36px] max-h-24 text-sm py-2"
              />
              <button
                type="submit"
                disabled={isSending}
                className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shrink-0"
              >
                {isSending
                  ? <span className="w-3.5 h-3.5 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-[16px]">send</span>
                }
              </button>
            </div>
            {errors.content && <p className="text-error text-[10px] mt-1">{errors.content.message}</p>}
          </form>
        </>
      )}
    </div>
  );
}
