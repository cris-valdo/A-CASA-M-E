
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  History,
  Edit,
  Trash2,
  Plus,
  Check,
  X as XIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { subscribeToGuests, updateGuest, deleteGuest } from '../services/firestoreService';

const GuestTable: React.FC = () => {
  const [guests, setGuests] = useState<any[]>([]);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const unsubscribe = subscribeToGuests((data) => {
      setGuests(data);
    });
    return () => unsubscribe();
  }, []);

  const handleStartEdit = (guest: any) => {
    setEditingGuestId(guest.id);
    setEditData({ ...guest });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateGuest(id, editData);
      setEditingGuestId(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tens a certeza que desejas remover este hóspede?")) {
      await deleteGuest(id);
    }
  };

  return (
    <div className="glass-card shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden rounded-[2rem]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      
      <div className="p-10 lg:p-14 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 bg-white/[0.01] relative z-10">
         <div className="flex items-center gap-8">
            <div className="w-1.5 h-16 bg-primary rounded-full shadow-[0_0_20px_rgba(255,107,0,0.4)]"></div>
            <div>
               <h3 className="font-headline text-white text-4xl tracking-tighter font-bold drop-shadow-lg uppercase">REGISTO DE <span className="text-secondary italic">HÓSPEDES</span></h3>
               <p className="font-body text-[10px] uppercase tracking-[0.4em] text-white/30 mt-2 font-bold italic">AUDITORIA DE ATIVOS HUMANOS — HQ CABINDA</p>
            </div>
         </div>
         <div className="flex gap-4 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none px-10 py-4 bg-white/[0.03] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all rounded-xl shadow-xl shadow-black/40">AUDITORIAS ATIVAS</button>
            <button className="flex-1 lg:flex-none px-10 py-4 text-white/30 text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary transition-all underline decoration-primary/20 underline-offset-8">ARQUIVO GERAL</button>
         </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar relative z-10">
         <table className="w-full text-left min-w-[1000px]">
            <thead>
               <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-12 py-8 font-body text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">Protocolo / Perfil</th>
                  <th className="px-12 py-8 font-body text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">Canais de Comunicação</th>
                  <th className="px-12 py-8 font-body text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold text-center">Identificação Fiscal</th>
                  <th className="px-12 py-8 font-body text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold text-right">Integridade</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
               {guests.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="px-12 py-40 text-center opacity-10">
                     <p className="font-headline text-5xl font-black italic tracking-tighter uppercase">No Intel Captured</p>
                     <p className="font-body text-[10px] uppercase tracking-[0.5em] mt-6 underline underline-offset-8">Aguardando Primeira Entrada</p>
                   </td>
                 </tr>
               ) : (
                 guests.map((guest, idx) => (
                    <motion.tr 
                      key={guest.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                       <td className="px-12 py-10">
                          <div className="flex items-center gap-8">
                             <div className="shrink-0 w-16 h-16 bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary font-headline text-3xl font-bold rounded-2xl group-hover:rotate-12 transition-transform duration-500 shadow-xl group-hover:bg-primary group-hover:text-white">
                                <span>{(editingGuestId === guest.id ? editData.name?.[0] : guest.name?.[0]) || 'G'}</span>
                             </div>
                             <div>
                                {editingGuestId === guest.id ? (
                                  <input 
                                    value={editData.name}
                                    onChange={e => setEditData({...editData, name: e.target.value})}
                                    className="bg-transparent border-b border-primary font-headline text-white text-2xl font-bold focus:outline-none w-full"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="font-headline text-white text-2xl font-bold tracking-tight group-hover:text-primary transition-colors leading-none mb-2">{guest.name || 'Hóspede Anónimo'}</div>
                                )}
                                <div className="flex items-center gap-4">
                                   <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">{guest.id?.slice(0, 12)}</span>
                                   <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                                   <span className="font-body text-[8px] font-black uppercase text-secondary/40 tracking-widest italic">Activo Verificado</span>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-12 py-10">
                          <div className="space-y-3 font-mono text-[11px] text-white/40">
                             <div className="flex items-center gap-4 group/item">
                                <div className="p-2 bg-white/[0.02] rounded-lg group-hover/item:text-primary transition-colors text-white/20">
                                   <Mail size={12} />
                                </div>
                                {editingGuestId === guest.id ? (
                                  <input 
                                    value={editData.email}
                                    onChange={e => setEditData({...editData, email: e.target.value})}
                                    className="bg-transparent border-b border-primary/20 focus:border-primary focus:outline-none w-full"
                                  />
                                ) : (
                                  <span className="tracking-widest font-bold grayscale group-hover:grayscale-0">{guest.email || '—'}</span>
                                )}
                             </div>
                             <div className="flex items-center gap-4 group/item">
                                <div className="p-2 bg-white/[0.02] rounded-lg group-hover/item:text-secondary transition-colors text-white/20">
                                   <Phone size={12} />
                                </div>
                                {editingGuestId === guest.id ? (
                                  <input 
                                    value={editData.phone}
                                    onChange={e => setEditData({...editData, phone: e.target.value})}
                                    className="bg-transparent border-b border-primary/20 focus:border-primary focus:outline-none w-full"
                                  />
                                ) : (
                                  <span className="tracking-widest font-bold grayscale group-hover:grayscale-0">{guest.phone || '—'}</span>
                                )}
                             </div>
                          </div>
                       </td>
                       <td className="px-12 py-10 text-center">
                          {editingGuestId === guest.id ? (
                            <input 
                              value={editData.nif}
                              onChange={e => setEditData({...editData, nif: e.target.value})}
                              className="bg-transparent border-b border-primary font-mono text-[10px] font-black text-white/60 focus:outline-none text-center"
                            />
                          ) : (
                            <span className="font-mono text-[10px] font-black text-white/60 bg-white/[0.03] px-6 py-3 border border-white/5 rounded-xl tracking-[0.2em] shadow-inner">{guest.nif || 'SEC_UNRESOLVED'}</span>
                          )}
                       </td>
                       <td className="px-12 py-10 text-right">
                          <div className={cn(
                            "flex items-center justify-end gap-3 transition-opacity",
                            editingGuestId === guest.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}>
                             {editingGuestId === guest.id ? (
                               <>
                                 <button 
                                   onClick={() => handleSaveEdit(guest.id)}
                                   className="w-12 h-12 flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all rounded-xl shadow-xl"
                                 >
                                    <Check size={16} />
                                 </button>
                                 <button 
                                   onClick={() => setEditingGuestId(null)}
                                   className="w-12 h-12 flex items-center justify-center bg-white/[0.05] text-white/40 hover:text-white transition-all rounded-xl shadow-xl"
                                 >
                                    <XIcon size={16} />
                                 </button>
                               </>
                             ) : (
                               <>
                                 <button 
                                   onClick={() => handleStartEdit(guest)}
                                   className="w-12 h-12 flex items-center justify-center bg-white/[0.05] text-white/40 hover:text-primary hover:bg-white/[0.1] transition-all rounded-xl shadow-xl"
                                 >
                                    <Edit size={16} />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(guest.id)}
                                   className="w-12 h-12 flex items-center justify-center bg-white/[0.05] text-white/40 hover:text-red-500 hover:bg-white/[0.1] transition-all rounded-xl shadow-xl"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                               </>
                             )}
                          </div>
                       </td>
                    </motion.tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
      <div className="p-10 lg:p-14 bg-white/[0.01] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-10 relative z-10">
         <div className="flex flex-col items-center sm:items-start gap-2">
            <span className="font-body text-[9px] text-white/20 uppercase tracking-[0.4em] font-black italic underline underline-offset-8 decoration-primary/20">Operational Database Status</span>
            <p className="font-headline text-white/60 text-lg uppercase tracking-tight font-bold">
               Ativos Monitorizados: <span className="text-primary text-3xl font-black ml-2 shadow-primary/20 drop-shadow-lg">{guests.length}</span>
            </p>
         </div>
         <button className="flex items-center gap-6 px-14 py-6 bg-primary text-white text-[11px] font-black uppercase tracking-[0.5em] hover:brightness-110 transition-all shadow-[0_20px_50px_rgba(255,107,0,0.3)] rounded-2xl relative overflow-hidden group/btn">
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
            <Plus size={18} className="relative z-10" /> 
            <span className="relative z-10">INICIAR PROTOCOLO</span>
         </button>
      </div>
    </div>
  );
};

export default GuestTable;
