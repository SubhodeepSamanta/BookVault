import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import BookDetail from './pages/BookDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-cream selection:bg-gold/30">
            {/* Global UI Elements */}
            <Navbar />
            <AuthModal />
            <Toast />

            {/* Main Content Areas */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/books/:id" element={<BookDetail />} />
                
                {/* Fallback for "My Library" which redirects to Home for now or shows a placeholder */}
                <Route path="/my-library" element={<Catalogue />} />
                
                {/* 404 Route */}
                <Route path="*" element={
                  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="font-serif text-4xl text-ink font-bold mb-4">404: Volume Misplaced</h2>
                    <p className="font-sans text-ink-muted mb-8 italic">The page you are looking for does not exist in our current collection.</p>
                    <Link to="/" className="bg-espresso text-cream px-8 py-3 uppercase tracking-widest text-xs font-bold font-sans">Return to Reading Room</Link>
                  </div>
                } />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
