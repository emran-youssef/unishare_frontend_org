import { useState, useEffect, useRef } from 'react';
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
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: convLoading } = useGetConversationsQuery();
  const { data: messages = [], isLoading: msgLoading } = useGetMessagesQuery(Number(userId), { skip: !userId });
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSend = async (data: SendMessageFormData) => {
    if (!userId) return;
    try {
      await sendMessage({ userId: Number(userId), body: { content: data.content } }).unwrap();
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const activeConversation = conversations.find((c) => c.otherUser.id === Number(userId));

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
            conversations.map((conv) => (
              <Link
                key={conv.otherUser.id}
                to={`/chat/${conv.otherUser.id}`}
                className={`flex items-center gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors border-b border-surface-container-highest
                  ${conv.otherUser.id === Number(userId) ? 'bg-surface-container-low' : ''}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container font-headline">
                    {getInitials(conv.otherUser.fullName)}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-on-surface text-sm">{conv.otherUser.fullName}</p>
                    <p className="text-xs text-on-surface-variant shrink-0 ml-2">
                      {formatRelativeTime(conv.lastMessage.createdAt)}
                    </p>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{conv.lastMessage.content}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* CENTER — message thread */}
      <div className="flex-grow flex flex-col min-w-0">
        {!userId ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState icon="forum" title="Select a conversation" description="Choose a conversation from the left to start messaging." />
          </div>
        ) : (
          <>
            {/* Thread header */}
            {activeConversation && (
              <div className="p-5 border-b border-surface-container-highest flex items-center gap-3 bg-surface-container-lowest">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container font-headline text-sm">
                  {getInitials(activeConversation.otherUser.fullName)}
                </div>
                <div>
                  <p className="font-semibold text-on-surface">{activeConversation.otherUser.fullName}</p>
                  <p className="text-xs text-on-surface-variant">{activeConversation.otherUser.universityEmail}</p>
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
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container mr-2 shrink-0 self-end">
                          {getInitials(msg.sender.fullName)}
                        </div>
                      )}
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed
                        ${isMine ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container text-on-surface rounded-bl-sm'}`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>
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
