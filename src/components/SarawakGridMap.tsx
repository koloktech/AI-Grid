import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Factory, Waves, Radio, AlertTriangle, Cpu, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { clsx } from 'clsx';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface Node {
  id: string;
  name: string;
  type: 'hydro' | 'coal' | 'gas' | 'substation';
  x: number;
  y: number;
  status: 'active' | 'warning' | 'offline';
  capacity: string;
  output: number; // percentage
  aiFocus?: boolean;
}

interface Connection {
  from: string;
  to: string;
  status: 'active' | 'warning' | 'critical';
  load: number; // percentage
  aiAlert?: string;
}

const initialNodes: Node[] = [
  { id: 'kuching', name: 'Sejingkat', type: 'coal', x: 150, y: 480, status: 'active', capacity: '210 MW', output: 85 },
  { id: 'batang-ai', name: 'Batang Ai HEP', type: 'hydro', x: 280, y: 460, status: 'active', capacity: '108 MW', output: 90 },
  { id: 'mukah', name: 'Mukah Power', type: 'coal', x: 450, y: 320, status: 'active', capacity: '270 MW', output: 75 },
  { id: 'bintulu', name: 'Tanjung Kidurong', type: 'gas', x: 580, y: 240, status: 'active', capacity: '330 MW', output: 60 },
  { id: 'samalaju', name: 'Samalaju Node', type: 'substation', x: 650, y: 200, status: 'active', capacity: 'Transmission', output: 80, aiFocus: true },
  { id: 'bakun', name: 'Bakun HEP', type: 'hydro', x: 680, y: 360, status: 'active', capacity: '2400 MW', output: 75 },
  { id: 'murum', name: 'Murum HEP', type: 'hydro', x: 760, y: 380, status: 'active', capacity: '944 MW', output: 88 },
  { id: 'baleh', name: 'Baleh HEP', type: 'hydro', x: 700, y: 460, status: 'warning', capacity: '1285 MW', output: 0 },
  { id: 'miri', name: 'Miri Node', type: 'gas', x: 850, y: 120, status: 'active', capacity: '100 MW', output: 40 },
];

const initialConnections: Connection[] = [
  { from: 'murum', to: 'bakun', status: 'active', load: 85 },
  { from: 'baleh', to: 'bakun', status: 'warning', load: 0 },
  { from: 'bakun', to: 'samalaju', status: 'critical', load: 92, aiAlert: "AI Alert: 82% probability of line fault due to heavy winds predicted in 3 hours." },
  { from: 'bintulu', to: 'samalaju', status: 'active', load: 60 },
  { from: 'samalaju', to: 'miri', status: 'active', load: 45 },
  { from: 'bintulu', to: 'mukah', status: 'active', load: 70 },
  { from: 'mukah', to: 'kuching', status: 'active', load: 80 },
  { from: 'batang-ai', to: 'kuching', status: 'active', load: 85 },
];

const samalajuLoadData = [
  { time: '14:00', load: 850 },
  { time: '15:00', load: 920 },
  { time: '16:00', load: 1100 },
  { time: '17:00', load: 1450 }, // Spike
  { time: '18:00', load: 1380 },
  { time: '19:00', load: 1200 },
];

export const SarawakGridMap: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [hoveredLine, setHoveredLine] = useState<Connection | null>(null);
  const [frequency, setFrequency] = useState(49.85);
  const [showSamalajuChart, setShowSamalajuChart] = useState(false);
  const [dispatchExecuted, setDispatchExecuted] = useState(false);
  const [isProcessingDispatch, setIsProcessingDispatch] = useState(false);

  // Simulate grid frequency fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setFrequency(prev => {
        if (dispatchExecuted) {
          const diff = 50.00 - prev;
          if (Math.abs(diff) < 0.01) return 50.00 + (Math.random() * 0.01 - 0.005);
          return prev + diff * 0.2; // gradually move to 50.00
        } else {
          return 49.75 + (Math.random() * 0.2); // volatile between 49.75 and 49.95
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatchExecuted]);

  const handleDispatch = () => {
    setIsProcessingDispatch(true);
    
    setTimeout(() => {
      setIsProcessingDispatch(false);
      setDispatchExecuted(true);
      
      // Update connections for dispatch animation
      setConnections(prev => prev.map(conn => {
        if (conn.from === 'bakun' && conn.to === 'samalaju') {
          return { ...conn, status: 'active', aiAlert: undefined, isDispatching: true, dispatchDirection: 'forward' };
        }
        if (conn.from === 'bintulu' && conn.to === 'samalaju') {
          return { ...conn, isDispatching: true, dispatchDirection: 'forward' };
        }
        if (conn.from === 'bintulu' && conn.to === 'mukah') {
          return { ...conn, isDispatching: true, dispatchDirection: 'backward' };
        }
        if (conn.from === 'mukah' && conn.to === 'kuching') {
          return { ...conn, isDispatching: true, dispatchDirection: 'backward' };
        }
        return conn;
      }));

      // Update nodes to show increased output
      setNodes(prev => prev.map(node => {
        if (node.id === 'bakun') return { ...node, output: 98 };
        if (node.id === 'kuching') return { ...node, output: 100 };
        return node;
      }));
    }, 3500); // 3.5 seconds of AI processing
  };

  const get3DIconStyle = (type: string, status: string) => {
    let baseColor = '';
    let shadowColor = '';
    let topColor = '';

    if (status === 'warning') {
      baseColor = '#d97706'; // amber-600
      shadowColor = '#92400e'; // amber-800
      topColor = '#fbbf24'; // amber-400
    } else if (status === 'offline') {
      baseColor = '#52525b'; // zinc-600
      shadowColor = '#3f3f46'; // zinc-700
      topColor = '#a1a1aa'; // zinc-400
    } else {
      switch (type) {
        case 'hydro':
          baseColor = '#0891b2'; // cyan-600
          shadowColor = '#164e63'; // cyan-900
          topColor = '#22d3ee'; // cyan-400
          break;
        case 'coal':
          baseColor = '#e11d48'; // rose-600
          shadowColor = '#881337'; // rose-900
          topColor = '#fb7185'; // rose-400
          break;
        case 'gas':
          baseColor = '#ea580c'; // orange-600
          shadowColor = '#7c2d12'; // orange-900
          topColor = '#fb923c'; // orange-400
          break;
        case 'substation':
          baseColor = '#4f46e5'; // indigo-600
          shadowColor = '#312e81'; // indigo-900
          topColor = '#818cf8'; // indigo-400
          break;
        default:
          baseColor = '#52525b';
          shadowColor = '#3f3f46';
          topColor = '#a1a1aa';
      }
    }

    return {
      background: `linear-gradient(135deg, ${topColor} 0%, ${baseColor} 100%)`,
      boxShadow: `
        inset 0px 2px 4px rgba(255,255,255,0.4),
        inset 0px -2px 4px rgba(0,0,0,0.4),
        0px 4px 0px ${shadowColor},
        0px 6px 10px rgba(0,0,0,0.6)
      `,
      border: `1px solid ${topColor}`,
      color: '#ffffff',
      textShadow: '0px 1px 2px rgba(0,0,0,0.8)'
    };
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hydro': return <Waves className="w-4 h-4 drop-shadow-md" />;
      case 'coal': return <Factory className="w-4 h-4 drop-shadow-md" />;
      case 'gas': return <Factory className="w-4 h-4 drop-shadow-md" />;
      case 'substation': return <Radio className="w-4 h-4 drop-shadow-md" />;
      default: return <Zap className="w-4 h-4 drop-shadow-md" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-[600px]">
      {/* Map Area */}
      <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <ActivityIcon /> Sarawak Energy Grid Superstructure
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Live 500kV / 275kV Transmission Backbone</p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-zinc-800/50">
          <div className="flex items-center gap-2 text-xs text-zinc-300"><div className="w-3 h-3 rounded-full bg-cyan-400/20 border border-cyan-400/50"></div> Hydroelectric (HEP)</div>
          <div className="flex items-center gap-2 text-xs text-zinc-300"><div className="w-3 h-3 rounded-full bg-rose-400/20 border border-rose-400/50"></div> Coal / Thermal</div>
          <div className="flex items-center gap-2 text-xs text-zinc-300"><div className="w-3 h-3 rounded-full bg-orange-400/20 border border-orange-400/50"></div> Gas / Combined Cycle</div>
          <div className="flex items-center gap-2 text-xs text-zinc-300"><div className="w-3 h-3 rounded-full bg-indigo-400/20 border border-indigo-400/50"></div> Substation Node</div>
        </div>

        {/* SVG Map Container */}
        <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-zinc-800/50 bg-zinc-950/50">
          
          {/* AI Processing Overlay */}
          <AnimatePresence>
            {isProcessingDispatch && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl border border-indigo-500/50 overflow-hidden"
              >
                {/* Background scanning lines */}
                <motion.div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(transparent 50%, rgba(99, 102, 241, 0.2) 50%)',
                    backgroundSize: '100% 4px'
                  }}
                  animate={{ backgroundPositionY: ['0px', '100px'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />

                <Cpu className="w-16 h-16 text-indigo-400 mb-6 animate-pulse relative z-10" />
                <h3 className="text-xl font-bold text-indigo-100 mb-6 tracking-widest uppercase relative z-10">AI Multi-Agent Orchestration</h3>
                
                <div className="space-y-3 w-80 relative z-10">
                  <AgentTask text="Agent Alpha: Recalculating Load..." delay={0} />
                  <AgentTask text="Agent Beta: Ramping Bakun HEP..." delay={0.8} />
                  <AgentTask text="Agent Gamma: Stabilizing Frequency..." delay={1.6} />
                  <AgentTask text="Agent Delta: Syncing Grid..." delay={2.4} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
          >
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
              <div className="relative w-[1000px] h-[600px]">
                <svg viewBox="0 0 1000 600" className="w-full h-full absolute inset-0">
                  {/* Stylized Sarawak Landmass Background */}
                  <path 
                    d="M 50,550 Q 100,480 150,500 Q 250,450 300,450 Q 400,350 450,320 Q 550,250 600,240 Q 700,200 850,120 Q 950,100 950,150 Q 850,250 800,350 Q 750,450 650,500 Q 450,550 250,550 Q 100,600 50,550 Z" 
                    fill="#18181b" 
                    stroke="#27272a" 
                    strokeWidth="2"
                    className="opacity-80"
                    style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' }}
                  />

                  {/* Transmission Lines */}
                  {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from)!;
              const toNode = nodes.find(n => n.id === conn.to)!;
              const isWarning = conn.status === 'warning';
              const isCritical = conn.status === 'critical';
              
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g 
                  key={idx} 
                  onMouseEnter={() => conn.aiAlert && setHoveredLine(conn)}
                  onMouseLeave={() => setHoveredLine(null)}
                  className={conn.aiAlert ? "cursor-help" : ""}
                >
                  {/* Invisible thicker line for easier hovering */}
                  <line 
                    x1={fromNode.x} y1={fromNode.y} 
                    x2={toNode.x} y2={toNode.y} 
                    stroke="transparent" 
                    strokeWidth="20"
                  />
                  {/* Base Line */}
                  <line 
                    x1={fromNode.x} y1={fromNode.y} 
                    x2={toNode.x} y2={toNode.y} 
                    stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#3f3f46'} 
                    strokeWidth={isWarning || isCritical ? 2 : 4}
                    strokeDasharray={isWarning || isCritical ? "5,5" : "none"}
                    className={clsx(isWarning ? "opacity-50" : "", isCritical ? "animate-pulse" : "")}
                  />
                  {/* Flow Animation Line */}
                  {!isWarning && !isCritical && (
                    <line 
                      x1={fromNode.x} y1={fromNode.y} 
                      x2={toNode.x} y2={toNode.y} 
                      stroke={conn.isDispatching ? "#7C4DFF" : "#10b981"} 
                      strokeWidth={conn.isDispatching ? "4" : "2"}
                      strokeDasharray={conn.isDispatching ? "12 12" : "8 16"}
                      className={clsx(
                        "opacity-80",
                        conn.dispatchDirection === 'backward' ? "animate-flow-reverse" : "animate-flow"
                      )}
                      style={conn.isDispatching ? { filter: 'drop-shadow(0 0 8px #7C4DFF)' } : {}}
                    />
                  )}
                  {/* AI Alert Icon on Line */}
                  {isCritical && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <circle cx="0" cy="0" r="12" fill="#ef4444" className="animate-ping opacity-75" />
                      <circle cx="0" cy="0" r="10" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
                      <path d="M0 -4 L-4 4 L4 4 Z" fill="#ef4444" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Add CSS for flow animations */}
          <style>
            {`
              @keyframes flow {
                from { stroke-dashoffset: 24; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes flow-reverse {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: 24; }
              }
              .animate-flow {
                animation: flow 1s linear infinite;
              }
              .animate-flow-reverse {
                animation: flow-reverse 1s linear infinite;
              }
            `}
          </style>

          {/* Nodes (HTML Overlay for better interactivity/tooltips) */}
          {nodes.map((node) => (
            <div 
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              style={{ left: `${(node.x / 1000) * 100}%`, top: `${(node.y / 600) * 100}%` }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => node.aiFocus && setShowSamalajuChart(!showSamalajuChart)}
            >
              {/* AI Focus Halo */}
              {node.aiFocus && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-indigo-500/40 blur-md"
                  animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Pulsing effect for active nodes */}
              {node.status === 'active' && (
                <motion.div 
                  className="absolute inset-0 rounded-full opacity-50 bg-white/20"
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              
              {/* 3D Node Icon */}
              <div 
                className={clsx(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:-translate-y-2 group-hover:scale-110",
                  node.aiFocus && "ring-2 ring-indigo-400 ring-offset-2 ring-offset-zinc-900 shadow-[0_0_20px_rgba(129,140,248,0.6)]"
                )}
                style={get3DIconStyle(node.type, node.status)}
              >
                {node.status === 'warning' ? <AlertTriangle className="w-4 h-4 drop-shadow-md" /> : getIcon(node.type)}
              </div>

              {/* Node Label */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap text-center pointer-events-none">
                <div className="text-xs font-medium text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-zinc-800">
                  {node.name}
                </div>
              </div>
            </div>
          ))}

          {/* Line Alert Tooltip */}
          {hoveredLine && hoveredLine.aiAlert && (
            <div 
              className="absolute z-30 bg-zinc-900/95 backdrop-blur-md border border-red-500/50 rounded-lg p-3 shadow-xl pointer-events-none transition-all duration-200 max-w-[250px]"
              style={{ 
                left: `calc(${((nodes.find(n => n.id === hoveredLine.from)!.x + nodes.find(n => n.id === hoveredLine.to)!.x) / 2 / 1000) * 100}% + 20px)`, 
                top: `calc(${((nodes.find(n => n.id === hoveredLine.from)!.y + nodes.find(n => n.id === hoveredLine.to)!.y) / 2 / 600) * 100}% - 40px)` 
              }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="font-medium text-red-100 text-xs leading-relaxed">{hoveredLine.aiAlert}</span>
              </div>
            </div>
          )}

          {/* Node Tooltip */}
          {hoveredNode && !showSamalajuChart && (
            <div 
              className="absolute z-30 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-lg p-3 shadow-xl pointer-events-none transition-all duration-200"
              style={{ 
                left: `calc(${(hoveredNode.x / 1000) * 100}% + 20px)`, 
                top: `calc(${(hoveredNode.y / 600) * 100}% - 40px)` 
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={clsx("w-2 h-2 rounded-full", hoveredNode.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500')}></span>
                <span className="font-medium text-white text-sm">{hoveredNode.name}</span>
              </div>
              <div className="text-xs text-zinc-400 capitalize mb-2">{hoveredNode.type} Plant</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-zinc-500">Capacity:</span>
                <span className="text-zinc-200 font-mono text-right">{hoveredNode.capacity}</span>
                <span className="text-zinc-500">Output:</span>
                <span className="text-zinc-200 font-mono text-right">{hoveredNode.output}%</span>
                <span className="text-zinc-500">Status:</span>
                <span className={clsx("font-mono text-right", hoveredNode.status === 'active' ? 'text-emerald-400' : 'text-amber-400')}>
                  {hoveredNode.status.toUpperCase()}
                </span>
              </div>
              {hoveredNode.aiFocus && (
                <div className="mt-2 pt-2 border-t border-zinc-700 text-[10px] text-indigo-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Click to view AI Load Forecast
                </div>
              )}
            </div>
          )}

          {/* Samalaju AI Forecast Chart Modal */}
          <AnimatePresence>
            {showSamalajuChart && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute z-40 bg-zinc-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-xl p-4 shadow-2xl w-[320px]"
                style={{ 
                  left: `calc(${(nodes.find(n => n.id === 'samalaju')!.x / 1000) * 100}% - 340px)`, 
                  top: `calc(${(nodes.find(n => n.id === 'samalaju')!.y / 600) * 100}% - 100px)` 
                }}
              >
                <button 
                  onClick={() => setShowSamalajuChart(false)}
                  className="absolute top-3 right-3 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-medium text-indigo-100">SCORE Load Forecast (6h)</h3>
                </div>
                <div className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={samalajuLoadData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="time" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                      <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#4f46e5', color: '#f4f4f5', fontSize: '12px' }}
                        itemStyle={{ color: '#818cf8' }}
                        formatter={(value: number) => [`${value} MW`, 'Predicted Load']}
                      />
                      <Line type="monotone" dataKey="load" stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: '#818cf8' }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-zinc-400 mt-3 leading-tight">
                  <span className="text-indigo-400 font-medium">AI Insight:</span> Heavy industry operations predicted to cause a 1,450 MW spike at 17:00.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {/* Grid Stats Panel */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex-1 flex flex-col">
          <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-6 flex items-center gap-2">
            <ActivityIcon /> Grid Telemetry
          </h3>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">System Frequency</span>
                <span className={clsx("font-mono", Math.abs(frequency - 50) > 0.05 ? "text-amber-400" : "text-emerald-400")}>
                  {frequency.toFixed(3)} Hz
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${((frequency - 49.8) / 0.4) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono">
                <span>49.8</span>
                <span>50.0</span>
                <span>50.2</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Capacity</p>
                <p className="text-lg font-mono text-white">5,742 MW</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Current Load</p>
                <p className="text-lg font-mono text-sky-400">4,120 MW</p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  AI Predicted Peak (17:00): <span className="text-amber-400">4,850 MW</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2">Energy Mix (Real-time)</p>
              <div className="flex h-3 rounded-full overflow-hidden mb-1">
                <div className="bg-cyan-500 w-[75%]" title="Hydro: 75%"></div>
                <div className="bg-rose-500 w-[15%]" title="Coal: 15%"></div>
                <div className="bg-orange-500 w-[10%]" title="Gas: 10%"></div>
              </div>
              
              <p className="text-xs text-indigo-400/80 mb-1 mt-3 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> AI Recommended Mix (Next 2h)
              </p>
              <div className="flex h-3 rounded-full overflow-hidden opacity-80 border border-indigo-500/30">
                <div className="bg-cyan-500 w-[85%]" title="Hydro: 85%"></div>
                <div className="bg-rose-500 w-[10%]" title="Coal: 10%"></div>
                <div className="bg-orange-500 w-[5%]" title="Gas: 5%"></div>
              </div>

              <div className="flex justify-between text-[10px] text-zinc-400 mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Hydro</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Coal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Gas</span>
              </div>
            </div>
          </div>

          {/* Agentic AI Action Center */}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className={clsx(
              "rounded-lg p-4 border transition-all duration-300",
              dispatchExecuted 
                ? "bg-emerald-500/10 border-emerald-500/30" 
                : "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
            )}>
              <div className="flex items-start gap-3">
                {dispatchExecuted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Cpu className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0 animate-pulse" />
                )}
                <div>
                  <p className={clsx("text-xs font-medium mb-1", dispatchExecuted ? "text-emerald-300" : "text-indigo-300")}>
                    {dispatchExecuted ? "AI DISPATCH EXECUTED" : "⚡ AI DISPATCH RECOMMENDATION"}
                  </p>
                  <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
                    Projected 350MW deficit at Samalaju Node in 45 mins due to SCORE industry spike. 
                    Recommendation: Ramp up Bakun HEP by +200MW and Sejingkat by +150MW to stabilize frequency.
                  </p>
                  
                  {!dispatchExecuted && (
                    <button 
                      onClick={handleDispatch}
                      disabled={isProcessingDispatch}
                      className={clsx(
                        "w-full py-2 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2",
                        isProcessingDispatch ? "bg-indigo-800 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
                      )}
                    >
                      {isProcessingDispatch ? "Processing..." : "Execute AI Dispatch"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const AgentTask = ({ text, delay }: { text: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-3 text-sm text-indigo-300 font-mono bg-indigo-900/40 p-3 rounded border border-indigo-500/30 shadow-inner"
  >
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full flex-shrink-0"
    />
    {text}
  </motion.div>
);

