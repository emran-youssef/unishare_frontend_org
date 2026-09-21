import { chatKey } from './chatWidgetUtils';
import { useChatWidget } from './useChatWidget';
import { FloatingChatWindow } from './FloatingChatWindow';

const WINDOW_WIDTH = 320;
const GAP = 16;

// Hosts all open floating chat windows, stacked bottom-right, Facebook-style.
// Desktop only — floating windows don't fit a phone screen.
export function FloatingChatDock() {
  const { openChats, minimized, closeChat, toggleMinimize } = useChatWidget();

  if (openChats.length === 0) return null;

  return (
    <div className="hidden md:block">
      {openChats.map((chat, index) => {
        const key = chatKey(chat.listingId, chat.userId);
        return (
          <FloatingChatWindow
            key={key}
            listingId={chat.listingId}
            userId={chat.userId}
            minimized={Boolean(minimized[key])}
            offset={GAP + index * (WINDOW_WIDTH + GAP)}
            onClose={() => closeChat(chat.listingId, chat.userId)}
            onToggleMinimize={() => toggleMinimize(chat.listingId, chat.userId)}
          />
        );
      })}
    </div>
  );
}
