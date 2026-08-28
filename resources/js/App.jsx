import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HomeMap from './pages/HomeMap';
import ShopLanding from './pages/ShopLanding';
import AuthPortal from './pages/AuthPortal';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InvoiceView from './pages/InvoiceView';
import { Scissors, MapPin, Calendar, CreditCard, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

function AboutPricingPage({ navigate }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-slate-100 space-y-16">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          The Map-First Barber Platform
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Find your next clean cut on <span className="text-amber-400">BarberMap</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          BarberMap connects modern gentlemen with vetted, high-caliber barber shops through an interactive live map, transparent pricing, haircut portfolios, and instant seat reservations.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#131720] border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Live Discovery Map</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instantly zoom, pan, and discover active barber shops near you with verified locations, real haircut photos, and ratings.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#131720] border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Smart Online Booking</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Check real-time chair availability, avoid waiting in long walk-in queues, and reserve your preferred barber service in seconds.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#131720] border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Scissors className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Mini-Site For Every Shop</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every barber shop gets a customized public mini-website to showcase haircut portfolios, promos, announcements, and customer reviews.
          </p>
        </div>
      </div>

      {/* Pricing Card for Owners */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#171b26] to-[#12151e] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">For Barber Shop Owners</span>
          <h2 className="text-3xl font-black text-white">List Your Barber Shop on BarberMap</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Get discovered by hundreds of local clients looking for fresh fades and classic cuts. Complete with custom CMS posts, gallery, and reservation schedule manager.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 pt-2">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Interactive Map Marker Pin</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Dedicated Public Landing Page URL</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Full Reservation & Calendar Management</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Automated Invoices & Official Receipts</li>
          </ul>
        </div>

        <div className="text-center p-8 bg-slate-900/90 rounded-2xl border border-slate-800 w-full sm:w-72 flex-shrink-0 space-y-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Monthly Flat Fee</span>
            <p className="text-4xl font-black text-amber-400 mt-1">₱350</p>
            <span className="text-xs text-slate-500">per month / no hidden charges</span>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
          >
            Register Your Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Route parsing
  const renderRoute = () => {
    if (currentPath === '/') {
      return <HomeMap navigate={navigate} />;
    }

    if (currentPath.startsWith('/shop/')) {
      const slug = currentPath.replace('/shop/', '');
      return <ShopLanding slug={slug} navigate={navigate} />;
    }

    if (currentPath.startsWith('/invoice/')) {
      const number = currentPath.replace('/invoice/', '');
      return <InvoiceView invoiceNumber={number} navigate={navigate} />;
    }

    if (currentPath === '/login') {
      return <AuthPortal initialMode="login" navigate={navigate} />;
    }

    if (currentPath === '/register' || currentPath === '/for-barbers') {
      return <AuthPortal initialMode="register" navigate={navigate} />;
    }

    if (currentPath === '/about') {
      return <AboutPricingPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/owner/')) {
      const subtab = currentPath.replace('/owner/', '') || 'dashboard';
      if (!user) {
        return <AuthPortal initialMode="login" navigate={navigate} />;
      }
      return <OwnerDashboard tab={subtab} navigate={navigate} />;
    }

    if (currentPath.startsWith('/admin/')) {
      const subtab = currentPath.replace('/admin/', '') || 'dashboard';
      if (!user) {
        return <AuthPortal initialMode="login" navigate={navigate} />;
      }
      return <AdminDashboard tab={subtab} navigate={navigate} />;
    }

    // Default fallback
    return <HomeMap navigate={navigate} />;
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0c10] text-slate-100 selection:bg-amber-500/30 selection:text-amber-300 overflow-x-hidden">
      <Navbar currentRoute={currentPath} navigate={navigate} />
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative min-h-0">
        {renderRoute()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
