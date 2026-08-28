import React, { useState, useEffect } from 'react';
import axios from '../bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, CheckCircle2, XCircle, AlertCircle, Store, 
  CreditCard, Settings, Users, MapPin, Flag, FileText, 
  History, DollarSign, Eye, Search, Check, X, RefreshCw,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminDashboard({ tab = 'dashboard', navigate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(tab);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  // Admin Navigation tabs
  const adminNav = [
    { id: 'dashboard', label: 'Platform Overview', icon: Shield },
    { id: 'payments', label: 'Payment Verification', icon: CreditCard },
    { id: 'shops', label: 'Shop Management', icon: Store },
    { id: 'locations', label: 'Map Pin Moderation', icon: MapPin },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'reports', label: 'Content Reports', icon: Flag },
    { id: 'billing', label: 'Billing Settings', icon: DollarSign },
    { id: 'logs', label: 'Admin Activity Logs', icon: History },
  ];

  const fetchAdminData = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (activeTab === 'dashboard') {
        const res = await axios.get('/api/admin/dashboard');
        setData(res.data);
      } else if (activeTab === 'payments') {
        const res = await axios.get('/api/admin/payments');
        setData(res.data);
      } else if (activeTab === 'shops') {
        const res = await axios.get('/api/admin/shops');
        setData(res.data);
      } else if (activeTab === 'locations') {
        const res = await axios.get('/api/admin/locations');
        setData(res.data);
      } else if (activeTab === 'users') {
        const res = await axios.get('/api/admin/users');
        setData(res.data);
      } else if (activeTab === 'reports') {
        const res = await axios.get('/api/admin/reports');
        setData(res.data);
      } else if (activeTab === 'billing') {
        const res = await axios.get('/api/admin/billing-settings');
        setData(res.data);
      } else if (activeTab === 'logs') {
        const res = await axios.get('/api/admin/logs');
        setData(res.data.data || res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b0e14] text-slate-100 flex flex-col md:flex-row relative">
      
      {/* MOBILE ADMIN TOP BAR */}
      <div className="md:hidden bg-[#0e1117] border-b border-slate-800/80 p-3.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white truncate">Super Admin Control</h2>
            <span className="text-[10px] text-rose-400 font-semibold uppercase">{activeTab}</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[#161b26] border border-slate-700/80 text-rose-400 font-bold text-xs flex items-center gap-1.5 shadow-md"
        >
          <span>Admin Menu</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* MOBILE OVERLAY BACKDROP */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in"
        />
      )}

      {/* ADMIN SIDEBAR (Desktop: Collapsible Mini-rail / Full | Mobile: Slide-over Drawer) */}
      <aside 
        className={`bg-[#0e1117] border-r border-slate-800/80 flex flex-col justify-between flex-shrink-0 z-40 transition-all duration-300 ease-in-out ${
          // Desktop Width: 72px when collapsed, 260px when expanded
          sidebarCollapsed ? 'md:w-[72px] md:p-3' : 'md:w-64 md:p-4'
        } ${
          // Mobile responsive slide-over drawer
          mobileMenuOpen 
            ? 'fixed inset-y-0 left-0 w-72 p-4 shadow-2xl flex translate-x-0' 
            : 'hidden md:flex'
        }`}
      >
        <div className="space-y-4">
          
          {/* Header Tag */}
          <div className={`p-3 bg-[#11151f] rounded-2xl border border-slate-800 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Super Admin Area</span>
                <h3 className="text-xs font-bold text-white truncate">BarberMap Control Center</h3>
              </div>
            )}

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-colors"
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

          <nav className="space-y-1">
            {adminNav.map((item) => {
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
                      ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {!sidebarCollapsed && (
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            <p>Logged in as <strong className="text-slate-300">{user?.name}</strong></p>
          </div>
        )}
      </aside>

      {/* MAIN ADMIN CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
        
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Shield className="w-10 h-10 text-rose-500 animate-spin mb-4" />
            <p className="text-xs">Loading admin records...</p>
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW DASHBOARD */}
            {activeTab === 'dashboard' && data && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white">Platform Operations & Metrics</h1>
                  <p className="text-xs text-slate-400">Real-time statistics across discovery, subscriptions, and shop operations.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-lg">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Active Live Shops</span>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{data?.stats?.active_shops ?? 0}</p>
                    <span className="text-[10px] text-slate-500">Total registered: {data?.stats?.total_shops ?? 0}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-lg">
                    <span className="text-[11px] font-bold uppercase text-amber-400">Pending Payments</span>
                    <p className="text-2xl font-black text-amber-400 mt-1">{data?.stats?.pending_payments ?? 0}</p>
                    <span className="text-[10px] text-slate-500">Needs verification</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-lg">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Monthly Revenue</span>
                    <p className="text-2xl font-black text-white mt-1">₱{(Number(data?.stats?.monthly_revenue) || 0).toLocaleString()}</p>
                    <span className="text-[10px] text-emerald-400">Subscriptions this month</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800/80 shadow-lg">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Total Bookings</span>
                    <p className="text-2xl font-black text-blue-400 mt-1">{data?.stats?.total_reservations ?? 0}</p>
                    <span className="text-[10px] text-slate-500">Client appointments</span>
                  </div>
                </div>

                {/* Quick Queues */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Recent Payments Pending */}
                  <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        Recent Payment Submissions
                      </h3>
                      <button onClick={() => setActiveTab('payments')} className="text-xs text-amber-400 hover:underline">
                        Open Verification Queue
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(!data?.recent_payments || data.recent_payments.length === 0) ? (
                        <p className="text-xs text-slate-500 py-3">No recent payment submissions.</p>
                      ) : (
                        data.recent_payments.map((p) => (
                          <div key={p.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-white">{p.shop?.name}</p>
                              <p className="text-slate-400">{p.payment_method} • Ref: {p.reference_number}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-amber-400">₱{p.amount}</span>
                              <p className="text-[10px] uppercase font-semibold text-slate-400">{p.status}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-rose-400" />
                        Recent Admin Audit Logs
                      </h3>
                      <button onClick={() => setActiveTab('logs')} className="text-xs text-rose-400 hover:underline">
                        View All Logs
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {(!data?.recent_logs || data.recent_logs.length === 0) ? (
                        <p className="text-xs text-slate-500 py-3">No recent activity logs.</p>
                      ) : (
                        data.recent_logs.map((log) => (
                          <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                            <p className="text-white font-medium">{log.action}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                              <span>By: {log.admin?.name}</span>
                              <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PAYMENT VERIFICATION QUEUE */}
            {activeTab === 'payments' && data && (
              <AdminPaymentVerification 
                payments={data.payments} 
                onRefresh={fetchAdminData}
                setMessage={setMessage}
              />
            )}

            {/* 3. SHOP MANAGEMENT */}
            {activeTab === 'shops' && data && (
              <AdminShopsManager 
                shops={data.shops} 
                onRefresh={fetchAdminData}
                setMessage={setMessage}
              />
            )}

            {/* 4. MAP LOCATIONS MODERATION */}
            {activeTab === 'locations' && data && (
              <AdminLocationsManager 
                locations={data.locations} 
                onRefresh={fetchAdminData}
                setMessage={setMessage}
              />
            )}

            {/* 5. USER MANAGEMENT */}
            {activeTab === 'users' && data && (
              <AdminUsersManager 
                users={data.users} 
                onRefresh={fetchAdminData}
                setMessage={setMessage}
              />
            )}

            {/* 6. CONTENT REPORTS */}
            {activeTab === 'reports' && data && (
              <AdminReportsManager 
                reports={data.reports} 
                onRefresh={fetchAdminData}
                setMessage={setMessage}
              />
            )}

            {/* 7. BILLING & PAYMENT SETTINGS */}
            {activeTab === 'billing' && data && (
              <AdminBillingConfig 
                settings={data} 
                onRefresh={fetchAdminData}
                setMessage={setMessage}
              />
            )}

            {/* 8. AUDIT LOGS */}
            {activeTab === 'logs' && data && (
              <AdminLogsViewer logs={data.data || data} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENTS FOR ADMIN PANEL
// -------------------------------------------------------------

function AdminPaymentVerification({ payments, onRefresh, setMessage }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async (id) => {
    if (!confirm('Approve this subscription payment? This will immediately activate the shop on the public map and generate an immutable invoice.')) return;
    setProcessing(true);
    try {
      const res = await axios.post(`/api/admin/payments/${id}/verify`, { action: 'approve' });
      setMessage(res.data.message);
      confetti({ particleCount: 70, spread: 60 });
      onRefresh();
    } catch (e) {
      alert('Failed to approve payment.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await axios.post(`/api/admin/payments/${rejectModal}/verify`, {
        action: 'reject',
        rejection_reason: rejectReason,
      });
      setMessage(res.data.message);
      setRejectModal(null);
      setRejectReason('');
      onRefresh();
    } catch (e) {
      alert('Failed to reject payment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          Subscription Payment Verification Queue ({payments?.length || 0})
        </h2>
        <p className="text-xs text-slate-400">
          Rule: Shops stay hidden from the discovery map until their ₱350/mo subscription receipt is approved by an admin.
        </p>
      </div>

      <div className="bg-[#131720] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Barber Shop</th>
                <th className="p-4">Owner Name</th>
                <th className="p-4">Method & Ref</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Receipt</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(!payments || payments.length === 0) ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">No payment submissions in queue.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-white">{p.shop?.name}</td>
                    <td className="p-4">{p.user?.name}</td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-200">{p.payment_method}</span>
                      <p className="text-[11px] text-slate-500">Ref: {p.reference_number}</p>
                    </td>
                    <td className="p-4 font-black text-amber-400">₱{p.amount}</td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedReceipt(p.receipt_url)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Receipt
                      </button>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        p.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400 animate-pulse'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={processing}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow"
                          >
                            Approve & Go Live
                          </button>
                          <button
                            onClick={() => setRejectModal(p.id)}
                            disabled={processing}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Image Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#151923] border border-slate-700 rounded-2xl max-w-lg w-full p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Payment Receipt Preview</h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto rounded-xl bg-black">
              <img src={selectedReceipt} alt="Receipt" className="w-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleReject} className="bg-[#151923] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Reject Payment Submission</h3>
            <p className="text-xs text-slate-400">Please provide a reason so the shop owner can re-submit a valid receipt.</p>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Reference number does not match receipt transaction / blur screenshot."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectModal(null)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-red-600 text-white font-bold rounded-xl text-xs">Confirm Rejection</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function AdminShopsManager({ shops, onRefresh, setMessage }) {
  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.post(`/api/admin/shops/${id}/status`, { status });
      setMessage(res.data.message);
      onRefresh();
    } catch (e) {
      alert('Failed to update shop status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Store className="w-5 h-5 text-amber-400" />
          All Platform Barber Shops ({shops?.length || 0})
        </h2>
        <p className="text-xs text-slate-400">Manage all registered shops, view subscription statuses, and toggle suspension.</p>
      </div>

      <div className="bg-[#131720] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Shop Name</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Location</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(shops || []).map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-800/40">
                  <td className="p-4">
                    <p className="font-bold text-white">{shop.name}</p>
                    <a href={`/shop/${shop.slug}`} target="_blank" className="text-[10px] text-amber-400 hover:underline">
                      /shop/{shop.slug}
                    </a>
                  </td>
                  <td className="p-4">{shop.user?.name}</td>
                  <td className="p-4">{shop.city}</td>
                  <td className="p-4 font-bold text-amber-400">{shop.rating_avg} ({shop.reviews_count})</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      shop.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      shop.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {shop.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    {shop.status === 'active' ? (
                      <button onClick={() => handleStatusChange(shop.id, 'suspended')} className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 font-bold hover:bg-red-500/30">
                        Suspend
                      </button>
                    ) : (
                      <button onClick={() => handleStatusChange(shop.id, 'active')} className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30">
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminLocationsManager({ locations, onRefresh, setMessage }) {
  const handleToggle = async (id) => {
    try {
      const res = await axios.post(`/api/admin/locations/${id}/toggle-marker`);
      setMessage(res.data.message);
      onRefresh();
    } catch (e) {
      alert('Failed to update marker.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          Map Markers & Coordinate Moderation ({locations?.length || 0})
        </h2>
        <p className="text-xs text-slate-400">Emergency marker control to hide suspicious pins or duplicate coordinates.</p>
      </div>

      <div className="bg-[#131720] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Barber Shop</th>
              <th className="p-4">Coordinates (Lat, Lng)</th>
              <th className="p-4">Address</th>
              <th className="p-4">Marker Visibility</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(locations || []).map((loc) => (
              <tr key={loc.id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-white">{loc.shop?.name}</td>
                <td className="p-4 font-mono text-[11px] text-amber-400">{loc.latitude}, {loc.longitude}</td>
                <td className="p-4">{loc.formatted_address}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    loc.is_marker_visible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {loc.is_marker_visible ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleToggle(loc.id)} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold">
                    {loc.is_marker_visible ? 'Hide Pin' : 'Show Pin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminUsersManager({ users, onRefresh, setMessage }) {
  const handleStatus = async (id, status) => {
    try {
      const res = await axios.post(`/api/admin/users/${id}/status`, { status });
      setMessage(res.data.message);
      onRefresh();
    } catch (e) {
      alert('Failed to update user.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          User & Role Management ({users?.length || 0})
        </h2>
        <p className="text-xs text-slate-400">Manage administrator, owner, and customer accounts.</p>
      </div>

      <div className="bg-[#131720] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(users || []).map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-white">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold text-[10px] uppercase">
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {u.status === 'active' ? (
                    <button onClick={() => handleStatus(u.id, 'disabled')} className="px-2.5 py-1 bg-red-500/20 text-red-300 rounded font-bold hover:bg-red-500/30">
                      Disable
                    </button>
                  ) : (
                    <button onClick={() => handleStatus(u.id, 'active')} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded font-bold hover:bg-emerald-500/30">
                      Enable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminReportsManager({ reports, onRefresh, setMessage }) {
  const handleResolve = async (id, action) => {
    try {
      const res = await axios.post(`/api/admin/reports/${id}/resolve`, { action });
      setMessage(res.data.message);
      onRefresh();
    } catch (e) {
      alert('Failed to resolve report.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Flag className="w-5 h-5 text-amber-400" />
          Content Moderation Reports ({reports?.length || 0})
        </h2>
        <p className="text-xs text-slate-400">Review reported customer reviews, inappropriate shop posts, or spam.</p>
      </div>

      <div className="bg-[#131720] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Target Type</th>
              <th className="p-4">Report Reason</th>
              <th className="p-4">Reporter</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Moderator Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(!reports || reports.length === 0) ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No pending reports.</td>
              </tr>
            ) : (
              reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-amber-400 uppercase">{rep.reportable_type} #{rep.reportable_id}</td>
                  <td className="p-4 max-w-xs">{rep.reason}</td>
                  <td className="p-4">{rep.reporter_email || 'Anonymous'}</td>
                  <td className="p-4 font-bold uppercase">{rep.status}</td>
                  <td className="p-4 text-right space-x-1">
                    {rep.status === 'pending' && (
                      <>
                        <button onClick={() => handleResolve(rep.id, 'remove_content')} className="px-2.5 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-500">
                          Remove Violation
                        </button>
                        <button onClick={() => handleResolve(rep.id, 'dismiss')} className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded font-semibold hover:bg-slate-700">
                          Dismiss
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminBillingConfig({ settings, onRefresh, setMessage }) {
  const [formData, setFormData] = useState({
    subscription_price: settings.subscription_price || 350,
    plan_name: settings.plan_name || 'BarberMap Pro Monthly',
    gcash_enabled: settings.gcash_enabled ?? true,
    gcash_account_name: settings.gcash_account_name || 'BarberMap Inc.',
    gcash_account_number: settings.gcash_account_number || '0917-888-2272',
    maya_enabled: settings.maya_enabled ?? true,
    maya_account_name: settings.maya_account_name || 'BarberMap Inc.',
    maya_account_number: settings.maya_account_number || '0918-999-3383',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post('/api/admin/billing-settings', formData);
      setMessage(res.data.message);
      onRefresh();
    } catch (e) {
      alert('Failed to update billing configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-[#131720] rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-400" />
          Dynamic Billing & Payment Accounts Configuration
        </h2>
        <p className="text-xs text-slate-400">
          Modify the monthly subscription price or receiving GCash/Maya details at any time without changing application source code.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
        💡 <strong>Immutable Billing Rule:</strong> Changes made here only apply to new/future subscription payments. Historical invoices and receipts retain their original transaction values.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Subscription Fee (₱)</label>
          <input
            type="number"
            min="1"
            required
            value={formData.subscription_price}
            onChange={(e) => setFormData({ ...formData, subscription_price: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Display Name</label>
          <input
            type="text"
            required
            value={formData.plan_name}
            onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>
      </div>

      {/* GCash Settings */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-blue-400">GCash Account Details</span>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={formData.gcash_enabled}
              onChange={(e) => setFormData({ ...formData, gcash_enabled: e.target.checked })}
              className="rounded text-amber-500"
            />
            <span>Enabled</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Account Holder Name</label>
            <input
              type="text"
              required
              value={formData.gcash_account_name}
              onChange={(e) => setFormData({ ...formData, gcash_account_name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">GCash Mobile Number</label>
            <input
              type="text"
              required
              value={formData.gcash_account_number}
              onChange={(e) => setFormData({ ...formData, gcash_account_number: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* Maya Settings */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-emerald-400">Maya Account Details</span>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={formData.maya_enabled}
              onChange={(e) => setFormData({ ...formData, maya_enabled: e.target.checked })}
              className="rounded text-amber-500"
            />
            <span>Enabled</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Account Holder Name</label>
            <input
              type="text"
              required
              value={formData.maya_account_name}
              onChange={(e) => setFormData({ ...formData, maya_account_name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Maya Mobile Number</label>
            <input
              type="text"
              required
              value={formData.maya_account_number}
              onChange={(e) => setFormData({ ...formData, maya_account_number: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg"
        >
          {saving ? 'Saving...' : 'Save & Broadcast Billing Settings'}
        </button>
      </div>
    </form>
  );
}

function AdminLogsViewer({ logs }) {
  const logList = Array.isArray(logs) ? logs : (logs?.data || []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-rose-400" />
          Administrator Audit Logs
        </h2>
        <p className="text-xs text-slate-400">Complete audit trail of admin actions, payment approvals, suspensions, and price adjustments.</p>
      </div>

      <div className="bg-[#131720] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Admin</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
              <th className="p-4">IP Address</th>
              <th className="p-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
            {(!logList || logList.length === 0) ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No logs found.</td>
              </tr>
            ) : (
              logList.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-white font-sans">{log.admin?.name}</td>
                  <td className="p-4 font-sans text-slate-200">{log.action}</td>
                  <td className="p-4 text-amber-400">{log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}</td>
                  <td className="p-4 text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                  <td className="p-4 text-right text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
