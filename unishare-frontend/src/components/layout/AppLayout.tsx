import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ChatWidgetProvider } from '../../features/chat/ChatWidgetContext';
import { FloatingChatDock } from '../../features/chat/FloatingChatDock';

export function AppLayout() {
  return (
    <ChatWidgetProvider>
      <div className="min-h-screen flex flex-col">
        <Sidebar />
        <main className="flex-grow pt-[72px]">
          <Outlet />
        </main>
        <FloatingChatDock />
      </div>
    </ChatWidgetProvider>
  );
}
