
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';
// Use local user state for session tracking
import { User } from '@supabase/supabase-js';
import Dashboard from './components/Dashboard';
import BillingForm from './components/BillingForm';
import Reports from './components/Reports';
import GuestTable from './components/GuestTable';
import AuthScreen from './components/AuthScreen';
import GuestModal from './components/GuestModal';
import Communications from './components/Communications';
import StaffManagement from './components/StaffManagement';
import SocialFeed from './components/SocialFeed';
import { 
  BarChart3, 
  BedDouble, 
  Users, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Plus,
  MessageSquare,
  ShieldCheck,
  Menu,
  X,
  Layout,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  subscribeToNotifications, 
  markNotificationAsRead, 
  subscribeToUsers, 
  updateUser 
} from './services/firestoreService';
import { AppUser, Page, UserRole, Permission } from './types';

const AppBackground = () => {
  const [index, setIndex] = useState(0);
  const bgImages = [
    "https://i.ibb.co/7xDTxMQs/img1.png",
    "https://i.ibb.co/zVHPNKTp/img2.png",
    "https://i.ibb.co/TBWTGLd9/img3.png",
    "https://i.ibb.co/zWs47JKX/img4.png",
    "https://i.ibb.co/TMrQRmDP/img5.png",
    "https://i.ibb.co/gMkwHHYH/img6.png"
  ];
  
  useEffect(() => {
    const timer = setInterval(() => setIndex(p => (p + 1) % bgImages.length), 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.25 }}
          animate={{ opacity: 0.25, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 5, ease: "linear" }}
          className="absolute inset-0 bg-cover bg-center grayscale brightness-50"
          style={{ backgroundImage: `url(${bgImages[index]})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black/80"></div>
      {/* Moving lines effect */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [loading, setLoading] = useState(true);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationTrayOpen, setIsNotificationTrayOpen] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    // Safety timeout for loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Loading timeout reached - forcing state release");
        setLoading(false);
      }
    }, 5000);

    // Check for "Bypass" login first (Local Storage)
    const bypassData = localStorage.getItem('bfv_bypass_user');
    if (bypassData) {
      try {
        const bypassUser = JSON.parse(bypassData);
        setUser(bypassUser);
        setUserRole('admin');
        setLoading(false);
        return () => clearTimeout(timeout);
      } catch (e) {
        localStorage.removeItem('bfv_bypass_user');
      }
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const isAdminEmail = currentUser.email === 'valter1990vado@gmail.com' || currentUser.email?.startsWith('valter');
        if (isAdminEmail) setUserRole('admin');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const isAdminEmail = currentUser.email === 'valter1990vado@gmail.com' || currentUser.email?.startsWith('valter');
        if (isAdminEmail) setUserRole('admin');
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Sync Supabase Auth with Firestore User Data
  useEffect(() => {
    if (!user) {
      setAppUser(null);
      setLoading(false);
      return;
    }

    const unsub = subscribeToUsers((allUsers) => {
      const found = allUsers.find(u => u.uid === user.id);
      
      // Secondary safety: check email again even if not in Firestore
      const isAdminEmail = user.email === 'valter1990vado@gmail.com' || user.email?.startsWith('valter');

      if (found) {
        setAppUser(found);
        setUserRole(found.role);
        setNewName(found.displayName || '');
      } else {
        // Fallback or initialization for new user
        setUserRole(isAdminEmail ? 'admin' : 'staff');
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore sync error:", error);
      const isAdminEmail = user.email === 'valter1990vado@gmail.com' || user.email?.startsWith('valter');
      setUserRole(isAdminEmail ? 'admin' : 'staff');
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (user) {
      const unsub = subscribeToNotifications(user.id, setNotifications);
      return () => unsub();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('bfv_bypass_user');
      await supabase.auth.signOut();
      window.location.reload(); // Ensure clean state
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const navItems: readonly { id: Page; label: string; icon: any; roles: readonly UserRole[]; permissionId?: Permission }[] = [
    { id: 'dashboard', label: 'Painel Central', icon: LayoutDashboard, roles: ['admin', 'staff'], permissionId: 'dashboard' },
    { id: 'guests', label: 'Gestão de Clientes', icon: Users, roles: ['admin', 'staff'], permissionId: 'guests' },
    { id: 'billing', label: 'Facturação', icon: FileText, roles: ['admin', 'staff'], permissionId: 'billing' },
    { id: 'rooms', label: 'Gestão de Quartos', icon: BedDouble, roles: ['admin', 'staff'], permissionId: 'rooms' },
    { id: 'comms', label: 'Comunicações', icon: MessageSquare, roles: ['admin', 'staff'], permissionId: 'comms' },
    { id: 'mural', label: 'Mural BFV', icon: Layout, roles: ['admin', 'staff'], permissionId: 'mural' },
    { id: 'reports', label: 'Relatórios Avançados', icon: BarChart3, roles: ['admin'], permissionId: 'reports' },
    { id: 'staff', label: 'Controlo de Equipa', icon: ShieldCheck, roles: ['admin'], permissionId: 'staff' },
  ];

  const accessibleNavItems = navItems.filter(item => {
    if (userRole === 'admin') return true;
    if (appUser?.permissions && item.permissionId) {
      return appUser.permissions.includes(item.permissionId);
    }
    return (item.roles as readonly string[]).includes(userRole);
  });


  const handleActionButton = () => {
    if (currentPage === 'guests') {
      setIsGuestModalOpen(true);
    }
  };
  
  const companyInfo = {
    name: "A CASA MÃE - BFV",
    nif: "508 123 456",
    address: "Beib Francisco Viana, Luanda, Angola",
    email: "contato@acasamaebfv.com",
    phone: "+244 923 000 000"
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-surface-container-low/95 backdrop-blur-xl border-r border-white/5 relative overflow-hidden">
      {/* Decorative vertical lines */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
      
      <div className="px-6 py-12 mb-6 relative z-10">
        <div className="flex flex-col items-center gap-5 mb-4 text-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="w-20 h-20 bg-white p-3 flex items-center justify-center rounded-2xl shadow-2xl relative z-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
              <img 
                src="https://i.ibb.co/sdggPPwX/logo.png" 
                alt="Casa Mãe Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="font-headline text-primary text-3xl font-black tracking-tight leading-none drop-shadow-lg">A CASA MÃE</h1>
            <p className="font-body text-[8px] font-black uppercase tracking-[0.4em] text-secondary/60">BFV • CABINDA</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
        {accessibleNavItems.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => {
              setCurrentPage(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center px-6 py-4 text-xs uppercase tracking-[0.2em] transition-all duration-500 rounded-xl group relative overflow-hidden",
              currentPage === item.id 
                ? "text-primary bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                : "text-white/20 hover:bg-white/[0.01] hover:text-white/60"
            )}
          >
            {currentPage === item.id && (
              <>
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,107,0,0.8)]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
              </>
            )}
            <item.icon size={18} className={cn(
              "mr-4 transition-all duration-500 relative z-10",
              currentPage === item.id ? "scale-110 text-primary drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" : "group-hover:scale-110 group-hover:text-white group-hover:rotate-6"
            )} />
            <span className="font-body font-black tracking-[0.2em] relative z-10">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="px-6 py-8 space-y-6 relative z-10">
        {(userRole === 'admin' || currentPage === 'billing') && (
          <button 
            onClick={handleActionButton}
            className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all neo-button shadow-xl shadow-primary/20 hover:brightness-110 hover:-translate-y-0.5"
          >
            Ação Rápida BFV
          </button>
        )}
        
        <div className="pt-6 border-t border-outline-variant/10 space-y-4">
          <button 
            onClick={handleLogout}
            className="flex items-center text-on-surface-variant/40 hover:text-primary transition-colors text-[10px] uppercase tracking-widest font-bold group"
          >
            <LogOut size={16} className="mr-3 group-hover:rotate-12 transition-transform" />
            Sair do Sistema
          </button>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    // Basic RBAC check
    const currentItem = navItems.find(item => item.id === currentPage);
    const hasAccess = currentItem?.roles.includes(userRole);

    if (!hasAccess) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-surface-container rounded-sm border border-outline-variant/10">
           <ShieldCheck size={48} className="text-primary/40 mb-6" />
           <h3 className="text-3xl font-headline font-light italic text-primary mb-4 tracking-wide">Acesso Restrito</h3>
           <p className="text-on-surface-variant/60 max-w-md mx-auto font-body uppercase tracking-[0.2em] text-[10px] leading-relaxed">
             Este módulo é reservado à Direção Executiva da <span className="text-secondary italic">CASA MÃE</span>.
           </p>
           <button onClick={() => setCurrentPage('dashboard')} className="mt-10 px-10 py-4 border border-primary/30 text-primary hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all italic">
             Voltar ao Centro de Comando
           </button>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard': return <Dashboard userRole={userRole} />;
      case 'billing': return <BillingForm companyInfo={companyInfo} />;
      case 'reports': return <Reports />;
      case 'guests': return <GuestTable />;
      case 'comms': return <Communications />;
      case 'mural': return <SocialFeed />;
      case 'staff': return <StaffManagement />;
      default: return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-30">
           <Settings size={48} className="mb-4" />
           <p className="uppercase tracking-[0.3em] text-[10px] font-black italic">Módulo em Otimização BFV</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-white p-4 rounded-2xl shadow-2xl relative"
        >
          <img src="https://i.ibb.co/sdggPPwX/logo.png" alt="Logo" className="w-full h-full object-contain" />
          <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
        </motion.div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-px bg-white/5 relative overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-primary animate-[loading_2s_infinite] origin-left shadow-[0_0_10px_rgba(255,107,0,0.5)]"></div>
          </div>
          <p className="font-body text-[8px] font-black uppercase tracking-[0.6em] text-primary/40 animate-pulse">
            SISTEMA OPERATIVO CASA MÃE • A INICIALIZAR
          </p>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%) scaleX(0.2); }
            50% { transform: translateX(0%) scaleX(1); }
            100% { transform: translateX(100%) scaleX(0.2); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen bg-surface font-body text-on-surface overflow-hidden">
      <AppBackground />
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[100] w-72 bg-surface-container border-r border-outline-variant/10 transition-transform duration-500 transform lg:relative lg:translate-x-0 lg:z-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative">
        {/* Header Principal Casa Mãe */}
        <header className="h-20 lg:h-24 shrink-0 bg-surface/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-6 lg:px-12 z-50 sticky top-0">
          <div className="flex items-center gap-6">
            <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="lg:hidden p-3 bg-white/5 border border-white/10 text-primary shadow-2xl rounded-lg"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-6 hidden sm:flex group cursor-pointer relative">
               <div className="flex flex-col">
                 <span className="font-headline text-white text-3xl lg:text-4xl tracking-tighter leading-none font-bold drop-shadow-md group-hover:text-primary transition-colors">
                   A CASA <span className="text-primary italic">MÃE</span>
                 </span>
                 <span className="text-[7px] lg:text-[8px] text-white/30 font-black uppercase tracking-[0.5em] mt-1 group-hover:text-secondary transition-colors">CENTRO DE OPERAÇÕES</span>
               </div>
            </div>
            
            <div className="relative flex items-center hidden sm:flex group/search">
              <Search className="absolute left-5 text-white/20 group-focus-within/search:text-primary transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="PROCURAR NO SISTEMA..." 
                className="bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] pl-14 pr-8 py-4 w-80 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] text-white placeholder:text-white/10 rounded-xl transition-all shadow-inner"
              />
              <div className="absolute right-4 px-2 py-1 bg-white/[0.05] border border-white/10 rounded font-mono text-[8px] text-white/20">F_SRCH</div>
            </div>
          </div>

          <div className="flex items-center gap-6 lg:gap-10">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationTrayOpen(!isNotificationTrayOpen)}
                className="relative p-3 bg-white/[0.03] border border-white/10 text-white/40 hover:text-primary transition-all rounded-xl shadow-xl group/bell"
              >
                <Bell size={18} className="group-hover/bell:rotate-12 transition-transform" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-black shadow-[0_0_10px_rgba(255,107,0,0.8)]"></span>
                )}
              </button>

              {isNotificationTrayOpen && (
                <div className="absolute right-0 mt-6 w-80 bg-surface-container border border-outline-variant/10 rounded-sm shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4">
                   <div className="p-5 border-b border-outline-variant/10 bg-surface-bright/20">
                      <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Notificações Command Center</h3>
                   </div>
                   <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center text-on-surface-variant/20 text-[9px] uppercase tracking-widest">Nenhuma atividade detectada</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={async () => await markNotificationAsRead(n.id)}
                            className={cn(
                              "p-5 border-b border-outline-variant/5 hover:bg-surface-bright/10 cursor-pointer transition-colors group",
                              !n.read && "bg-primary/5"
                            )}
                          >
                             <div className="flex gap-4">
                                <div className={cn(
                                   "w-8 h-8 rounded-sm shrink-0 flex items-center justify-center border border-outline-variant/10",
                                   n.type === 'success' ? 'text-emerald-400 bg-emerald-400/5' :
                                   n.type === 'warning' ? 'text-primary bg-primary/5' : 'text-on-surface/40'
                                )}>
                                   {n.type === 'success' ? <CheckCircle2 size={14} /> : n.type === 'warning' ? <AlertTriangle size={14} /> : <Info size={14} />}
                                </div>
                                <div className="flex-1">
                                   <p className="text-[11px] font-bold text-on-surface uppercase tracking-tight">{n.title}</p>
                                   <p className="text-[10px] text-on-surface-variant/60 font-medium leading-relaxed mt-1">{n.message}</p>
                                </div>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              )}
            </div>

            <div 
              className="flex items-center gap-6 pl-8 border-l border-white/5 relative group/profile cursor-pointer"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold font-headline tracking-tight text-white leading-none mb-1">{appUser?.displayName || user.email?.split('@')[0] || 'Manager'}</p>
                <div className="flex items-center justify-end gap-2">
                   <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                   <p className="text-[8px] text-primary font-black uppercase tracking-[0.2em] opacity-80">
                      {userRole === 'admin' ? 'DIREÇÃO GERAL' : 'OPERACIONAL'}
                   </p>
                </div>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl relative transition-transform duration-700 group-hover/profile:scale-110">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent"></div>
                {appUser?.photoURL ? (
                  <img src={appUser.photoURL} alt="Profile" className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-headline text-2xl text-primary font-bold shadow-primary/20 drop-shadow-md">{(appUser?.displayName?.[0] || user.email?.[0] || 'A').toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Profile Modal */}
        <AnimatePresence>
          {isProfileModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setIsProfileModalOpen(false)}
                 className="absolute inset-0 bg-black/80 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="w-full max-w-md bg-surface-container border border-white/10 p-10 lg:p-12 relative z-10 shadow-3xl"
               >
                  <button 
                    onClick={() => setIsProfileModalOpen(false)}
                    className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>

                  <h3 className="font-headline text-4xl italic text-primary mb-10 tracking-tight">Editar Perfil</h3>
                  
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Identidade no Sistema</label>
                        <input 
                          type="text" 
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 text-white text-sm focus:outline-none focus:border-primary transition-all rounded-lg font-headline italic text-xl"
                          placeholder="Nome Completo"
                        />
                     </div>
                     
                     <div className="pt-6 border-t border-white/5">
                        <button 
                          onClick={async () => {
                            if (appUser) {
                              await updateUser(appUser.id, { displayName: newName });
                              setIsProfileModalOpen(false);
                            }
                          }}
                          className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-lg shadow-2xl shadow-primary/20 hover:brightness-110 hover:-translate-y-1 transition-all neo-button"
                        >
                          Atualizar Identidade
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dynamic Content Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative z-10">
           <div className="max-w-7xl mx-auto pb-24">
               <div className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 overflow-hidden">
                 <motion.div
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8, ease: "easeOut" }}
                 >
                    <h2 className="font-headline text-5xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
                      {currentPage === 'comms' ? (
                        <>TIME <span className="text-primary italic">SERVICE</span></>
                      ) : currentPage === 'guests' ? (
                         <>GESTÃO <span className="text-primary italic">CLIENTES</span></>
                      ) : currentPage === 'dashboard' ? (
                         <>COMMAND <span className="text-primary italic">CENTER</span></>
                      ) : currentPage === 'mural' ? (
                         <>SOCIAL <span className="text-primary italic">MURAL</span></>
                      ) : (
                        currentPage.toUpperCase()
                      )}
                    </h2>
                    <p className="font-body text-[10px] font-black uppercase tracking-[0.6em] text-white/30 mt-6 flex items-center gap-4">
                       <span className="w-16 h-px bg-primary/50"></span>
                       SISTEMA OPERATIVO PRODUTO BFV
                    </p>
                 </motion.div>
              </div>
              
              <motion.div 
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {renderPage()}
              </motion.div>
           </div>
        </div>

        {/* System Status & Watermark */}
        <footer className="h-16 bg-black/40 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between px-12 text-[9px] font-mono uppercase tracking-[0.3em] text-white/20 shrink-0 relative z-50">
          <div className="flex items-center space-x-12">
            <span className="flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
               <span className="font-black text-emerald-500/80">CORE_SYSTEM_ACTIVE</span>
            </span>
            <span className="hidden sm:flex items-center gap-2">
               NETWORK_LATENCY: <span className="text-secondary font-black">0.42ms</span>
            </span>
            <span className="text-primary/60 font-black px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg">CASA_MÃE_v3.0.0_BFV</span>
          </div>
          
          {/* Central status line */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] overflow-hidden">
             <div className="whitespace-nowrap font-black font-headline text-2xl tracking-[2em]">AUDIT_STATUS_OK — SYSTEM_STABLE — CABINDA_HQ</div>
          </div>

          <div className="flex items-center space-x-8 relative z-10">
            <span className="font-black">LOCAL_TIME {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
            <div className="w-px h-6 bg-white/10"></div>
            <span className="text-white/40">SEC_LEVEL_01</span>
          </div>
        </footer>
      </main>

      <GuestModal 
        isOpen={isGuestModalOpen} 
        onClose={() => setIsGuestModalOpen(false)} 
      />
    </div>
  );
};

export default App;
