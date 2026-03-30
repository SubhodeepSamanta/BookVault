import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  IndianRupee, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X, 
  Copy, 
  ArrowRight,
  Receipt,
  Download,
  Loader2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCover from '../components/BookCover';

const Fines = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [fines, setFines] = useState([]);
  const [showUPI, setShowUPI] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [paymentStep, setPaymentStep] = useState('pay'); // pay, processing, success
  const [timer, setTimer] = useState(180);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [txnId, setTxnId] = useState('');

  useEffect(() => {
    const fetchFines = async () => {
      setLoading(true);
      try {
        const res = await api.get('/fines/my');
        setFines(res.data.fines);
      } catch (err) {
        addToast('Records retrieval failure.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchFines();
  }, [addToast]);

  useEffect(() => {
    let interval;
    if (showUPI && paymentStep === 'pay' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimedOut(true);
    }
    return () => clearInterval(interval);
  }, [showUPI, paymentStep, timer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brown mb-4" size={40} />
        <span className="text-ink-muted font-sans uppercase tracking-[0.25em] text-[10px] font-bold">Synchronizing Financial Dues...</span>
      </div>
    );
  }

  const unpaidFines = fines.filter(f => !f.paid_at);
  const paidFines = fines.filter(f => f.paid_at);
  const totalOutstanding = unpaidFines.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2);
  const totalPaid = paidFines.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaymentInitiate = async (fine) => {
    try {
      const res = await api.post(`/fines/${fine.id}/pay`);
      setSelectedFine({ ...fine, ...res.data }); // Merge upiId, reference, etc.
      setShowUPI(true);
      setPaymentStep('pay');
      setTimer(180);
      setIsTimedOut(false);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to initiate payment', 'error');
    }
  };

  const handlePaymentConfirm = async () => {
    setPaymentStep('processing');
    try {
      const res = await api.put(`/fines/${selectedFine.id}/confirm`);
      setTxnId(res.data.txnId);
      setTimeout(() => {
        setPaymentStep('success');
      }, 1500);
    } catch (err) {
      addToast(err.response?.data?.error || 'Payment verification failed', 'error');
      setPaymentStep('pay');
    }
  };

  const handleFinish = () => {
    setShowUPI(false);
    // Refresh list
    api.get('/fines/my').then(res => setFines(res.data.fines));
    addToast('Fine paid successfully! Receipt saved.', 'success');
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (timer / 180) * circumference;

  return (
    <div className="bg-cream min-h-screen relative">
      <header className="bg-espresso py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-4">
            <span className="text-[12px] font-sans text-parchment/40 uppercase tracking-widest">
               <Link to="/" className="hover:text-gold transition-colors">Home</Link> / <span className="text-parchment/60 font-bold">Fines</span>
            </span>
          </nav>
          <h1 className="font-serif text-5xl text-cream font-bold mb-1">My Fines</h1>
          <p className="font-sans text-sm italic text-parchment/60">Outstanding and paid fine history.</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className={`px-5 py-2.5 border rounded-none flex items-center gap-3 ${unpaidFines.length > 0 ? 'bg-red-400/10 border-red-400/30 text-red-300' : 'bg-parchment/10 border-parchment/20 text-parchment/70'}`}>
               <IndianRupee size={16} />
               <span className="text-sm font-sans font-bold tracking-wider">₹{totalOutstanding} Outstanding</span>
            </div>
            <div className="bg-green-400/10 border border-green-400/30 px-5 py-2.5 rounded-none flex items-center gap-3 text-green-300">
               <CheckCircle size={16} />
               <span className="text-sm font-sans font-bold tracking-wider">₹{totalPaid} Paid</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 pb-20">
        {unpaidFines.length > 0 ? (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-red-600 mb-5 pl-1">Outstanding</h2>
             <div className="space-y-6">
                {unpaidFines.map(fine => (
                  <div key={fine.id} className="bg-red-50 border border-red-200 shadow-sm overflow-hidden">
                    <div className="bg-red-600 px-6 py-3 flex justify-between items-center">
                       <div className="font-mono text-xl text-white font-bold tracking-[0.05em]">₹{parseFloat(fine.amount).toFixed(2)}</div>
                       <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-red-100">UNPAID</span>
                    </div>
                    
                    <div className="px-6 py-6 flex gap-8 items-start">
                       <Link to={`/book/${fine.book_id}`} className="w-20 shrink-0 shadow-lg mt-1 hover:scale-105 transition-transform">
                          <BookCover book={fine.Book} className="w-full h-full !rounded-none" />
                       </Link>
                       <div className="flex-1">
                          <Link to={`/book/${fine.book_id}`}>
                             <h3 className="font-serif text-xl font-bold text-ink mb-1 hover:text-red-700 transition-colors">{fine.Book?.title}</h3>
                          </Link>
                          <p className="font-sans text-xs italic text-ink-muted mb-4">by {fine.Book?.author}</p>
                          
                          <div className="inline-flex items-center gap-2 text-[13px] font-sans font-bold text-red-600 mb-6 bg-red-100/50 px-3 py-1 rounded-sm">
                             <Clock size={14} />
                             Overdue fine calculated dynamically
                          </div>

                          <div className="bg-white border border-red-100 p-4 space-y-3">
                             <div className="flex justify-between items-center text-[12px] font-sans text-ink-muted leading-none">
                                <span>Reason</span>
                                <span className="text-ink font-medium capitalize">{fine.reason}</span>
                             </div>
                             <div className="h-px bg-red-50" />
                             <div className="flex justify-between items-center text-[13px] font-sans font-bold text-ink">
                                <span>Total fine</span>
                                <span className="text-red-600 font-mono text-base">₹{parseFloat(fine.amount).toFixed(2)}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="px-6 py-4 bg-red-100/20 border-t border-red-100 flex justify-between items-center">
                       <span className="text-[11px] font-sans text-red-400 font-medium italic">Fine added on {new Date(fine.created_at).toLocaleDateString()}</span>
                       <button 
                        onClick={() => handlePaymentInitiate(fine)}
                        className="bg-red-600 text-white px-8 py-3 text-[12px] font-sans font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 group"
                       >
                          Pay Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        ) : (
          <div className="py-12 bg-parchment/50 border border-border-warm text-center mb-16">
             <div className="flex justify-center mb-4 text-green-600"><CheckCircle size={32} /></div>
             <h3 className="font-serif text-xl font-bold text-ink">No outstanding library dues</h3>
             <p className="text-sm text-ink-muted mt-1 font-sans">Your account is in good standing.</p>
          </div>
        )}

        {/* PAYMENT HISTORY */}
        <section className={`${unpaidFines.length > 0 ? 'mt-16' : ''}`}>
           <h2 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-green-700 mb-5 pl-1">Payment History</h2>
           <div className="space-y-4">
              {paidFines.length > 0 ? paidFines.map(fine => (
                <div key={fine.id} className="bg-parchment border border-border-warm flex overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                   <div className="bg-green-700 w-24 shrink-0 flex flex-col items-center justify-center text-white px-2">
                      <div className="font-mono text-lg font-bold">₹{parseFloat(fine.amount).toFixed(2)}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                         <CheckCircle size={10} className="text-green-200" />
                         <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-green-200">PAID</span>
                      </div>
                   </div>
                   
                   <div className="px-5 py-4 flex gap-5 items-center flex-1">
                      <Link to={`/book/${fine.book_id}`} className="w-10 h-14 shrink-0 shadow-sm transform scale-90 hover:scale-110 transition-transform">
                         <BookCover book={fine.Book} className="w-full h-full !rounded-none" />
                      </Link>
                      <div className="flex-1 min-w-0">
                         <Link to={`/book/${fine.book_id}`}>
                            <h4 className="font-serif text-[15px] font-bold text-ink truncate hover:text-green-800 transition-colors">{fine.Book?.title}</h4>
                         </Link>
                         <p className="text-[11px] font-sans text-green-700 mb-1 font-medium">Paid on {new Date(fine.paid_at).toLocaleDateString()}</p>
                         <div className="font-mono text-[10px] text-ink-muted">Txn: {fine.txn_id}</div>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="py-10 text-center text-ink-muted italic font-sans text-sm">No payment history recorded.</div>
              )}
           </div>
        </section>
      </main>

      {/* UPI PAYMENT MODAL */}
      {showUPI && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
           <div className="absolute inset-0 bg-espresso/95 backdrop-blur-sm" onClick={() => paymentStep === 'pay' && setShowUPI(false)} />
           
           <div className="relative bg-cream w-full max-w-md shadow-2xl border-t-4 border-brown animate-in zoom-in-95 duration-300">
              <div className="bg-espresso px-8 py-6 flex justify-between items-center border-b border-parchment/10">
                 <div>
                    <h2 className="font-serif text-2xl text-cream font-bold">Pay Fine</h2>
                    <p className="text-[11px] font-sans text-parchment/50 font-medium uppercase tracking-[0.2em]">Secure UPI Payment</p>
                 </div>
                 {paymentStep === 'pay' && (
                   <button onClick={() => setShowUPI(false)} className="text-parchment/50 hover:text-cream transition-colors">
                      <X size={24} />
                   </button>
                 )}
              </div>

              {paymentStep === 'pay' && (
                <div className="px-8 py-10">
                   <div className="text-center mb-10">
                      <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-ink-muted mb-2">Amount Due</div>
                      <div className="font-serif text-6xl font-bold text-ink flex items-center justify-center leading-none mb-4">
                         <span className="text-3xl font-sans text-ink-soft mr-2">₹</span>{parseFloat(selectedFine?.amount).toFixed(2)}
                      </div>
                      <p className="text-[13px] font-sans text-ink-muted italic">for {selectedFine?.Book?.title}</p>
                   </div>

                   <div className="flex flex-col items-center mb-10">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                         <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="transparent" stroke="var(--border-warm)" strokeWidth="4" />
                            <circle 
                              cx="50" cy="50" r="45" 
                              fill="transparent" 
                              stroke={isTimedOut ? "#ef4444" : "#e11d48"} 
                              strokeWidth="4" 
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="square"
                              className="transition-all duration-1000 linear"
                            />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`font-serif text-2xl font-bold ${isTimedOut ? 'text-red-600' : 'text-ink'}`}>{formatTime(timer)}</span>
                         </div>
                      </div>
                      {isTimedOut && (
                        <button 
                          onClick={() => { setTimer(180); setIsTimedOut(false); }}
                          className="mt-3 text-[11px] font-sans font-bold text-brown underline uppercase tracking-widest decoration-2"
                        >
                          Try Again
                        </button>
                      )}
                   </div>

                   <div className="bg-parchment border border-border-warm overflow-hidden mb-8">
                      <div className="px-5 py-4 flex justify-between items-center border-b border-border-warm/50">
                         <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">UPI ID</span>
                         <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-ink">bookvault@upi</span>
                            <button onClick={() => { navigator.clipboard.writeText('bookvault@upi'); addToast('UPI ID copied!', 'success'); }} className="text-ink-muted hover:text-brown transition-colors">
                               <Copy size={16} />
                            </button>
                         </div>
                      </div>
                      <div className="px-5 py-4 flex justify-between items-center">
                         <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Reference</span>
                         <span className="font-mono text-[11px] font-bold text-ink-muted">FINE-{selectedFine?.id}-BV</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      {[
                        "Open any UPI app (GPay, PhonePe, Paytm)",
                        "Scan the QR or enter the UPI ID",
                        "Return here and click \"I Have Paid\""
                      ].map((step, i) => (
                        <div key={i} className="flex gap-4 items-start">
                           <div className="w-6 h-6 shrink-0 bg-espresso text-cream text-[10px] font-sans font-bold flex items-center justify-center">
                              {i + 1}
                           </div>
                           <p className="text-[12px] font-sans text-ink-muted leading-tight pt-1">{step}</p>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="px-8 py-20 flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
                   <Loader2 className="animate-spin text-brown mb-6" size={64} />
                   <h3 className="font-serif text-2xl font-bold text-ink">Verifying Payment</h3>
                   <p className="font-sans text-sm text-ink-muted mt-2">Connecting to UPI infrastructure...</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="px-8 py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                   <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 ring-8 ring-green-50/50">
                         <CheckCircle size={48} className="text-green-600" />
                      </div>
                      <h3 className="font-serif text-3xl font-bold text-ink mb-1">Payment Successful!</h3>
                      <p className="font-sans text-[13px] text-green-700 font-medium">Institutional record updated.</p>
                   </div>

                   <div className="bg-parchment border border-border-warm p-6 mb-8 relative">
                      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border-warm/50">
                         <Receipt size={14} className="text-brown" />
                         <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted">Transaction Receipt</span>
                      </div>

                      <div className="space-y-4">
                         {[
                           ['Amount Paid', `₹${parseFloat(selectedFine?.amount).toFixed(2)}`, true],
                           ['Transaction ID', txnId, false],
                           ['Status', 'Success', true, 'text-green-700']
                         ].map(([label, value, isBold, textColor]) => (
                           <div key={label} className="flex justify-between items-center text-[13px] font-sans border-b border-border-warm/30 pb-3 last:border-none last:pb-0">
                              <span className="text-ink-muted uppercase tracking-wider text-[10px] font-bold">{label}</span>
                              <span className={`${isBold ? 'font-bold' : ''} ${textColor || 'text-ink'} ${label.includes('ID') ? 'font-mono text-[11px]' : ''}`}>
                                 {value}
                              </span>
                           </div>
                         ))}
                      </div>

                      <button className="w-full mt-8 border border-brown text-brown py-3 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-brown hover:text-cream transition-all flex items-center justify-center gap-2">
                         <Download size={14} /> Download Receipt
                      </button>
                   </div>

                   <button 
                    onClick={handleFinish}
                    className="w-full bg-espresso text-cream py-4 font-sans font-bold uppercase tracking-widest text-sm hover:bg-black transition-all"
                   >
                      Done & Close
                   </button>
                </div>
              )}

              {paymentStep === 'pay' && (
                <div className="bg-cream border-t border-border-warm px-8 py-5">
                   <button 
                    onClick={handlePaymentConfirm}
                    disabled={isTimedOut}
                    className="w-full bg-green-700 text-white py-4 font-sans font-bold uppercase tracking-widest text-sm hover:bg-green-800 transition-all disabled:opacity-50 disabled:bg-gray-400 group"
                   >
                      I Have Paid <ArrowRight size={16} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              )}
           </div>
        </div>
      )}

      <footer className="bg-espresso py-8 border-t border-parchment/10 text-center">
         <p className="text-[10px] font-sans text-parchment/30 uppercase tracking-[0.3em]">Institutional Member · BookVault Library Portal · Est. 1987</p>
      </footer>
    </div>
  );
};

export default Fines;
