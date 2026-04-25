
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
import { subscribeToNotifications, markNotificationAsRead } from './services/firestoreService';

type Page = 'dashboard' | 'billing' | 'guests' | 'rooms' | 'reports' | 'settings' | 'comms' | 'staff' | 'mural';
type UserRole = 'admin' | 'staff';

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
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.15, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImages[index]})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/60"></div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [loading, setLoading] = useState(true);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationTrayOpen, setIsNotificationTrayOpen] = useState(false);

  useEffect(() => {
    // Check for "Bypass" login first
    const bypassData = localStorage.getItem('bfv_bypass_user');
    if (bypassData) {
      try {
        const bypassUser = JSON.parse(bypassData);
        setUser(bypassUser);
        setUserRole('admin');
        setLoading(false);
        return; // Skip supabase check if bypass is active
      } catch (e) {
        localStorage.removeItem('bfv_bypass_user');
      }
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const isAdminEmail = session.user.email === 'valter1990vado@gmail.com' || session.user.email?.startsWith('valter');
        setUserRole(isAdminEmail ? 'admin' : 'staff');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      const isAdminEmail = currentUser?.email === 'valter1990vado@gmail.com' || currentUser?.email?.startsWith('valter');
      
      if (isAdminEmail) {
        setUserRole('admin');
      } else {
        setUserRole('staff');
        if (['reports', 'staff', 'settings'].includes(currentPage)) {
          setCurrentPage('dashboard');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [currentPage]);

  useEffect(() => {
    if (user) {
      // Temporarily disabling Firebase notification subscription until fully migrated to Supabase
      // const unsub = subscribeToNotifications(user.id, setNotifications);
      // return () => unsub();
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

  const navItems: readonly { id: Page; label: string; icon: any; roles: readonly UserRole[] }[] = [
    { id: 'dashboard', label: 'Painel Central', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { id: 'guests', label: 'Gestão de Clientes', icon: Users, roles: ['admin', 'staff'] },
    { id: 'billing', label: 'Facturação', icon: FileText, roles: ['admin', 'staff'] },
    { id: 'rooms', label: 'Gestão de Quartos', icon: BedDouble, roles: ['admin', 'staff'] },
    { id: 'comms', label: 'Comunicações', icon: MessageSquare, roles: ['admin', 'staff'] },
    { id: 'mural', label: 'Mural BFV', icon: Layout, roles: ['admin', 'staff'] },
    { id: 'reports', label: 'Relatórios Avançados', icon: BarChart3, roles: ['admin'] },
    { id: 'staff', label: 'Controlo de Equipa', icon: ShieldCheck, roles: ['admin'] },
    { id: 'settings', label: 'Configurações', icon: Settings, roles: ['admin'] },
  ];

  const accessibleNavItems = navItems.filter(item => (item.roles as readonly string[]).includes(userRole));


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
    <div className="h-full flex flex-col bg-surface border-r border-outline-variant/10 shadow-[40px_0_40px_-10px_rgba(0,0,0,0.4)]">
      <div className="px-6 py-10 mb-6 border-b border-outline-variant/10">
        <div className="flex flex-col items-center gap-4 mb-4 text-center">
          <div className="w-20 h-20 bg-surface-bright border border-outline-variant/10 p-2 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(255,107,0,0.2)] hover:scale-105 transition-all duration-700">
            <img 
              src="https://i.ibb.co/sdggPPwX/logo.png" 
              alt="Casa Mãe Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-headline text-primary text-3xl font-black tracking-tight leading-none drop-shadow-sm">A CASA MÃE</h1>
            <p className="font-body text-[8px] font-black uppercase tracking-[0.4em] text-glow">BFV-BEIB FRANCISCO VIANA</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-0 space-y-1 overflow-y-auto custom-scrollbar">
        {accessibleNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentPage(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center px-6 py-4 text-xs uppercase tracking-widest transition-all duration-500 relative group",
              currentPage === item.id 
                ? "text-primary bg-surface-container-low after:absolute after:right-0 after:top-0 after:h-full after:w-1 after:bg-primary" 
                : "text-on-surface-variant/40 hover:bg-surface-container-low hover:text-on-surface"
            )}
          >
            <item.icon size={18} className="mr-4 lg:mr-5 shrink-0" />
            <span className="font-body font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-6 py-8 space-y-6">
        {(userRole === 'admin' || currentPage === 'billing') && (
          <button 
            onClick={handleActionButton}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-black text-[10px] uppercase tracking-widest rounded-sm transition-transform active:scale-95 shadow-xl shadow-primary/10"
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
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <div className="w-16 h-px bg-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary animate-[loading_1.5s_infinite] origin-left"></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: scaleX(0); left: 0; }
            50% { transform: scaleX(1); left: 0; }
            100% { transform: scaleX(0); left: 100%; }
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
        <header className="h-20 lg:h-24 shrink-0 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 flex items-center justify-between px-6 lg:px-12 z-50 sticky top-0">
          <div className="flex items-center gap-6">
            <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="lg:hidden p-3 bg-surface border border-outline-variant/10 text-primary shadow-lg"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-6 hidden sm:flex group cursor-pointer relative">
              <div className="w-12 h-12 lg:w-14 lg:h-14 hover:rotate-6 transition-all duration-700 bg-white/5 p-2 border border-outline-variant/10">
                <img 
                  src="https://i.ibb.co/sdggPPwX/logo.png" 
                  alt="A Casa Mãe" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-primary text-3xl lg:text-4xl tracking-tighter leading-none font-black drop-shadow-md text-glow">A CASA MÃE</span>
                <span className="text-[7px] lg:text-[8px] text-secondary font-black uppercase tracking-[0.4em] mt-1">BFV-BEIB FRANCISCO VIANA</span>
              </div>
            </div>
            
            <div className="relative flex items-center hidden sm:flex">
              <Search className="absolute left-3 text-on-surface-variant/40" size={14} />
              <input 
                type="text" 
                placeholder="Pesquisar BFV..." 
                className="bg-surface-container-low border-none text-xs pl-10 pr-4 py-2 w-64 focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/20 rounded-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 lg:gap-8">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationTrayOpen(!isNotificationTrayOpen)}
                className="relative text-on-surface-variant/60 hover:text-primary transition-colors"
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-4 ring-surface"></span>
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

            <div className="flex items-center gap-4 pl-4 border-l border-outline-variant/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-headline tracking-wide leading-none">{user.user_metadata?.display_name || user.email?.split('@')[0] || 'Manager'}</p>
                <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1 opacity-60">
                   {userRole === 'admin' ? 'Director Executivo' : 'Operações'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-sm bg-surface-container border border-outline-variant/20 flex items-center justify-center overflow-hidden shrink-0 shadow-lg grayscale hover:grayscale-0 transition-all duration-500">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-headline text-lg text-primary">{(user.user_metadata?.display_name?.[0] || user.email?.[0] || 'A').toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10">
           <div className="max-w-7xl mx-auto pb-12">
               <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                 <div>
                    <h2 className="font-headline text-5xl lg:text-7xl font-black tracking-tight text-primary drop-shadow-md">
                      {currentPage === 'comms' ? 'Tempo de Serviço' : 
                       currentPage === 'guests' ? 'Registo de Hóspedes' :
                       currentPage === 'dashboard' ? 'Centro de Comando' : 
                       currentPage === 'mural' ? 'Mural BFV' :
                       currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                    </h2>
                    <p className="font-body text-[11px] font-black uppercase tracking-[0.4em] text-secondary mt-4 flex items-center gap-3">
                       <span className="w-12 h-0.5 bg-primary/40"></span>
                       A CASA MÃE — BFV-BEIB FRANCISCO VIANA
                    </p>
                 </div>
              </div>
              
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                {renderPage()}
              </div>
           </div>
        </div>

        {/* System Status & Watermark */}
        <footer className="h-10 bg-surface-container-lowest border-t border-outline-variant/5 flex items-center justify-between px-8 text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/20 shrink-0 relative">
          <div className="flex items-center space-x-8">
            <span className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               Operacional
            </span>
            <span className="hidden sm:inline">Latência: <span className="text-secondary/50 font-bold">12ms</span></span>
            <span className="text-primary/40 font-black">Casa Mãe v2.4.0 BFV</span>
          </div>
          
          {/* Watermark Logo */}
          <div className="absolute right-1/2 translate-x-1/2 bottom-2 h-12 opacity-10 pointer-events-none mix-blend-overlay">
            <img 
              src="https://i.ibb.co/BVY4mTqq/logo.png" 
              alt="Casa Mãe Logo" 
              className="h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center space-x-4">
            <span>GMT {new Date().getHours()}:{new Date().getMinutes()}</span>
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
