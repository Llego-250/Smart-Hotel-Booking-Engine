import React, { useState, useEffect } from 'react';
import { Card, StatCard, Button, Badge } from './UI';
import { RevenueTrendChart, SegmentPieChart, ForecastChart } from './Charts';
import { REVENUE_DATA, GUEST_SEGMENTS, FORECAST_DATA, AI_PROMPTS } from '../constants';
import { generateInsight } from '../services/geminiService';
import { TrendingUp, Users, DollarSign, BrainCircuit, Download, Share2, Sparkles, Activity } from 'lucide-react';

interface AnalyticsProps {
  type: 'BI' | 'FINANCIAL' | 'GUEST';
  darkMode: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ type, darkMode }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Only fetch for BI view initially or on demand
    if (type === 'BI' && !aiInsight) {
      handleGenerateInsight();
    }
  }, [type]);

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    const insight = await generateInsight(AI_PROMPTS.EXECUTIVE_SUMMARY);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  if (type === 'BI') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Business Intelligence</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">AI-driven insights and predictive modeling</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary"><Share2 size={16}/> Share Report</Button>
            <Button variant="outline"><Download size={16}/> Export Data</Button>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">AI Executive Summary</h3>
              {loadingAi ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                </div>
              ) : (
                <p className="text-indigo-50 leading-relaxed text-sm md:text-base">
                  {aiInsight}
                </p>
              )}
              <button 
                onClick={handleGenerateInsight}
                className="mt-4 text-xs font-medium text-white/80 hover:text-white underline decoration-dotted"
              >
                Regenerate Insight
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Occupancy Forecast (30 Days)" action={<Button variant="outline" className="!py-1 !px-2 text-xs">View Model</Button>}>
             <ForecastChart data={FORECAST_DATA} darkMode={darkMode} />
             <p className="text-xs text-gray-400 mt-4 text-center">Shaded area represents 95% confidence interval based on historical seasonality.</p>
          </Card>
          <Card title="Revenue Optimization" action={<Badge type="success">Active</Badge>}>
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Dynamic Pricing Alert</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">High demand detected for weekend of Oct 15</p>
                  </div>
                  <Button variant="outline" className="text-xs">Apply +15% Rate</Button>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Channel Strategy</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">OTA commissions trending high</p>
                  </div>
                  <Button variant="outline" className="text-xs">Limit Allocation</Button>
                </div>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                   <div className="flex items-center gap-2 mb-2">
                     <Activity size={16} className="text-blue-600 dark:text-blue-400"/>
                     <span className="text-sm font-semibold dark:text-white">Market Positioning</span>
                   </div>
                   <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                   </div>
                   <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                     <span>Value Leader</span>
                     <span>Premium Market</span>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    );
  }

  // Financial Dashboard View
  if (type === 'FINANCIAL') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Revenue (MTD)" value="$324,500" trend={12.5} icon={<DollarSign size={24}/>} />
          <StatCard label="RevPAR" value="$215.40" trend={-2.1} icon={<Activity size={24}/>} />
          <StatCard label="ADR" value="$245.00" trend={5.4} icon={<TrendingUp size={24}/>} />
        </div>
        <Card title="Revenue Trends">
          <RevenueTrendChart data={REVENUE_DATA} darkMode={darkMode} />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card title="Expense Breakdown">
             <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                Expense Pie Chart Placeholder
             </div>
           </Card>
           <Card title="Recent Transactions">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {[1,2,3,4].map(i => (
                          <tr key={i} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">TX-{202400 + i}</td>
                              <td className="px-4 py-3">Room Charge</td>
                              <td className="px-4 py-3">${(Math.random() * 500).toFixed(2)}</td>
                              <td className="px-4 py-3"><Badge type="success">Paid</Badge></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
           </Card>
        </div>
      </div>
    );
  }

  // Guest Analytics View
  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guest Analytics</h2>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Guest Segments" className="lg:col-span-1">
             <SegmentPieChart data={GUEST_SEGMENTS} />
          </Card>
          <Card title="Loyalty & Retention" className="lg:col-span-2">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                   <h4 className="text-3xl font-bold text-blue-700 dark:text-blue-300">42%</h4>
                   <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Repeat Guest Rate</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                   <h4 className="text-3xl font-bold text-purple-700 dark:text-purple-300">8.9</h4>
                   <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avg Satisfaction Score</p>
                </div>
             </div>
             <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Top Origins</h4>
                <div className="space-y-2">
                   {['United States', 'United Kingdom', 'Germany', 'Canada'].map(c => (
                     <div key={c} className="flex justify-between text-sm">
                       <span className="text-gray-600 dark:text-gray-400">{c}</span>
                       <span className="font-medium text-gray-900 dark:text-gray-200">{Math.floor(Math.random() * 40) + 10}%</span>
                     </div>
                   ))}
                </div>
             </div>
          </Card>
       </div>
    </div>
  );
};