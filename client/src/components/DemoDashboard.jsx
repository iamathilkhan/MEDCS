import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const StatCard = ({ title, value, prefix = "", suffix = "", icon, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.5%</span>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <div className="text-3xl font-black text-slate-900 tracking-tight">
        {prefix}<CountUp end={value} />{suffix}
      </div>
    </div>
  </motion.div>
);

const CountUp = ({ end }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <>{count.toLocaleString()}</>;
};

const DemoDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1240,
    totalMatches: 8432,
    guidesGenerated: 3120,
    valueUnlocked: 21000000,
    topSchemes: [
      { name: 'PM-KISAN', application_count: 2450 },
      { name: 'Ayushman Bharat', application_count: 1840 },
      { name: 'PM Awas Yojana', application_count: 1200 },
      { name: 'Matru Vandana', application_count: 980 },
      { name: 'MGNREGA', application_count: 850 }
    ],
    categories: [
      { name: 'Health', value: 35 },
      { name: 'Farming', value: 25 },
      { name: 'Education', value: 20 },
      { name: 'Housing', value: 15 },
      { name: 'Others', value: 5 }
    ],
    recentActivity: [
      { id: 'usr_812', matches: 8, location: 'Kanchipuram', time: 'Just now' },
      { id: 'usr_754', matches: 12, location: 'Salem', time: '2 mins ago' },
      { id: 'usr_901', matches: 5, location: 'Madurai', time: '5 mins ago' },
      { id: 'usr_112', matches: 9, location: 'Chennai', time: '12 mins ago' },
      { id: 'usr_233', matches: 14, location: 'Erode', time: '15 mins ago' }
    ]
  });

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  const [simulating, setSimulating] = useState(false);
  const [simResults, setSimResults] = useState([]);

  const runSimulation = () => {
    setSimulating(true);
    setSimResults([]);
    const demoMatches = ['PM-KISAN', 'Crop Insurance', 'Fertilizer Subsidy'];
    
    demoMatches.forEach((name, i) => {
      setTimeout(() => {
        setSimResults(prev => [...prev, name]);
        if (i === demoMatches.length - 1) {
          setTimeout(() => setSimulating(false), 1000);
        }
      }, (i + 1) * 800);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-2">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Profiles Assessed" value={stats.totalUsers} icon="👥" delay={0.1} />
        <StatCard title="Schemes Matched" value={stats.totalMatches} icon="✨" delay={0.2} />
        <StatCard title="Guides Generated" value={stats.guidesGenerated} icon="🗺️" delay={0.3} />
        <StatCard title="Value Unlocked" value={stats.valueUnlocked} prefix="₹" icon="💰" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart: Most Matched */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center">
            <span className="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
            Demand Distribution — Top Schemes
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topSchemes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748B' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="application_count" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Categories */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center">
            <span className="w-2 h-6 bg-green-500 rounded-full mr-3"></span>
            Impact Areas
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categories}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Activity Feed */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Live Impact Stream</h3>
            <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((act, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg border border-slate-100">
                    👤
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{act.id} matched with <span className="text-blue-600">{act.matches} schemes</span></p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{act.location} • {act.time}</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Verified</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Impact Simulator */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Impact Simulator</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Experience the automated matching engine in action. We simulate a profile check for a small-scale farmer in rural Tamil Nadu.</p>
            
            {!simulating && simResults.length === 0 && (
              <button 
                onClick={runSimulation}
                className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-blue-50 transition transform active:scale-95 shadow-xl"
              >
                Start Simulation Run
              </button>
            )}

            {(simulating || simResults.length > 0) && (
              <div className="space-y-3">
                <AnimatePresence>
                  {simResults.map((res, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center"
                    >
                      <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 text-[10px]">✓</span>
                      <span className="text-xs font-bold">{res}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {simulating && (
                  <div className="p-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Analyzing Profile...</span>
                  </div>
                )}
                {!simulating && simResults.length > 0 && (
                   <button 
                   onClick={() => setSimResults([])}
                   className="w-full py-2 mt-4 text-[10px] font-bold text-slate-500 hover:text-white transition uppercase tracking-widest"
                 >
                   Reset Simulator
                 </button>
                )}
              </div>
            )}
          </div>
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-3xl -z-0"></div>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;
