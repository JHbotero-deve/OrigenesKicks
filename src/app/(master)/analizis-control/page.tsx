"use client";

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Bell,
  Mail,
  Settings,
  Search,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Zap,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AnalizisCorePanel() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-[#0F0F12] text-[#E0E0E6] flex font-sans">

      {/* 1. SIDEBAR - ESTILO CORE PANEL */}
      <aside className="w-72 bg-[#16161D] border-r border-white/5 flex flex-col p-6 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-[#5E5CE6] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(94,92,230,0.3)]">
            <span className="font-black italic text-xl">A</span>
          </div>
          <h1 className="font-black uppercase tracking-tighter text-xl italic">CORE PANEL</h1>
        </div>

        <nav className="flex-1 space-y-8">
          <div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 px-2">Menu</p>
            <div className="space-y-1">
              {['Dashboard', 'Products', 'Clients', 'Analytics'].map(item => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === item ? 'bg-[#5E5CE6] text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item === 'Dashboard' && <LayoutDashboard size={18} />}
                  {item === 'Products' && <Package size={18} />}
                  {item === 'Clients' && <Users size={18} />}
                  {item === 'Analytics' && <BarChart3 size={18} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 px-2">Insights</p>
            <div className="space-y-1 text-white/40">
              <button className="w-full flex items-center justify-between px-4 py-3 hover:text-white transition-colors">
                <div className="flex items-center gap-3 font-bold text-sm"><Bell size={18} /> Notification</div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:text-white transition-colors font-bold text-sm"><Mail size={18} /> Message</button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:text-white transition-colors font-bold text-sm"><Settings size={18} /> Settings</button>
            </div>
          </div>
        </nav>

        {/* PRO UPGRADE CARD */}
        <div className="bg-gradient-to-br from-[#1E1E2A] to-[#252538] p-6 rounded-3xl border border-white/5 mt-auto relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-black uppercase italic mb-2 tracking-widest">Upgrade to Pro</p>
            <p className="text-[10px] text-white/40 mb-6 leading-tight">Get unlimited access to all AnalyzisEstudio features.</p>
            <Button className="w-full bg-[#5E5CE6] hover:bg-[#706EE6] text-white rounded-2xl py-6 font-black uppercase italic text-[10px] flex items-center justify-center gap-2">
              <Crown size={14} /> Upgrade Now
            </Button>
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#5E5CE6]/10 rounded-full blur-2xl"></div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">

        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-12">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              placeholder="Hello Olivia, Welcome back!"
              className="w-full bg-[#16161D] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#5E5CE6] transition-all font-bold text-sm text-white/80"
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-[#16161D] border border-white/5 px-4 py-2 rounded-xl">
               <span className="text-[10px] font-black uppercase text-white/40">EN</span>
             </div>
             <div className="w-10 h-10 bg-[#16161D] rounded-full border border-white/5 flex items-center justify-center">
                <Bell size={18} className="text-white/40" />
             </div>
             <div className="flex items-center gap-3 bg-[#16161D] border border-white/5 pl-2 pr-6 py-2 rounded-full">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-black uppercase italic tracking-tighter">My Account</span>
             </div>
          </div>
        </header>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Revenue', val: '$52,000', inc: '+8.33%', color: 'text-[#4CD964]' },
            { label: 'Conversion Rate', val: '3.5%', inc: '+16.67%', color: 'text-[#4CD964]' },
            { label: 'Renewals', val: '1,200', inc: '-4.35%', color: 'text-[#FF3B30]' },
            { label: 'Subscribers', val: '650', inc: '+12%', color: 'text-[#4CD964]' },
          ].map((s, i) => (
            <div key={i} className="bg-[#16161D] p-6 rounded-3xl border border-white/5 relative group">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{s.label}</p>
                <MoreHorizontal size={16} className="text-white/20" />
              </div>
              <p className="text-2xl font-black italic text-white mb-2">{s.val}</p>
              <p className={`text-[10px] font-bold ${s.color}`}>
                {s.inc} <span className="text-white/20 ml-1">from last week</span>
              </p>
            </div>
          ))}
        </div>

        {/* MIDDLE SECTION - CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

          {/* LINE CHART - ORDERS */}
          <div className="lg:col-span-2 bg-[#16161D] p-8 rounded-[2.5rem] border border-white/5">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-black uppercase italic tracking-tighter">Order Flow</h3>
              <select className="bg-transparent border border-white/10 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest outline-none">
                <option>Current Week</option>
              </select>
            </div>

            <div className="h-64 relative flex items-end">
               {/* Simulación de Curva Neón */}
               <svg className="w-full h-full" viewBox="0 0 400 100">
                  <path d="M0 80 Q 50 20, 100 70 T 200 30 T 300 80 T 400 40" fill="none" stroke="#5E5CE6" strokeWidth="4" className="drop-shadow-[0_0_10px_#5E5CE6]" />
                  <path d="M0 90 Q 50 40, 100 80 T 200 50 T 300 90 T 400 60" fill="none" stroke="#BF5AF2" strokeWidth="2" strokeDasharray="4" className="opacity-50" />
               </svg>
               <div className="absolute top-10 left-1/4 bg-white text-black text-[10px] font-black px-3 py-1 rounded shadow-2xl">
                 $27.256.390
               </div>
            </div>
            <div className="flex justify-between mt-6 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
               <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>

          {/* TEAM MEMBERS */}
          <div className="bg-[#16161D] p-8 rounded-[2.5rem] border border-white/5 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-black uppercase italic tracking-tighter">Team Member</h3>
              <span className="text-[10px] font-black text-[#5E5CE6]">Recent</span>
            </div>
            <div className="space-y-6 flex-1">
              {[
                { name: 'Rissa Pearson', role: 'UI Designer', img: 'bg-orange-500' },
                { name: 'Michael Chen', role: 'Dev Backend', img: 'bg-blue-500' },
                { name: 'Camilo Kicks', role: 'Inventory', img: 'bg-green-500' },
                { name: 'Paula Herrera', role: 'Support', img: 'bg-purple-500' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${m.img}`}></div>
                    <div>
                      <p className="text-xs font-black uppercase italic text-white/90">{m.name}</p>
                      <p className="text-[9px] text-white/30 font-bold uppercase">{m.role}</p>
                    </div>
                  </div>
                  <MoreHorizontal size={16} className="text-white/20 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-8 border-white/5 text-[9px] font-black uppercase italic hover:bg-white hover:text-black">
              See Details
            </Button>
          </div>
        </div>

        {/* BOTTOM SECTION - PROJECTS & OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* PROJECT CARDS */}
          {['Orígenes Kicks', 'StreetWear Pro', 'Zapatos Local'].map((p, i) => (
            <div key={i} className="bg-[#16161D] p-6 rounded-[2rem] border border-white/5 hover:border-[#5E5CE6]/30 transition-all">
               <h4 className="font-black uppercase italic text-sm mb-1">{p}</h4>
               <p className="text-[9px] text-white/30 font-bold uppercase mb-6 tracking-widest">Active SaaS Instance</p>
               <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#16161D]"></div>
                    <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#16161D]"></div>
                  </div>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">4 hrs ago</span>
               </div>
            </div>
          ))}

          {/* PROJECT OVERVIEW (Circular Progress) */}
          <div className="bg-[#16161D] p-6 rounded-[2rem] border border-white/5 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                   <circle cx="64" cy="64" r="50" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                   <circle cx="64" cy="64" r="50" stroke="#5E5CE6" strokeWidth="8" fill="none" strokeDasharray="314" strokeDashoffset="100" />
                   <circle cx="64" cy="64" r="40" stroke="#BF5AF2" strokeWidth="6" fill="none" strokeDasharray="251" strokeDashoffset="150" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Zap size={20} className="text-[#5E5CE6]" />
                </div>
             </div>
             <p className="font-black uppercase italic text-[10px] tracking-widest">System Load</p>
             <p className="text-xl font-black italic text-white mt-1">78%</p>
          </div>

        </div>

      </main>
    </div>
  );
}
