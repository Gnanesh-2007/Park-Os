import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, CheckCircle, XCircle, Clock, Check, Download, MapPin } from 'lucide-react';

const Billing = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, bill: null });
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'success', 'failed'

  const fetchBills = async () => {
    try {
      setLoading(true);
      const url = user.role === 'admin' 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/billing` 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/billing/history`;
      const res = await axios.get(url);
      
      // Sort newest first
      const sortedBills = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBills(sortedBills);
    } catch (error) {
      console.error("Failed to fetch billing", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [user]);

  const handleDownloadCsv = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/billing/export/csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'parking_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handlePay = async (paymentMethod) => {
    setPaymentStatus('processing');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/billing/pay`, {
        billId: paymentModal.bill._id,
        paymentMethod
      });
      setPaymentStatus('success');
      setTimeout(() => {
        setPaymentModal({ isOpen: false, bill: null });
        setPaymentStatus(null);
        fetchBills();
      }, 2000);
    } catch (error) {
      setPaymentStatus('failed');
      setTimeout(() => {
        setPaymentStatus(null);
        fetchBills();
      }, 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-slate-700/50 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {user.role === 'admin' ? 'All Billing Records' : 'Parking History & Billing'}
          </h1>
          <p className="text-slate-400">
            {user.role === 'admin' ? 'Monitor all financial transactions and parking fees.' : 'View your past sessions and settle pending payments.'}
          </p>
        </div>

        {user.role === 'admin' && (
          <button 
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg"
          >
            <Download size={18} />
            Download CSV Report
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <CreditCard className="mx-auto h-16 w-16 text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Records Found</h2>
          <p className="text-slate-400">You don't have any billing history yet.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-900 shadow-xl">
                <tr className="text-slate-400 border-b border-slate-700 text-sm">
                  <th className="p-4 font-semibold w-1/4">Date</th>
                  {user.role === 'admin' && <th className="p-4 font-semibold">User</th>}
                  <th className="p-4 font-semibold">Location (Slot)</th>
                  <th className="p-4 font-semibold">Duration</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  {user.role === 'user' && <th className="p-4 font-semibold text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-slate-800/50">
                {bills.map((bill) => {
                  const startTime = new Date(bill.sessionId?.startTime);
                  const endTime = bill.sessionId?.endTime ? new Date(bill.sessionId.endTime) : null;
                  
                  // Calculate duration display
                  let durationStr = 'Active';
                  if (endTime) {
                    const diffMs = endTime - startTime;
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    durationStr = `${hours}h ${mins}m`;
                  }

                  const isPending = bill.paymentStatus === 'pending';
                  const isPaid = bill.paymentStatus === 'paid';
                  const isFailed = bill.paymentStatus === 'failed';

                  return (
                    <tr key={bill._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 text-white text-sm">
                        <div className="font-medium whitespace-nowrap">{startTime.toLocaleDateString()}</div>
                        <div className="text-slate-500 text-xs">{startTime.toLocaleTimeString()}</div>
                      </td>
                      {user.role === 'admin' && (
                        <td className="p-4 text-white text-sm font-medium">
                          {bill.sessionId?.userId?.name || 'Unknown'}
                        </td>
                      )}
                      <td className="p-4 text-slate-300 text-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-blue-500" />
                          <span>Slot {bill.sessionId?.slotId?.slotNumber || '---'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 text-sm font-mono">{durationStr}</td>
                      <td className="p-4 font-bold text-white">₹{bill.amount}</td>
                      <td className="p-4">
                        <div className={`inline-flex flex-col items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          isPending ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          <div className="flex items-center gap-1">
                            {isPaid && <CheckCircle size={12} />}
                            {isPending && <Clock size={12} />}
                            {isFailed && <XCircle size={12} />}
                            <span className="capitalize tracking-wider">{bill.paymentStatus}</span>
                          </div>
                        </div>
                        {isPaid && <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider text-center">{bill.paymentMethod}</div>}
                      </td>
                      {user.role === 'user' && (
                        <td className="p-4 text-right">
                          {(isPending || isFailed) && (
                            <button
                              onClick={() => setPaymentModal({ isOpen: true, bill })}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap"
                            >
                              {isFailed ? 'Retry Payment' : 'Pay Now'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mock Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <h2 className="text-2xl font-bold text-white mb-6">Complete Payment</h2>
            
            <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-center border-t-2 border-b-2 border-slate-800">
              <span className="text-slate-400 text-sm uppercase tracking-wider mb-2 block">Total Amount</span>
              <span className="text-4xl font-bold text-white">₹{paymentModal.bill.amount}</span>
            </div>

            {paymentStatus === 'processing' ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-blue-400 font-medium">Processing payment safely...</p>
              </div>
            ) : paymentStatus === 'success' ? (
              <div className="text-center py-8 space-y-4 animate-in zoom-in-90 duration-300">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">Payment Successful</h3>
                <p className="text-emerald-400">Your bill has been settled.</p>
              </div>
            ) : paymentStatus === 'failed' ? (
              <div className="text-center py-8 space-y-4 animate-in zoom-in-90 duration-300">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">Payment Failed</h3>
                <p className="text-red-400">Network simulation failure. Try again.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm mb-4">Select a payment method:</p>
                
                <button 
                  onClick={() => handlePay('Paytm')}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 border border-[#00B9F5]/30 hover:bg-[#00B9F5]/10 text-white rounded-xl p-4 transition-colors font-semibold"
                >
                  <div className="w-8 h-8 rounded-full bg-[#00B9F5] flex items-center justify-center text-white text-xs font-bold">P</div>
                  Pay with Paytm
                </button>
                
                <button 
                  onClick={() => handlePay('PhonePe')}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 border border-[#5f259f]/30 hover:bg-[#5f259f]/20 text-white rounded-xl p-4 transition-colors font-semibold"
                >
                  <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center text-white text-xs font-bold">Pe</div>
                  Pay with PhonePe
                </button>

                <button 
                  onClick={() => setPaymentModal({ isOpen: false, bill: null })}
                  className="w-full text-center mt-4 text-slate-500 hover:text-white transition-colors text-sm font-medium py-2"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
