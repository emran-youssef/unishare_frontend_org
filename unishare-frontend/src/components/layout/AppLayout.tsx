import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar />
      <main className="flex-grow pt-[72px]">
        <Outlet />
      </main>
    </div>
  );
}
