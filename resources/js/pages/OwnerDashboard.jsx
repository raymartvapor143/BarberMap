import React, { useState, useEffect } from 'react';
import axios from '../bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  Store, MapPin, Calendar, Clock, Star, Scissors, 
  Image as ImageIcon, FileText, CreditCard, Receipt, 
  Settings, LogOut, CheckCircle2, AlertCircle, Plus, 
  Trash2, Edit3, ExternalLink, ChevronRight, Upload, Bell
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OwnerDashboard({ tab = 'dashboard', navigate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(tab);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'success' });
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Store },
    { id: 'profile', label: 'Shop Profile', icon: Edit3 },
    { id: 'services', label: 'Services & Prices', icon: Scissors },
    { id: 'portfolio', label: 'Photos & Portfolio', icon: ImageIcon },
    { id: 'posts', label: 'Posts & CMS', icon: FileText },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'reviews', label: 'Ratings & Reviews', icon: Star },
    { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
  ];

  const fetchTabData = async () => {
    setLoading(true);
    setMessage({ text: '', type: 'success' });
    try {
      if (activeTab === 'dashboard') {
        const res = await axios.get('/api/owner/dashboard');
        setData(res.data);
      } else if (activeTab === 'profile') {
        const res = await axios.get('/api/owner/profile');
        setData(res.data);
      } else if (activeTab === 'services') {
        const res = await axios.get('/api/owner/services');
        setData(res.data);
      } else if (activeTab === 'portfolio') {
        const res = await axios.get('/api/owner/media');
        setData(res.data);
      } else if (activeTab === 'posts') {
        const res = await axios.get('/api/owner/posts');
        setData(res.data);
      } else if (activeTab === 'hours') {
        const res = await axios.get('/api/owner/hours');
        setData(res.data);
      } else if (activeTab === 'reservations') {
        const res = await axios.get('/api/owner/reservations');
        setData({ reservations: res.data.reservations?.data || res.data.reservations || [] });
      } else if (activeTab === 'reviews') {
        const res = await axios.get('/api/owner/reviews');
        setData({ reviews: res.data.reviews?.data || res.data.reviews || [] });
      } else if (activeTab === 'subscription') {
        const res = await axios.get('/api/owner/billing');
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b0e14] text-slate-100 flex flex-col md:flex-row relative">
      
      {/* MOBILE DASHBOARD TOP BAR */}
      <div className="md:hidden bg-[#0e1117] border-b border-slate-800/80 p-3.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white truncate">{user?.shop?.name || 'Shop Portal'}</h2>
            <span className="text-[10px] text-amber-400 font-semibold uppercase">{activeTab}</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[#161b26] border border-slate-700/80 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-md"
        >
          <span>Menu</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* MOBILE OVERLAY BACKDROP */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-x-0 bottom-0 top-16 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in"
        />
      )}

      {/* SIDEBAR NAVIGATION (Desktop: Collapsible Mini-rail / Full | Mobile: Slide-over Drawer) */}
      <aside 
        className={`bg-[#0e1117] border-r border-slate-800/80 flex flex-col justify-between flex-shrink-0 z-40 transition-all duration-300 ease-in-out ${
          // Desktop Width: 68px when collapsed, 260px when expanded
          sidebarCollapsed ? 'lg:w-[72px] lg:p-3' : 'lg:w-64 lg:p-4'
        } ${
          // Mobile & tablet responsive slide-over drawer
          mobileMenuOpen 
            ? 'fixed left-0 top-16 bottom-0 w-72 p-4 shadow-2xl flex translate-x-0 z-40' 
            : 'hidden lg:flex'
        }`}
      >
        <div className="space-y-4">
          
          {/* Header & Shop Tag */}
          <div className={`p-3 bg-[#11151f] rounded-2xl border border-slate-800 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Owner Portal</span>
                <h3 className="text-xs font-bold text-white truncate">{user?.shop?.name || 'My Barber Shop'}</h3>
              </div>
            )}

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-180" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5'} rounded-xl text-xs font-semibold transition-all group relative ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Subscription Status & Public Preview */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {!sidebarCollapsed ? (
            <>
              {user?.shop?.slug && (
                <button
                  onClick={() => window.open(`/shop/${user.shop.slug}`, '_blank')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 font-semibold text-xs flex items-center justify-between transition-colors border border-slate-700/60"
                  title="Preview Public Landing Page"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Public Page</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}

              <div 
                onClick={() => {
                  setActiveTab('subscription');
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl bg-[#161a24] border border-amber-500/20 cursor-pointer hover:border-amber-500/40 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Subscription</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                    user?.shop?.status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {user?.shop?.status?.toUpperCase().replace('_', ' ') || 'PENDING'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">₱350 / Monthly Plan</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setActiveTab('subscription')}
                className="p-2 rounded-xl bg-[#161a24] border border-amber-500/20 text-amber-400 hover:bg-slate-800"
                title="Subscription Status"
              >
                <CreditCard className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN OWNER CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
        
        {/* Banner Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ text: '', type: 'success' })} className="text-xs">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Scissors className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-xs">Loading shop records...</p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'dashboard' && data && (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-white">{data.shop?.name || 'My Barber Shop'}</h1>
                    <p className="text-xs text-slate-400">Welcome to your shop control center. Manage your reservations, portfolio, and public listing.</p>
                  </div>

                  {data.shop?.slug && (
                    <button
                      onClick={() => window.open(`/shop/${data.shop.slug}`, '_blank')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 flex items-center gap-2 self-start sm:self-auto"
                    >
                      <span>View Public Landing Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Warning if NOT Active */}
                {data.shop && data.shop.status !== 'active' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300">Shop Listing is Currently Hidden From Public Map</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Status: <strong className="text-white uppercase">{data.shop.status?.replace('_', ' ') || 'PENDING'}</strong>. 
                        Your shop will become publicly searchable on the map as soon as your monthly subscription payment of ₱350 is verified by an administrator.
                      </p>
                      <button
                        onClick={() => setActiveTab('subscription')}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                      >
                        Submit / Check Subscription Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* KPI Overview Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-lg">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Today's Bookings</span>
                    <p className="text-2xl font-black text-amber-400 mt-1">{data.kpis?.today_count ?? 0}</p>
                    <span className="text-[10px] text-slate-500">Upcoming: {data.kpis?.upcoming_reservations ?? 0}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-lg">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Total Bookings</span>
                    <p className="text-2xl font-black text-white mt-1">{data.kpis?.total_reservations ?? 0}</p>
                    <span className="text-[10px] text-emerald-400">All-time reserved</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-lg">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Customer Rating</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="text-2xl font-black text-white">{(Number(data.kpis?.rating_avg) || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{data.kpis?.reviews_count || 0} reviews</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Profile Completion</span>
                        <button 
                          onClick={() => setShowChecklistModal(true)}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline"
                        >
                          View Checklist
                        </button>
                      </div>
                      <p className="text-2xl font-black text-emerald-400 mt-1">{data.kpis?.profile_completion ?? 0}%</p>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${data.kpis?.profile_completion ?? 0}%` }}></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowChecklistModal(true)}
                      className="mt-3 w-full py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white flex items-center justify-between border border-slate-700/60 transition-all"
                    >
                      <span>
                        {data.kpis?.completion_checklist?.filter(i => !i.is_completed).length || 0} tasks remaining
                      </span>
                      <ChevronRight className="w-3 h-3 text-amber-400" />
                    </button>
                  </div>
                </div>

                {/* Profile Completion Checklist Modal */}
                {showChecklistModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#151923] border border-slate-700/90 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                            <span>Shop Profile Completion Guide</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                              {data.kpis?.profile_completion ?? 0}% Completed
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Complete all steps below to build trust and rank higher on discovery.</p>
                        </div>
                        <button 
                          onClick={() => setShowChecklistModal(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Total Progress</span>
                          <span className="text-amber-400 font-bold">{data.kpis?.profile_completion ?? 0} / 100 pts</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${data.kpis?.profile_completion ?? 0}%` }}></div>
                        </div>
                      </div>

                      {/* Checklist Tasks List */}
                      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                        {(data.kpis?.completion_checklist || [
                          { key: 'name', label: 'Shop Name & Tagline', points: 10, is_completed: true, tab: 'profile' },
                          { key: 'description', label: 'About / Shop Story', points: 10, is_completed: false, tab: 'profile' },
                          { key: 'logo', label: 'Shop Logo Image', points: 10, is_completed: false, tab: 'profile' },
                          { key: 'cover', label: 'Cover Photo Banner', points: 10, is_completed: false, tab: 'profile' },
                          { key: 'location', label: 'Geographic Map Coordinates (Lat / Lng)', points: 15, is_completed: false, tab: 'profile' },
                          { key: 'plus_code', label: 'Google Maps Plus Code (Navigation Pin)', points: 10, is_completed: false, tab: 'profile' },
                          { key: 'services', label: 'Services & Pricing Menu', points: 15, is_completed: false, tab: 'services' },
                          { key: 'hours', label: 'Weekly Business Hours', points: 10, is_completed: false, tab: 'hours' },
                          { key: 'portfolio', label: 'Haircut Portfolio Photos', points: 10, is_completed: false, tab: 'portfolio' },
                        ]).map((task, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                              task.is_completed 
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300' 
                                : 'bg-[#11141c] border-slate-800 text-white hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {task.is_completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-600 flex-shrink-0"></div>
                              )}
                              <div>
                                <p className={`font-semibold ${task.is_completed ? 'line-through text-slate-400' : 'text-white'}`}>
                                  {task.label}
                                </p>
                                <span className="text-[10px] text-slate-500">+{task.points} points</span>
                              </div>
                            </div>

                            {!task.is_completed && (
                              <button
                                onClick={() => {
                                  setShowChecklistModal(false);
                                  setActiveTab(task.tab);
                                }}
                                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-all border border-amber-500/30"
                              >
                                <span>Complete</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setShowChecklistModal(false)}
                          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Today's Schedule & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Today's Reservations */}
                  <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        Today's Schedule
                      </h3>
                      <button onClick={() => setActiveTab('reservations')} className="text-xs text-amber-400 hover:underline">
                        View All
                      </button>
                    </div>

                    {(!data?.today_reservations || data.today_reservations.length === 0) ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No appointments booked for today yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.today_reservations.map((res) => (
                          <div key={res.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-white">{res.customer_name}</p>
                              <p className="text-slate-400">{res.service?.name} (₱{res.total_price})</p>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                                {res.start_time?.slice(0, 5)} - {res.end_time?.slice(0, 5)}
                              </span>
                              <p className="text-[10px] text-slate-500 capitalize mt-1">{res.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Customer Feedback */}
                  <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        Recent Customer Reviews
                      </h3>
                      <button onClick={() => setActiveTab('reviews')} className="text-xs text-amber-400 hover:underline">
                        Manage Reviews
                      </button>
                    </div>

                    {(!data?.recent_reviews || data.recent_reviews.length === 0) ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No reviews yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.recent_reviews.map((rev) => (
                          <div key={rev.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{rev.customer_name}</span>
                              <div className="flex items-center text-amber-400 text-[10px]">
                                {[...Array(Math.max(1, rev.rating || 5))].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400" />)}
                              </div>
                            </div>
                            <p className="text-slate-300 line-clamp-2">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. SHOP PROFILE TAB */}
            {activeTab === 'profile' && data && (
              <ShopProfileEditor 
                shop={data.shop} 
                onSaved={(updated) => {
                  setData({ shop: updated });
                  setMessage({ text: 'Shop profile saved successfully!', type: 'success' });
                }} 
              />
            )}

            {/* 3. SERVICES & PRICING TAB */}
            {activeTab === 'services' && data && (
              <ShopServicesManager 
                services={data.services} 
                onRefresh={fetchTabData}
              />
            )}

            {/* 5. PHOTOS & PORTFOLIO TAB */}
            {activeTab === 'portfolio' && data && (
              <ShopMediaManager 
                photos={data.photos} 
                portfolio={data.portfolio} 
                onRefresh={fetchTabData}
              />
            )}

            {/* 6. POSTS / CMS TAB */}
            {activeTab === 'posts' && data && (
              <ShopPostsManager 
                posts={data.posts} 
                onRefresh={fetchTabData}
              />
            )}

            {/* 7. BUSINESS HOURS TAB */}
            {activeTab === 'hours' && data && (
              <ShopHoursEditor 
                hours={data.hours} 
                breaks={data.breaks} 
                onRefresh={fetchTabData}
              />
            )}

            {/* 8. RESERVATIONS MANAGEMENT TAB */}
            {activeTab === 'reservations' && data && (
              <ShopReservationsManager 
                reservations={data.reservations} 
                onRefresh={fetchTabData}
              />
            )}

            {/* 9. REVIEWS TAB */}
            {activeTab === 'reviews' && data && (
              <ShopReviewsManager 
                reviews={data.reviews} 
                onRefresh={fetchTabData}
              />
            )}

            {/* 10. SUBSCRIPTION & BILLING TAB */}
            {activeTab === 'subscription' && data && (
              <ShopBillingManager 
                billing={data} 
                onRefresh={fetchTabData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENTS FOR OWNER DASHBOARD
// -------------------------------------------------------------

function ShopProfileEditor({ shop = {}, onSaved }) {
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    tagline: shop?.tagline || '',
    description: shop?.description || '',
    phone: shop?.phone || '',
    email: shop?.email || '',
    address: shop?.address || '',
    city: shop?.city || '',
    barangay: shop?.barangay || '',
    latitude: shop?.location?.latitude || '',
    longitude: shop?.location?.longitude || '',
    plus_code: shop?.location?.plus_code || '',
    logo_url: shop?.logo_url || '',
    cover_url: shop?.cover_url || '',
    starting_price: shop?.starting_price || 150,
  });

  const [detectingGps, setDetectingGps] = useState(false);

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
        }));
        setDetectingGps(false);
      },
      () => {
        alert('Could not detect location. Please input coordinates manually or allow location access.');
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(shop?.logo_url || '');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(shop?.cover_url || '');
  const [saving, setSaving] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      if (logoFile) {
        data.append('logo', logoFile);
      }
      if (coverFile) {
        data.append('cover', coverFile);
      }

      const res = await axios.post('/api/owner/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Shop profile and location coordinates updated successfully!');
      onSaved(res.data.shop);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl bg-[#131720] rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Shop Profile & Branding</h2>
          <p className="text-xs text-slate-400">Configure your shop branding shown on your dedicated landing page mini-site.</p>
        </div>
        {shop?.slug && (
          <button
            type="button"
            onClick={() => window.open(`/shop/${shop.slug}`, '_blank')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-1"
          >
            <span>Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline / Catchphrase</label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="e.g. Master Fades & Classic Grooming"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">About Shop Story & Description</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white leading-relaxed"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Barangay</label>
          <input
            type="text"
            value={formData.barangay}
            onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Starting Haircut Price (₱)</label>
          <input
            type="number"
            min="0"
            value={formData.starting_price}
            onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Full Street Address</label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
        />
      </div>

      {/* Map Location Coordinates & Plus Code */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">Geographic Map Coordinates</span>
          </div>
          <button
            type="button"
            onClick={handleGetLiveLocation}
            disabled={detectingGps}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[11px] font-bold border border-amber-500/30 transition-all flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            {detectingGps ? 'Detecting GPS...' : 'Use Current Location'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              placeholder="e.g. 14.554729"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              placeholder="e.g. 121.024445"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Google Plus Code (Optional)</label>
          <input
            type="text"
            value={formData.plus_code}
            onChange={(e) => setFormData({ ...formData, plus_code: e.target.value })}
            placeholder="e.g. 7Q63+H8 Taguig, Metro Manila"
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white"
          />
          <p className="text-[10px] text-slate-500 mt-1">Provide Latitude & Longitude or your Google Maps Plus Code so clients can navigate directly to your shop.</p>
        </div>
      </div>

      {/* Image Attachments Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Shop Logo</label>
          <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-900/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px]">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
            />
            {logoPreview ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="w-20 h-20 object-cover rounded-xl border border-slate-700 shadow-md"
                />
                <span className="text-[11px] text-amber-400 font-semibold underline">Change Attached Logo</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Upload className="w-6 h-6 text-amber-400" />
                <p className="text-xs text-slate-200 font-medium">Attach Shop Logo</p>
                <p className="text-[10px] text-slate-500">Square PNG, JPG, or SVG (Max 5MB)</p>
              </div>
            )}
          </label>
          {logoFile && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Selected: <span className="font-semibold text-white truncate">{logoFile.name}</span>
            </p>
          )}
        </div>

        {/* Cover Photo Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Cover Banner Photo</label>
          <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-900/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px]">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleCoverChange}
              className="hidden"
            />
            {coverPreview ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  className="w-full h-20 object-cover rounded-xl border border-slate-700 shadow-md"
                />
                <span className="text-[11px] text-amber-400 font-semibold underline">Change Attached Cover</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Upload className="w-6 h-6 text-amber-400" />
                <p className="text-xs text-slate-200 font-medium">Attach Cover Photo</p>
                <p className="text-[10px] text-slate-500">Landscape JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            )}
          </label>
          {coverFile && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Selected: <span className="font-semibold text-white truncate">{coverFile.name}</span>
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
        >
          {saving ? 'Saving Changes...' : 'Save Shop Profile'}
        </button>
      </div>
    </form>
  );
}

function ShopServicesManager({ services, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState(200);
  const [duration, setDuration] = useState(45);

  const openAdd = () => {
    setEditingService(null);
    setName('');
    setDesc('');
    setPrice(200);
    setDuration(45);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditingService(s);
    setName(s.name);
    setDesc(s.description || '');
    setPrice(s.price);
    setDuration(s.duration_minutes);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingService ? `/api/owner/services/${editingService.id}` : '/api/owner/services';
      await axios.post(url, {
        name,
        description: desc,
        price,
        duration_minutes: duration,
        is_active: true,
      });
      setModalOpen(false);
      onRefresh();
    } catch (e) {
      alert('Failed to save service.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await axios.delete(`/api/owner/services/${id}`);
      onRefresh();
    } catch (e) {
      alert('Failed to delete service.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-amber-400" />
            Services & Pricing Menu ({services?.length || 0})
          </h2>
          <p className="text-xs text-slate-400">Manage haircut packages and durations offered to customers.</p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(services || []).map((s) => (
          <div key={s.id} className="p-4 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-md flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{s.name}</h3>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{s.duration_minutes} min</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.description}</p>
              <p className="text-base font-black text-amber-400 mt-2">₱{s.price}</p>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-[#151923] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Skin Fade + Hot Towel"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₱)</label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="15"
                step="5"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">Save Service</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ShopMediaManager({ photos, portfolio, onRefresh }) {
  const [portModal, setPortModal] = useState(false);
  const [editingPort, setEditingPort] = useState(null);
  const [portFile, setPortFile] = useState(null);
  const [portPreview, setPortPreview] = useState('');
  const [portTitle, setPortTitle] = useState('');
  const [portCat, setPortCat] = useState('Fade');
  const [saving, setSaving] = useState(false);

  const handlePortFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortFile(file);
      setPortPreview(URL.createObjectURL(file));
    }
  };

  const openAdd = () => {
    setEditingPort(null);
    setPortFile(null);
    setPortPreview('');
    setPortTitle('');
    setPortCat('Fade');
    setPortModal(true);
  };

  const openEdit = (item) => {
    setEditingPort(item);
    setPortFile(null);
    setPortPreview(item.url || '');
    setPortTitle(item.title || '');
    setPortCat(item.category || 'Fade');
    setPortModal(true);
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    if (!editingPort && !portFile) {
      alert('Please select an image file for your haircut portfolio.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      if (portFile) {
        formData.append('image', portFile);
      }
      formData.append('title', portTitle);
      formData.append('category', portCat);

      const url = editingPort ? `/api/owner/portfolio/${editingPort.id}` : '/api/owner/portfolio';
      await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(editingPort ? 'Portfolio photo updated successfully!' : 'Portfolio photo added successfully!');
      setPortModal(false);
      setEditingPort(null);
      setPortFile(null);
      setPortPreview('');
      setPortTitle('');
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save portfolio photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePort = async (id) => {
    if (!confirm('Are you sure you want to remove this portfolio photo?')) return;
    try {
      await axios.delete(`/api/owner/portfolio/${id}`);
      onRefresh();
    } catch (e) {
      alert('Failed to delete photo.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Haircut Portfolio */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              Haircut Portfolio ({portfolio?.length || 0})
            </h2>
            <p className="text-xs text-slate-400">Showcase your cuts by categories (Fade, Classic, Beard, Crop, Kids, Other).</p>
          </div>

          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Cut Photo
          </button>
        </div>

        {(!portfolio || portfolio.length === 0) ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No portfolio photos yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Add photos of your haircut styles to attract more clients.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(portfolio || []).map((p) => (
              <div key={p.id} className="relative rounded-2xl overflow-hidden aspect-square group bg-slate-900 border border-slate-800 shadow-md">
                <img src={p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-md self-start">{p.category}</span>
                  <div>
                    <span className="text-xs font-bold text-white block truncate mb-2">{p.title || 'Untitled Cut'}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEdit(p)} 
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 border border-slate-700"
                        title="Edit Haircut Details"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeletePort(p.id)} 
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {portModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSavePortfolio} className="bg-[#151923] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                {editingPort ? 'Edit Haircut Portfolio Photo' : 'Add Haircut Portfolio Photo'}
              </h3>
              <button type="button" onClick={() => setPortModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {editingPort ? 'Change Attached Photo (Optional)' : 'Attach Cut Photo'}
              </label>
              <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-900/60 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handlePortFileChange}
                  className="hidden"
                />
                {portPreview ? (
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <img 
                      src={portPreview} 
                      alt="Cut Preview" 
                      className="h-28 max-w-full object-cover rounded-lg border border-slate-700 shadow" 
                    />
                    <span className="text-[11px] text-amber-400 font-semibold underline">Click to Choose New Photo</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 py-1">
                    <Upload className="w-5 h-5 text-amber-400" />
                    <p className="text-xs text-slate-300 font-medium">Click to select haircut photo</p>
                    <p className="text-[10px] text-slate-500">JPG, PNG, WEBP (Max 10MB)</p>
                  </div>
                )}
              </label>
              {portFile && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Selected: <span className="font-semibold text-white truncate">{portFile.name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Haircut Title</label>
              <input
                type="text"
                required
                value={portTitle}
                onChange={(e) => setPortTitle(e.target.value)}
                placeholder="e.g. Mid Taper Skin Fade"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={portCat}
                onChange={(e) => setPortCat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Fade">Fade</option>
                <option value="Classic">Classic</option>
                <option value="Beard">Beard</option>
                <option value="Crop">Crop</option>
                <option value="Kids">Kids</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button 
                type="button" 
                onClick={() => setPortModal(false)} 
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
              >
                {saving ? 'Saving...' : (editingPort ? 'Update Photo' : 'Add Photo')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ShopPostsManager({ posts, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('Promotion');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('post_type', type);
      formData.append('status', 'published');
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.post('/api/owner/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setModalOpen(false);
      setTitle('');
      setContent('');
      setImageFile(null);
      setImagePreview('');
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to publish post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await axios.delete(`/api/owner/posts/${id}`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Shop Posts & Announcements ({posts?.length || 0})
          </h2>
          <p className="text-xs text-slate-400">Publish promotions, announcements, and haircut drops directly to your landing page.</p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setContent('');
            setImageFile(null);
            setImagePreview('');
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(posts || []).map((p) => (
          <div key={p.id} className="p-4 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-md space-y-2">
            {p.images && p.images.length > 0 && (
              <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-900 mb-2">
                <img 
                  src={p.images[0].url} 
                  alt={p.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                {p.post_type}
              </span>
              <button onClick={() => handleDelete(p.id)} className="text-slate-500 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="font-bold text-sm text-white">{p.title}</h3>
            <p className="text-xs text-slate-300 line-clamp-3">{p.content}</p>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePost} className="bg-[#151923] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Create Shop Post</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Post Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Promotion">Promotion (Promo/Discount)</option>
                <option value="Announcement">Announcement</option>
                <option value="Haircut">Haircut Style Spotlight</option>
                <option value="Update">Schedule / Holiday Update</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Post Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 💈 Weekend Special Promo"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Post Image (Optional)</label>
              <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-900/60 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <img 
                      src={imagePreview} 
                      alt="Post Preview" 
                      className="h-28 max-w-full object-cover rounded-lg border border-slate-700 shadow" 
                    />
                    <span className="text-[11px] text-amber-400 font-semibold underline">Change Attached Image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 py-1">
                    <Upload className="w-5 h-5 text-amber-400" />
                    <p className="text-xs text-slate-300 font-medium">Click to attach photo</p>
                    <p className="text-[10px] text-slate-500">JPG, PNG, WEBP (Max 10MB)</p>
                  </div>
                )}
              </label>
              {imageFile && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Attached: <span className="font-semibold text-white truncate">{imageFile.name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Post Content</label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Details of your announcement..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
              >
                {saving ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ShopHoursEditor({ hours, breaks, onRefresh }) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [schedule, setSchedule] = useState(hours || []);
  const [saving, setSaving] = useState(false);

  // Initialize with standard schedule if completely empty
  const handleApplyPreset = () => {
    const fullWeek = [1, 2, 3, 4, 5, 6, 0].map(day => ({
      day_of_week: day,
      open_time: '09:00',
      close_time: '19:00',
      is_closed: false,
    }));
    setSchedule(fullWeek);
  };

  const handleAddDay = (dayIndex) => {
    if (schedule.some(h => h.day_of_week === dayIndex)) return;
    const next = [...schedule, {
      day_of_week: dayIndex,
      open_time: '09:00',
      close_time: '19:00',
      is_closed: false,
    }].sort((a, b) => a.day_of_week - b.day_of_week);
    setSchedule(next);
  };

  const handleRemoveDay = (dayIndex) => {
    setSchedule(schedule.filter(h => h.day_of_week !== dayIndex));
  };

  const handleUpdateDay = (index, field, value) => {
    const next = [...schedule];
    next[index] = { ...next[index], [field]: value };
    setSchedule(next);
  };

  const handleToggleClosed = (index) => {
    const next = [...schedule];
    next[index] = { ...next[index], is_closed: !next[index].is_closed };
    setSchedule(next);
  };

  const handleSaveHours = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/owner/hours', {
        hours: schedule.map(h => ({
          day_of_week: h.day_of_week,
          open_time: (h.open_time || '09:00').slice(0, 5),
          close_time: (h.close_time || '19:00').slice(0, 5),
          is_closed: Boolean(h.is_closed),
        })),
        breaks: breaks || [],
      });
      alert('Business hours and active days updated successfully!');
      onRefresh();
    } catch (e) {
      alert('Failed to save hours.');
    } finally {
      setSaving(false);
    }
  };

  // Missing days available to add
  const existingDays = schedule.map(h => h.day_of_week);
  const unaddedDays = [1, 2, 3, 4, 5, 6, 0].filter(d => !existingDays.includes(d));

  return (
    <form onSubmit={handleSaveHours} className="max-w-3xl bg-[#131720] rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Weekly Business Hours & Operating Days
          </h2>
          <p className="text-xs text-slate-400">Add, customize, turn on/off, or remove operating days. The booking calendar strictly follows these slots.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {schedule.length === 0 && (
            <button
              type="button"
              onClick={handleApplyPreset}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all border border-amber-500/30"
            >
              + Standard 7-Day Schedule
            </button>
          )}

          {unaddedDays.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">Add Day:</span>
              {unaddedDays.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleAddDay(d)}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-[11px] border border-slate-700"
                  title={`Add ${days[d]}`}
                >
                  +{days[d].slice(0, 3)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {schedule.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">No active operating hours set</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Click below to initialize standard opening hours or add individual days.</p>
          <button
            type="button"
            onClick={handleApplyPreset}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
          >
            Apply Standard Mon-Sun Preset
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.map((h, i) => (
            <div 
              key={h.day_of_week} 
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                h.is_closed 
                  ? 'bg-slate-950/60 border-slate-800/60 opacity-60' 
                  : 'bg-slate-900/90 border-slate-800 text-white shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 w-36">
                {/* On / Off Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleClosed(i)}
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase transition-all ${
                    h.is_closed 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {h.is_closed ? 'OFF (Closed)' : 'ON (Open)'}
                </button>
                <span className="font-bold text-white text-xs">{days[h.day_of_week]}</span>
              </div>
              
              {/* Hours Selector */}
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  disabled={h.is_closed}
                  value={(h.open_time || '09:00').slice(0, 5)}
                  onChange={(e) => handleUpdateDay(i, 'open_time', e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs disabled:opacity-30"
                />
                <span className="text-slate-500 font-semibold">to</span>
                <input
                  type="time"
                  disabled={h.is_closed}
                  value={(h.close_time || '19:00').slice(0, 5)}
                  onChange={(e) => handleUpdateDay(i, 'close_time', e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs disabled:opacity-30"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleToggleClosed(i)}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  {h.is_closed ? 'Turn On' : 'Turn Off'}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveDay(h.day_of_week)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title={`Delete ${days[h.day_of_week]}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
        >
          {saving ? 'Saving Hours...' : 'Save Weekly Schedule'}
        </button>
      </div>
    </form>
  );
}

function ShopReservationsManager({ reservations, onRefresh }) {
  const handleStatus = async (id, status) => {
    try {
      await axios.post(`/api/owner/reservations/${id}/status`, { status });
      onRefresh();
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          Customer Reservations ({reservations?.length || 0})
        </h2>
        <p className="text-xs text-slate-400">Manage client bookings, confirmations, and completed services.</p>
      </div>

      <div className="bg-[#131720] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Service</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(!reservations || reservations.length === 0) ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No reservations found.</td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <p className="font-bold text-white">{r.customer_name}</p>
                      <p className="text-[11px] text-slate-500">{r.customer_phone}</p>
                    </td>
                    <td className="p-4">{r.service?.name}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-200">{r.reservation_date}</p>
                      <p className="text-[11px] text-amber-400">{r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)}</p>
                    </td>
                    <td className="p-4 font-bold text-amber-400">₱{r.total_price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                        r.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        r.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {r.status === 'pending' && (
                        <button onClick={() => handleStatus(r.id, 'confirmed')} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded font-bold hover:bg-emerald-500/30">Confirm</button>
                      )}
                      {r.status === 'confirmed' && (
                        <button onClick={() => handleStatus(r.id, 'completed')} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-bold hover:bg-blue-500/30">Complete</button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button onClick={() => handleStatus(r.id, 'cancelled')} className="px-2 py-1 bg-red-500/10 text-red-400 rounded font-bold hover:bg-red-500/20">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ShopReviewsManager({ reviews, onRefresh }) {
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = async (id) => {
    try {
      await axios.post(`/api/owner/reviews/${id}/reply`, { owner_reply: replyText });
      setReplyingId(null);
      setReplyText('');
      onRefresh();
    } catch (e) {
      alert('Failed to send reply.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Customer Ratings & Feedback ({reviews?.length || 0})
        </h2>
        <p className="text-xs text-slate-400">Respond to customer reviews. Reviews cannot be permanently deleted by owners.</p>
      </div>

      <div className="space-y-4">
        {(reviews || []).map((rev) => (
          <div key={rev.id} className="p-5 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">{rev.customer_name}</h4>
                <span className="text-[11px] text-slate-500">{new Date(rev.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex text-amber-400">
                {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

            {rev.owner_reply ? (
              <div className="p-3 bg-slate-900 rounded-xl border-l-2 border-amber-500 text-xs">
                <span className="font-bold text-amber-400">Your Response:</span>
                <p className="text-slate-300 italic mt-0.5">{rev.owner_reply}</p>
              </div>
            ) : replyingId === rev.id ? (
              <div className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your public response..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setReplyingId(null)} className="px-3 py-1 text-xs text-slate-400">Cancel</button>
                  <button onClick={() => handleSendReply(rev.id)} className="px-4 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs">Post Reply</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setReplyingId(rev.id); setReplyText(''); }}
                className="text-xs text-amber-400 font-bold hover:underline"
              >
                Reply to this review
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShopBillingManager({ billing = {}, onRefresh }) {
  const { 
    active_subscription = null, 
    history = [], 
    payments = [], 
    invoices = [], 
    payment_instructions = {}, 
    shop_status = 'pending_payment' 
  } = (billing || {});

  const monthlyPrice = Number(payment_instructions?.monthly_price) || 350;
  const gcashName = payment_instructions?.gcash_account_name || 'BarberMap Inc.';
  const gcashNumber = payment_instructions?.gcash_account_number || '0917-888-2272';
  const mayaName = payment_instructions?.maya_account_name || 'BarberMap Inc.';
  const mayaNumber = payment_instructions?.maya_account_number || '0918-999-3383';
  
  const [payMethod, setPayMethod] = useState('GCash');
  const [refNumber, setRefNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      alert('Please attach your payment receipt screenshot image.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('payment_method', payMethod);
      formData.append('amount', monthlyPrice);
      formData.append('reference_number', refNumber);
      formData.append('payment_date', new Date().toISOString().split('T')[0]);
      formData.append('receipt', receiptFile);

      await axios.post('/api/owner/billing/payment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg('Payment submitted successfully! Waiting for administrator approval.');
      setRefNumber('');
      setReceiptFile(null);
      setReceiptPreview('');
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit payment receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header Plan Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171b26] to-[#12151e] border border-amber-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Current Listing Status</span>
          <h2 className="text-2xl font-black text-white mt-1">BarberMap Pro Monthly</h2>
          <p className="text-xs text-slate-400 mt-1">
            ₱{monthlyPrice} / month • Interactive Map Pin • Mini-Website Landing Page • Booking System
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
            shop_status === 'active' 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {(shop_status || 'pending_payment').replace('_', ' ')}
          </span>
          {active_subscription && (
            <p className="text-[11px] text-slate-400 mt-2">
              Valid until: <strong className="text-white">{new Date(active_subscription.expires_at).toLocaleDateString()}</strong>
            </p>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}>✕</button>
        </div>
      )}

      {/* Payment Step Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Step 1: Receiving Details */}
        <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 space-y-4 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</div>
            <h3 className="font-bold text-sm text-white">Step 1: Send ₱{monthlyPrice} Payment</h3>
          </div>

          <p className="text-xs text-slate-400">
            Please transfer the monthly subscription fee of <strong className="text-amber-400">₱{monthlyPrice}</strong> to our verified administrator payment accounts:
          </p>

          <div className="space-y-3">
            {/* GCash */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-400">GCash Transfer</span>
                <span className="text-[10px] text-slate-400 font-bold">₱{monthlyPrice}</span>
              </div>
              <p className="text-xs text-white font-semibold">Account Name: {gcashName}</p>
              <p className="text-sm font-black text-amber-400 tracking-wider">{gcashNumber}</p>
            </div>

            {/* Maya */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-400">Maya Transfer</span>
                <span className="text-[10px] text-slate-400 font-bold">₱{monthlyPrice}</span>
              </div>
              <p className="text-xs text-white font-semibold">Account Name: {mayaName}</p>
              <p className="text-sm font-black text-amber-400 tracking-wider">{mayaNumber}</p>
            </div>
          </div>
        </div>

        {/* Step 2: Submit Receipt Form */}
        <div className="p-6 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</div>
            <h3 className="font-bold text-sm text-white">Step 2: Submit Receipt for Verification</h3>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-semibold">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmitPayment} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method Used</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="GCash">GCash</option>
                <option value="Maya">Maya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reference Number</label>
              <input
                type="text"
                required
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. GC-9928174620"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Receipt Screenshot Image</label>
              
              <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-900/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  required={!receiptFile}
                />
                {receiptPreview ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img 
                      src={receiptPreview} 
                      alt="Receipt Preview" 
                      className="h-28 max-w-full object-contain rounded-lg border border-slate-700 shadow"
                    />
                    <span className="text-[11px] text-amber-400 font-semibold underline">Click to change attached receipt</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-1.5 py-2">
                    <Upload className="w-6 h-6 text-amber-400" />
                    <p className="text-xs text-slate-200 font-medium">Click to browse & upload receipt</p>
                    <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP (Max 10MB)</p>
                  </div>
                )}
              </label>

              {receiptFile && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Attached: <span className="font-semibold text-white">{receiptFile.name}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-transform active:scale-98"
            >
              {submitting ? 'Submitting Receipt...' : 'Submit Payment for Admin Review'}
            </button>
          </form>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-amber-400" />
          Official Invoices & Billing History ({invoices?.length || 0})
        </h3>

        <div className="bg-[#131720] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Billing Period</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method & Ref</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Invoice View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(!invoices || invoices.length === 0) ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No invoices generated yet.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-white">{inv.invoice_number}</td>
                      <td className="p-4">
                        {new Date(inv.billing_period_start).toLocaleDateString()} - {new Date(inv.billing_period_end).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-bold text-amber-400">₱{inv.amount}</td>
                      <td className="p-4">{inv.payment_method} ({inv.reference_number})</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => window.open(`/invoice/${inv.invoice_number}`, '_blank')}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <span>Print / View</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
