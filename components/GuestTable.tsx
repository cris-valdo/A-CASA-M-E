
import React, { useEffect, useState } from 'react';
import { 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  History,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { subscribeToGuests } from '../services/firestoreService';

const GuestTable: React.FC = () => {
  const [guests, setGuests] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToGuests((data) => {
      setGuests(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-surface-container border border-outline-variant/10 shadow-2xl relative overflow-hidden">
      <div className="p-8 lg:p-10 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-surface-bright/5">
         <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-primary"></div>
            <div>
               <h3 className="font-headline italic text-on-surface text-3xl tracking-wide font-black drop-shadow-sm text-glow">Registo de Hóspedes</h3>
               <p className="font-body text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/40 mt-1 italic">Histórico • Casa Mãe BFV</p>
            </div>
         </div>
         <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-8 py-3 bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 italic">Auditorias Activas</button>
            <button className="flex-1 sm:flex-none px-8 py-3 text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all underline decoration-primary/20 decoration-2 underline-offset-4 italic">Arrumação / Arquivo</button>
         </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
         <table className="w-full text-left min-w-[800px]">
            <thead>
               <tr className="bg-surface-container-low">
                  <th className="px-10 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">Perfil do Hóspede</th>
                  <th className="px-10 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">Contacto</th>
                  <th className="px-10 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 text-center">NIF / ID</th>
                  <th className="px-10 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 text-right">Acções</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
               {guests.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="px-10 py-32 text-center opacity-20">
                     <p className="font-headline italic text-3xl">Nenhum Registo Encontrado</p>
                   </td>
                 </tr>
               ) : (
                 guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-surface-bright/10 transition-colors group">
                       <td className="px-10 py-7">
                          <div className="flex items-center gap-6">
                             <div className="shrink-0 w-12 h-12 bg-surface-bright/20 border border-outline-variant/10 flex items-center justify-center text-primary font-headline italic text-xl group-hover:border-primary/40 transition-colors">
                                <span>{guest.name?.[0] || 'G'}</span>
                             </div>
                             <div>
                                <div className="font-headline italic text-on-surface text-xl group-hover:text-primary transition-colors leading-tight">{guest.name || 'Hóspede Anónimo'}</div>
                                <div className="font-body text-[9px] font-bold uppercase tracking-[0.2em] mt-1 text-on-surface-variant/40 italic">Identificador Geral de Auditoria</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-7">
                          <div className="flex flex-col gap-2 font-body text-[11px] text-on-surface-variant/60">
                             <div className="flex items-center gap-3">
                                <Mail size={12} className="text-primary/40" />
                                <span className="tracking-tight">{guest.email || '—'}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <Phone size={12} className="text-secondary/40" />
                                <span className="tracking-tight">{guest.phone || '—'}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-7 text-center">
                          <span className="font-body text-[10px] font-bold text-on-surface-variant/60 bg-surface-bright/20 px-4 py-2 border border-outline-variant/10 tracking-widest italic">{guest.nif || 'Sem ID'}</span>
                       </td>
                       <td className="px-10 py-7 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-3 text-on-surface-variant/40 hover:text-primary transition-all rounded-sm hover:bg-primary/5">
                                <Edit size={16} />
                             </button>
                             <button className="p-3 text-on-surface-variant/40 hover:text-primary transition-all rounded-sm hover:bg-primary/5">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
      <div className="p-8 bg-surface-bright/5 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-6">
         <p className="font-body text-[10px] text-on-surface-variant/40 uppercase tracking-[0.2em] italic">
            Total de Registos: <span className="text-on-surface text-base font-headline ml-1">{guests.length}</span> Hóspedes
         </p>
         <button className="flex items-center gap-3 px-10 py-4 bg-on-surface text-surface text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl italic underline decoration-surface/20 underline-offset-8">
            <Plus size={16} /> Registar Hóspede
         </button>
      </div>
    </div>
  );
};

export default GuestTable;
