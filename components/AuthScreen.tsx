
import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Phone, ArrowRight, X, Mail, Lock } from 'lucide-react';
import { signInWithGoogle, auth } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const AuthScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'selection' | 'phone' | 'email'>('selection');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
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
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError("AUTENTICAÇÃO TERMINADA PELO UTILIZADOR.");
      } else if (err.message === 'POPUP_BLOCKED' || err.code === 'auth/popup-blocked') {
        setError("POPUP BLOQUEADO. Por favor, autorize popups ou abra o App em uma nova aba para entrar.");
      } else {
        setError("ERRO NO ACESSO GOOGLE. Tente novamente ou use outra aba.");
      }
      setIsLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+244${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("O MÉTODO DE ACESSO POR TELEFONE NÃO ESTÁ ACTIVADO NO CONSOLA DO FIREBASE.");
      } else {
        setError("ERRO AO ENVIAR SMS. VERIFIQUE O NÚMERO.");
      }
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(verificationCode);
      }
    } catch (err: any) {
      setError("CÓDIGO DE VERIFICAÇÃO INVÁLIDO.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Transform phone-only input to internal email format for Firebase Email/Password provider
    let finalId = email.trim();
    if (!finalId.includes('@')) {
      // It's likely a phone number
      finalId = `${finalId.replace(/\s/g, '').replace('+', '')}@casamae.ao`;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, finalId, password);
      } else {
        await signInWithEmailAndPassword(auth, finalId, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("O MÉTODO DE ACESSO (EMAIL OU TELEFONE) AINDA NÃO ESTÁ ACTIVADO NO CONSOLA DO FIREBASE. POR FAVOR, CONTACTE O ADMINISTRADOR.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("EMAIL OU PALAVRA-PASSE INCORRECTOS.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("ESTE EMAIL JÁ ESTÁ REGISTADO.");
      } else if (err.code === 'auth/weak-password') {
        setError("A PALAVRA-PASSE DEVE TER PELO MENOS 6 CARACTERES.");
      } else {
        setError("ERRO NA AUTENTICAÇÃO. TENTE NOVAMENTE.");
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
        className="w-full max-w-md space-y-8 relative z-10 bg-surface-container/90 backdrop-blur-xl border border-outline-variant/20 p-8 md:p-12 shadow-3xl"
      >
        <div className="space-y-6 flex flex-col items-center text-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 bg-surface-bright/10 border border-outline-variant/10 p-3 flex items-center justify-center overflow-hidden shadow-2xl rounded-sm"
          >
            <img src={logoUrl} alt="A Casa Mãe" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="font-headline text-5xl md:text-6xl text-primary font-black drop-shadow-2xl">A CASA MÃE</h1>
            <p className="font-body text-[10px] font-black text-secondary uppercase tracking-[0.6em] text-glow">BFV-BEIB FRANCISCO VIANA</p>
          </div>
        </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="font-headline text-2xl text-on-surface font-bold uppercase tracking-tight">Portal de Acesso</h2>
              <div className="w-12 h-0.5 bg-primary mx-auto"></div>
            </div>

          <AnimatePresence mode="wait">
            {authMode === 'selection' ? (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <button 
                  onClick={() => {
                    setAuthMode('email');
                    setIsRegistering(true);
                  }}
                  className="w-full group relative flex items-center justify-between h-20 bg-primary text-on-primary px-8 hover:brightness-110 transition-all duration-300 shadow-xl shadow-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <ShieldCheck size={20} className="" />
                    <div className="text-left">
                      <span className="block font-headline font-black uppercase text-[11px] tracking-widest italic">Criar Nova Conta</span>
                      <span className="block font-body text-[8px] uppercase tracking-widest opacity-60">Registar Email ou Telefone</span>
                    </div>
                  </div>
                  <ArrowRight size={18} className="opacity-40" />
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-outline-variant/20"></div>
                  <span className="font-body text-[8px] uppercase tracking-[0.4em] text-on-surface/40 italic">Ou Entrar com</span>
                  <div className="h-px flex-1 bg-outline-variant/20"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="group relative flex flex-col items-center justify-center gap-2 h-20 bg-surface-bright/40 border border-outline-variant/20 hover:bg-primary/20 transition-all duration-300 disabled:opacity-50"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 invert" referrerPolicy="no-referrer" />
                    <span className="font-body font-black uppercase text-[7px] tracking-[0.2em] text-on-surface">Google</span>
                  </button>

                  <button 
                    onClick={() => {
                      setAuthMode('email');
                      setIsRegistering(false);
                    }}
                    className="group relative flex flex-col items-center justify-center gap-2 h-20 bg-surface-bright/40 border border-outline-variant/20 hover:bg-primary/20 transition-all duration-300"
                  >
                    <Lock size={16} className="text-on-surface/70 group-hover:text-primary transition-colors" />
                    <span className="font-body font-black uppercase text-[7px] tracking-[0.2em] text-on-surface">Login</span>
                  </button>
                </div>
              </motion.div>
            ) : authMode === 'phone' ? (
              <motion.div 
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {!confirmationResult ? (
                  <form onSubmit={handlePhoneAuth} className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Número (Angola +244)</label>
                        <input 
                          type="tel" 
                          placeholder="EX: 923 000 000"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-surface-bright border-2 border-outline-variant/60 h-16 px-6 font-mono text-base focus:border-primary outline-none transition-colors text-white placeholder:text-white/30 shadow-inner"
                          required
                        />
                      </div>
                      <div className="flex gap-4">
                         <button 
                          type="button"
                          onClick={() => setAuthMode('selection')}
                          className="flex-1 h-14 bg-surface-bright border border-outline-variant/20 text-on-surface text-xs font-black uppercase tracking-widest hover:bg-surface transition-colors"
                        >
                          Voltar
                        </button>
                        <button 
                          type="submit"
                          disabled={isLoading}
                          className="flex-[2] h-14 bg-primary text-on-primary text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                          {isLoading ? "Enviando..." : "Enviar Código"}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={verifyCode} className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Código de verificação</label>
                        <input 
                          type="text" 
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="w-full bg-surface-bright border-2 border-outline-variant/60 h-16 px-6 font-mono text-center tracking-[1em] text-2xl focus:border-primary outline-none transition-colors text-white placeholder:text-white/30 shadow-inner"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => setConfirmationResult(null)}
                          className="flex-1 h-14 bg-surface-bright border border-outline-variant/20 text-on-surface text-xs font-black uppercase tracking-widest hover:bg-surface transition-colors"
                        >
                          Anular
                        </button>
                        <button 
                          type="submit"
                          disabled={isLoading}
                          className="flex-[2] h-14 bg-primary text-on-primary text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                          {isLoading ? "Verificando..." : "Confirmar Acesso"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <form onSubmit={handleEmailAuth} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface ml-1 italic">{isRegistering ? "Defina ID (Email ou Telemóvel)" : "Identificação (Email ou Telemóvel)"}</label>
                       <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/60" size={16} />
                         <input 
                           type="text" 
                           placeholder={isRegistering ? "Ex: 923... ou email@ex.com" : "Digite seu ID"}
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-surface-bright border border-outline-variant/60 h-16 pl-12 pr-6 text-sm focus:border-primary outline-none transition-colors text-white placeholder:text-white/30"
                           required
                         />
                       </div>
                     </div>
 
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface ml-1 italic">{isRegistering ? "Crie uma Palavra-Passe" : "Sua Palavra-Passe"}</label>
                       <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/60" size={16} />
                         <input 
                           type="password" 
                           placeholder="••••••••"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-surface-bright border border-outline-variant/60 h-16 pl-12 pr-6 text-sm focus:border-primary outline-none transition-colors text-white placeholder:text-white/30"
                           required
                         />
                       </div>
                     </div>
                    
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 bg-primary text-on-primary text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all duration-300 shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                      {isLoading ? "Processando..." : (isRegistering ? "Criar Minha Conta" : "Entrar no Sistema")}
                    </button>

                    <div className="flex flex-col gap-4 mt-6">
                       <button 
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                      >
                        {isRegistering ? "Já tenho conta? Entrar" : "Não tenho conta? Registar agora"}
                      </button>

                      <button 
                        type="button"
                        onClick={() => setAuthMode('selection')}
                        className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-on-surface transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={12} /> Cancelar Acesso
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-error/10 border border-error/20 flex items-center gap-4"
            >
              <AlertCircle className="text-error shrink-0" size={16} />
              <p className="font-body text-[9px] text-error font-black uppercase tracking-widest leading-relaxed italic">
                {error}
              </p>
            </motion.div>
          )}

          <p className="font-body text-[8px] text-on-surface-variant/60 leading-loose uppercase tracking-[0.2em] text-center pt-4">
            Sistema Seguro BFV. Todos os acessos são monitorizados.<br/>
            Angola • Cabinda
          </p>
        </div>
      </motion.div>
      
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col gap-2 opacity-5 hidden sm:flex">
        <span className="font-body text-[40px] md:text-[60px] font-black italic transform -rotate-90 origin-bottom-left leading-none uppercase select-none pointer-events-none">A Casa Mãe</span>
      </div>
    </div>
  );
};

export default AuthScreen;
