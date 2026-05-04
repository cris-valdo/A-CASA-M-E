
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DoorOpen, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Video,
  Clock
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { subscribeToGuests, subscribeToInvoices, subscribeToRooms } from '../services/firestoreService';

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-10 relative group overflow-hidden rounded-2xl"
  >
    {/* Animated accent gradient */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
    
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-white/[0.03] text-primary border border-white/5 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
          <Icon size={22} className="drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
        </div>
        {trend && (
          <span className="font-mono text-[10px] text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="font-body text-[10px] uppercase font-bold tracking-[0.3em] text-white/30">{title}</p>
        <h3 className="font-headline text-5xl text-white font-bold tracking-tighter drop-shadow-lg">{value}</h3>
      </div>
    </div>
  </motion.div>
);

const Dashboard: React.FC<{ userRole?: 'admin' | 'staff' }> = ({ userRole = 'admin' }) => {
  const [guests, setGuests] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const unsubGuests = subscribeToGuests(setGuests);
    const unsubInvoices = subscribeToInvoices(setInvoices);
    const unsubRooms = subscribeToRooms(setRooms);
    
    return () => {
      unsubGuests();
      unsubInvoices();
      unsubRooms();
    };
  }, []);

  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  const adminStats = [
    { title: 'Receita Auditada', value: formatCurrency(totalRevenue), icon: Wallet },
    { title: 'Volume de Hóspedes', value: guests.length.toString(), icon: Users },
    { title: 'Índice de Ocupação', value: `${occupancyRate}%`, icon: DoorOpen },
    { title: 'Volume de Facturas', value: invoices.length.toString(), icon: TrendingUp },
  ];

  const staffStats = [
    { title: 'Hóspedes Activos', value: guests.length.toString(), icon: Users },
    { title: 'Taxa de Ocupação', value: `${occupancyRate}%`, icon: DoorOpen },
    { title: 'Quartos Disponíveis', value: rooms.filter(r => r.status === 'available').length.toString(), icon: DoorOpen },
    { title: 'Serviços Pendentes', value: '3', icon: Clock },
  ];

  const stats = userRole === 'admin' ? adminStats : staffStats;

  const bfvImages = [
    "https://i.ibb.co/sdggPPwX/logo.png",
    "https://i.ibb.co/7xDTxMQs/img1.png",
    "https://i.ibb.co/zVHPNKTp/img2.png",
    "https://i.ibb.co/TBWTGLd9/img3.png",
    "https://i.ibb.co/zWs47JKX/img4.png",
    "https://i.ibb.co/TMrQRmDP/img5.png",
    "https://i.ibb.co/gMkwHHYH/img6.png"
  ];

  return (
    <div className="space-y-16">
      {/* Visual Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
        {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      {/* Galeria de Instalações BFV */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="space-y-10"
      >
        <div className="flex items-center gap-6">
           <h3 className="font-headline text-white text-3xl tracking-tight font-bold drop-shadow-sm uppercase">GALERIA <span className="text-primary italic">ASSETS</span></h3>
           <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {bfvImages.slice(1).map((img, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.02, y: -5 }}
              className="aspect-[4/5] bg-white/5 border border-white/5 overflow-hidden group cursor-pointer relative rounded-2xl shadow-2xl"
            >
               <img 
                 src={img} 
                 alt={`BFV Facility ${i+1}`} 
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                 referrerPolicy="no-referrer"
                 onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/seed/bfv${i}/800/1000`;
                 }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <span className="font-body text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2">BFV ASSET {i+1}</span>
                  <span className="font-headline text-xs text-white uppercase italic">Vista Auditada</span>
               </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Service Timeline / Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card shadow-2xl overflow-hidden h-full rounded-3xl relative">
            {/* Technical grid background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            <div className="p-10 border-b border-white/5 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-1.5 h-12 bg-primary rounded-full shadow-[0_0_15px_rgba(255,107,0,0.5)]"></div>
                <div>
                  <h3 className="font-headline text-white text-4xl tracking-tighter font-bold drop-shadow-lg">SERVICE <span className="text-secondary italic">TIMELINE</span></h3>
                  <p className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 mt-2">AUDITORIA OPERACIONAL — HQ CABINDA</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar relative z-10">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-10 py-6 font-body text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Descrição / Activo</th>
                    <th className="px-10 py-6 font-body text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold text-right">Identificador</th>
                    <th className="px-10 py-6 font-body text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold text-right">Estado Audit.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-10 py-32 text-center">
                        <p className="font-headline text-white/10 text-4xl font-black italic">SEM ATIVIDADE</p>
                        <p className="font-body text-[10px] uppercase tracking-[0.4em] text-white/10 mt-4 underline underline-offset-8 text-glow">AGUARDANDO INPUT DO SISTEMA</p>
                      </td>
                    </tr>
                  ) : (
                    invoices.slice(0, 6).map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-10 py-8">
                           <p className="font-headline text-white text-xl font-bold group-hover:text-primary transition-colors tracking-tight">
                              {inv.roomName || 'Serviço Directo'}
                           </p>
                           <p className="font-body text-[10px] uppercase tracking-[0.2em] text-white/20 mt-2 group-hover:text-white/40 transition-colors">
                              {inv.guestName || 'Activo Público'}
                           </p>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <p className="font-mono text-sm font-bold text-white tracking-widest">
                              {userRole === 'admin' ? formatCurrency(inv.totalAmount) : `#${inv.invoiceNumber}`}
                           </p>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <span className={cn(
                             "inline-flex items-center gap-3 px-6 py-3 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                             inv.status === 'paid' ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5 shadow-[0_0_20px_rgba(52,211,153,0.1)]" :
                             inv.status === 'pending' ? "text-primary border-primary/20 bg-primary/5" : "text-white/20 border-white/10 bg-white/5"
                           )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full shadow-lg",
                                inv.status === 'paid' ? "bg-emerald-400 shadow-emerald-400/50" :
                                inv.status === 'pending' ? "bg-primary shadow-primary/50" : "bg-white/20"
                              )}></div>
                              {inv.status === 'paid' ? 'Liquidado' : inv.status === 'pending' ? 'Pendente' : 'Anulado'}
                           </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Inventory / Secondary Controls */}
        <div className="space-y-10">
           {/* Room Inventory Grid View */}
           <div className="glass-card p-10 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors"></div>
              <h4 className="font-headline text-white text-2xl font-bold mb-10 tracking-tight flex items-center gap-4">
                MAPA DE <span className="text-secondary italic">QUARTOS</span>
              </h4>
              <div className="grid grid-cols-4 gap-4">
                 {[...Array(12)].map((_, i) => {
                    const room = rooms[i];
                    return (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        title={room?.name || `Quarto ${i+1}`}
                        className={cn(
                          "aspect-square border border-white/5 flex flex-col items-center justify-center p-2 rounded-xl transition-all shadow-lg",
                          room?.status === 'occupied' ? "bg-primary/20 border-primary/30 shadow-primary/10" : 
                          room?.status === 'maintenance' ? "bg-white/5 border-white/10" : "bg-white/[0.02]"
                        )}
                      >
                         <span className={cn(
                           "font-mono font-bold text-[10px] mb-1.5",
                           room?.status === 'occupied' ? "text-primary" : "text-white/20"
                         )}>
                            {(room?.name?.split(' ')[1] || (i + 1)).toString().padStart(2, '0')}
                         </span>
                         {room?.status === 'occupied' && (
                           <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(255,107,0,0.8)]"></div>
                         )}
                      </motion.div>
                    );
                 })}
              </div>
              <div className="mt-10 flex flex-col gap-4 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold pt-8 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="flex items-center gap-3"><div className="w-2.5 h-2.5 bg-primary/20 border border-primary/40 rounded-sm"></div> Ocupado</span>
                  <span className="flex items-center gap-3"><div className="w-2.5 h-2.5 bg-white/5 border border-white/10 rounded-sm"></div> Disponível</span>
                </div>
              </div>
           </div>

            {/* Quick Operations panel */}
           <div className="glass-card p-10 relative overflow-hidden group rounded-3xl">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-1000"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-24 h-24 bg-white p-4 mb-8 flex items-center justify-center shadow-2xl rounded-2xl group-hover:rotate-12 transition-transform duration-700">
                    <img 
                      src="https://i.ibb.co/sdggPPwX/logo.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                 </div>
                 <h3 className="font-headline text-white text-3xl font-bold tracking-tighter">A CASA <span className="text-primary italic">MÃE</span></h3>
                 <p className="font-body text-[9px] font-black uppercase tracking-[0.4em] text-secondary/40 mt-3 mb-10 italic underline underline-offset-8 decoration-primary/20">CABINDA OPERATIONS</p>
                 <button className="w-full py-5 bg-white/[0.03] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white hover:border-primary transition-all rounded-xl shadow-xl shadow-black/50 group-hover:-translate-y-1">
                   ATIVAR PROTOCOLO BFV
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
