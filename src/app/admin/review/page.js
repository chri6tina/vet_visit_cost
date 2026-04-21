import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';

export default async function AdminReviewPage() {
  // Fetch unapproved prices. Note: We use 'verified' as a proxy right now until 'is_approved' column is active.
  const { data: pendingPrices } = await supabase
    .from('vet_prices')
    .select(`
      id, cost, created_at, verified,
      vets ( name, city )
    `)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen pt-24 pb-20 px-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black mb-2">Admin: Price Moderation</h1>
      <p className="text-gray-600 mb-8">Review and approve crowdsourced submissions before they affect public averages.</p>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Clinic</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Reported Cost</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Receipt</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {pendingPrices && pendingPrices.length > 0 ? pendingPrices.map(price => (
              <tr key={price.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium">{price.vets?.name || 'Unknown'} <span className="text-xs text-gray-400 ml-2">{price.vets?.city}</span></td>
                <td className="p-4 font-bold text-green-600">${price.cost}</td>
                <td className="p-4">
                  {price.verified ? (
                     <span className="inline-flex gap-1 items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"><FileText className="w-3 h-3"/> Attached</span>
                  ) : (
                     <span className="text-gray-400 text-xs italic">No receipt</span>
                  )}
                </td>
                <td className="p-4 flex gap-2">
                  <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-all"><CheckCircle2 className="w-4 h-4"/> Approve</button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-all"><XCircle className="w-4 h-4"/> Reject</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">No pending submissions in the queue.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
