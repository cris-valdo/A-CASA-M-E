
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
      const cleanId = finalId.replace(/\s/g, '').replace('+', '');
      finalId = `${cleanId}@bfv.ao`;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, finalId, password);
      } else {
        await signInWithEmailAndPassword(auth, finalId, password);
      }
    } catch (err: any) {
      console.error("DIAGNOSTICO BFV:", err.code, err.message);
      if (err.code === 'auth/operation-not-allowed') {
        setError("ADMINISTRADOR: ACTIVAR 'EMAIL/PASSWORD' NA CONSOLA DO FIREBASE.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("ACESSO NEGADO: ID OU PALAVRA-PASSE INCORRECTOS.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("ALERTA: ESTE ID JÁ EXISTE. FAÇA 'LOGIN' EM VEZ DE REGISTAR.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("DOMÍNIO NÃO AUTORIZADO: ADICIONE O URL DO VERCEL NAS CONFIGURAÇÕES DO FIREBASE.");
      } else if (err.code === 'auth/weak-password') {
        setError("SEGURANÇA: PALAVRA-PASSE MUITO CURTA (MÍNIMO 6).");
      } else {
        setError(`ERRO DO SISTEMA (${err.code}): ${err.message.toUpperCase()}`);
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
        className="w-full max-w-md space-y-8 relative z-10 bg-black border-4 border-primary p-8 md:p-12 shadow-[0_0_60px_rgba(255,107,0,0.3)]"
      >
        <div className="space-y-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white border border-outline-variant/10 p-3 flex items-center justify-center overflow-hidden shadow-2xl rounded-sm">
            <img src={logoUrl} alt="A Casa Mãe" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-headline text-5xl md:text-6xl text-primary font-black">A CASA MÃE</h1>
            <p className="font-body text-xs font-black text-secondary uppercase tracking-[0.4em]">BFV - FRANCISCO VIANA</p>
          </div>
        </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center border-b border-primary/20 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold uppercase tracking-tight">Portal de Acesso</h2>
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
                  className="w-full flex flex-col items-center justify-center h-24 bg-primary text-white hover:bg-primary-hover transition-all duration-300 shadow-xl border-2 border-primary"
                >
                  <div className="text-center">
                    <span className="block font-headline font-black uppercase text-xl italic leading-none">1. CRIAR NOVA CONTA</span>
                    <span className="block font-body text-[10px] uppercase tracking-widest font-bold mt-2">Clique aqui para se registar</span>
                  </div>
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-primary/30"></div>
                  <span className="font-body text-[10px] uppercase font-black text-white italic tracking-[0.2em]">OU ENTRAR</span>
                  <div className="h-px flex-1 bg-primary/30"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setAuthMode('email');
                      setIsRegistering(false);
                    }}
                    className="flex flex-col items-center justify-center gap-2 h-20 bg-white border-2 border-white text-black hover:bg-gray-200 transition-all duration-300"
                  >
                    <Lock size={20} />
                    <span className="font-body font-black uppercase text-[10px] tracking-widest">LOGIN</span>
                  </button>

                  <button 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center gap-2 h-20 bg-surface-bright border-2 border-primary text-white hover:bg-primary/20 transition-all duration-300 disabled:opacity-50"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 invert" referrerPolicy="no-referrer" />
                    <span className="font-body font-black uppercase text-[10px] tracking-widest text-on-surface group-hover:text-primary transition-colors">GOOGLE</span>
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
                        <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Número de Telefone</label>
                        <input 
                          type="tel" 
                          placeholder="EX: 923 000 000"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-surface-bright border-2 border-primary/50 h-16 px-6 font-bold text-lg focus:border-primary outline-none transition-colors text-white placeholder:text-white/20 shadow-inner"
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
                        <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Código SMS Recebido</label>
                        <input 
                          type="text" 
                          placeholder="000 000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="w-full bg-surface-bright border-2 border-primary/50 h-16 px-6 font-mono text-center tracking-[0.5em] text-2xl font-bold focus:border-primary outline-none transition-colors text-white placeholder:text-white/20 shadow-inner"
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
                <div className="text-center space-y-1 mb-6">
                  <h3 className="font-headline text-xl text-primary font-bold uppercase italic underline decoration-primary/30 underline-offset-8">
                    {isRegistering ? "Passo 2: Criar Acesso" : "Identificação Requerida"}
                  </h3>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white ml-1">
                         {isRegistering ? "Escolha um ID (Email ou Telefone)" : "Seu ID (Email ou Telefone)"}
                       </label>
                       <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                         <input 
                           type="text" 
                           placeholder={isRegistering ? "923 000 000 ou email@provedor.com" : "Introduza o seu ID"}
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-surface-bright border-2 border-primary/50 h-16 pl-14 pr-6 text-base font-bold outline-none focus:border-primary transition-all text-white placeholder:text-white/40"
                           required
                         />
                       </div>
                     </div>
 
                     <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white ml-1">
                         {isRegistering ? "Defina uma Palavra-Passe" : "Sua Palavra-Passe"}
                       </label>
                       <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                         <input 
                           type="password" 
                           placeholder="••••••••"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-surface-bright border-2 border-primary/50 h-16 pl-14 pr-6 text-base font-bold outline-none focus:border-primary transition-all text-white placeholder:text-white/40"
                           required
                         />
                       </div>
                     </div>
                    
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-16 bg-primary text-white text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-2xl shadow-primary/30 disabled:opacity-50 border-2 border-primary"
                    >
                      {isLoading ? "A PROCESSAR..." : (isRegistering ? "FINALIZAR REGISTO" : "ENTRAR AGORA")}
                    </button>

                    <div className="flex flex-col gap-4 mt-8 pt-6 border-t-2 border-primary/20">
                      <button 
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="bg-white text-black py-4 px-6 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-gray-100 transition-colors"
                      >
                        {isRegistering ? "JÁ TENHO CONTA? ENTRAR" : "NÃO TENHO CONTA? REGISTAR"}
                      </button>

                      <button 
                        type="button"
                        onClick={() => setAuthMode('selection')}
                        className="bg-black border-2 border-primary/50 text-white py-3 px-6 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-primary/20 transition-colors"
                      >
                        VOLTAR AO INÍCIO
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-600 border-2 border-white text-white shadow-[0_0_30px_rgba(220,38,38,0.5)]"
            >
              <div className="flex items-start gap-4">
                <AlertCircle className="shrink-0 animate-pulse" size={24} />
                <div className="space-y-1">
                  <p className="font-headline font-black uppercase text-xs tracking-widest italic">Erro de Autenticação:</p>
                  <p className="font-body text-[11px] font-bold leading-tight uppercase">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <p className="font-body text-[10px] text-white/80 leading-loose uppercase tracking-[0.2em] text-center pt-8 border-t border-primary/20">
            SISTEMA SEGURO BFV • CABINDA, ANGOLA
          </p>
          <p className="text-[8px] text-primary/50 text-center font-bold mt-2 uppercase tracking-widest">
            Versão de UI: 22.04.2026-V3 (Contraste Máximo)
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
