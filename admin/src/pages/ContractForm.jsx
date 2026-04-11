import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

const DEFAULT_TERMS = [
  { title: '1. Agreement Overview', content: 'These Rental Terms & Conditions constitute a legally binding agreement between the renter ("You") and Rentr ("We", "Us", "Our"). By placing a rental order on our platform, you acknowledge that you have read, understood, and agree to be bound by these terms.' },
  { title: '2. Rental Tenure & Pricing', content: 'Rental plans are available for tenures ranging from 3 months to 36 months. Monthly rental charges are determined based on the product category, configuration, and chosen tenure. Late payments may attract a penalty of up to 2% per month on the outstanding amount.' },
  { title: '3. Security Deposit', content: 'Rentr operates on a zero security deposit model for approved customers. Approval is subject to successful KYC verification and creditworthiness assessment. Any security deposit collected will be refunded within 15 business days of the successful return of rented equipment.' },
  { title: '4. Equipment Usage & Care', content: 'All rented equipment remains the property of Rentr throughout the rental tenure. You are responsible for the proper care and maintenance of the equipment during the rental period. Any damage caused by misuse, negligence, or unauthorised modifications will be charged to the renter.' },
  { title: '5. Equipment Return', content: 'At the end of the rental tenure, you must return the equipment in the same condition as received, subject to normal wear and tear. Failure to return the equipment within 7 days of tenure expiry may result in additional rental charges and penalties.' },
  { title: '6. Early Termination', content: 'You may terminate your rental agreement before the committed tenure by providing 30 days written notice. Early termination will attract a closure fee equivalent to the remaining rental for a specified period as outlined in your rental agreement.' },
  { title: '7. Damage & Loss', content: 'In the event of equipment damage beyond normal wear and tear, repair or replacement costs will be borne by the renter. In case of theft or total loss, the renter is liable to pay the current market value of the equipment.' },
  { title: '8. Dispute Resolution', content: 'Any disputes arising out of or in connection with this rental agreement shall be resolved through mutual discussion and negotiation. If a resolution cannot be reached amicably, the dispute shall be referred to arbitration in Mumbai.' },
];

export default function ContractForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    order_id: '',
    type: 'rental',
    start_date: '',
    end_date: '',
    terms: '',
  });
  const [saving, setSaving] = useState(false);
  const [loadingContract, setLoadingContract] = useState(isEdit);
  const [error, setError] = useState('');
  const [termsSections, setTermsSections] = useState(DEFAULT_TERMS.map(s => ({ ...s })));
  const [expandedSection, setExpandedSection] = useState(null);

  // Load existing contract data for edit mode
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/contracts/${id}`)
      .then((data) => {
        setForm({
          customer_name: data.customer_name || '',
          customer_email: data.customer_email || '',
          order_id: data.order_id || '',
          type: data.type || 'rental',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          terms: data.terms || '',
        });
        // Parse terms JSON if available
        if (data.terms) {
          try {
            const parsed = JSON.parse(data.terms);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTermsSections(parsed);
            }
          } catch { /* use defaults */ }
        }
      })
      .catch(() => navigate('/contracts'))
      .finally(() => setLoadingContract(false));
  }, [id, isEdit, navigate]);

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateTermsSection = (index, field, value) => {
    setTermsSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addSection = () => {
    setTermsSections(prev => [...prev, { title: `${prev.length + 1}. New Section`, content: '' }]);
    setExpandedSection(termsSections.length);
  };

  const removeSection = (index) => {
    setTermsSections(prev => prev.filter((_, i) => i !== index));
  };

  const resetToDefaults = () => {
    setTermsSections(DEFAULT_TERMS.map(s => ({ ...s })));
    setExpandedSection(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, terms: JSON.stringify(termsSections) };
      if (isEdit) {
        await api.put(`/contracts/${id}`, payload);
        navigate(`/contracts/${id}`);
      } else {
        await api.post('/contracts', payload);
        navigate('/contracts');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingContract) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      <div>
        <button onClick={() => navigate('/contracts')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={14} />
          Back to Contracts
        </button>
        <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">{isEdit ? 'Edit Contract' : 'New Contract'}</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Customer Name</label>
            <input
              type="text"
              required
              value={form.customer_name}
              onChange={(e) => updateField('customer_name', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Customer Email</label>
            <input
              type="email"
              required
              value={form.customer_email}
              onChange={(e) => updateField('customer_email', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Order ID</label>
            <input
              type="text"
              value={form.order_id}
              onChange={(e) => updateField('order_id', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Type</label>
            <select
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            >
              <option value="rental">Rental</option>
              <option value="lease">Lease</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Start Date</label>
            <input
              type="date"
              required
              value={form.start_date}
              onChange={(e) => updateField('start_date', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">End Date</label>
            <input
              type="date"
              required
              value={form.end_date}
              onChange={(e) => updateField('end_date', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20">Terms & Conditions</label>
            <div className="flex gap-2">
              <button type="button" onClick={resetToDefaults} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
                <RotateCcw size={12} /> Reset Defaults
              </button>
              <button type="button" onClick={addSection} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-rentr-primary hover:text-rentr-primary-light transition-colors">
                <Plus size={12} /> Add Section
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {termsSections.map((section, i) => (
              <div key={i} className="border border-foreground/[0.05] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors"
                >
                  <span className="text-sm font-medium text-foreground/70 text-left">{section.title || `Section ${i + 1}`}</span>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={(e) => { e.stopPropagation(); removeSection(i); }}
                      className="text-foreground/20 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </span>
                    {expandedSection === i ? <ChevronUp size={14} className="text-foreground/30" /> : <ChevronDown size={14} className="text-foreground/30" />}
                  </div>
                </button>
                {expandedSection === i && (
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateTermsSection(i, 'title', e.target.value)}
                      className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all"
                      placeholder="Section title"
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => updateTermsSection(i, 'content', e.target.value)}
                      rows={4}
                      className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all"
                      placeholder="Section content..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/contracts')}
            className="px-6 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
          >
            {saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Contract')}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
