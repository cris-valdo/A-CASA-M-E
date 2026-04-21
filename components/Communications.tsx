import React, { useState } from 'react';
import { 
  Send, 
  Video, 
  Users, 
  MessageSquare, 
  Phone, 
  Plus, 
  Search,
  MoreVertical,
  Mic,
  MicOff,
  ScreenShare,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const Communications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'meetings'>('chat');
  const [isMeetingActive, setIsMeetingActive] = useState(false);

  const contacts = [
    { id: '1', name: 'Administração Casa Mãe', status: 'online', avatar: 'AD' },
    { id: '2', name: 'Protocolo Recepção', status: 'away', avatar: 'PR' },
    { id: '3', name: 'Operações Gastro', status: 'online', avatar: 'OG' },
    { id: '4', name: 'Auditoria Concierge', status: 'offline', avatar: 'AC' },
  ];

  const meetings = [
    { title: 'Alinhamento Operacional Semanal', time: 'Hoje, 15:30', host: 'Direção' },
    { title: 'Reconciliação de Inventário', time: 'Amanhã, 10:00', host: 'Suprimentos' },
  ];

  return (
    <div className="h-[calc(100vh-250px)] flex bg-surface-container border border-outline-variant/10 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none transition-all duration-700"></div>

      {/* Sidebar - Dispatch Logic */}
      <div className="w-80 border-r border-outline-variant/10 flex flex-col bg-surface-bright/5 relative z-10 backdrop-blur-sm">
        <div className="p-10">
          <div className="flex bg-surface-bright/5 p-1 border border-outline-variant/10 mb-10">
             <button 
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-3 text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 italic underline-offset-8 decoration-primary decoration-2",
                  activeTab === 'chat' ? "text-on-surface underline" : "text-on-surface-variant/20 hover:text-on-surface"
                )}
             >
                <MessageSquare size={14} /> Comunicar
             </button>
             <button 
                onClick={() => setActiveTab('meetings')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-3 text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 italic underline-offset-8 decoration-primary decoration-2",
                  activeTab === 'meetings' ? "text-on-surface underline" : "text-on-surface-variant/20 hover:text-on-surface"
                )}
             >
                <Video size={14} /> Reuniões
             </button>
          </div>
          
          <div className="relative group">
             <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" />
             <input 
                type="text" 
                placeholder="Registo de Auditoria..." 
                className="w-full pl-12 pr-4 py-4 bg-transparent border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-all text-on-surface placeholder:text-on-surface-variant/10 italic"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar pb-12">
          {activeTab === 'chat' ? (
            contacts.map(c => (
              <button key={c.id} className="w-full flex items-center gap-6 p-4 hover:bg-surface-bright/5 transition-all group text-left border-l-2 border-transparent hover:border-primary">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-surface-bright border border-outline-variant/10 flex items-center justify-center text-on-surface font-headline italic text-lg shadow-xl grayscale group-hover:grayscale-0 transition-all">
                    <span>{c.avatar}</span>
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-3 h-3 border-2 border-surface-container rounded-full",
                    c.status === 'online' ? "bg-emerald-500" : c.status === 'away' ? "bg-amber-400" : "bg-on-surface-variant/10"
                  )}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-headline italic text-lg text-on-surface truncate tracking-wide group-hover:text-primary transition-colors">{c.name}</div>
                  <p className="font-body text-[8px] text-on-surface-variant/20 font-bold truncate mt-1 uppercase tracking-widest italic">{c.status}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 space-y-10">
              <button 
                onClick={() => setIsMeetingActive(true)}
                className="w-full flex items-center justify-center gap-3 py-5 bg-on-surface text-surface font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary shadow-2xl transition-all italic underline decoration-surface/20 underline-offset-8"
              >
                <Plus size={18} /> Iniciar Sessão
              </button>
              
              <div className="space-y-8">
                 <h4 className="font-body text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-[0.5em] px-2 italic">Ciclos Agendados</h4>
                 {meetings.map((m, i) => (
                    <div key={i} className="p-8 bg-surface-bright/5 border border-outline-variant/10 shadow-xl group hover:border-primary/20 transition-all cursor-pointer">
                       <div className="font-headline italic text-xl text-on-surface mb-3 tracking-wide">{m.title}</div>
                       <div className="flex items-center gap-4 text-[8px] text-on-surface-variant/40 font-bold uppercase tracking-widest italic">
                          <Users size={12} className="text-primary/40" /> Host: {m.host}
                       </div>
                       <div className="mt-8 flex items-center justify-between border-t border-outline-variant/5 pt-6">
                          <span className="font-body text-[9px] font-bold text-primary uppercase tracking-widest italic">{m.time}</span>
                          <button 
                             onClick={() => setIsMeetingActive(true)}
                             className="p-3 text-on-surface-variant/20 hover:text-primary transition-all underline underline-offset-4 decoration-transparent hover:decoration-primary"
                          >
                             <Video size={16} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Dispatch Area */}
      <div className="flex-1 flex flex-col bg-surface relative z-10 group/main">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,107,0,0.02)_0%,transparent_50%)] pointer-events-none"></div>
        {activeTab === 'chat' ? (
          <>
            <div className="h-28 border-b border-outline-variant/10 flex items-center justify-between px-12 bg-surface/80 backdrop-blur-3xl sticky top-0 z-10">
              <div className="flex items-center gap-8">
                 <div className="w-16 h-16 bg-surface-bright border border-outline-variant/10 flex items-center justify-center text-primary font-headline italic text-2xl shadow-xl grayscale">
                    AD
                 </div>
                 <div>
                    <h3 className="font-headline italic text-2xl text-on-surface tracking-wide leading-none">Direção Casa Mãe</h3>
                    <div className="flex items-center gap-3 mt-3">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                       <p className="font-body text-[8px] text-on-surface-variant/40 font-bold uppercase tracking-[0.4em] italic leading-none">Activo Global</p>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <button className="p-3 text-on-surface-variant/20 hover:text-primary transition-all"><Phone size={20} /></button>
                 <button onClick={() => setIsMeetingActive(true)} className="p-3 text-on-surface-variant/20 hover:text-primary transition-all"><Video size={20} /></button>
                 <button className="p-3 text-on-surface-variant/20 hover:text-primary transition-all"><MoreVertical size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-16 space-y-16 custom-scrollbar">
               <div className="flex justify-center mb-8">
                  <span className="font-body text-[8px] font-bold text-on-surface-variant/20 uppercase tracking-[0.6em] italic px-8 py-2 border border-outline-variant/10 scale-90">Ciclo de Auditoria Temporal • Hoje</span>
               </div>
               
               <div className="flex gap-8 max-w-[80%] group/msg animate-in fade-in slide-in-from-left-4 duration-700">
                  <div className="shrink-0 w-10 h-10 bg-surface-bright border border-outline-variant/10 flex items-center justify-center font-headline italic text-primary shadow-lg self-end grayscale">AD</div>
                  <div className="relative">
                    <div className="p-8 bg-surface-container text-on-surface font-headline italic text-xl shadow-2xl border border-outline-variant/5 leading-relaxed tracking-wide">
                       "Refined morning reports processed. Residency audit indicates 85% occupancy for the current cycle. Commendable discipline by the concierge team."
                    </div>
                    <span className="absolute -bottom-8 left-2 font-body text-[8px] font-bold text-on-surface-variant/20 uppercase tracking-widest italic">10:45 AM Audit</span>
                  </div>
               </div>

               <div className="flex gap-8 max-w-[80%] ml-auto flex-row-reverse group/msg animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="shrink-0 w-10 h-10 bg-on-surface text-surface flex items-center justify-center font-headline italic text-xl shadow-lg self-end">ME</div>
                  <div className="relative">
                    <div className="p-8 bg-on-surface text-surface font-headline italic text-xl shadow-2xl border border-on-surface-variant/10 leading-relaxed tracking-wide">
                       "Acknowledged. Total readiness for the 14:00 group protocol. All suites have been independently audited and verified."
                    </div>
                    <span className="absolute -bottom-8 right-2 font-body text-[8px] font-bold text-on-surface-variant/20 uppercase tracking-widest italic text-right">Confirmed • 10:47 AM</span>
                  </div>
               </div>
            </div>

            <div className="p-12 bg-surface/80 backdrop-blur-3xl border-t border-outline-variant/10 relative z-10">
               <div className="max-w-4xl mx-auto flex items-center gap-8 bg-surface-container p-4 border border-outline-variant/10 shadow-2xl focus-within:border-primary/40 transition-all duration-500">
                  <button className="p-4 text-on-surface-variant/20 hover:text-primary transition-all"><Plus size={22} /></button>
                  <input 
                    type="text" 
                    placeholder="Comunicar com Equipa Casa Mãe..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 font-headline italic text-xl py-4 text-on-surface placeholder:text-on-surface-variant/10"
                  />
                  <button className="p-4 bg-on-surface text-surface hover:bg-primary transition-all duration-500 group">
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center relative overflow-hidden group/wait">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.03)_0%,transparent_70%)] pointer-events-none group-hover/wait:opacity-100 transition-opacity"></div>
             <div className="w-40 h-40 bg-surface-container border border-outline-variant/10 flex items-center justify-center text-primary mb-12 shadow-2xl group-hover/wait:scale-110 transition-transform duration-1000 grayscale group-hover/wait:grayscale-0">
                <Video size={64} className="opacity-20 group-hover/wait:opacity-100 transition-opacity" />
             </div>
             <h2 className="font-headline italic text-4xl text-on-surface tracking-wide mb-8">Nó de Sessão Casa Mãe</h2>
             <p className="font-body text-[10px] font-bold text-on-surface-variant/40 max-w-xs uppercase tracking-[0.5em] mb-16 italic leading-loose px-4">
                Inicie um diálogo de alta resolução com a direção operacional para reconciliação estratégica em tempo real.
             </p>
             <button 
                onClick={() => setIsMeetingActive(true)}
                className="px-16 py-6 bg-on-surface text-surface font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-primary transition-all transform hover:-translate-y-2 italic underline decoration-surface/20 underline-offset-8"
              >
                Assembleia Consultiva
              </button>
          </div>
        )}
      </div>

      {/* Video Call Session */}
      {isMeetingActive && (
        <div className="fixed inset-0 z-[100] bg-surface flex flex-col animate-in fade-in duration-700">
           {/* Participants High-Fidelity Grid */}
           <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-12 p-16">
              <div className="bg-surface-container relative overflow-hidden flex items-center justify-center border border-outline-variant/10 group">
                 <div className="text-on-surface text-center opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
                    <div className="w-32 h-32 bg-primary/10 border border-primary/20 flex items-center justify-center font-headline italic text-4xl mx-auto mb-8 grayscale group-hover:grayscale-0 transition-all">AD</div>
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.5em] italic">Direction</p>
                 </div>
                 <div className="absolute top-8 right-8 p-3 bg-surface text-on-surface-variant/20 border border-outline-variant/10">
                    <MicOff size={16} />
                 </div>
              </div>

              <div className="bg-on-surface relative overflow-hidden flex items-center justify-center border-4 border-primary/40 shadow-2xl shadow-primary/20">
                 <video 
                    className="w-full h-full object-cover grayscale opacity-80" 
                    autoPlay 
                    muted 
                    playsInline 
                    poster="https://picsum.photos/seed/you/800/600"
                 />
                 <div className="absolute top-8 right-8 p-3 bg-primary text-surface font-body font-black text-[9px] uppercase tracking-[0.4em] italic shadow-2xl">Vocal Active</div>
                 <div className="absolute bottom-8 left-8 p-3 bg-surface/20 backdrop-blur-md text-surface font-body font-black text-[9px] uppercase tracking-[0.4em] italic">Principal Auditor</div>
              </div>

              <div className="bg-surface-container relative overflow-hidden flex items-center justify-center border border-outline-variant/10 group">
                 <div className="text-on-surface text-center opacity-20">
                    <div className="w-24 h-24 bg-surface-bright border border-outline-variant/10 flex items-center justify-center font-headline italic text-2xl mx-auto mb-6 grayscale">GO</div>
                    <p className="font-body text-[9px] font-bold uppercase tracking-[0.4em] italic leading-none">Gastro Operations</p>
                 </div>
              </div>
           </div>

           {/* Precision Controls */}
           <div className="h-32 bg-surface-container border-t border-outline-variant/10 flex items-center justify-center gap-12 px-16">
              <button className="p-5 text-on-surface-variant/40 hover:text-primary transition-all border border-outline-variant/5 hover:border-primary/20 bg-surface shadow-lg"><Mic size={24} /></button>
              <button className="p-5 text-on-surface-variant/40 hover:text-primary transition-all border border-outline-variant/5 hover:border-primary/20 bg-surface shadow-lg"><Video size={24} /></button>
              <button className="p-5 text-on-surface-variant/40 hover:text-primary transition-all border border-outline-variant/5 hover:border-primary/20 bg-surface shadow-lg"><ScreenShare size={24} /></button>
              <button className="p-5 text-on-surface-variant/40 hover:text-secondary transition-all border border-outline-variant/5 hover:border-secondary/20 bg-surface shadow-lg rotate-[135deg]"><Phone size={24} /></button>
              <button 
                onClick={() => setIsMeetingActive(false)}
                className="px-12 py-5 bg-primary text-surface font-black uppercase tracking-[0.3em] text-[10px] hover:bg-on-surface shadow-2xl transition-all italic underline decoration-surface/20 underline-offset-8"
              >
                Terminate Cycle
              </button>
           </div>

           {/* Temporal Session Info */}
           <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-surface p-4 border border-outline-variant/10 shadow-3xl">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(255,107,0,1)]"></div>
              <span className="font-body text-[10px] font-bold border-l border-outline-variant/10 pl-6 text-on-surface uppercase tracking-[0.4em] italic">Live Session Audit • 14:32:01</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default Communications;
