import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, openAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If not loading and no user, trigger the auth modal for the login prompt
    if (!loading && !user) {
      openAuthModal('login');
    }
  }, [loading, user, openAuthModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full scale-110" />
           <Loader2 className="animate-spin text-brown relative" size={48} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">Institutional Terminal Initializing</h2>
        <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-ink-muted">Verifying Archival Access Credentials...</p>
        
        {/* Progress Bar Decoration */}
        <div className="w-48 h-px bg-border-warm mt-10 relative overflow-hidden">
           <div className="absolute inset-0 bg-gold animate-progress-slide" />
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to home if not logged in
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Redirect to home if admin access required but not present
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-12 text-center">
         <ShieldAlert size={64} className="text-red-500 mb-6" />
         <h2 className="font-serif text-3xl font-bold text-ink mb-4">Access Restricted: Archival Protocol</h2>
         <p className="max-w-md font-sans text-ink-muted mb-8 italic">
            Entry to the Institutional Portal is reserved for administrative personnel. Your current credentials do not permit access to this volume of records.
         </p>
         <Navigate to="/" replace />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
