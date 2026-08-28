import React, { useState, useEffect } from 'react';
import axios from '../bootstrap';
import { 
  Star, MapPin, Phone, Mail, Clock, Calendar, Scissors, 
  CheckCircle2, Share2, AlertCircle, MessageSquare, 
  ChevronRight, ArrowLeft, Image as ImageIcon, Flame, Flag, X, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ShopLanding({ slug, navigate }) {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePortfolioTab, setActivePortfolioTab] = useState('All');
  
  // Reservation Modal State
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [reservationDate, setReservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [reservationNotes, setReservationNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review Submission Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Content Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('shop');
  const [reportId, setReportId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const [isLive, setIsLive] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchShop = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/public/shop/${slug}`);
      setShop(res.data.shop);
      setIsLive(res.data.is_live);
      setPreviewMode(Boolean(res.data.preview_mode));
      if (res.data.shop.services?.length > 0) {
        setSelectedService(res.data.shop.services[0]);
      }
    } catch (e) {
      setShop(null);
      setErrorMessage(e.response?.data?.message || 'This barber shop is currently disabled, pending verification, or unlisted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchShop();
  }, [slug]);

  // Fetch Available Slots when service or date changes
  const fetchSlots = async () => {
    if (!shop || !selectedService || !reservationDate) return;
    setSlotsLoading(true);
    setSelectedSlot('');
    try {
      const res = await axios.get(`/api/public/shop/${shop.id}/available-slots`, {
        params: {
          service_id: selectedService.id,
          date: reservationDate,
        }
      });
      setAvailableSlots(res.data.slots || []);
    } catch (e) {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (isReserveModalOpen) {
      fetchSlots();
    }
  }, [isReserveModalOpen, selectedService, reservationDate]);

  const handleMakeReservation = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please select an available appointment time slot.');
      return;
    }
    setBookingError('');
    setIsSubmitting(true);
    try {
      const res = await axios.post(`/api/public/shop/${shop.id}/reserve`, {
        shop_service_id: selectedService.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        reservation_date: reservationDate,
        start_time: selectedSlot,
        notes: reservationNotes,
      });

      setBookingSuccess(res.data);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to confirm reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await axios.post(`/api/public/shop/${shop.id}/reviews`, {
        customer_name: reviewerName,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      fetchShop();
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
        setReviewComment('');
      }, 1500);
    } catch (e) {
      alert('Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/public/report', {
        reportable_type: reportType,
        reportable_id: reportId || shop.id,
        reporter_email: reporterEmail,
        reason: reportReason,
      });
      setReportSent(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSent(false);
        setReportReason('');
      }, 1500);
    } catch (e) {
      alert('Failed to submit report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d12] flex items-center justify-center text-slate-400">
        <Scissors className="w-10 h-10 text-amber-500 animate-spin mb-4" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#0b0d12] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
          <Scissors className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Shop Unavailable</h2>
        <p className="text-slate-400 max-w-md mb-6">{errorMessage || 'This barber shop is currently disabled, pending subscription verification, or unlisted.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
        >
          Explore Active Barber Shops
        </button>
      </div>
    );
  }

  const portfolioCategories = ['All', 'Fade', 'Classic', 'Beard', 'Crop', 'Kids'];
  const filteredPortfolio = activePortfolioTab === 'All' 
    ? shop.portfolio || [] 
    : (shop.portfolio || []).filter(item => item.category === activePortfolioTab);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 pb-20">
      
      {/* PREVIEW MODE BANNER FOR OWNER/ADMIN */}
      {previewMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-black tracking-wide flex items-center justify-center gap-2 sticky top-16 z-40 shadow-md">
          <AlertCircle className="w-4 h-4" />
          <span>PREVIEW MODE: This shop is currently disabled / inactive and is NOT visible to public users or clients on the map.</span>
        </div>
      )}
      
      {/* 1. HERO SECTION & BRANDING */}
      <div className="relative h-96 lg:h-[480px] w-full overflow-hidden bg-slate-900">
        <img
          src={shop.cover_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80'}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/60 to-black/30"></div>

        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 text-white text-xs font-semibold flex items-center gap-2 border border-white/10 shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            Back to Map
          </button>
        </div>

        {/* Floating Brand Bar */}
        <div className="absolute bottom-8 left-4 right-4 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
          <div className="flex items-end gap-5">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-[#161a22] border-4 border-[#0b0e14] shadow-2xl flex-shrink-0">
              <img
                src={shop.logo_url || shop.cover_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80'}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active & Verified
                </span>
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {shop.barangay ? `${shop.barangay}, ` : ''}{shop.city}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{shop.name}</h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1">{shop.tagline}</p>

              {/* Ratings */}
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{(Number(shop.rating_avg) || 0).toFixed(1)}</span>
                  <span className="text-slate-300 font-normal">({shop.reviews_count || 0} reviews)</span>
                </div>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300 font-semibold">Starting from <span className="text-amber-400">₱{Number(shop.starting_price) || 0}</span></span>
              </div>
            </div>
          </div>

          {/* Reserve CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReserveModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/25 transition-transform active:scale-95 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Reserve Appointment Now
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: shop.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Shop URL copied to clipboard!');
                }
              }}
              className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Share Shop"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLUMNS: Story, CMS Posts, Portfolio, Services, Gallery, Reviews */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* About / Story Section */}
          <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              About Our Shop & Philosophy
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {shop.description || 'Welcome to our barber shop. We deliver premium grooming and haircuts with utmost attention to detail.'}
            </p>
          </div>

          {/* Featured CMS Posts (Owner-Managed Announcements & Promos) */}
          {shop.posts && shop.posts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  Latest News & Promotions
                </h2>
                <span className="text-xs text-slate-400 font-medium">Owner Updates</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(shop.posts || []).map((post) => (
                  <div key={post.id} className="bg-[#131720] rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col shadow-lg">
                    {post.images && post.images.length > 0 && (
                      <div className="h-44 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={post.images[0].url}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            post.post_type === 'Promotion' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {post.post_type}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(post.published_at || post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm leading-snug mb-1">{post.title}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{post.content}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setReportType('shop_post');
                          setReportId(post.id);
                          setIsReportModalOpen(true);
                        }}
                        className="mt-3 text-[11px] text-slate-500 hover:text-slate-400 flex items-center gap-1 self-end"
                      >
                        <Flag className="w-3 h-3" /> Report post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services & Pricing Menu */}
          <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-amber-400" />
                  Services & Pricing
                </h2>
                <p className="text-xs text-slate-400">Choose a service and reserve your dedicated chair time.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {(shop.services || []).map((srv) => (
                <div key={srv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">{srv.name}</h3>
                      <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-slate-400" /> {srv.duration_minutes} mins
                      </span>
                    </div>
                    {srv.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{srv.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto flex-shrink-0">
                    <span className="text-lg font-black text-amber-400">₱{srv.price}</span>
                    <button
                      onClick={() => {
                        setSelectedService(srv);
                        setIsReserveModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs border border-amber-500/30 transition-all active:scale-95"
                    >
                      Reserve Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Haircut Portfolio Gallery */}
          <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  Haircut Portfolio & Styles
                </h2>
                <p className="text-xs text-slate-400">Real cuts crafted by our master barbers.</p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
                {(portfolioCategories || []).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActivePortfolioTab(cat)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      activePortfolioTab === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredPortfolio.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No portfolio photos in this category yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredPortfolio.map((item) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden bg-slate-900 aspect-square shadow-md border border-slate-800">
                    <img
                      src={item.url}
                      alt={item.title || 'Haircut'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-xs font-bold text-white leading-tight">{item.title || item.category}</p>
                      <span className="text-[10px] text-amber-400">{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Reviews & Feedback */}
          <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Verified Reviews & Ratings ({shop.reviews?.length || 0})
                </h2>
                <p className="text-xs text-slate-400">Authentic client feedback.</p>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Write a Review
              </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {(!shop.reviews || shop.reviews.length === 0) ? (
                <p className="text-xs text-slate-500 py-6 text-center">Be the first to review {shop.name}!</p>
              ) : (
                shop.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-[#171b26] border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center">
                          {rev.customer_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white leading-none">{rev.customer_name}</p>
                          <span className="text-[11px] text-slate-500">{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{rev.comment}</p>

                    {/* Owner Official Response */}
                    {rev.owner_reply && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-900/90 border-l-2 border-amber-500 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <Scissors className="w-3 h-3" />
                          <span>Owner Response</span>
                        </div>
                        <p className="text-slate-300 italic">{rev.owner_reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: Contact, Business Hours & Location Pin */}
        <div className="space-y-6">
          
          {/* Quick Reserve Widget Card */}
          <div className="bg-gradient-to-b from-[#1c2230] to-[#131720] rounded-2xl p-6 border border-amber-500/30 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-white">Book Your Cut</h3>
            <p className="text-xs text-slate-300">Skip the queue. Reserve your guaranteed chair slot online.</p>

            <button
              onClick={() => setIsReserveModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>
          </div>

          {/* Business Hours */}
          <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Business Hours
            </h3>

            <div className="space-y-2 text-xs">
              {(shop.hours || []).map((h) => {
                const dayName = daysOfWeek[h.day_of_week];
                const isToday = new Date().getDay() === h.day_of_week;

                return (
                  <div key={h.id} className={`flex items-center justify-between py-1 px-2 rounded ${
                    isToday ? 'bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20' : 'text-slate-300'
                  }`}>
                    <span>{dayName}</span>
                    <span>
                      {h.is_closed ? (
                        <span className="text-red-400 font-semibold">Closed</span>
                      ) : (
                        `${h.open_time.slice(0, 5)} - ${h.close_time.slice(0, 5)}`
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Directions */}
          <div className="bg-[#131720] rounded-2xl p-6 border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Location & Contact
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{shop.address}, {shop.city}</span>
              </p>
              {shop.location?.plus_code && (
                <p className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700">Plus Code</span>
                  <span className="text-slate-200 font-mono text-[11px]">{shop.location.plus_code}</span>
                </p>
              )}
              {shop.location?.latitude && shop.location?.longitude && (
                <p className="text-[11px] text-slate-400 font-mono pl-6">
                  📍 {Number(shop.location.latitude).toFixed(6)}, {Number(shop.location.longitude).toFixed(6)}
                </p>
              )}
              {shop.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{shop.phone}</span>
                </p>
              )}
              {shop.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{shop.email}</span>
                </p>
              )}
            </div>

            {/* Exact GPS Directions Link */}
            {(() => {
              let mapUrl = '';
              if (shop.location?.latitude && shop.location?.longitude) {
                mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.location.latitude},${shop.location.longitude}`;
              } else if (shop.location?.plus_code) {
                mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.location.plus_code)}`;
              } else {
                mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${shop.name}, ${shop.address}, ${shop.city}`)}`;
              }

              return (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Get Directions (Exact GPS)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              );
            })()}
          </div>
        </div>
      </div>

      {/* 2. RESERVATION BOOKING MODAL */}
      {isReserveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151923] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Reserve an Appointment</h3>
                <p className="text-xs text-slate-400">{shop.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsReserveModalOpen(false);
                  setBookingSuccess(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white">Appointment Confirmed!</h4>
                <div className="bg-slate-900/90 rounded-xl p-4 text-xs text-slate-300 text-left space-y-2 border border-slate-800">
                  <p><strong className="text-white">Customer:</strong> {bookingSuccess.reservation.customer_name}</p>
                  <p><strong className="text-white">Service:</strong> {bookingSuccess.service_name}</p>
                  <p><strong className="text-white">Date:</strong> {bookingSuccess.formatted_date}</p>
                  <p><strong className="text-white">Time:</strong> {bookingSuccess.formatted_time}</p>
                  <p><strong className="text-white">Total:</strong> ₱{bookingSuccess.reservation.total_price}</p>
                </div>
                <button
                  onClick={() => {
                    setIsReserveModalOpen(false);
                    setBookingSuccess(null);
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleMakeReservation} className="space-y-4 pt-4">
                {bookingError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Service</label>
                  <select
                    value={selectedService?.id || ''}
                    onChange={(e) => {
                      const s = shop.services.find(x => x.id === parseInt(e.target.value));
                      setSelectedService(s);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  >
                    {(shop.services || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — ₱{s.price} ({s.duration_minutes} mins)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Appointment Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                {/* Available Slot Chips */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Available Time Slots</label>
                  {slotsLoading ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Checking slot availability...</p>
                  ) : (!availableSlots || availableSlots.length === 0) ? (
                    <p className="text-xs text-amber-400 py-2 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      No available slots on this date (shop may be closed or fully booked).
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                      {(availableSlots || []).map((slot) => {
                        const isChosen = selectedSlot === slot.start_time;
                        return (
                          <button
                            type="button"
                            key={slot.start_time}
                            onClick={() => setSelectedSlot(slot.start_time)}
                            className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition-all ${
                              isChosen
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                                : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:border-slate-600'
                            }`}
                          >
                            {slot.start_time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Juan Ramos"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0917-xxx-xxxx"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="juan@example.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Special Cut Notes / Requests (Optional)</label>
                  <input
                    type="text"
                    value={reservationNotes}
                    onChange={(e) => setReservationNotes(e.target.value)}
                    placeholder="e.g. Low drop skin fade, preserve length on top"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Total Price:</span>
                    <p className="text-lg font-black text-amber-400">₱{selectedService?.price || 0}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedSlot}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. REVIEW SUBMISSION MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151923] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Write a Review for {shop.name}</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="py-8 text-center text-emerald-400 font-bold text-sm">
                Thank you! Your review has been published.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Display Name</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Christian G."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Experience & Feedback</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about the barber haircut precision, atmosphere, cleanliness, etc."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  {reviewSubmitting ? 'Posting Review...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. MODERATION REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151923] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Report Inappropriate Content</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSent ? (
              <div className="py-8 text-center text-emerald-400 font-bold text-sm">
                Report submitted. Platform moderators will review this item.
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Report</label>
                  <textarea
                    required
                    rows={4}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Please explain why this content violates platform guidelines..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Email (Optional)</label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="reporter@example.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Submit Report to Admin
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
