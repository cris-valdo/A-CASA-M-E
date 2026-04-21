
import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  UserMinus, 
  UserCheck, 
  Search,
  MoreVertical,
  Plus,
  Mail,
  Shield,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  subscribeToUsers, 
  updateUserStatus, 
  deleteUser, 
  updateUserRole 
} from '../services/firestoreService';

const StaffManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await updateUserStatus(userId, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Confirmar remoção permanente deste operacional?")) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'staff' : 'admin';
    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Panel */}
      <div className="bg-surface-container border border-outline-variant/10 p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-6">
               <ShieldCheck size={32} className="text-primary" />
               <h2 className="font-headline text-3xl italic text-on-surface tracking-wide">Auditoria de Privilégios</h2>
            </div>
            <p className="font-body text-[10px] text-on-surface-variant/40 uppercase tracking-[0.3em] max-w-sm italic leading-relaxed">
               Painel de Gestão Operacional — BFV. Defina hierarquias, audite permissões e controle o acesso à rede Command Center.
            </p>
          </div>
          <button className="px-10 py-4 bg-on-surface text-surface font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all italic underline decoration-surface/20 underline-offset-8">
             <Plus size={16} className="inline mr-2" /> Protocolo de Convite
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="relative max-w-md w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20" size={14} />
           <input 
             type="text" 
             placeholder="Pesquisar Audit..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-surface-container-low border border-outline-variant/10 px-12 py-3 text-[10px] font-body font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/10"
           />
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-4 py-2 border border-emerald-500/10 bg-emerald-500/5 text-emerald-400">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black uppercase tracking-widest">{users.filter(u => u.status === 'active').length} Ativo</span>
           </div>
           <div className="flex items-center gap-3 px-4 py-2 border border-primary/10 bg-primary/5 text-primary">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span className="text-[9px] font-black uppercase tracking-widest">{users.filter(u => u.status === 'blocked').length} Suspenso</span>
           </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container border border-outline-variant/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/5">
                   <th className="px-10 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">Identidade Operacional</th>
                   <th className="px-10 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">Hierarquia</th>
                   <th className="px-10 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">Status</th>
                   <th className="px-10 py-5 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 text-right">Acções de Auditoria</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-outline-variant/5">
                {loading ? (
                   <tr>
                      <td colSpan={4} className="px-10 py-20 text-center opacity-20 italic">A carregar Ledger...</td>
                   </tr>
                ) : filteredUsers.length === 0 ? (
                   <tr>
                      <td colSpan={4} className="px-10 py-20 text-center font-headline italic text-2xl text-on-surface-variant/20 text-on-surface-variant/20 italic">Nenhum Operacional Encontrado</td>
                   </tr>
                ) : (
                   filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-bright/5 transition-all group">
                         <td className="px-10 py-7">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 bg-surface-bright border border-outline-variant/10 flex items-center justify-center grayscale hover:grayscale-0 transition-all overflow-hidden shrink-0">
                                  {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <span className="font-headline italic text-primary text-xl">{u.displayName?.[0] || 'A'}</span>}
                               </div>
                               <div>
                                  <p className="font-headline italic text-xl text-on-surface group-hover:text-primary transition-colors leading-tight">{u.displayName || 'Agente Anónimo'}</p>
                                  <p className="font-body text-[9px] text-on-surface-variant/40 font-bold uppercase mt-1 tracking-widest">{u.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-7">
                            <button 
                              onClick={() => handleToggleRole(u.id, u.role)}
                              className={cn(
                                "px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all italic",
                                u.role === 'admin' 
                                  ? "text-secondary border-secondary/20 bg-secondary/5" 
                                  : "text-on-surface/40 border-outline-variant/20 hover:text-primary transition-colors hover:border-primary/20"
                              )}
                            >
                               {u.role === 'admin' ? 'Director Executivo' : 'Staff Operacional'}
                            </button>
                         </td>
                         <td className="px-10 py-7">
                            <div className={cn(
                               "flex items-center gap-2 px-3 py-1.5 border w-fit",
                               u.status === 'active' ? "text-emerald-400 border-emerald-400/10" : "text-primary border-primary/10 bg-primary/5"
                            )}>
                               <div className={cn("w-1 h-1 rounded-full", u.status === 'active' ? "bg-emerald-400" : "bg-primary")}></div>
                               <span className="text-[9px] font-black uppercase tracking-widest italic">{u.status === 'active' ? 'Activo' : 'Suspenso'}</span>
                            </div>
                         </td>
                         <td className="px-10 py-7 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => handleToggleStatus(u.id, u.status)}
                                 className="p-3 text-on-surface-variant/40 hover:text-primary transition-all rounded-sm hover:bg-primary/5"
                               >
                                  {u.status === 'active' ? <UserMinus size={16} /> : <UserCheck size={16} />}
                               </button>
                               <button 
                                 onClick={() => handleDeleteUser(u.id)}
                                 className="p-3 text-on-surface-variant/40 hover:text-primary transition-all rounded-sm hover:bg-primary/5"
                               >
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
      </div>
    </div>
  );
};

export default StaffManagement;
