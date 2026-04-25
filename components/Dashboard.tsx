
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
  <div className="bg-surface/40 backdrop-blur-md p-8 border border-white/5 shadow-xl relative group overflow-hidden rounded-sm">
    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all duration-500"></div>
    <div className="flex items-start justify-between">
      <div className="space-y-4">
        <p className="font-body text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">{title}</p>
        <h3 className="font-headline text-4xl text-on-surface font-light">{value}</h3>
      </div>
      <div className="p-3 bg-primary/10 text-primary border border-primary/20">
        <Icon size={20} />
      </div>
    </div>
  </div>
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
    <div className="space-y-12">
      {/* Visual Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      {/* Galeria de Instalações BFV */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-px bg-primary/40"></div>
           <h3 className="font-headline text-on-surface text-2xl tracking-widest font-black uppercase drop-shadow-sm">Galeria de Instalações</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {bfvImages.slice(1).map((img, i) => (
            <div key={i} className="aspect-[4/5] bg-surface-bright/10 border border-outline-variant/10 overflow-hidden group cursor-pointer relative">
               <img 
                 src={img} 
                 alt={`BFV Facility ${i+1}`} 
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                 referrerPolicy="no-referrer"
                 onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/seed/bfv${i}/800/1000`;
                 }}
               />
               <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="font-body text-[9px] font-black uppercase tracking-[0.2em] text-on-primary bg-primary px-4 py-2">Vista Auditoria</span>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Service Timeline / Activity */}
        <div className="lg:col-span-2">
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 shadow-2xl overflow-hidden h-full rounded-sm">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-secondary"></div>
                <div>
                  <h3 className="font-headline text-on-surface text-4xl tracking-wide font-black drop-shadow-md">Linha do Tempo de Serviço</h3>
                  <p className="font-body text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/40 mt-1">Auditoria Operacional — Centro de Comando Casa Mãe</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40">Descrição / Activo</th>
                    <th className="px-8 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 text-right">Identificador</th>
                    <th className="px-8 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 text-right">Estado Audit.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-24 text-center">
                        <p className="font-headline text-on-surface/20 text-2xl">Sem Atividade Registada</p>
                        <p className="font-body text-[9px] uppercase tracking-widest text-on-surface-variant/10 mt-2">A aguardar dados do sistema...</p>
                      </td>
                    </tr>
                  ) : (
                    invoices.slice(0, 6).map((inv) => (
                      <tr key={inv.id} className="hover:bg-primary/10 transition-colors group">
                        <td className="px-8 py-6">
                           <p className="font-headline text-on-surface text-lg group-hover:text-primary transition-colors">
                              {inv.roomName || 'Serviço Directo'}
                           </p>
                           <p className="font-body text-[9px] uppercase tracking-widest text-on-surface-variant/40 mt-1">
                              {inv.guestName || 'Activo Público'}
                           </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <p className="font-body font-bold text-xs text-on-surface tracking-tighter">
                              {userRole === 'admin' ? formatCurrency(inv.totalAmount) : `#${inv.invoiceNumber}`}
                           </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className={cn(
                             "inline-flex items-center gap-2 px-4 py-2 border rounded-sm text-[9px] font-black uppercase tracking-widest",
                             inv.status === 'paid' ? "text-emerald-500 border-emerald-500/20 bg-emerald-600/5 shadow-[0_0:15px_rgba(16,185,129,0.1)]" :
                             inv.status === 'pending' ? "text-primary border-primary/20 bg-primary/5" : "text-on-surface-variant/40 border-outline-variant/10 bg-surface-bright/5"
                           )}>
                              <div className={cn("w-1 h-1 rounded-full",
                                inv.status === 'paid' ? "bg-emerald-500" :
                                inv.status === 'pending' ? "bg-primary" : "bg-on-surface-variant/20"
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
        <div className="space-y-8">
           {/* Room Inventory Grid View */}
           <div className="bg-surface/40 backdrop-blur-md border border-white/5 p-8 shadow-xl rounded-sm">
              <h4 className="font-headline italic text-on-surface text-xl mb-8 tracking-wide">Mapa de Quartos</h4>
              <div className="grid grid-cols-4 gap-3">
                 {[...Array(12)].map((_, i) => {
                    const room = rooms[i];
                    return (
                      <div 
                        key={i}
                        title={room?.name || `Quarto ${i+1}`}
                        className={cn(
                          "aspect-square border border-white/10 flex flex-col items-center justify-center p-2 group cursor-pointer transition-all hover:scale-110",
                          room?.status === 'occupied' ? "bg-primary/30 border-primary/40" : 
                          room?.status === 'maintenance' ? "bg-white/10 border-white/20" : "bg-white/5"
                        )}
                      >
                         <span className={cn(
                           "font-body font-black text-[9px] mb-1",
                           room?.status === 'occupied' ? "text-primary" : "text-on-surface-variant/40"
                         )}>
                            {room?.name?.split(' ')[1] || (i + 1)}
                         </span>
                         {room?.status === 'occupied' && <div className="w-1 h-1 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(255,182,142,0.8)]"></div>}
                      </div>
                    );
                 })}
              </div>
              <div className="mt-8 flex justify-between items-center text-[9px] uppercase tracking-widest text-on-surface-variant/40 font-bold border-t border-outline-variant/10 pt-6">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-primary/20 border border-primary/40"></div> Ocupado</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-surface-container-low border border-outline-variant/20"></div> Disponível</span>
              </div>
           </div>

            {/* Quick Operations panel */}
           <div className="bg-surface/40 backdrop-blur-md border border-white/5 p-8 relative overflow-hidden group shadow-xl rounded-sm">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-white/10 border border-white/20 p-2 mb-6 flex items-center justify-center overflow-hidden hover:scale-110 transition-transform duration-500 rounded-lg">
                    <img 
                      src="https://i.ibb.co/sdggPPwX/logo.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                 </div>
                 <h3 className="font-headline text-on-surface text-2xl font-black drop-shadow-sm">A CASA MÃE</h3>
                 <p className="font-body text-[8px] font-black uppercase tracking-[0.2em] text-secondary mt-2 mb-8">BFV-BEIB FRANCISCO VIANA</p>
                 <button className="w-full py-4 border border-outline-variant/20 text-on-surface text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all underline underline-offset-8">
                   Conectar Protocolo BFV
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
