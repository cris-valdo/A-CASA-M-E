
import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Plus, 
  Trash2,
  User,
  CreditCard,
  Home,
  Tag,
  DollarSign,
  Layers,
  Share2
} from 'lucide-react';
import { CompanyInfo, InvoiceItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface BillingFormProps {
  companyInfo: CompanyInfo;
}

const BillingForm: React.FC<BillingFormProps> = ({ companyInfo }) => {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Hospedagem / Consumo Geral', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  
  const [guestName, setGuestName] = useState('');
  const [guestNif, setGuestNif] = useState('');
  
  const [roomName, setRoomName] = useState('Quarto 101');
  const [roomNumber, setRoomNumber] = useState('101');
  const [roomPrice, setRoomPrice] = useState(0);
  const [hostingType, setHostingType] = useState('Diária');

  const addItem = () => {
    setItems([...items, { 
      id: Math.random().toString(36).substr(2, 9), 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      total: 0 
    }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((acc, item) => acc + item.total, 0) + roomPrice;
  const tax = subtotal * 0.14; 
  const total = subtotal + tax;

  const handleShare = async () => {
    const shareData = {
      title: `Factura ${guestName || 'Hóspede'}`,
      text: `Extracto da Casa Mãe BFV. Total: ${formatCurrency(total)}.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const text = encodeURIComponent(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-12 pb-32">
      {/* Editor Side */}
      <div className="flex-1 space-y-12">
        {/* Guest Info */}
        <div className="bg-surface-container-low border border-outline-variant/10 p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
          
          <div className="flex items-center gap-4 mb-10 border-b border-outline-variant/10 pb-6">
            <User size={24} className="text-primary" />
            <h3 className="font-headline text-on-surface text-4xl tracking-wide font-black drop-shadow-md">Identificação</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="font-body text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/40">Nome Completo do Cliente</label>
              <input 
                type="text" 
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Particular ou Empresa"
                className="w-full bg-surface-bright border border-outline-variant/10 px-4 py-3 font-headline text-xl focus:border-primary/40 outline-none transition-all text-on-surface placeholder:text-on-surface-variant/20" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-body text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/40">NIF (Opcional)</label>
              <input 
                type="text" 
                value={guestNif}
                onChange={(e) => setGuestNif(e.target.value)}
                placeholder="Número de Contribuinte"
                className="w-full bg-surface-bright border border-outline-variant/10 px-4 py-3 font-headline text-xl focus:border-primary/40 outline-none transition-all text-on-surface placeholder:text-on-surface-variant/20" 
              />
            </div>
          </div>
        </div>

        {/* Residency Details */}
        <div className="bg-surface-container-low border border-outline-variant/10 p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>

          <div className="flex items-center gap-4 mb-10 border-b border-outline-variant/10 pb-6">
            <Home size={24} className="text-secondary" />
            <h3 className="font-headline text-on-surface text-4xl tracking-wide font-black drop-shadow-md text-secondary">Dados da Hospedagem</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="font-body text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/40">Designação do Quarto</label>
              <input 
                type="text" 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-surface-bright border border-outline-variant/10 px-4 py-3 font-headline text-xl focus:border-primary/40 outline-none transition-all text-on-surface" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-body text-[9px] uppercase tracking-[0.3em] text-primary">Preço Diário (Kz)</label>
              <input 
                type="number" 
                value={roomPrice}
                onChange={(e) => setRoomPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-primary/5 border border-primary/20 px-4 py-3 font-headline text-2xl focus:border-primary outline-none transition-all text-primary text-right" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-body text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/40">Nº de Registo</label>
              <input 
                type="text" 
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-surface-bright border border-outline-variant/10 px-4 py-3 font-body font-bold text-lg focus:border-primary/40 outline-none transition-all text-on-surface text-center" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-body text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/40">Tipo de Alojamento</label>
              <input 
                type="text" 
                value={hostingType}
                onChange={(e) => setHostingType(e.target.value)}
                className="w-full bg-surface-bright border border-outline-variant/10 px-4 py-3 font-headline text-xl focus:border-primary/40 outline-none transition-all text-on-surface" 
              />
            </div>
          </div>
        </div>

        {/* Goods & Services */}
        <div className="bg-surface-container border border-outline-variant/10 p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>

          <div className="flex justify-between items-center mb-10 border-b border-outline-variant/10 pb-6">
            <div className="flex items-center gap-4">
              <CreditCard size={24} className="text-on-surface-variant/40" />
              <h3 className="font-headline italic text-4xl text-on-surface tracking-wide font-black drop-shadow-md text-glow">Consumo e Extras</h3>
            </div>
            <button 
              onClick={addItem}
              className="p-3 text-primary hover:bg-primary/5 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
          
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col lg:flex-row gap-8 pb-8 border-b border-outline-variant/5 last:border-0 group/item">
                <div className="flex-1 space-y-2">
                  <label className="font-body text-[8px] uppercase tracking-[0.3em] text-on-surface-variant/20 italic">Descrição</label>
                  <input 
                    type="text" 
                    placeholder="Defina o serviço..."
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant/10 py-2 font-headline italic text-lg focus:border-primary/40 outline-none transition-all text-on-surface placeholder:text-on-surface-variant/10" 
                  />
                </div>
                <div className="flex gap-8 items-end">
                    <div className="w-16 space-y-2">
                      <label className="font-body text-[8px] uppercase tracking-[0.3em] text-on-surface-variant/20 italic text-center block">Qtd</label>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent border-b border-outline-variant/10 py-2 font-body font-bold text-center outline-none text-on-surface" 
                      />
                    </div>
                    <div className="flex-1 lg:w-40 space-y-2">
                      <label className="font-body text-[8px] uppercase tracking-[0.3em] text-on-surface-variant/20 italic text-right block">Preço Unitário</label>
                      <input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-b border-outline-variant/10 py-2 font-body font-bold text-right outline-none text-primary" 
                      />
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-on-surface-variant/10 hover:text-primary transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 pt-12">
           <button className="flex-1 px-12 py-5 bg-on-surface text-surface font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary transition-all italic underline decoration-surface/20 underline-offset-8">
              <Download size={16} className="inline mr-3" /> Emitir Factura BFV
           </button>
           <button className="px-10 py-5 border border-outline-variant/20 text-on-surface-variant/40 hover:text-primary transition-all">
              <Printer size={16} />
           </button>
           <button 
             onClick={handleShare}
             className="px-10 py-5 border border-outline-variant/20 text-on-surface-variant/40 hover:text-primary transition-all"
           >
              <Share2 size={16} />
           </button>
        </div>
      </div>

      {/* Preview Side */}
      <div className="relative sticky top-8 lg:w-[500px]">
        <div className="bg-surface-container-high min-h-[700px] shadow-2xl p-16 flex flex-col font-body text-on-surface ring-1 ring-outline-variant/10">
           {/* Document Header */}
           <div className="flex justify-between items-start mb-20">
              <div className="space-y-4">
                  <div className="w-20 h-20 bg-surface-bright/20 border border-outline-variant/10 p-2 flex items-center justify-center shrink-0 mb-6 shadow-md">
                     <img 
                       src="https://i.ibb.co/sdggPPwX/logo.png" 
                       alt="Casa Mãe Logo" 
                       className="w-full h-full object-contain"
                       referrerPolicy="no-referrer"
                     />
                  </div>
                 <div>
                    <h2 className="font-headline text-4xl leading-tight text-on-surface font-black tracking-tight underline decoration-primary decoration-4 underline-offset-8">A CASA MÃE</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 mt-4">BFV-BEIB FRANCISCO VIANA</p>
                 </div>
              </div>
              <div className="text-right">
                 <h1 className="font-headline text-4xl text-on-surface tracking-wide mb-2">Factura</h1>
                 <p className="font-body text-[8px] font-bold text-on-surface-variant/20 uppercase tracking-widest">CM-BFV-001</p>
              </div>
           </div>

           {/* Client Section */}
           <div className="flex justify-between items-end mb-16 border-b border-outline-variant/10 pb-12">
              <div className="space-y-4">
                 <p className="font-body text-[8px] font-bold text-primary uppercase tracking-[0.3em] italic">Destinatário</p>
                 <div className="space-y-1">
                    <p className="font-headline italic text-2xl text-on-surface underline decoration-primary/10 decoration-4 underline-offset-4">{guestName || 'Hóspede'}</p>
                    <p className="font-body text-[9px] font-bold text-on-surface-variant/40 tracking-widest">{guestNif || 'Não Identificado'}</p>
                 </div>
              </div>
              <div className="text-right space-y-1">
                 <p className="font-body text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">Data de Emissão</p>
                 <p className="font-body font-bold text-[10px] text-on-surface">{new Date().toLocaleDateString('pt-AO')}</p>
              </div>
           </div>

           {/* Table */}
           <div className="flex-1 space-y-8">
              {/* Items */}
              <div className="space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <p className="font-headline italic text-lg text-on-surface-variant/60">{roomName}</p>
                       <p className="font-body text-[7px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">Reserva de Quarto • {roomNumber}</p>
                    </div>
                    <p className="font-headline italic text-lg text-on-surface">{formatCurrency(roomPrice)}</p>
                 </div>

                 {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start opacity-70">
                       <div className="space-y-1">
                          <p className="font-headline italic text-base text-on-surface-variant/60">{item.description || 'Hospedagem'}</p>
                          <p className="font-body text-[7px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">Qtd: {item.quantity}</p>
                       </div>
                       <p className="font-headline italic text-base text-on-surface">{formatCurrency(item.total)}</p>
                    </div>
                 ))}
              </div>
           </div>

           {/* Totals */}
           <div className="mt-20 space-y-6 pt-12 border-t border-outline-variant/10">
              <div className="flex justify-between font-body text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">
                 <span>Subtotal</span>
                 <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-end">
                 <div className="space-y-1">
                    <p className="font-body text-[8px] font-bold text-primary uppercase tracking-[0.4em] italic mb-2">Total a Pagar</p>
                    <p className="font-body text-[7px] text-on-surface-variant/40 uppercase tracking-widest">Inclui 14% de Imposto Operacional</p>
                 </div>
                 <div className="text-right">
                    <p className="font-headline italic text-5xl text-on-surface tracking-tight leading-none italic">{formatCurrency(total)}</p>
                 </div>
              </div>
           </div>

           {/* Footer */}
           <div className="mt-24 pt-12 text-center opacity-30">
              <p className="font-body text-[7px] font-bold uppercase tracking-[0.5em] italic text-on-surface-variant/60">Documento Oficial Casa Mãe BFV</p>
              <p className="font-body text-[6px] uppercase tracking-widest mt-2">{companyInfo.name} • Gestão BFV v4.0</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BillingForm;
