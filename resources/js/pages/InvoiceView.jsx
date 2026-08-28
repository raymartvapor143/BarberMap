import React, { useState, useEffect } from 'react';
import axios from '../bootstrap';
import { Scissors, Printer, Download, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function InvoiceView({ invoiceNumber, navigate }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In our seed/api we can fetch invoices or simulate view
    const fetchInv = async () => {
      try {
        const res = await axios.get('/api/owner/billing');
        const inv = res.data.invoices?.find(i => i.invoice_number === invoiceNumber);
        if (inv) {
          setInvoice(inv);
        } else {
          // If viewing from admin
          const admRes = await axios.get('/api/admin/invoices');
          const admInv = admRes.data.invoices?.find(i => i.invoice_number === invoiceNumber);
          setInvoice(admInv);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInv();
  }, [invoiceNumber]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading invoice...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] p-4 sm:p-8 flex flex-col items-center">
      
      {/* Action Bar */}
      <div className="max-w-2xl w-full flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </button>

        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Invoice Document Box */}
      <div className="max-w-2xl w-full bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 print:shadow-none print:p-0 print:rounded-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase">BARBERMAP</h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Official Subscription Receipt</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-500">INVOICE NUMBER</span>
            <p className="text-base font-mono font-black text-slate-900">{invoiceNumber || 'INV-2026-000001'}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BILLED TO</span>
            <h3 className="font-extrabold text-sm text-slate-900 mt-1">{invoice?.shop?.name || 'Fresh Fade Barbershop'}</h3>
            <p className="text-slate-600 mt-0.5">{invoice?.user?.name || 'Juan Dela Cruz'}</p>
            <p className="text-slate-500">{invoice?.shop?.address || 'Bonifacio Global City, Taguig'}</p>
          </div>

          <div className="text-right space-y-1">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ISSUE DATE</span>
              <p className="font-semibold text-slate-800">{new Date(invoice?.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT METHOD</span>
              <p className="font-semibold text-slate-800">{invoice?.payment_method || 'GCash'} (Ref: {invoice?.reference_number || 'GC-9928174620'})</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Description</th>
                <th className="p-4">Coverage Period</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="p-4">
                  <p className="font-bold text-slate-900">BarberMap Monthly Pro Listing Subscription</p>
                  <p className="text-[11px] text-slate-500">Public map marker, dedicated landing page, online reservation system.</p>
                </td>
                <td className="p-4 text-slate-600">
                  {invoice ? `${new Date(invoice.billing_period_start).toLocaleDateString()} - ${new Date(invoice.billing_period_end).toLocaleDateString()}` : '30 Days Active Access'}
                </td>
                <td className="p-4 text-right font-bold text-slate-900">₱{invoice?.amount || '350.00'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total & Paid Badge */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>PAYMENT VERIFIED & APPROVED</span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-semibold">Total Paid:</span>
            <p className="text-2xl font-black text-slate-900">₱{invoice?.amount || '350.00'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
          <p>BarberMap Philippines Inc. • Automated Billing & Invoice Engine</p>
          <p>Thank you for partnering with BarberMap to bring premium barbering to clients across the nation.</p>
        </div>
      </div>
    </div>
  );
}
