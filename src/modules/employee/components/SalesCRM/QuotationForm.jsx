import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Download } from 'lucide-react';
import { salesService } from '../../../../services/salesService';
import { downloadQuotationPDF } from '../../../../utils/pdfGenerator';

export default function QuotationForm({ initialData, leads = [], onClose, onSaved }) {
  const [leadId, setLeadId] = useState(initialData?.lead?._id || initialData?.lead || '');
  const [items, setItems] = useState(initialData?.items || [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const [discount, setDiscount] = useState(0); // Add discount logic later if added to schema
  const [tax, setTax] = useState(initialData?.tax || 18);
  const [validUntil, setValidUntil] = useState(initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const discountAmount = subtotal * (discount / 100);
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const totalAmount = subtotal - discountAmount + taxAmount;

  const handleSave = async () => {
    if (!leadId) return alert("Please select a lead.");
    if (!validUntil) return alert("Please select a valid date.");
    
    // Ensure all items have calculated totals
    const finalItems = items.map(i => ({ ...i, total: i.quantity * i.unitPrice }));

    setIsSubmitting(true);
    try {
      const payload = {
        leadId,
        items: finalItems,
        subtotal,
        tax,
        totalAmount,
        validUntil: new Date(validUntil).toISOString()
      };

      if (initialData) {
        await salesService.updateQuotation(initialData._id, payload);
      } else {
        await salesService.generateQuote(payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to save quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Quotation' : 'Create Quotation'}</h2>
            <p className="text-xs text-slate-500">{initialData ? 'Update an existing quotation.' : 'Generate a new quote for a client or lead.'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Client / Lead</label>
              <select value={leadId} onChange={e => setLeadId(e.target.value)} disabled={!!initialData} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500">
                <option value="">Select Lead...</option>
                {leads.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.company ? `${l.company} - ${l.name}` : l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valid Until</label>
              <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-slate-400 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Products & Services</h3>
              <button onClick={handleAddItem} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 transition">
                <Plus className="w-3.5 h-3.5"/> Add Item
              </button>
            </div>
            
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3">Description</th>
                    <th className="p-3 w-24">Qty</th>
                    <th className="p-3 w-32">Price (₹)</th>
                    <th className="p-3 w-32">Total</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={idx} className="bg-white dark:bg-slate-950">
                      <td className="p-2">
                        <input type="text" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Item description" className="w-full p-2 text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded focus:border-indigo-500 outline-none dark:text-white" />
                      </td>
                      <td className="p-2">
                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="w-full p-2 text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded focus:border-indigo-500 outline-none dark:text-white" />
                      </td>
                      <td className="p-2">
                        <input type="number" min="0" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full p-2 text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded focus:border-indigo-500 outline-none dark:text-white" />
                      </td>
                      <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        ₹{(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleRemoveItem(idx)} className="text-rose-400 hover:text-rose-600 p-1"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-3 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-white">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-2">Discount (%) <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-16 p-1 text-xs border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" /></span>
                <span className="text-slate-800 dark:text-white">-₹{discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-2">Tax (%) <input type="number" value={tax} onChange={e => setTax(e.target.value)} className="w-16 p-1 text-xs border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" /></span>
                <span className="text-slate-800 dark:text-white">+₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-white">Total Estimate</span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-900/50">
          <button 
            type="button"
            onClick={() => {
              if (!leadId) return alert("Select a lead first to preview.");
              downloadQuotationPDF({ 
                quotationNumber: initialData?.quotationNumber || 'DRAFT', 
                lead: leads.find(l => l._id === leadId), 
                items, 
                subtotal, 
                tax, 
                totalAmount, 
                validUntil 
              });
            }}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4"/> Preview PDF
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
            <button onClick={handleSave} disabled={isSubmitting} className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50">
              <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : initialData ? 'Update Quote' : 'Save & Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
