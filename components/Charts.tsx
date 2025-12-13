import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { RevenueData, GuestSegment, BookingForecast } from '../types';

export const RevenueTrendChart: React.FC<{ data: RevenueData[], darkMode?: boolean }> = ({ data, darkMode }) => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1976D2" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#1976D2" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#374151" : "#E5E7EB"} />
        <XAxis dataKey="date" hide />
        <YAxis stroke={darkMode ? "#9CA3AF" : "#9CA3AF"} fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: darkMode ? '#1F2937' : '#fff', 
            borderRadius: '8px', 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: darkMode ? '#fff' : '#000'
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
        />
        <Area type="monotone" dataKey="revenue" stroke="#1976D2" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
        <Area type="monotone" dataKey="projected" stroke={darkMode ? "#4ade80" : "#82ca9d"} strokeDasharray="5 5" fill="none" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const SegmentPieChart: React.FC<{ data: GuestSegment[] }> = ({ data }) => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data as any[]}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const ForecastChart: React.FC<{ data: BookingForecast[], darkMode?: boolean }> = ({ data, darkMode }) => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#374151" : "#f0f0f0"} />
        <XAxis dataKey="date" fontSize={12} tickMargin={10} stroke={darkMode ? "#9CA3AF" : "#666"} />
        <YAxis domain={[0, 100]} unit="%" fontSize={12} stroke={darkMode ? "#9CA3AF" : "#666"} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: darkMode ? '#1F2937' : '#fff', 
            borderRadius: '8px', 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: darkMode ? '#fff' : '#000'
          }}
        />
        <Area type="monotone" dataKey="confidenceUpper" stackId="1" stroke="none" fill={darkMode ? "#1e3a8a" : "#E3F2FD"} />
        <Area type="monotone" dataKey="confidenceLower" stackId="1" stroke="none" fill={darkMode ? "#1f2937" : "#ffffff"} />
        <Line type="monotone" dataKey="occupancy" stroke="#1976D2" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);