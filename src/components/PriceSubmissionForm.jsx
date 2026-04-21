"use client";

import { useState } from "react";
import { CheckCircle2, UploadCloud, X, Loader2, Wand2 } from "lucide-react";

export default function PriceSubmissionForm({ vetId, vetName, procedures }) {
  const [procedureId, setProcedureId] = useState("");
  const [cost, setCost] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("bill", uploadedFile);
      
      const res = await fetch("/api/prices/scan", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Format not read");
      
      const data = await res.json();
      if (data.cost) setCost(data.cost.toString());
      if (data.procedure && procedures) {
         const hit = procedures.find(p => p.name.toLowerCase().includes(data.procedure.toLowerCase()));
         if (hit) setProcedureId(hit.id);
      }
    } catch (err) {
      console.log("OCR Skipped - manual entry fallback", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!procedureId || !cost) {
      alert("Please select a procedure and enter a cost.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create a FormData object since we might be sending a file
      const formData = new FormData();
      formData.append("vetId", vetId);
      formData.append("procedureId", procedureId);
      formData.append("cost", cost);
      
      if (file) {
        formData.append("bill", file);
      }

      const res = await fetch("/api/prices/submit", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit");
      setSuccess(true);
    } catch (e) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 bg-green-50 dark:bg-green-900/20 rounded-3xl border border-green-200 dark:border-green-800 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">Thank you!</h3>
        <p className="text-green-800 dark:text-green-400 text-sm">
          Your anonymously submitted price has been sent for verification. This helps our community immensely!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-brand-50 dark:bg-brand-900/20 rounded-3xl border border-brand-200 dark:border-brand-800/50">
      <h3 className="text-xl font-black text-brand-900 dark:text-brand-300 mb-2">
        Help your community!
      </h3>
      <p className="text-sm text-brand-800 dark:text-brand-400 mb-6 leading-relaxed">
        Did you recently visit {vetName}? Submit what you paid anonymously to help other pet owners budget for their vet costs.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
            Procedure Type
          </label>
          <select 
            value={procedureId} 
            onChange={(e) => setProcedureId(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          >
            <option value="">Select Procedure...</option>
            {procedures && procedures.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
            Total Cost You Paid ($)
          </label>
          <input
            type="number"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="e.g. 150"
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider flex justify-between items-center">
            <span>Upload Vet Bill (Optional)</span>
            <span className="text-[10px] text-brand-500 bg-brand-50 px-2 rounded-full py-0.5 border border-brand-200">AI Auto-Fill</span>
          </label>
          
          {file ? (
            <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isScanning ? 'border-brand-300 bg-brand-50' : 'bg-white dark:bg-gray-800 border-brand-500'}`}>
              <span className="text-xs truncate max-w-[200px] flex items-center gap-2">
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {file.name}
              </span>
              {!isScanning && <button type="button" onClick={() => setFile(null)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>}
            </div>
          ) : (
            <label className="flex items-center gap-2 justify-center w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-dashed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-xl cursor-pointer">
              <UploadCloud className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Attach Image/PDF</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} disabled={isScanning} />
            </label>
          )}

          {isScanning && (
            <div className="flex items-center gap-2 text-brand-600 text-[11px] font-bold mt-2 animate-pulse">
              <Wand2 className="w-3 h-3" /> GPT-4o Vision is extracting your total cost and procedure type...
            </div>
          )}
          
          {!isScanning && !file && (
            <p className="text-[10px] text-gray-400 mt-1">If you upload, we scrub all personal ID / credit card data automatically.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors mt-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Share Anonymous Price</>
          )}
        </button>
      </form>
    </div>
  );
}
