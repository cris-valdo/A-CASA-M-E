
import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Phone, ArrowRight, X, Mail, Lock } from 'lucide-react';
import { supabase, signInWithGoogleSupabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const AuthScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = [
    "https://i.ibb.co/7xDTxMQs/img1.png",
    "https://i.ibb.co/zVHPNKTp/img2.png",
    "https://i.ibb.co/TBWTGLd9/img3.png",
    "https://i.ibb.co/zWs47JKX/img4.png",
    "https://i.ibb.co/TMrQRmDP/img5.png",
    "https://i.ibb.co/gMkwHHYH/img6.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogleSupabase();
    } catch (err: any) {
      console.error("Erro Google Supabase:", err);
      setError("ERRO NO ACESSO GOOGLE (SUPABASE). Tente novamente.");
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // MODO DE ACESSO RÁPIDO BFV (ADMIN/ADMIN)
    if (email.trim().toLowerCase() === 'admin' && password === 'admin') {
      const bypassUser = {
        id: 'bypass-admin-id',
        email: 'valter1990vado@gmail.com',
        user_metadata: { display_name: 'Director Geral', avatar_url: 'https://i.ibb.co/sdggPPwX/logo.png' }
      };
      localStorage.setItem('bfv_bypass_user', JSON.stringify(bypassUser));
      // Force reload to pick up bypass
      window.location.reload();
      return;
    }

    let finalId = email.trim();
    // If it's just a phone-like string, append a domain if using email provider
    if (!finalId.includes('@')) {
      const cleanId = finalId.replace(/\s/g, '').replace('+', '');
      finalId = `${cleanId}@bfv.ao`;
    }

    try {
      if (isRegistering) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: finalId,
          password: password,
          options: {
            data: {
              display_name: displayName,
            }
          }
        });
        if (signUpError) throw signUpError;
        
        // If registration succeeds but email confirm is on, tell user
        if (data.user && data.session === null) {
          setError("REGISTO INICIADO. Verifique o seu email para confirmar o acesso (ou peça ao admin para libertar).");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: finalId,
          password: password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      console.error("DIAGNOSTICO SUPABASE:", err.name, err.message);
      if (err.message.includes('Invalid login credentials')) {
        setError("ACESSO NEGADO: PASSWORD OU ID INCORRECTOS.");
      } else if (err.message.includes('User already registered')) {
        setError("ESTE ID JÁ EXISTE. TENTE FAZER LOGIN.");
      } else {
        setError(`ERRO SUPABASE: ${err.message.toUpperCase()}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logoUrl = "https://i.ibb.co/sdggPPwX/logo.png";

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Background Gallery & Atmospheric Gradients */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImgIndex}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 0.2, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center grayscale"
            style={{ backgroundImage: `url(${images[currentImgIndex]})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent opacity-50"></div>
      </div>

      <div id="recaptcha-container"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 glass-card rounded-3xl overflow-hidden flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]"
      >
        {/* Scanner line effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-[loading_3s_infinite] origin-left z-20"></div>

        {/* Header */}
        <div className="p-10 flex flex-col items-center text-center border-b border-white/5 bg-white/[0.02]">
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-20 h-20 bg-white p-4 mb-6 flex items-center justify-center rounded-2xl shadow-2xl relative"
          >
            <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full"></div>
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain relative z-10" referrerPolicy="no-referrer" />
          </motion.div>
          <h1 className="font-headline text-4xl text-white font-bold tracking-tighter drop-shadow-lg uppercase">
            A CASA <span className="text-primary italic">MÃE</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
             <div className="h-px w-6 bg-primary/40"></div>
             <p className="font-body text-[9px] font-black text-secondary/60 uppercase tracking-[0.5em] italic">CABINDA OPERATIONS</p>
             <div className="h-px w-6 bg-primary/40"></div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 bg-black/20">
          <button 
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${!isRegistering ? 'text-primary' : 'text-white/20 hover:text-white/40'}`}
          >
            {!isRegistering && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#ff6b00]" />}
            Login
          </button>
          <button 
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${isRegistering ? 'text-primary' : 'text-white/20 hover:text-white/40'}`}
          >
            {isRegistering && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#ff6b00]" />}
            Registo
          </button>
        </div>

        {/* Form Content */}
        <div className="p-10 space-y-8 bg-black/40">
           <div className="space-y-6">
              {isRegistering && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Full Name / Agent ID</label>
                  </div>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="NOME COMPLETO"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 h-16 pl-14 pr-6 text-xs font-bold font-mono tracking-widest outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-white placeholder:text-white/10 rounded-xl"
                      required={isRegistering}
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Access Identifier</label>
                   <span className="text-[8px] font-mono text-primary/40">REQ_ID_001</span>
                </div>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="E-MAIL OU TELEFONE"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 h-16 pl-14 pr-6 text-xs font-bold font-mono tracking-widest outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-white placeholder:text-white/10 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Clearance Key</label>
                   <span className="text-[8px] font-mono text-primary/40">SEC_PWD_AUTH</span>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 h-16 pl-14 pr-6 text-xs font-bold font-mono tracking-widest outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-white placeholder:text-white/10 rounded-xl"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-4"
                >
                  <AlertCircle className="text-red-500 shrink-0" size={16} />
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                    {error}
                  </p>
                </motion.div>
              )}

              <button 
                onClick={handleEmailAuth}
                disabled={isLoading}
                className="w-full h-16 bg-primary text-white text-[11px] font-black uppercase tracking-[0.4em] hover:brightness-110 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(255,107,0,0.3)] disabled:opacity-50 rounded-xl relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                <span className="relative z-10">
                  {isLoading ? "INITIALIZING..." : (isRegistering ? "CREATE ACCOUNT" : "AUTHENTICATE")}
                </span>
              </button>

              <div className="flex items-center gap-6 py-2">
                <div className="h-px flex-1 bg-white/5"></div>
                <span className="font-body text-[8px] uppercase font-black text-white/20 tracking-[0.5em] italic shrink-0">MASTER CLEARANCE</span>
                <div className="h-px flex-1 bg-white/5"></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-16 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 rounded-xl shadow-xl"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale transition-all group-hover:grayscale-0" referrerPolicy="no-referrer" />
                Auth with G-Identity
              </button>
           </div>
            
           <div className="flex flex-col items-center gap-4 pt-10 border-t border-white/5">
              <div className="flex gap-8 opacity-20 hover:opacity-100 transition-opacity">
                 <ShieldCheck size={18} />
                 <Phone size={18} />
                 <ArrowRight size={18} />
              </div>
              <p className="text-[9px] text-white/10 text-center uppercase tracking-[0.3em] leading-loose">
                A CASA MÃE HQ — SYSTEM_v3.0.0_BFV<br/>
                EXCLUSIVE ACCESS MODE
              </p>
           </div>
        </div>
      </motion.div>
      
      {/* Footer Large Watermark */}
      <div className="absolute bottom-10 left-10 opacity-[0.03] select-none pointer-events-none hidden lg:block">
        <h2 className="text-[14vw] font-headline font-black leading-none uppercase italic tracking-tighter">CASA MÃE</h2>
      </div>
    </div>
  );
};

export default AuthScreen;
