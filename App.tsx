import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { OperationsDashboard } from './components/Operations';
import { AnalyticsDashboard } from './components/Analytics';
import { Login } from './components/Login';
import { StatCard, Card, Badge } from './components/UI';
import { View, Alert } from './types';
import { INITIAL_ALERTS } from './constants';
import { DollarSign, Users, Activity, BedDouble } from 'lucide-react';
import { RevenueTrendChart } from './components/Charts';
import { REVENUE_DATA } from './constants';

function App() {
  // Initialize auth state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('auth_token') === 'valid';
    } catch {
      return false;
    }
  });
  
  const [currentView, setCurrentView] = useState<View>('EXECUTIVE');
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogin = () => {
    localStorage.setItem('auth_token', 'valid');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'OPERATIONS':
        return <OperationsDashboard />;
      case 'BI_ANALYTICS':
        return <AnalyticsDashboard type="BI" darkMode={darkMode} />;
      case 'FINANCIAL':
        return <AnalyticsDashboard type="FINANCIAL" darkMode={darkMode} />;
      case 'GUEST_ANALYTICS':
        return <AnalyticsDashboard type="GUEST" darkMode={darkMode} />;
      case 'EXECUTIVE':
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Overview</h2>
            
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Occupancy Rate" value="85.5%" trend={2.3} icon={<BedDouble size={24}/>} />
              <StatCard label="RevPAR" value="$208.40" trend={-1.2} icon={<Activity size={24}/>} />
              <StatCard label="Total Revenue" value="$45,250" trend={8.1} icon={<DollarSign size={24}/>} />
              <StatCard label="Guest Satisfaction" value="4.8/5.0" trend={0.5} icon={<Users size={24}/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <Card title="Revenue Performance (Last 30 Days)" className="lg:col-span-2">
                <RevenueTrendChart data={REVENUE_DATA} darkMode={darkMode} />
              </Card>

              {/* Alerts & Actions */}
              <div className="space-y-6">
                <Card title="Action Required">
                  <div className="space-y-3">
                    {alerts.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">All clear! No pending alerts.</p>
                    ) : (
                      alerts.map(alert => (
                        <div key={alert.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 group transition-colors">
                          <div className={`w-1 h-full rounded-full ${
                            alert.type === 'error' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{alert.message}</p>
                              <button onClick={() => dismissAlert(alert.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">×</button>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{alert.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card title="Quick Stats">
                   <div className="space-y-4">
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600 dark:text-gray-400">Arrivals Today</span>
                       <Badge type="info">24 Bookings</Badge>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600 dark:text-gray-400">Departures Today</span>
                       <Badge type="warning">18 Pending</Badge>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600 dark:text-gray-400">In-House</span>
                       <span className="text-sm font-bold text-gray-900 dark:text-white">88 Guests</span>
                     </div>
                   </div>
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      alerts={alerts} 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;