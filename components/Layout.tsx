import React from 'react';
import { View } from '../types';
import { LayoutDashboard, CalendarDays, DollarSign, Users, BarChart3, Bell, User, Search, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Alert } from '../types';

interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
  alerts: Alert[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

const NavItem: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string 
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children, alerts, darkMode, toggleDarkMode, onLogout }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-20 transition-colors duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white leading-none">SmartHotel</h1>
            <span className="text-xs text-gray-500 dark:text-gray-400">Booking Engine</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-4 mt-4">Dashboards</div>
          <NavItem 
            active={currentView === 'EXECUTIVE'} 
            onClick={() => onNavigate('EXECUTIVE')} 
            icon={<LayoutDashboard size={20} />} 
            label="Executive Overview" 
          />
          <NavItem 
            active={currentView === 'OPERATIONS'} 
            onClick={() => onNavigate('OPERATIONS')} 
            icon={<CalendarDays size={20} />} 
            label="Operations Center" 
          />
          <NavItem 
            active={currentView === 'FINANCIAL'} 
            onClick={() => onNavigate('FINANCIAL')} 
            icon={<DollarSign size={20} />} 
            label="Financial Report" 
          />
          
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-4 mt-6">Analytics</div>
          <NavItem 
            active={currentView === 'GUEST_ANALYTICS'} 
            onClick={() => onNavigate('GUEST_ANALYTICS')} 
            icon={<Users size={20} />} 
            label="Guest Insights" 
          />
          <NavItem 
            active={currentView === 'BI_ANALYTICS'} 
            onClick={() => onNavigate('BI_ANALYTICS')} 
            icon={<BarChart3 size={20} />} 
            label="Business Intelligence" 
          />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
           <button 
             onClick={onLogout}
             className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full px-4 py-2 text-sm"
           >
             <LogOut size={18} />
             <span>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-8 z-10 transition-colors duration-200">
          <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700/50 rounded-full px-4 py-2 w-96">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search rooms, guests, or bookings..." 
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-6">
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative cursor-pointer group">
              <div className="relative">
                <Bell size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
              </div>
            </div>
            
            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              <Settings size={20} />
            </button>

            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">Alex Morgan</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">General Manager</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-sm">
                <User size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};