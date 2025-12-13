# Smart Hotel Booking Engine - Frontend Development Guide

## Overview

The frontend is built with React 19.2.3, TypeScript, and Tailwind CSS, providing a modern, responsive interface for hotel management operations.

## Technology Stack

### Core Technologies
- **React 19.2.3**: Modern UI framework with concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework

### UI Libraries
- **Lucide React**: Modern icon library
- **Recharts**: Data visualization components
- **React DOM**: DOM rendering

### Development Tools
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes
- **ESLint**: Code linting (configured)

## Project Structure

```
Smart-Hotel-Booking-Engine/
├── src/
│   └── index.css              # Global styles
├── components/
│   ├── Layout.tsx             # Main application layout
│   ├── Login.tsx              # Authentication component
│   ├── Operations.tsx         # Operations dashboard
│   ├── Analytics.tsx          # Analytics dashboards
│   ├── Charts.tsx             # Data visualization
│   └── UI.tsx                 # Reusable UI components
├── services/
│   ├── apiService.ts          # API communication
│   └── geminiService.ts       # AI integration
├── App.tsx                    # Main application component
├── index.tsx                  # Application entry point
├── types.ts                   # TypeScript definitions
├── constants.ts               # Application constants
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
└── postcss.config.js          # PostCSS configuration
```

## Component Architecture

### Main Application Flow

```typescript
// App.tsx - Main application component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('EXECUTIVE');
  const [metrics, setMetrics] = useState({...});
  
  // Authentication check
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }
  
  // Main application layout
  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}
```

### Component Hierarchy

```
App
├── Login (conditional)
└── Layout (authenticated users)
    ├── Sidebar Navigation
    │   ├── Dashboard Links
    │   └── User Actions
    ├── Header
    │   ├── Search Bar
    │   ├── Notifications
    │   ├── Dark Mode Toggle
    │   └── User Profile
    └── Main Content
        ├── Executive Dashboard
        ├── Operations Center
        ├── Financial Analytics
        ├── Guest Analytics
        └── Business Intelligence
```

## Core Components

### Layout Component (`components/Layout.tsx`)

The main layout wrapper providing navigation and header functionality.

```typescript
interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
  alerts: Alert[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onNavigate, 
  children, 
  alerts, 
  darkMode, 
  toggleDarkMode, 
  onLogout 
}) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800">
        {/* Sidebar Navigation */}
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800">
          {/* Header with search, notifications, user menu */}
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
```

**Features:**
- Responsive sidebar navigation
- Dark/light mode toggle
- Search functionality
- Notification system
- User profile menu
- Mobile-friendly design

### Authentication Component (`components/Login.tsx`)

Handles user authentication with a clean, professional interface.

```typescript
interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
    localStorage.setItem('auth_token', 'valid');
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Login form */}
    </div>
  );
};
```

**Features:**
- Form validation
- Loading states
- Error handling
- Responsive design
- Professional styling

### Dashboard Components

#### Executive Dashboard
Displays key performance indicators and high-level metrics.

```typescript
// In App.tsx - Executive Dashboard rendering
case 'EXECUTIVE':
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Executive Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Occupancy Rate" 
          value={`${metrics.occupancyRate}%`} 
          trend={2.3} 
          icon={<BedDouble size={24}/>} 
        />
        {/* More KPI cards */}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Revenue Performance" className="lg:col-span-2">
          <RevenueTrendChart data={revenueData} darkMode={darkMode} />
        </Card>
        {/* Alerts and quick stats */}
      </div>
    </div>
  );
```

#### Operations Dashboard (`components/Operations.tsx`)
Real-time operations management interface.

```typescript
export const OperationsDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    loadRoomData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Operations Center</h2>
        <div className="flex gap-2">
          {/* Filter buttons */}
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {rooms.map(room => (
          <RoomCard 
            key={room.id} 
            room={room} 
            onClick={() => setSelectedRoom(room)} 
          />
        ))}
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetailsModal 
          room={selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
        />
      )}
    </div>
  );
};
```

### UI Components (`components/UI.tsx`)

Reusable components for consistent design.

```typescript
// StatCard - KPI display component
interface StatCardProps {
  label: string;
  value: string;
  trend?: number;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  trend, 
  icon 
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {trend && (
          <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </p>
        )}
      </div>
      {icon && (
        <div className="text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      )}
    </div>
  </div>
);

// Card - Generic container component
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
    )}
    {children}
  </div>
);

// Badge - Status indicator component
interface BadgeProps {
  type: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ type, children }) => {
  const colors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type]}`}>
      {children}
    </span>
  );
};
```

## Data Visualization (`components/Charts.tsx`)

Charts and graphs for analytics dashboards.

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueTrendChartProps {
  data: RevenueData[];
  darkMode: boolean;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data, darkMode }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
      <XAxis 
        dataKey="date" 
        stroke={darkMode ? '#9CA3AF' : '#6B7280'}
        fontSize={12}
      />
      <YAxis 
        stroke={darkMode ? '#9CA3AF' : '#6B7280'}
        fontSize={12}
        tickFormatter={(value) => `$${value.toLocaleString()}`}
      />
      <Tooltip 
        contentStyle={{
          backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
          border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
          borderRadius: '8px'
        }}
        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
      />
      <Line 
        type="monotone" 
        dataKey="revenue" 
        stroke="#3B82F6" 
        strokeWidth={2}
        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
        activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
      />
    </LineChart>
  </ResponsiveContainer>
);
```

## State Management

### Application State Structure

```typescript
// Main App state
interface AppState {
  isAuthenticated: boolean;
  currentView: View;
  alerts: Alert[];
  darkMode: boolean;
  metrics: {
    occupancyRate: number;
    dailyRevenue: number;
    arrivalsToday: number;
    inHouseGuests: number;
  };
  revenueData: RevenueData[];
}

// View types
type View = 'EXECUTIVE' | 'OPERATIONS' | 'FINANCIAL' | 'GUEST_ANALYTICS' | 'BI_ANALYTICS';
```

### State Management Patterns

```typescript
// useState for local component state
const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

// useEffect for data loading
useEffect(() => {
  if (isAuthenticated) {
    loadDashboardData();
  }
}, [isAuthenticated]);

// Custom hooks for reusable logic
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('auth_token') === 'valid';
    } catch {
      return false;
    }
  });

  const login = () => {
    localStorage.setItem('auth_token', 'valid');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};
```

## API Integration (`services/apiService.ts`)

Centralized API communication service.

```typescript
const API_BASE_URL = 'http://localhost:3001/api';

export const apiService = {
  // Dashboard metrics
  async getDashboardMetrics() {
    const response = await fetch(`${API_BASE_URL}/dashboard/metrics`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  },

  // Room management
  async getRoomStatus() {
    const response = await fetch(`${API_BASE_URL}/rooms/status`);
    if (!response.ok) throw new Error('Failed to fetch room status');
    return response.json();
  },

  // Revenue data
  async getRevenueData() {
    const response = await fetch(`${API_BASE_URL}/revenue/daily`);
    if (!response.ok) throw new Error('Failed to fetch revenue data');
    return response.json();
  },

  // Create reservation
  async createReservation(data: {
    guestId: number;
    roomId: number;
    checkIn: string;
    checkOut: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create reservation');
    return response.json();
  },

  // Error handling wrapper
  async request<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
};
```

## TypeScript Definitions (`types.ts`)

Comprehensive type definitions for type safety.

```typescript
// Enums for consistent values
export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
  DIRTY = 'DIRTY'
}

export enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  EXECUTIVE = 'EXECUTIVE'
}

// Core interfaces
export interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  price: number;
}

export interface KPI {
  label: string;
  value: string | number;
  trend: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  format?: 'currency' | 'percent' | 'number';
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  message: string;
  timestamp: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  expenses: number;
  projected: number;
}

// View types
export type View = 'EXECUTIVE' | 'OPERATIONS' | 'FINANCIAL' | 'GUEST_ANALYTICS' | 'BI_ANALYTICS';
```

## Styling and Theming

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
```

### Dark Mode Implementation

```typescript
// Dark mode state management
const [darkMode, setDarkMode] = useState(false);

// Apply dark mode class to document
useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [darkMode]);

// Toggle function
const toggleDarkMode = () => setDarkMode(!darkMode);
```

### Responsive Design Patterns

```css
/* Mobile-first responsive classes */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.card-responsive {
  @apply p-4 md:p-6 rounded-lg md:rounded-xl;
}

.text-responsive {
  @apply text-sm md:text-base lg:text-lg;
}
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy loading for large components
const AnalyticsDashboard = lazy(() => import('./components/Analytics'));
const OperationsDashboard = lazy(() => import('./components/Operations'));

// Wrap with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <AnalyticsDashboard />
</Suspense>
```

### Memoization
```typescript
// Memoize expensive calculations
const memoizedMetrics = useMemo(() => {
  return calculateComplexMetrics(rawData);
}, [rawData]);

// Memoize components
const MemoizedChart = React.memo(RevenueTrendChart);
```

### Efficient Re-renders
```typescript
// Use callback to prevent unnecessary re-renders
const handleRoomClick = useCallback((room: Room) => {
  setSelectedRoom(room);
}, []);

// Optimize state updates
const updateMetrics = useCallback((newMetrics: Partial<Metrics>) => {
  setMetrics(prev => ({ ...prev, ...newMetrics }));
}, []);
```

## Development Workflow

### Development Server
```bash
# Start development server
npm run dev

# Server runs on http://localhost:5173
# Hot reload enabled
# TypeScript checking in real-time
```

### Build Process
```bash
# Production build
npm run build

# Preview production build
npm run preview

# Build output in dist/ directory
```

### Code Quality
```bash
# TypeScript checking
npx tsc --noEmit

# Linting (if configured)
npx eslint src/

# Format code (if Prettier configured)
npx prettier --write src/
```

## Testing Strategies

### Component Testing
```typescript
// Example test structure
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from '../components/UI';

describe('StatCard', () => {
  it('displays label and value correctly', () => {
    render(<StatCard label="Occupancy" value="85%" />);
    expect(screen.getByText('Occupancy')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows trend indicator when provided', () => {
    render(<StatCard label="Revenue" value="$1000" trend={5.2} />);
    expect(screen.getByText('↗ 5.2%')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// API integration tests
describe('API Integration', () => {
  it('loads dashboard metrics on mount', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/occupancy rate/i)).toBeInTheDocument();
    });
  });
});
```

## Deployment

### Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
```

### Environment Variables
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Smart Hotel Booking Engine
```

---

*This frontend guide provides comprehensive documentation for developing and maintaining the React-based user interface of the Smart Hotel Booking Engine.*