import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PriceChartProps {
  currentTime: number;
}

const data = Array.from({ length: 24 }, (_, i) => {
  let price = 0.22;
  if (i >= 19 && i < 22) price = 0.50;
  else if (i >= 8 && i < 19) price = 0.33;
  return { time: i, price };
});

export const PriceChart: React.FC<PriceChartProps> = ({ currentTime }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-white">Dynamic Tariff (RM/kWh)</h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {(currentTime >= 19 && currentTime < 22) && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${currentTime >= 19 && currentTime < 22 ? 'bg-red-500' : 'bg-zinc-500'}`}></span>
          </span>
          <span className="text-xs text-zinc-400 uppercase tracking-wider">
            {currentTime >= 19 && currentTime < 22 ? 'Spike Alert Active' : 'Normal Rate'}
          </span>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#52525b" 
              tick={{ fill: '#a1a1aa', fontSize: 12 }} 
              tickFormatter={(val) => `${val}:00`}
            />
            <YAxis 
              stroke="#52525b" 
              tick={{ fill: '#a1a1aa', fontSize: 12 }} 
              tickFormatter={(val) => `RM${val.toFixed(2)}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
              itemStyle={{ color: '#f4f4f5' }}
              labelFormatter={(val) => `${val}:00`}
              formatter={(value: number) => [`RM${value.toFixed(2)}`, 'Price']}
            />
            <Area 
              type="stepAfter" 
              dataKey="price" 
              stroke="#f43f5e" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
            <ReferenceLine x={currentTime} stroke="#38bdf8" strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
