import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { GridMap } from './GridMap';
import { PriceChart } from './PriceChart';
import { StatCard } from './StatCard';
import { SarawakGridMap } from './SarawakGridMap';
import { Clock, Zap, BatteryCharging, DollarSign, Play, Pause, FastForward, Activity, Home as HomeIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

export const Dashboard: React.FC = () => {
  const { homes, gridState, isRunning, setIsRunning, speed, setSpeed } = useSimulation();
  const [activeTab, setActiveTab] = useState<'neighborhood' | 'sarawak'>('sarawak');

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">MY-Grid AI</h1>
            <p className="text-zinc-400 text-sm">Smart Neighborhood Aggregator & VPP Simulator</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Tabs */}
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveTab('sarawak')}
                className={clsx(
                  "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                  activeTab === 'sarawak' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Activity className="w-4 h-4" />
                Sarawak Grid
              </button>
              <button
                onClick={() => setActiveTab('neighborhood')}
                className={clsx(
                  "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                  activeTab === 'neighborhood' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <HomeIcon className="w-4 h-4" />
                Neighborhood VPP
              </button>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300 hover:text-white"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <div className="h-6 w-px bg-zinc-700"></div>
              <button 
                onClick={() => setSpeed(speed === 1000 ? 500 : speed === 500 ? 100 : 1000)}
                className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300 hover:text-white flex items-center gap-2"
              >
                <FastForward className="w-5 h-5" />
                <span className="text-xs font-mono">{speed === 1000 ? '1x' : speed === 500 ? '2x' : '10x'}</span>
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'sarawak' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
          >
            <SarawakGridMap />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Current Time" 
                value={formatTime(gridState.time)} 
                icon={<Clock className="w-5 h-5" />} 
                valueClassName={gridState.isPeak ? "text-red-400" : "text-sky-400"}
              />
              <StatCard 
                title="Current Price" 
                value={`RM ${gridState.price.toFixed(2)}`} 
                icon={<DollarSign className="w-5 h-5" />} 
                trend={gridState.isPeak ? "Peak Rate" : "Standard"}
                valueClassName={gridState.isPeak ? "text-red-400" : "text-white"}
              />
              <StatCard 
                title="V2G Power Active" 
                value={`${gridState.totalV2G.toFixed(1)} kW`} 
                icon={<BatteryCharging className="w-5 h-5" />} 
                valueClassName={gridState.totalV2G > 0 ? "text-indigo-400" : "text-zinc-500"}
              />
              <StatCard 
                title="Total RM Saved" 
                value={`RM ${gridState.totalSavings.toFixed(2)}`} 
                icon={<Zap className="w-5 h-5" />} 
                valueClassName="text-emerald-400"
              />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GridMap homes={homes} />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="flex-1">
                  <PriceChart currentTime={gridState.time} />
                </div>
                
                {/* AI Status Panel */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">AI Orchestrator Status</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-300">Grid Stress Level</span>
                      <span className="text-sm font-mono text-white">
                        {gridState.isPeak ? 'HIGH' : gridState.time >= 8 && gridState.time < 19 ? 'MEDIUM' : 'LOW'}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <motion.div 
                        className={`h-2 rounded-full ${gridState.isPeak ? 'bg-red-500' : gridState.time >= 8 && gridState.time < 19 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: gridState.isPeak ? '90%' : gridState.time >= 8 && gridState.time < 19 ? '50%' : '20%' }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Total Load</p>
                        <p className="text-lg font-mono text-white">{gridState.totalLoad.toFixed(1)} kW</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Solar Gen</p>
                        <p className="text-lg font-mono text-emerald-400">{gridState.totalSolar.toFixed(1)} kW</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {gridState.isPeak 
                          ? "CRITICAL PEAK DETECTED. VPP has activated V2G protocols. EVs are currently discharging to offset neighborhood cooling loads and minimize grid draw."
                          : gridState.time >= 8 && gridState.time < 19 
                          ? "Daytime operations. Solar generation active. EVs charging from excess solar where available."
                          : "Off-peak hours. Grid prices are low. EVs are charging to ensure 100% readiness for morning commute."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
