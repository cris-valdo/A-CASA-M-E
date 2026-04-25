
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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gallery */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImgIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${images[currentImgIndex]})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/80 to-surface"></div>
      </div>

      <div id="recaptcha-container"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 bg-surface/95 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header - Fixed to top of card */}
        <div className="p-6 md:p-8 flex flex-col items-center text-center border-b border-white/5 bg-white/5">
          <div className="w-16 h-16 bg-white p-2 mb-4 flex items-center justify-center rounded-lg shadow-lg">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <h1 className="font-headline text-3xl text-primary font-black tracking-tight">A CASA MÃE</h1>
          <p className="font-body text-[10px] font-black text-secondary uppercase tracking-[0.3em] mt-1">BFV - FRANCISCO VIANA</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5">
          <button 
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${!isRegistering ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-white/40 hover:text-white'}`}
          >
            Entrar
          </button>
          <button 
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${isRegistering ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-white/40 hover:text-white'}`}
          >
            Registar
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Identificação</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" size={18} />
                  <input 
                    type="text" 
                    placeholder="E-mail ou Telefone"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 h-14 pl-12 pr-6 text-sm font-bold outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-white placeholder:text-white/20 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Palavra-Passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 h-14 pl-12 pr-6 text-sm font-bold outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-white placeholder:text-white/20 rounded-md"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/20 border border-red-500/50 rounded-md"
                >
                  <p className="text-[10px] font-bold text-red-400 uppercase leading-relaxed text-center">
                    {error}
                  </p>
                </motion.div>
              )}

              <button 
                onClick={handleEmailAuth}
                disabled={isLoading}
                className="w-full h-14 bg-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all duration-300 shadow-xl shadow-primary/20 disabled:opacity-50 rounded-md border border-primary/50"
              >
                {isLoading ? "A Processar..." : (isRegistering ? "Confirmar Registo" : "Aceder ao Sistema")}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-white/10"></div>
                <span className="font-body text-[9px] uppercase font-black text-white/30 italic">Ou</span>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-14 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-100 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 rounded-md"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" referrerPolicy="no-referrer" />
                Entrar com Google
              </button>
            </div>
            
            <p className="text-[10px] text-white/30 text-center uppercase tracking-widest pt-4 leading-loose border-t border-white/5">
              Sistema BFV • Cabinda, Angola<br/>
              A Casa Mãe v2.5.1
            </p>
          </div>
        </div>
      </motion.div>
      
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col gap-2 opacity-5 hidden sm:flex">
        <span className="font-body text-[40px] md:text-[60px] font-black italic transform -rotate-90 origin-bottom-left leading-none uppercase select-none pointer-events-none">A Casa Mãe</span>
      </div>
    </div>
  );
};

export default AuthScreen;
