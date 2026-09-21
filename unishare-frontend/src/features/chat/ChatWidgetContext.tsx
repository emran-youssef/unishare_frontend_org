import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { chatKey } from './chatWidgetUtils';
import { ChatWidgetContext, type ChatWidgetState, type OpenChat } from './chatWidgetContextObject';

// Keep at most this many floating windows open at once, like Facebook's chat heads.
const MAX_OPEN_CHATS = 2;

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const [listOpen, setListOpen] = useState(false);
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [minimized, setMinimized] = useState<Record<string, boolean>>({});

  const toggleList = useCallback(() => setListOpen((o) => !o), []);
  const closeList = useCallback(() => setListOpen(false), []);

  const openChat = useCallback((listingId: number, userId: number) => {
    const key = chatKey(listingId, userId);
    setOpenChats((prev) => {
      const withoutExisting = prev.filter((c) => chatKey(c.listingId, c.userId) !== key);
      return [...withoutExisting, { listingId, userId }].slice(-MAX_OPEN_CHATS);
    });
    setMinimized((prev) => ({ ...prev, [key]: false }));
    setListOpen(false);
  }, []);

  const closeChat = useCallback((listingId: number, userId: number) => {
    const key = chatKey(listingId, userId);
    setOpenChats((prev) => prev.filter((c) => chatKey(c.listingId, c.userId) !== key));
    setMinimized((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const toggleMinimize = useCallback((listingId: number, userId: number) => {
    const key = chatKey(listingId, userId);
    setMinimized((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const value = useMemo<ChatWidgetState>(
    () => ({ listOpen, openChats, minimized, toggleList, closeList, openChat, closeChat, toggleMinimize }),
    [listOpen, openChats, minimized, toggleList, closeList, openChat, closeChat, toggleMinimize],
  );

  return <ChatWidgetContext.Provider value={value}>{children}</ChatWidgetContext.Provider>;
}
