import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Scissors, Lock, Mail, User, Phone, MapPin, Store, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthPortal({ initialMode = 'login', navigate }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [role, setRole] = useState('shop_owner'); // shop_owner or customer

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phone, setPhone] = useState('');
  
  // Shop specific registration fields
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCity, setShopCity] = useState('Metro Manila');
  const [shopBarangay, setShopBarangay] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.user.role === 'shop_owner') {
          navigate('/owner/dashboard');
        } else if (['super_admin', 'admin', 'moderator', 'payment_admin'].includes(res.user.role)) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        const payload = {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          phone,
          role,
        };

        if (role === 'shop_owner') {
          payload.shop_name = shopName;
          payload.shop_address = shopAddress;
          payload.shop_city = shopCity;
          payload.shop_barangay = shopBarangay;
        }

        const res = await register(payload);
        if (role === 'shop_owner') {
          navigate('/owner/subscription');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstErr = Object.values(err.response.data.errors)[0][0];
        setError(firstErr);
      } else {
        setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start py-8 px-4 sm:px-6 md:px-8 bg-[#090b0f] relative overflow-y-auto overflow-x-hidden">
      
      {/* Background glowing gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-xl w-full bg-[#131720]/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl relative z-10 my-auto">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
            <Scissors className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {isLogin ? 'Welcome Back to BarberMap' : 'Create Your BarberMap Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLogin 
              ? 'Log in to manage your shop, check bookings, or access admin operations.' 
              : 'Join the premier map-first barber discovery network in the Philippines.'}
          </p>
        </div>

        {/* Demo Login Credentials Quick Pill */}
        {isLogin && (
          <div className="mb-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
            <p className="font-bold text-amber-400">🔑 Development Quick Credentials:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div 
                onClick={() => { setEmail('owner@barbermap.com'); setPassword('password123'); }}
                className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-700 cursor-pointer border border-slate-700/50"
              >
                <span className="font-semibold text-white">Active Shop Owner:</span>
                <p className="text-slate-400 truncate">owner@barbermap.com</p>
              </div>
              <div 
                onClick={() => { setEmail('admin@barbermap.com'); setPassword('password123'); }}
                className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-700 cursor-pointer border border-slate-700/50"
              >
                <span className="font-semibold text-white">Administrator:</span>
                <p className="text-slate-400 truncate">admin@barbermap.com</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-4">
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('shop_owner')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'shop_owner'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Barber Shop Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'customer'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Customer / Visitor
                  </button>
                </div>
              </div>

              {/* Owner Specific Shop Setup Fields */}
              {role === 'shop_owner' && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                    <Store className="w-4 h-4" />
                    <span>Barber Shop Details (₱350/mo subscription)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Barber Shop Name</label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Apex Cuts Studio"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={shopCity}
                        onChange={(e) => setShopCity(e.target.value)}
                        placeholder="e.g. Taguig"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Barangay</label>
                      <input
                        type="text"
                        value={shopBarangay}
                        onChange={(e) => setShopBarangay(e.target.value)}
                        placeholder="e.g. Fort Bonifacio"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder="e.g. 5th Ave cor 28th St"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0917-xxx-xxxx"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Please wait...' : (isLogin ? 'Log In to BarberMap' : 'Create Account & Continue')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="ml-2 font-bold text-amber-400 hover:underline"
            >
              {isLogin ? 'Register Here' : 'Log In Here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
