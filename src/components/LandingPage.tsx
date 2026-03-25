import { motion } from 'motion/react';
import { Zap, Brain, Activity } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage = ({ onEnter }: LandingPageProps) => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage: `url('https://thumbs.dreamstime.com/b/sarawak-dun-state-legislative-assembly-building-view-waterfront-sarawak-river-night-sarawak-dun-state-381793434.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0a0f]/80 via-[#0a0a0f]/60 to-[#0a0a0f]" />
      
      {/* Power Surge Flash */}
      <motion.div 
        className="absolute inset-0 z-0 bg-emerald-500/10 mix-blend-color-dodge pointer-events-none"
        animate={{ opacity: [0, 0.3, 0, 0.1, 0] }}
        transition={{ duration: 5, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 1] }}
      />

      {/* Electric Energy Animation Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-60 pointer-events-none">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="electric-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Horizontal scanning energy lines */}
          <motion.rect
            x="0"
            y="30%"
            width="100%"
            height="2"
            fill="url(#electric-grad)"
            filter="url(#glow)"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "100%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.rect
            x="0"
            y="70%"
            width="100%"
            height="2"
            fill="url(#electric-grad)"
            filter="url(#glow)"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "-100%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 2 }}
          />

          {/* Electric Arcs / Lightning */}
          <motion.path
            d="M -200,200 L 100,150 L 300,250 L 500,100 L 700,300 L 900,150 L 1200,250 L 1500,100 L 1800,200 L 2200,150"
            fill="transparent"
            stroke="#34d399"
            strokeWidth="2"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M -200,800 L 200,850 L 400,750 L 600,900 L 800,750 L 1100,850 L 1400,700 L 1700,850 L 2200,750"
            fill="transparent"
            stroke="#a855f7"
            strokeWidth="3"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 1.2 }}
          />
        </svg>
      </div>

      {/* Abstract Glowing Nodes */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] z-0"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[150px] z-0"
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-semibold tracking-wide uppercase mb-8"
        >
          <Brain className="w-4 h-4" />
          <span>AI-Orchestrated Grid</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-tight"
        >
          Powering <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Sarawak</span><br />
          with Intelligence.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
        >
          Real-time energy optimization, predictive maintenance, and sustainable grid management powered by advanced AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <button 
            onClick={onEnter}
            className="group relative px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-full text-lg transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10">Launch Grid Control</span>
            <Zap className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
          </button>
          
          <button className="px-8 py-4 bg-transparent border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 text-slate-300 font-semibold rounded-full text-lg transition-all duration-300 flex items-center gap-3">
            <Activity className="w-5 h-5" />
            <span>View Grid Analytics</span>
          </button>
        </motion.div>
      </div>
      
      {/* Decorative Bottom Grid Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-purple-500/10 blur-2xl z-0" />
    </div>
  );
};
