import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import BookDetail from './pages/BookDetail';
import MyLibrary from './pages/MyLibrary';
import ReservationsPickups from './pages/ReservationsPickups';
import Fines from './pages/Fines';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import BooksManager from './pages/admin/BooksManager';
import UsersAndBorrows from './pages/admin/UsersAndBorrows';
import PickupsAndFines from './pages/admin/PickupsAndFines';
import Content from './pages/admin/Content';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-cream selection:bg-gold/30">
            {/* Global UI Elements (Modals & Toasts) */}
            <AuthModal />
            <Toast />

            <Routes>
              {/* ADMIN PORTAL */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="books" element={<BooksManager />} />
                <Route path="users" element={<UsersAndBorrows />} />
                <Route path="pickups" element={<PickupsAndFines />} />
                <Route path="content" element={<Content />} />
              </Route>

              {/* PUBLIC SITE (With Global Navbar) */}
              <Route element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Outlet />
                  </main>
                </>
              }>
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/my-library" element={<MyLibrary />} />
                <Route path="/reservations" element={<ReservationsPickups />} />
                <Route path="/fines" element={<Fines />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={
                  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="font-serif text-4xl text-ink font-bold mb-4">404: Volume Misplaced</h2>
                    <p className="font-sans text-ink-muted mb-8 italic">The page you are looking for does not exist in our current collection.</p>
                    <Link to="/" className="bg-espresso text-cream px-8 py-3 uppercase tracking-widest text-xs font-bold font-sans">Return to Reading Room</Link>
                  </div>
                } />
              </Route>
            </Routes>
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
