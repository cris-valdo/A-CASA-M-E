
import React, { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

const AuthScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError("AUTHENTICATION TERMINATED BY USER.");
      } else {
        setError("SYSTEM ACCESS DENIED. VERIFY PROTOCOLS.");
      }
      setIsLoading(false);
    }
  };

  const logoUrl = "https://ibb.co/sdggPPwX";
  const directLogoUrl = "https://i.ibb.co/sdggPPwX/logo.png";

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-surface-bright/5 skew-x-12 transform origin-top translate-x-32 invisible lg:visible"></div>
      
      <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10">
        <div className="space-y-8 flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-white/5 border border-outline-variant/10 p-3 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(255,107,0,0.3)] hover:scale-105 transition-all duration-1000">
            <img 
              src={logoUrl} 
              alt="Casa Mãe Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = directLogoUrl; }}
            />
          </div>
          <div className="space-y-4">
            <h1 className="font-headline italic text-7xl text-primary tracking-tight leading-none font-black drop-shadow-2xl">A CASA MÃE</h1>
            <p className="font-body text-[12px] font-black text-secondary uppercase tracking-[0.6em] italic text-glow">BFV-BEIB FRANCISCO VIANA</p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6"></div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="font-headline italic text-4xl text-on-surface tracking-tight border-b border-outline-variant/10 pb-6">Identificação</h2>
            <p className="font-body text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] italic">Operações BFV • Protocolo de Segurança</p>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full group relative flex items-center justify-between h-20 bg-on-surface text-surface px-8 hover:bg-primary transition-all duration-500 disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale invert" referrerPolicy="no-referrer" />
                )}
                <span className="font-body font-black uppercase text-[10px] tracking-[0.2em] italic">Access with Google</span>
              </div>
              <ShieldCheck size={18} className="text-surface/20 group-hover:text-surface transition-colors" />
            </button>

            {error && (
              <div className="p-4 bg-primary/5 border border-primary/20 flex items-center gap-4 animate-in slide-in-from-top-2">
                <AlertCircle className="text-primary shrink-0" size={16} />
                <p className="font-body text-[9px] text-primary font-black uppercase tracking-widest leading-relaxed italic">
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-8 pt-8 border-t border-outline-variant/10">
             <p className="font-body text-[10px] text-on-surface-variant/40 leading-loose uppercase tracking-[0.3em] italic text-center">
               O acesso é estritamente limitado ao pessoal autorizado no ecossistema <span className="text-primary font-black">Casa Mãe</span>.
             </p>
          </div>
        </div>

        <footer className="pt-12 flex items-center justify-between opacity-20">
          <p className="font-body text-[7px] font-bold uppercase tracking-[0.3em] italic">Centro de Comando Casa Mãe</p>
          <div className="w-8 h-px bg-on-surface"></div>
        </footer>
      </div>
      
      <div className="absolute bottom-8 left-8 flex flex-col gap-2 opacity-5">
        <span className="font-body text-[60px] font-black italic transform -rotate-90 origin-bottom-left leading-none uppercase select-none pointer-events-none">Casa Mãe</span>
      </div>
    </div>
  );
};

export default AuthScreen;
