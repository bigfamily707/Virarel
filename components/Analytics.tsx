import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MetricData } from '../types';

const data: MetricData[] = [
  { name: 'Day 1', views: 4000, engagement: 240, amt: 2400 },
  { name: 'Day 2', views: 3000, engagement: 139, amt: 2210 },
  { name: 'Day 3', views: 2000, engagement: 980, amt: 2290 },
  { name: 'Day 4', views: 2780, engagement: 390, amt: 2000 },
  { name: 'Day 5', views: 1890, engagement: 480, amt: 2181 },
  { name: 'Day 6', views: 2390, engagement: 380, amt: 2500 },
  { name: 'Day 7', views: 3490, engagement: 430, amt: 2100 },
];

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Performance Analytics</h2>
        <p className="text-neutral-400">Deep dive into cross-platform metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Growth Chart */}
        <div className="bg-dark-900 p-6 rounded-2xl border border-neutral-800">
            <h3 className="text-lg font-bold text-white mb-6">View Growth</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#EAB308' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#EAB308" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Engagement Bar Chart */}
        <div className="bg-dark-900 p-6 rounded-2xl border border-neutral-800">
            <h3 className="text-lg font-bold text-white mb-6">Daily Engagement</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                         <Tooltip 
                            cursor={{fill: '#33333330'}}
                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar dataKey="engagement" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-dark-900 p-6 rounded-2xl border border-neutral-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Platform ROI</h3>
            <select className="bg-neutral-950 border border-neutral-800 text-xs rounded-lg px-2 py-1 text-white">
                <option>Last 30 Days</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-xs text-neutral-500 border-b border-neutral-800">
                        <th className="pb-3 pl-4">Platform</th>
                        <th className="pb-3">Videos</th>
                        <th className="pb-3">Avg. Views</th>
                        <th className="pb-3">Retention</th>
                        <th className="pb-3">Conversion</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    <tr className="border-b border-neutral-800/50 group hover:bg-neutral-800/20">
                        <td className="py-4 pl-4 font-medium text-white">YouTube Shorts</td>
                        <td className="py-4 text-neutral-400">12</td>
                        <td className="py-4 text-neutral-300">14.2K</td>
                        <td className="py-4 text-green-500">82%</td>
                        <td className="py-4 text-white">1.2%</td>
                    </tr>
                     <tr className="border-b border-neutral-800/50 group hover:bg-neutral-800/20">
                        <td className="py-4 pl-4 font-medium text-white">TikTok</td>
                        <td className="py-4 text-neutral-400">15</td>
                        <td className="py-4 text-neutral-300">45.1K</td>
                        <td className="py-4 text-yellow-500">65%</td>
                        <td className="py-4 text-white">0.8%</td>
                    </tr>
                     <tr className="group hover:bg-neutral-800/20">
                        <td className="py-4 pl-4 font-medium text-white">Instagram Reels</td>
                        <td className="py-4 text-neutral-400">12</td>
                        <td className="py-4 text-neutral-300">8.9K</td>
                        <td className="py-4 text-neutral-400">45%</td>
                        <td className="py-4 text-white">2.4%</td>
                    </tr>
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};
