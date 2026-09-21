import { useContext } from 'react';
import { ChatWidgetContext } from './chatWidgetContextObject';

export function useChatWidget() {
  const ctx = useContext(ChatWidgetContext);
  if (!ctx) throw new Error('useChatWidget must be used within a ChatWidgetProvider');
  return ctx;
}
