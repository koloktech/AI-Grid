import React, { useState } from 'react';
import { Home } from '../types';
import { Sun, Car, Zap, Home as HomeIcon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface GridMapProps {
  homes: Home[];
}

export const GridMap: React.FC<GridMapProps> = ({ homes }) => {
  const [selectedHome, setSelectedHome] = useState<Home | null>(null);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-white">Digital Twin: 50 Homes</h2>
        <div className="flex gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Exporting</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Importing</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> V2G Active</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> AI Anomaly</div>
        </div>
      </div>
      
      <div className="grid grid-cols-10 gap-3">
        {homes.map((home) => {
          const isExporting = home.netLoad < 0;
          const isImporting = home.netLoad > 0 && !home.isV2GActive;
          
          return (
            <div 
              key={home.id} 
              onClick={() => setSelectedHome(home)}
              className={clsx(
                "relative aspect-square rounded-lg border p-2 flex flex-col items-center justify-center transition-colors duration-500 cursor-pointer",
                home.isV2GActive ? "bg-indigo-500/20 border-indigo-500/50" :
                home.isAnomaly ? "bg-amber-500/20 border-amber-500/50 animate-pulse" :
                isExporting ? "bg-emerald-500/10 border-emerald-500/30" :
                isImporting ? "bg-red-500/10 border-red-500/30" :
                "bg-zinc-800/50 border-zinc-700/50"
              )}
            >
              <HomeIcon className={clsx(
                "w-5 h-5 mb-1",
                home.isV2GActive ? "text-indigo-400" :
                home.isAnomaly ? "text-amber-400" :
                isExporting ? "text-emerald-400" :
                isImporting ? "text-red-400" :
                "text-zinc-500"
              )} />
              
              <div className="flex gap-1">
                {home.hasSolar && <Sun className="w-3 h-3 text-amber-400" />}
                {home.hasEV && <Car className="w-3 h-3 text-sky-400" />}
              </div>

              {home.isV2GActive && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute top-1 right-1"
                >
                  <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                </motion.div>
              )}
              
              {home.isAnomaly && (
                <div className="absolute top-1 left-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                </div>
              )}
              
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-zinc-500">
                {home.id}
              </div>

              {/* Tooltip */}
              <div className="absolute inset-0 bg-zinc-900/95 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg p-2 flex flex-col justify-center items-center text-[10px] z-10">
                <div className="font-mono text-white mb-1">{home.id}</div>
                <div className="text-zinc-400">Load: {home.baseLoad.toFixed(1)}kW</div>
                {home.hasSolar && <div className="text-emerald-400">Solar: {home.solarOutput.toFixed(1)}kW</div>}
                {home.hasEV && (
                  <>
                    <div className="text-sky-400">EV: {home.evChargeLevel.toFixed(0)}%</div>
                    {home.isV2GActive && <div className="text-indigo-400">V2G: {Math.abs(home.evChargingRate).toFixed(1)}kW</div>}
                  </>
                )}
                {home.isAnomaly && <div className="text-amber-400 mt-1">Anomaly Detected</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Reasoning Modal */}
      <AnimatePresence>
        {selectedHome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedHome(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-white mb-2">AI Reasoning: {selectedHome.id}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{selectedHome.aiV2GLogic}</p>
              <button 
                onClick={() => setSelectedHome(null)}
                className="mt-6 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
