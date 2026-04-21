import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileDown, 
  Calendar,
  TrendingUp,
  Download
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

const Reports: React.FC = () => {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  
  const data = [
    { name: 'Mon', revenue: 400000, guests: 4 },
    { name: 'Tue', revenue: 300000, guests: 3 },
    { name: 'Wed', revenue: 200000, guests: 2 },
    { name: 'Thu', revenue: 278000, guests: 4 },
    { name: 'Fri', revenue: 189000, guests: 2 },
    { name: 'Sat', revenue: 890000, guests: 8 },
    { name: 'Sun', revenue: 640000, guests: 6 },
  ];

  const periodLabels = {
    daily: 'Hoje',
    weekly: 'Relatório Semanal',
    monthly: 'Ciclo Mensal',
    quarterly: 'Auditoria Trimestral',
    yearly: 'Registo Anual'
  };

  const pieData = [
    { name: 'Hospedagem', value: 500 },
    { name: 'Restaurante BFV', value: 300 },
    { name: 'Bar / Outros', value: 200 },
  ];

  const COLORS = ['#FF6B00', '#2D2D2D', '#646464'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container p-6 border border-outline-variant/10 shadow-2xl backdrop-blur-md">
          <p className="font-body text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] mb-4 border-b border-outline-variant/5 pb-2 italic">{label}</p>
          <div className="flex items-center gap-4">
             <div className="w-1 h-6 bg-primary"></div>
             <p className="font-headline italic text-2xl text-on-surface tracking-wide">{formatCurrency(payload[0].value)}</p>
          </div>
          <p className="font-body text-[8px] text-primary font-bold uppercase mt-2 italic opacity-60 tracking-widest">Auditoria Geral Casa Mãe</p>
        </div>
      );
    }
    return null;
  };

  const handleGenerateDailyPDF = () => {
    alert("Synthesizing Daily Intelligence Briefing...");
  };

  return (
    <div className="space-y-16 pb-32">
      {/* Header Filters */}
      <div className="bg-surface-container-low border border-outline-variant/10 p-8 shadow-2xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-primary" />
            <span className="font-body text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Filtro Temporal:</span>
          </div>
          <div className="flex bg-surface-bright/50 p-1">
            {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as ReportPeriod[]).map((p) => (
               <button 
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 decoration-transparent decoration-2 underline-offset-8",
                    period === p ? "text-primary border-primary" : "text-on-surface-variant/40 border-transparent hover:text-on-surface"
                  )}
               >
                 {p}
               </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleGenerateDailyPDF}
            className="flex-1 sm:flex-none px-8 py-3 border border-gray-200 text-gray-500 hover:text-primary transition-all font-body text-[10px] uppercase tracking-widest"
          >
            <FileDown size={14} className="inline mr-2" /> Resumo
          </button>
          <button className="flex-1 sm:flex-none px-10 py-3 bg-surface text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all underline decoration-white/20 underline-offset-8">
            <Download size={14} className="inline mr-2" /> Exportar Auditoria
          </button>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-surface-container-low p-10 border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/10"></div>
          <div className="flex justify-between items-start mb-12 relative z-10">
             <div>
                <h3 className="font-headline text-4xl text-on-surface tracking-wide font-black drop-shadow-md">Fluxo de Receita</h3>
                <p className="font-body text-[9px] text-on-surface-variant/40 mt-1 uppercase font-bold tracking-widest">Relatório Casa Mãe BFV • {periodLabels[period]}</p>
             </div>
             <div className="text-right">
                <span className="font-headline text-3xl text-primary tracking-tight">
                   {period === 'daily' ? '+5.2%' : period === 'weekly' ? '+12.4%' : '+18.4%'}
                </span>
                <p className="font-body text-[8px] text-emerald-600 font-black uppercase tracking-widest mt-1">Índice Amostra</p>
             </div>
          </div>
          <div className="h-[340px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#00000005" />
                <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fontSize: 9, fill: '#646464', fontWeight: '700'}}
                   dy={15}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fontSize: 9, fill: '#646464', fontWeight: '700'}}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                   type="monotone" 
                   dataKey="revenue" 
                   stroke="#FF6B00" 
                   strokeWidth={2}
                   fillOpacity={1} 
                   fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-low p-10 border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary/10"></div>
          <div className="flex justify-between items-center mb-12 relative z-10">
             <div>
                <h3 className="font-headline text-4xl text-on-surface tracking-wide font-black drop-shadow-md text-secondary">Distribuição por Sector</h3>
                <p className="font-body text-[9px] text-on-surface-variant/40 mt-1 uppercase font-bold tracking-widest">Auditoria de Divisões Operacionais</p>
             </div>
             <div className="p-3 text-primary bg-primary/5 border border-primary/10">
                <TrendingUp size={16} />
             </div>
          </div>
          <div className="h-[340px] w-full flex flex-col sm:flex-row items-center justify-center gap-12 relative z-10">
            <div className="flex-1 w-full h-full min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/3 flex flex-row sm:flex-col justify-around sm:justify-center gap-8 border-l border-outline-variant/5 pl-8">
               {pieData.map((item, i) => (
                 <div key={i} className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                       <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                       <span className="font-body text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">{item.name}</span>
                    </div>
                    <p className="font-headline text-2xl text-on-surface leading-none tracking-tight">{item.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Table */}
      <div className="bg-surface-container-low border border-outline-variant/10 shadow-2xl overflow-hidden">
        <div className="p-10 border-b border-outline-variant/10 flex justify-between items-center bg-surface-bright/5">
           <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-primary"></div>
              <h3 className="font-headline text-4xl text-on-surface tracking-wide font-black drop-shadow-md">Consolidado Casa Mãe</h3>
           </div>
           <p className="font-body text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-[0.4em] leading-none">Última Sincronização: 12:45 GMT</p>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-surface-bright/5 border-b border-outline-variant/5">
                    <th className="px-10 py-5 font-body text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/40">Cronologia</th>
                    <th className="px-10 py-5 font-body text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/40 text-right">Volume Total</th>
                    <th className="px-10 py-5 font-body text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/40 text-center">Audit. Ocupação</th>
                    <th className="px-10 py-5 font-body text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/40 text-right">Ticket Médio</th>
                    <th className="px-10 py-5 font-body text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/40">Tendência</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                 {[...data].reverse().map((row, i) => (
                    <tr key={i} className="hover:bg-primary/5 transition-colors group">
                       <td className="px-10 py-6 font-headline text-xl text-on-surface group-hover:text-primary transition-colors tracking-wide">Ciclo {row.name}</td>
                       <td className="px-10 py-6 font-body text-sm font-bold text-on-surface text-right tracking-tight">{formatCurrency(row.revenue)}</td>
                       <td className="px-10 py-6 text-center">
                          <span className="font-body text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest px-4 py-2 bg-surface-bright border border-outline-variant/10">
                             {80 + i * 2}% Ocupação
                          </span>
                       </td>
                       <td className="px-10 py-6 font-body text-sm font-medium text-on-surface-variant/40 text-right tracking-tight">{formatCurrency(row.revenue / row.guests)}</td>
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-2 text-emerald-600 font-body font-bold text-[10px] uppercase tracking-widest">
                             <TrendingUp size={14} /> +{(Math.random() * 5 + 2).toFixed(1)}% Rendimento
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
