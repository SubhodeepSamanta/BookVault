import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  IndianRupee, 
  FileText, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

const PREDEFINED_REASONS = [
  'Physical Damage to Volume',
  'Environmental Degradation',
  'Missing/Torn Pages',
  'Lost Archive Item',
  'Archival Protocol Breach',
  'Late Restoration (Manual)',
  'Other Policy Violation'
];

const IssueFineModal = ({ isOpen, onClose, borrow, onSuccess }) => {
  const { addToast } = useToast();
  const [amount, setAmount] = useState('');
  const [reasonCategory, setReasonCategory] = useState(PREDEFINED_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !borrow) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      addToast('Please enter a valid fine amount.', 'error');
      return;
    }

    const finalReason = customReason 
      ? `${reasonCategory}: ${customReason}` 
      : reasonCategory;

    setIsSubmitting(true);
    try {
      await api.post('/fines/custom', {
        borrowId: borrow.id,
        userId: borrow.user_id,
        amount: parseFloat(amount),
        reason: finalReason
      });
      
      addToast(`Discretionary fine of ₹${amount} issued to ${borrow.User?.name}.`, 'success');
      if (onSuccess) onSuccess();
      onClose();
      
      // Reset form
      setAmount('');
      setCustomReason('');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to issue fine.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-espresso/80 backdrop-blur-sm transition-opacity" 
        onClick={() => !isSubmitting && onClose()} 
      />
      
      <div className="relative bg-cream w-full max-w-lg border-t-4 border-red-600 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="bg-espresso p-6 text-cream flex justify-between items-center">
           <div className="flex items-center gap-3">
              <ShieldAlert className="text-red-500" size={24} />
              <div>
                 <h3 className="font-serif text-xl font-bold">Issue Discretionary Fine</h3>
                 <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-parchment/40">Archival Fiscal Enforcement</p>
              </div>
           </div>
           <button 
            onClick={onClose}
            className="text-parchment/40 hover:text-white transition-colors"
           >
              <X size={20} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
           <div className="mb-8 p-4 bg-parchment border border-border-warm flex gap-4">
              <div className="w-12 h-16 bg-espresso/5 border border-border-deep shrink-0">
                 {/* Simplified book preview or ID */}
                 <div className="h-full flex items-center justify-center text-[10px] font-mono text-ink-muted leading-tight text-center p-1 uppercase">
                    BV-VOL<br/>{borrow.id}
                 </div>
              </div>
              <div className="min-w-0">
                 <h4 className="font-serif text-sm font-bold text-ink truncate">"{borrow.Book?.title}"</h4>
                 <p className="text-[11px] font-sans text-ink-muted">Borrowed by: <span className="text-ink font-bold font-mono uppercase tracking-tighter">{borrow.User?.name} ({borrow.User?.card_id})</span></p>
              </div>
           </div>

           <div className="space-y-6">
              {/* AMOUNT INPUT */}
              <div>
                 <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-2">Fine Amount (₹)</label>
                 <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-parchment border border-border-warm pl-12 pr-4 py-4 text-2xl font-serif font-bold text-red-600 focus:outline-none focus:border-red-600 transition-colors"
                    />
                 </div>
              </div>

              {/* REASON CATEGORY */}
              <div>
                 <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-2">Primary Violation Category</label>
                 <select 
                   value={reasonCategory}
                   onChange={(e) => setReasonCategory(e.target.value)}
                   className="w-full bg-parchment border border-border-warm px-4 py-3 text-[13px] font-sans font-bold text-ink focus:outline-none focus:border-brown"
                 >
                    {PREDEFINED_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                 </select>
              </div>

              {/* CUSTOM REASON */}
              <div>
                 <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-2">Granular Notes (Optional)</label>
                 <div className="relative">
                    <FileText className="absolute left-4 top-4 text-ink-muted" size={16} />
                    <textarea 
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Specify the exact nature of the violation or damage..."
                      className="w-full bg-parchment border border-border-warm pl-12 pr-4 py-3 min-h-[100px] text-[13px] font-sans text-ink focus:outline-none focus:border-brown resize-none"
                    />
                 </div>
              </div>
           </div>

           <div className="mt-10 flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-4 text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
              >
                 Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-red-600 text-cream py-4 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                 {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Finalize & Issue Fine'}
              </button>
           </div>
        </form>

        <div className="bg-red-50 p-4 flex items-start gap-3 border-t border-red-100">
           <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
           <p className="text-[10px] font-sans text-red-700 leading-tight italic">
              Issuing this fine will generate an immediate notification to the member and update their outstanding dues. This action is recorded in the institutional audit log.
           </p>
        </div>
      </div>
    </div>
  );
};

export default IssueFineModal;
