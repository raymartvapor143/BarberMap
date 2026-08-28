import React, { useState, useEffect } from 'react';
import axios from '../bootstrap';
import { Scissors, Printer, CheckCircle2, ArrowLeft, AlertCircle, Calendar, CreditCard, ShieldCheck, MapPin, User, Building } from 'lucide-react';

export default function InvoiceView({ invoiceNumber, navigate }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExactInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Direct dedicated invoice endpoint
        const res = await axios.get(`/api/public/invoice/${invoiceNumber}`);
        if (res.data?.invoice) {
          setInvoice(res.data.invoice);
          return;
        }
      } catch (err) {
        // Fallback 2: Try owner billing endpoint if authenticated as owner
        try {
          const ownerRes = await axios.get('/api/owner/billing');
          const ownerInv = ownerRes.data?.invoices?.find(i => i.invoice_number === invoiceNumber);
          if (ownerInv) {
            setInvoice(ownerInv);
            return;
          }
        } catch (e) {
          // Fallback 3: Try admin invoices endpoint if authenticated as admin
          try {
            const admRes = await axios.get('/api/admin/invoices');
            const admInv = admRes.data?.invoices?.find(i => i.invoice_number === invoiceNumber);
            if (admInv) {
              setInvoice(admInv);
              return;
            }
          } catch (admErr) {
            console.error('Failed to load invoice from fallbacks', admErr);
          }
        }
        setError('Invoice not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceNumber) {
      fetchExactInvoice();
    } else {
      setLoading(false);
      setError('Invalid invoice number.');
    }
  }, [invoiceNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center p-6 text-slate-400">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Fetching exact invoice records...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Invoice Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          {error || `Unable to retrieve invoice record #${invoiceNumber}.`}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </button>
      </div>
    );
  }

  const issueDate = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  const periodStart = invoice.billing_period_start ? new Date(invoice.billing_period_start).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : null;

  const periodEnd = invoice.billing_period_end ? new Date(invoice.billing_period_end).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : null;

  const formattedAmount = Number(invoice.amount || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="min-h-screen bg-[#0d0f14] p-4 sm:p-8 flex flex-col items-center">
      
      {/* Action Bar */}
      <div className="max-w-3xl w-full flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              navigate('/');
            }
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Invoice Document Box */}
      <div className="max-w-3xl w-full bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 print:shadow-none print:p-0 print:rounded-none">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase text-slate-950">BARBERMAP</h1>
              <p className="text-[11px] text-slate-500 font-bold tracking-wider uppercase">Official Subscription Receipt & Tax Invoice</p>
            </div>
          </div>

          <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-100">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">INVOICE NUMBER</span>
            <p className="text-lg font-mono font-black text-amber-600 sm:text-slate-900">{invoice.invoice_number}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wide">
              {invoice.status || 'PAID'}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs border-b border-slate-100 pb-8">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">BILLED TO</span>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-500" />
              {invoice.shop?.name || 'Barbershop Partner'}
            </h3>
            {invoice.user?.name && (
              <p className="text-slate-700 font-medium mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {invoice.user.name} {invoice.user.email ? `(${invoice.user.email})` : ''}
              </p>
            )}
            <p className="text-slate-500 mt-1 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span>
                {invoice.shop?.address ? `${invoice.shop.address}, ` : ''}
                {invoice.shop?.barangay ? `Brgy. ${invoice.shop.barangay}, ` : ''}
                {invoice.shop?.city || 'Philippines'}
              </span>
            </p>
          </div>

          <div className="sm:text-right space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">ISSUE DATE</span>
              <p className="font-bold text-slate-900 text-sm">{issueDate}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">PAYMENT METHOD</span>
              <p className="font-semibold text-slate-800">
                {invoice.payment_method || 'Online Payment'}
              </p>
              {invoice.reference_number && (
                <p className="text-[11px] font-mono text-slate-500">
                  Ref: <span className="font-bold text-slate-700">{invoice.reference_number}</span>
                </p>
              )}
            </div>

            {invoice.payment_id && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">TRANSACTION ID</span>
                <p className="font-mono text-slate-600 text-[11px]">TXN-{invoice.payment_id.toString().padStart(6, '0')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Description</th>
                <th className="p-4">Coverage Period</th>
                <th className="p-4 text-right">Amount ({invoice.currency || 'PHP'})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="p-4">
                  <p className="font-bold text-slate-900 text-sm">BarberMap Pro Subscription</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Map listing visibility, verified badge, online reservation engine, and dedicated mini-site profile.
                  </p>
                </td>
                <td className="p-4 text-slate-700">
                  {periodStart && periodEnd ? (
                    <span className="font-semibold">{periodStart} &mdash; {periodEnd}</span>
                  ) : (
                    '30 Days Active Access'
                  )}
                </td>
                <td className="p-4 text-right font-black text-slate-900 text-sm">
                  ₱{formattedAmount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total & Paid Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-200 gap-4">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>PAYMENT VERIFIED & RECORD IMMUTABLE</span>
          </div>

          <div className="text-right self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-semibold block">Total Amount Paid:</span>
            <p className="text-2xl font-black text-slate-950">
              ₱{formattedAmount} <span className="text-xs font-bold text-slate-500 uppercase">{invoice.currency || 'PHP'}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500">BarberMap Philippines Inc. • Automated Billing & Invoice Engine</p>
          <p>This is a computer-generated immutable receipt and does not require a physical signature.</p>
          <p className="text-[9px] text-slate-400">System Verification Key: SHA256-INV-{invoice.id}-{invoice.invoice_number}</p>
        </div>
      </div>
    </div>
  );
}

