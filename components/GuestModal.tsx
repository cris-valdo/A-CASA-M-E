
import React, { useState } from 'react';
import { X, User, Mail, Phone, CreditCard } from 'lucide-react';
import { addGuest } from '../services/firestoreService';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuestModal: React.FC<GuestModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nif: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addGuest(formData);
      onClose();
      setFormData({ name: '', email: '', phone: '', nif: '' });
    } catch (error) {
      console.error("Registry failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="bg-surface-container w-full max-w-lg shadow-[0_40px_120px_rgba(0,0,0,0.4)] border border-outline-variant/10 relative overflow-hidden animate-in zoom-in-95 duration-700">
        {/* Protocol Accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
        
        <div className="flex justify-between items-center p-10 lg:px-12 lg:py-10 border-b border-outline-variant/10 relative z-10">
          <div>
            <h3 className="font-headline italic text-3xl text-on-surface tracking-wide">Protocol Entry</h3>
            <p className="font-body text-[8px] text-on-surface-variant/40 font-bold uppercase tracking-[0.4em] mt-3 italic">Independent Residency Audit</p>
          </div>
          <button onClick={onClose} className="p-3 text-on-surface-variant/20 hover:text-primary transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 lg:p-12 space-y-12 relative z-10">
          <div className="space-y-4">
            <label className="font-body text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] italic block">Full Descriptor / Entity</label>
            <div className="relative border-b border-outline-variant/10 group">
              <User size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" />
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-8 pr-0 py-4 bg-transparent font-headline italic text-xl text-on-surface focus:outline-none placeholder:text-on-surface-variant/10 transition-all" 
                placeholder="Individual Name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="font-body text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] italic block">Digital Communication</label>
            <div className="relative border-b border-outline-variant/10 group">
              <Mail size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-8 pr-0 py-4 bg-transparent font-headline italic text-xl text-on-surface focus:outline-none placeholder:text-on-surface-variant/10 transition-all" 
                placeholder="identity@domain.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="font-body text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] italic block">Channel</label>
              <div className="relative border-b border-outline-variant/10 group">
                <Phone size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-8 pr-0 py-4 bg-transparent font-body font-bold text-sm text-on-surface focus:outline-none placeholder:text-on-surface-variant/10 transition-all tracking-widest" 
                  placeholder="+244 000"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="font-body text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] italic block">Fiscal ID</label>
              <div className="relative border-b border-outline-variant/10 group">
                <CreditCard size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" />
                <input 
                  required
                  type="text" 
                  value={formData.nif}
                  onChange={(e) => setFormData({...formData, nif: e.target.value})}
                  className="w-full pl-8 pr-0 py-4 bg-transparent font-body font-bold text-sm text-on-surface focus:outline-none placeholder:text-on-surface-variant/10 transition-all tracking-widest" 
                  placeholder="Identification"
                />
              </div>
            </div>
          </div>

          <div className="pt-10 flex flex-col sm:flex-row gap-8">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-5 font-body text-[9px] font-bold text-on-surface-variant/20 uppercase tracking-[0.3em] hover:text-on-surface transition-all italic underline decoration-transparent underline-offset-8"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-5 bg-on-surface text-surface font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary transition-all italic underline decoration-surface/20 underline-offset-8 disabled:opacity-30"
            >
              {loading ? 'Synthesizing...' : 'Commit Protocol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestModal;
