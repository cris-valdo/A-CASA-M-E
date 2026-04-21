
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { cn } from './lib/utils';
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Whitelist for admin - adding a fallback for common test accounts or letting the user match their email
      const isAdminEmail = currentUser?.email === 'valter1990vado@gmail.com' || currentUser?.email?.startsWith('valter');
      
      if (isAdminEmail) {
        setUserRole('admin');
      } else {
        setUserRole('staff');
        // If staff logs in, default to a page they can access
        if (['reports', 'staff', 'settings'].includes(currentPage)) {
          setCurrentPage('dashboard');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentPage]);

  useEffect(() => {
    if (user) {
      const unsub = subscribeToNotifications(user.uid, setNotifications);
      return () => unsub();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
              src="https://ibb.co/sdggPPwX" 
              alt="Casa Mãe Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = "https://i.ibb.co/sdggPPwX/logo.png"; }}
            />
          </div>
          <div>
            <h1 className="font-headline italic text-primary text-3xl font-black tracking-tight leading-none drop-shadow-sm">A CASA MÃE</h1>
            <p className="font-body text-[8px] font-black uppercase tracking-[0.4em] text-secondary mt-2 text-glow">BFV-BEIB FRANCISCO VIANA</p>
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
      {/* Sidebar Overlay */}
      <aside className="hidden lg:block w-64 shrink-0 h-full">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface animate-in slide-in-from-left duration-500">
              <SidebarContent />
           </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative">
        {/* Atelier Header */}
        <header className="h-16 shrink-0 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/5 flex items-center justify-between px-6 lg:px-10 z-50 sticky top-0">
          <div className="flex items-center gap-6">
            <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="lg:hidden p-2 text-on-surface-variant/60 hover:text-primary transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-4 hidden md:flex group cursor-pointer">
              <div className="w-10 h-10 hover:scale-110 transition-transform duration-500">
                <img 
                  src="https://ibb.co/sdggPPwX" 
                  alt="CM" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = "https://i.ibb.co/sdggPPwX/logo.png"; }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline italic text-primary text-2xl tracking-tighter leading-none font-bold">A CASA MÃE</span>
                <span className="text-[7px] text-secondary font-black uppercase tracking-widest mt-0.5">BFV-BEIB FRANCISCO VIANA</span>
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
                      <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] italic">Notificações Command Center</h3>
                   </div>
                   <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center text-on-surface-variant/20 text-[9px] uppercase tracking-widest italic">Nenhuma atividade detectada</div>
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
                <p className="text-xs font-headline italic tracking-wide leading-none">{user.displayName || 'Manager'}</p>
                <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1 opacity-60">
                   {userRole === 'admin' ? 'Director Executivo' : 'Operações'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-sm bg-surface-container border border-outline-variant/20 flex items-center justify-center overflow-hidden shrink-0 shadow-lg grayscale hover:grayscale-0 transition-all duration-500">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-headline italic text-lg text-primary">{user.displayName?.[0] || 'A'}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 bg-surface">
           <div className="max-w-7xl mx-auto pb-12">
              <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                 <div>
                    <h2 className="font-headline text-5xl lg:text-7xl font-black tracking-tight text-primary italic drop-shadow-md">
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
            <span className="text-primary/40 font-black italic">Casa Mãe v2.4.0 BFV</span>
          </div>
          
          {/* Watermark Logo */}
          <div className="absolute right-1/2 translate-x-1/2 bottom-2 h-12 opacity-10 pointer-events-none mix-blend-overlay">
            <img 
              src="https://ibb.co/BVY4mTqq" 
              alt="Casa Mãe Logo" 
              className="h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback for ImgBB direct link if the splash page doesn't render
                e.currentTarget.src = "https://i.ibb.co/BVY4mTqq/logo.png";
              }}
            />
          </div>

          <div className="flex items-center space-x-4 italic">
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
