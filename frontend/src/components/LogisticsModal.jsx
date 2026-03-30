import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Loader2, ArrowRight, ShieldCheck, Undo2 } from 'lucide-react';
import api from '../api/client';

const LogisticsModal = ({ isOpen, onClose, book, onConfirm, mode = 'pickup' }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM'
  ];

  useEffect(() => {
    if (isOpen) {
      const fetchBranches = async () => {
        setLoading(true);
        try {
          const res = await api.get('/branches');
          setBranches(res.data.branches);
          if (res.data.branches.length > 0) setSelectedBranch(res.data.branches[0].id);
        } catch (err) {
          console.error('Failed to fetch branches:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBranches();
      
      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
      setSelectedTime(timeSlots[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = mode === 'pickup' 
        ? { bookIds: [book.id], branchId: selectedBranch, pickupDate: selectedDate, pickupTime: selectedTime }
        : { branchId: selectedBranch, returnDate: selectedDate, returnTime: selectedTime };
      
      await onConfirm(payload);
      onClose();
    } catch (err) {
      // Error handled by parent toast
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const isPickup = mode === 'pickup';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-espresso/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg bg-cream border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ borderRadius: '2px' }}
      >
        {/* HEADER */}
        <div className="bg-espresso text-parchment p-6 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight">
              {isPickup ? 'Reserve for Pickup' : 'Schedule Return'}
            </h2>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] opacity-60 mt-1">
              Scheduled Academic Resource {isPickup ? 'Access' : 'Restoration'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* BOOK SUMMARY */}
          <div className="flex gap-4 p-4 bg-parchment border border-border-warm/50">
            <div className="w-16 h-24 bg-espresso/10 shrink-0 border border-border-warm overflow-hidden shadow-sm">
               <div 
                 className="w-full h-full" 
                 style={{ backgroundColor: book.cover_bg || '#F5EFE6', color: book.cover_text || '#1C0F0A' }}
               >
                 <div className="w-full h-full opacity-30 flex items-center justify-center font-serif text-[8px] p-2 text-center font-bold leading-tight">
                   {book.title}
                 </div>
               </div>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-ink leading-tight line-clamp-1">{book.title}</h3>
              <p className="text-xs text-ink-muted italic mb-3">by {book.author}</p>
              <div className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 border font-sans font-bold uppercase tracking-widest inline-block
                ${isPickup ? 'text-green-700 bg-green-50 border-green-100' : 'text-brown bg-brown/5 border-brown/10'}`}>
                {isPickup ? <ShieldCheck size={10} /> : <Undo2 size={10} />}
                {isPickup ? 'In Stock & Ready' : 'Active Research Volume'}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* BRANCH SELECTION */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">
                <MapPin size={12} className="text-brown" />
                Select Library Branch
              </label>
              {loading ? (
                <div className="flex items-center gap-2 text-xs py-3 px-4 border border-border-warm bg-white/50">
                  <Loader2 size={14} className="animate-spin text-brown" />
                  <span className="italic text-ink-muted">Retrieving institutional locations...</span>
                </div>
              ) : (
                <select 
                  required
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-white border border-border-warm py-3 px-4 text-sm font-sans focus:outline-none focus:border-brown transition-colors cursor-pointer"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} — {b.address}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DATE SELECTION */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">
                  <Calendar size={12} className="text-brown" />
                  {isPickup ? 'Pickup Date' : 'Return Date'}
                </label>
                <input 
                  type="date"
                  required
                  min={minDateStr}
                  max={maxDateStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white border border-border-warm py-3 px-4 text-sm font-sans focus:outline-none focus:border-brown transition-colors"
                />
              </div>

              {/* TIME SELECTION */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">
                  <Clock size={12} className="text-brown" />
                  Time Slot
                </label>
                <select 
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-white border border-border-warm py-3 px-4 text-sm font-sans focus:outline-none focus:border-brown transition-colors cursor-pointer"
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <button 
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-espresso text-cream py-4 font-sans font-bold uppercase tracking-[0.2em] text-xs hover:bg-espresso-light disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Confirming Security Protocol...
                </>
              ) : (
                <>
                  {isPickup ? 'Complete Reservation' : 'Commit to Return'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-ink-muted font-sans leading-relaxed px-4">
              {isPickup 
                ? "Physical collection is required within the chosen window. Uncollected volumes will be automatically restocked in the archives."
                : "A physical drop-off is required at the chosen campus terminal. Failure to drop off by the scheduled window may incur archival late fees."}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogisticsModal;
