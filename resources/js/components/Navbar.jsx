import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  MapPin, Scissors, Shield, LayoutDashboard, LogOut, 
  LogIn, UserPlus, Bell, Menu, X, CheckCircle2, ChevronRight, Store,
  Sun, Moon
} from 'lucide-react';

export default function Navbar({ currentRoute, navigate }) {
  const { user, logout, notifications, unreadCount, markNotificationRead } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-[9999] bg-[#0d0f14]/95 backdrop-blur-md border-b border-slate-800/80 transition-all w-full flex-shrink-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          
          {/* LEFT END: Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl tracking-tighter">
              <Scissors className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Barber<span className="text-amber-400">Map</span></span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">PH</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Map-First Discovery & Booking</p>
            </div>
          </div>

          {/* CENTER: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => navigate('/')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentRoute === '/' 
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              Explore Map
            </button>

            <button
              onClick={() => navigate('/about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === '/about'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              About & Pricing
            </button>

            {!user && (
              <button
                onClick={() => navigate('/for-barbers')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors text-amber-400 hover:bg-amber-500/10 border border-amber-500/20`}
              >
                For Barber Shops (₱350/mo)
              </button>
            )}
          </nav>

          {/* RIGHT END: Theme, User Info, Notifications & Logout */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700/60 transition-all flex items-center justify-center shadow-sm"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white relative border border-slate-700/60 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#161a22] rounded-xl shadow-2xl border border-slate-700/80 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => markNotificationRead()} 
                            className="text-[11px] text-amber-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.link) navigate(n.link);
                                setShowNotifications(false);
                              }}
                              className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                n.is_read ? 'bg-slate-800/40 text-slate-300' : 'bg-amber-500/10 border border-amber-500/20 text-amber-200'
                              } hover:bg-slate-800`}
                            >
                              <p className="font-semibold text-white mb-0.5">{n.title}</p>
                              <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Role Portals */}
                {user.role === 'shop_owner' && (
                  <button
                    onClick={() => navigate('/owner/dashboard')}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-tight shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Store className="w-3.5 h-3.5" />
                    Shop Dashboard
                  </button>
                )}

                {user.role && ['super_admin', 'admin', 'moderator', 'payment_admin'].includes(user.role) && (
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-bold text-xs tracking-tight shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Panel
                  </button>
                )}

                {/* Profile Pill & Logout (Far Right) */}
                <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
                    <p className="text-[10px] text-amber-400 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700/60 transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/70 border border-slate-700/60 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Log in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu & Theme */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800/80 text-amber-400 border border-slate-700/60 flex items-center justify-center transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 flex items-center justify-center transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#11141a] border-b border-slate-800 px-4 py-4 space-y-3">
          <button
            onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" /> Explore Map</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          <button
            onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center justify-between"
          >
            <span>About & Pricing</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          
          {user ? (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="px-3 py-1">
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[11px] text-amber-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              {user.role === 'shop_owner' && (
                <button
                  onClick={() => { navigate('/owner/dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm"
                >
                  Shop Owner Dashboard
                </button>
              )}
              {['super_admin', 'admin', 'moderator', 'payment_admin'].includes(user.role) && (
                <button
                  onClick={() => { navigate('/admin/dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-rose-600 text-white font-bold text-sm"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-lg border border-slate-700 text-center text-sm font-semibold text-white"
              >
                Log In
              </button>
              <button
                onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-lg bg-amber-500 text-center text-sm font-bold text-slate-950"
              >
                Register Shop / Customer
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
