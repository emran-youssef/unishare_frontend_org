import { createContext } from 'react';

export interface OpenChat {
  listingId: number;
  userId: number;
}

export interface ChatWidgetState {
  listOpen: boolean;
  openChats: OpenChat[];
  minimized: Record<string, boolean>;
  toggleList: () => void;
  closeList: () => void;
  openChat: (listingId: number, userId: number) => void;
  closeChat: (listingId: number, userId: number) => void;
  toggleMinimize: (listingId: number, userId: number) => void;
}

export const ChatWidgetContext = createContext<ChatWidgetState | null>(null);
